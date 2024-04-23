import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import orderStatusJson from '@db/order-statuses.json';
import ordersJson from '@db/orders.json';
import paymentGatewayJson from '@db/payment-gateway.json';
import paymentIntentJson from '@db/payment-intent.json';
import setting from '@db/settings.json';
import usersJson from '@db/users.json';
import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { PaypalPaymentService } from 'src/payment/paypal-payment.service';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { Setting } from 'src/settings/entities/setting.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto } from './dto/get-downloads.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
} from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import { OrderStatus } from './entities/order-status.entity';
import {
  Children,
  Order,
  OrderFiles,
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
  PixWebhook,
} from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDb } from 'src/schemas/order.schema';
import * as jwt from 'jsonwebtoken';
import { UserDocument, UserInitial } from 'src/schemas/user.schema';
import { SettingsDocument } from 'src/schemas/settings.schema';
import { ProductDocument, Settings } from 'src/schemas/product.schema';
import { OrderFile } from 'src/schemas/orderFile';
import { Upload } from 'src/schemas/upload.schema';
import { Review } from 'src/schemas/review.schema';
import { EfyPaymentService } from 'src/payment/efy-payment.service';
import { Request } from 'express';

const orders = plainToClass(Order, ordersJson);
const paymentIntents = plainToClass(PaymentIntent, paymentIntentJson);
const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
const orderStatus = plainToClass(OrderStatus, orderStatusJson);
const users = plainToClass(User, usersJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(orderStatus, options);

const orderFiles = plainToClass(OrderFiles, orderFilesJson);
const settings = plainToClass(Setting, setting);

const ordersOptions = {
  keys: ['tracking_number'],
  threshold: 0.3,
};
const ordersFuse = new Fuse(orders, ordersOptions);

const orderStatusOptions = {
  keys: ['name'],
  threshold: 0.3,
};
const orderStatusFuse = new Fuse(orderStatus, orderStatusOptions);

@Injectable()
export class OrdersService {
  private orders: Order[] = orders;
  private orderStatus: OrderStatus[] = orderStatus;
  private orderFiles: OrderFiles[] = orderFiles;
  private setting: Setting = settings;
  private users: User[] = users;
  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
    private readonly efiService: EfyPaymentService,
    @InjectModel('Order') private orderModel: Model<OrderDb>,
    @InjectModel(UserInitial.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Settings.name) private readonly settingModel: Model<SettingsDocument>,
    @InjectModel('Product') private productModel: Model<ProductDocument>,
    @InjectModel('OrderFile') private orderFileModel: Model<OrderFile>,
    @InjectModel('Upload') private uploadModel: Model<Upload>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) { }
  async create(createOrderInput: CreateOrderDto, tokenCustomer: string): Promise<Order> {
    const extractToken = tokenCustomer.replace('Bearer', '').trim();
    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as { id: string };
    const customer = await this.userModel.findById(decoded.id).lean().exec();
    // Mapeando os produtos e buscando detalhes assincronamente
    const productPromises = createOrderInput.products.map(async (product) => {
      const productData = await this.productModel.findById(product.product_id).lean().exec();

      // colocar o pivot no objeto
      return {
        ...productData,
        id: productData._id.toString(),
        pivot: createOrderInput.products.find((p) => p.product_id === productData._id.toString()),
        digital_file: {
          // gerar um id para o digital file
          fileable_id: Math.floor(100000 + Math.random() * 900000),
          url: productData.digital_file.url,
          attachment_id: productData.digital_file.attachment_id,
        }
      };
    });

    // Aguardando todas as consultas assíncronas serem concluídas
    const products = await Promise.all(productPromises);

    const createOrder = {
      ...createOrderInput,
      customer_id: decoded.id,
      customer: customer,
      created_at: new Date(),
      updated_at: new Date(),
      tracking_number: Math.floor(100000 + Math.random() * 900000).toString(),
      children: [],
      language: "pt-BR",
      translated_languages: ["pt-BR"],
      order_status: OrderStatusType.PENDING,
      payment_status: PaymentStatusType.PENDING,
      customer_name: customer.name,
      products: products,
    }

    const savedOrder = new this.orderModel(createOrder);

    const saveInDb = await savedOrder.save();

    const order: Order = {
      ...saveInDb.toObject(),
      id: saveInDb._id.toString(),
      payment_intent: null,
      children: [],
    }

    const payment_gateway_type = createOrderInput.payment_gateway
      ? createOrderInput.payment_gateway
      : PaymentGatewayType.STRIPE;
    order.payment_gateway = payment_gateway_type;
    delete order.payment_intent;
    // set the order type and payment type

    switch (payment_gateway_type) {
      case PaymentGatewayType.CASH:
        console.log("entrou no cash")
        order.order_status = OrderStatusType.PROCESSING;
        order.payment_status = PaymentStatusType.CASH;
        break;
      case PaymentGatewayType.FULL_WALLET_PAYMENT:
        console.log("entrou no full wallet")
        order.order_status = OrderStatusType.COMPLETED;
        order.payment_status = PaymentStatusType.WALLET;
        break;
      default:
        console.log("entrou no default")
        order.order_status = OrderStatusType.PENDING;
        order.payment_status = PaymentStatusType.PENDING;
        break;
    }
    order.children = this.processChildrenOrder(order);
    try {
      if (
        [
          PaymentGatewayType.STRIPE,
          PaymentGatewayType.PAYPAL,
          PaymentGatewayType.RAZORPAY,
          PaymentGatewayType.PIX
        ].includes(payment_gateway_type)
      ) {
        const setting: Setting[] = await this.settingModel.find().lean().exec();

        const paymentIntent = await this.processPaymentIntent(
          order,
          setting[0]
        );
        order.payment_intent = paymentIntent;
      }

      // atualizar o pedido
      const updatedOrder = await this.orderModel.findByIdAndUpdate(order.id, order, {}).lean().exec();

      const orderUpdated = {
        id: updatedOrder._id.toString(),
        ...updatedOrder,
      }

      // adicionar no banco de dados o orderfile de cada produto detro do array de products
      orderUpdated.products.forEach(async (product) => {
        const orderFile = new this.orderFileModel({
          _id: orderUpdated._id.toString(),
          id: product.digital_file.fileable_id,
          // gerar um purchase_key
          purchase_key: Math.floor(100000 + Math.random() * 900000).toString(),
          tracking_number: orderUpdated.tracking_number,
          customer_id: orderUpdated.customer_id,
          order_id: orderUpdated._id.toString(),
          fileable_id: product.digital_file.fileable_id,
          digital_file_id: product.digital_file.fileable_id,
          order: orderUpdated,
          created_at: new Date(),
          updated_at: new Date(),
          file: {
            id: product.digital_file.fileable_id,
            attachment_id: product.digital_file.attachment_id,
            fileable: product,
          }
        });

        await orderFile.save();
      });

      return {
        id: updatedOrder._id.toString(),
        ...updatedOrder,
      }
    } catch (error) {
      console.log(order);
      return order;
    }
  }

  async getOrders({
    limit,
    page,
    customer_id,
    tracking_number,
    search,
    shop_id,
  }: GetOrdersDto): Promise<OrderPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query: any = {};

    if (shop_id) {
      query['shop.id'] = Number(shop_id);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        query[key] = value;
      }
    }

    try {
      const count = await this.orderModel.countDocuments(query);
      const results = await this.orderModel.find(query).skip(startIndex).limit(limit).lean().exec();

      const url = `/orders?search=${search}&limit=${limit}`;
      return {
        data: results,
        ...paginate(count, page, limit, results.length, url),
      };
    } catch (error) {
      // Handle error appropriately
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderByIdOrTrackingNumber(id: number): Promise<Order> {
    try {
      const order = await this.orderModel.findOne({ tracking_number: id }).lean().exec();

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        id: order._id.toString(),
        ...order,
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getOrderStatuses({
    limit,
    page,
    search,
    orderBy,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: OrderStatus[] = this.orderStatus;

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // For price
        searchText.push({
          [key]: value,
        });
      }

      data = orderStatusFuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    // if (shop_id) {
    //   data = this.orders?.filter((p) => p?.shop?.id === shop_id);
    // }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    // procurar se o cliente fez algum review
    const reviews = await this.reviewModel.find({ user_id: "" }).lean().exec();

    const results = data.slice(startIndex, endIndex);
    const url = `/order-status?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getOrderStatus(param: string, language: string) {
    const orderStatus = await this.orderModel.findOne({
      slug: param,
    }).lean().exec();


    return {
      id: orderStatus._id.toString(),
      ...orderStatus,
    }
  }

  update(id: number, updateOrderInput: UpdateOrderDto) {
    return this.orders[0];
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  verifyCheckout(input: CheckoutVerificationDto): VerifiedCheckoutData {
    return {
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
      wallet_currency: 5000,
      wallet_amount: 1500,
    };
  }

  createOrderStatus(createOrderStatusInput: CreateOrderStatusDto) {
    return this.orderStatus[0];
  }

  updateOrderStatus(updateOrderStatusInput: UpdateOrderStatusDto) {
    return this.orderStatus[0];
  }

  async getOrderFileItems({ page, limit }: GetOrderFilesDto, token: string) {
    const extractToken = token.split(' ')[1];
    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as any;

    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const orderFiles = await this.orderFileModel.find({ customer_id: decoded.id }).lean().exec();

    const orderIds = orderFiles.map(orderFile => orderFile._id.toString());

    // Buscar os reviews associados a cada pedido
    const reviews = await this.reviewModel.find({ order_id: { $in: orderIds } }).lean().exec();


    const ordersWithReviews = orderFiles.map(orderFile => {
      const orderReview = reviews.find(review => review.order_id === orderFile._id.toString());

      return {
        ...orderFile,
        id: orderFile._id.toString(),
        order_id: orderFile.order_id,
        file: {
          ...orderFile.file,
          fileable: {
            ...orderFile.file.fileable,
            my_review: [orderReview],
          }
        }
      };
    });

    const results = ordersWithReviews.slice(startIndex, endIndex);

    const url = `/downloads?&limit=${limit}`;

    return {
      data: results,
      ...paginate(orderFiles.length, page, limit, results.length, url),
    };
  }

  async getDigitalFileDownloadUrl(digitalFileId: number) {
    const file = await this.orderModel.findOne({ 'products.digital_file.fileable_id': digitalFileId }).lean().exec();

    if (!file) {
      throw new Error('File not found');
    }

    console.log(file)
    const filter = file.products.filter((p) => p.digital_file.fileable_id === digitalFileId);

    // pesquisar no banco de dados o arquivo digital
    const upload = await this.uploadModel.findById(filter[0].digital_file.attachment_id).lean().exec();
    const fileName = upload.fileName

    return {
      fileUrl: filter[0].digital_file.url,
      fileName: fileName,
    };
  }

  async exportOrder(shop_id: string) {
    return exportOrderJson.url;
  }

  async downloadInvoiceUrl(shop_id: string) {
    return orderInvoiceJson[0].url;
  }

  /**
   * helper methods from here
   */
  /**
   * this method will process children of Order Object
   * @param order
   * @returns Children[]
   */
  processChildrenOrder(order: Order): Children[] {
    return [...order.children].map((child: Children) => {
      child.order_status = order.order_status;
      child.payment_status = order.payment_status;
      return child;
    });
  }
  // /**
  //  * this method will process children of Order Object
  //  * @param order
  //  * @returns Children[]
  //  */
  // processChildrenOrder(order: Order) {
  //   return [...order.children].map((child) => {
  //     child.order_status = order.order_status;
  //     child.payment_status = order.payment_status;
  //     return child;
  //   });
  // }
  /**
   * This action will return Payment Intent
   * @param order
   * @param setting
   */
  async processPaymentIntent(
    order: Order,
    setting: Setting,
  ): Promise<PaymentIntent> {
    const paymentIntent = paymentIntents.find(
      (intent: PaymentIntent) =>
        intent.tracking_number === order.tracking_number &&
        intent.payment_gateway.toString().toLowerCase() ===
        order.payment_gateway.toString().toLowerCase(),
    );
    if (paymentIntent) {
      return paymentIntent;
    }
    const {
      id: payment_id,
      client_secret,
      redirect_url = null,
      customer = null,
      txid,
      loc
    } = await this.savePaymentIntent(order, order.payment_gateway);
    const is_redirect = redirect_url ? true : false;
    const paymentIntentInfo: PaymentIntent = {
      id: Number(Date.now()),
      order_id: order.id,
      tracking_number: order.tracking_number,
      payment_gateway: order.payment_gateway.toString().toLowerCase(),
      payment_intent_info: {
        txid,
        loc,
        client_secret,
        payment_id,
        redirect_url,
        is_redirect,
      },
    };

    /**
     * Commented below code will work for real database.
     * if you uncomment this for json will arise conflict.
     */

    // paymentIntents.push(paymentIntentInfo);
    // const paymentGateway: PaymentGateWay = {
    //   id: Number(Date.now()),
    //   user_id: this.authService.me().id,
    //   customer_id: customer,
    //   gateway_name: setting.options.paymentGateway,
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // };
    // paymentGateways.push(paymentGateway);

    return paymentIntentInfo;
  }

  /**
   * Trailing method of ProcessPaymentIntent Method
   *
   * @param order
   * @param paymentGateway
   */
  async savePaymentIntent(order: Order, paymentGateway?: string): Promise<any> {
    switch (order.payment_gateway) {

      case PaymentGatewayType.STRIPE:
        const paymentIntentParam =
          await this.stripeService.makePaymentIntentParam(order, order.customer);
        return await this.stripeService.createPaymentIntent(paymentIntentParam);

      case PaymentGatewayType.PAYPAL:
        // here goes PayPal
        return this.paypalService.createPaymentIntent(order);
        break;

      case PaymentGatewayType.PIX:
        return this.efiService.createCustomer({
          valor: {
            original: ((order.total).toFixed(2)).toString(),
          },
          infoAdicionais: [
            {
              nome: "Pedido",
              valor: String(order.tracking_number),
            }
          ]
        });
        break;
      default:
        //
        break;
    }
  }

  /**
   *  Route {order/payment} Submit Payment intent here
   * @param order
   * @param orderPaymentDto
   */
  async stripePay(order: Order) {
    const tracking_number = order.tracking_number;
    /*
    this.orders[0]['order_status'] = OrderStatusType.COMPLETED;
    this.orders[0]['payment_status'] = PaymentStatusType.SUCCESS;
    */

    const retrievedPaymentIntent =
      await this.stripeService.retrievePaymentIntent(
        order?.payment_intent?.payment_intent_info?.payment_id,
      );

    if (retrievedPaymentIntent.status === 'succeeded') {
      const orderUpdated = await this.changeOrderPaymentStatus(OrderStatusType.COMPLETED, PaymentStatusType.SUCCESS, tracking_number);

      // atualizar o pedido no orderFile
      const orderFile = await this.orderFileModel.findOne({ tracking_number: tracking_number }).lean().exec();

      orderFile.order.payment_status = PaymentStatusType.SUCCESS;
      orderFile.order.order_status = OrderStatusType.COMPLETED;

      await this.orderFileModel.findByIdAndUpdate(orderFile._id, orderFile, { new: true }).lean().exec();

      return orderUpdated;
    } else if (retrievedPaymentIntent.status === 'canceled') {
      const orderUpdated = await this.changeOrderPaymentStatus(OrderStatusType.FAILED, PaymentStatusType.FAILED, tracking_number);

      return orderUpdated;
    } else {
      return order;
    }
  }

  async paypalPay(order: Order) {
    this.orders[0]['order_status'] = OrderStatusType.COMPLETED;
    this.orders[0]['payment_status'] = PaymentStatusType.SUCCESS;
    const { status } = await this.paypalService.verifyOrder(
      order.payment_intent.payment_intent_info.payment_id,
    );
    this.orders[0]['payment_intent'] = null;
    if (status === 'COMPLETED') {
      console.log('payment Success');
    }
  }

  /**
   * This method will set order status and payment status
   * @param orderStatus
   * @param paymentStatus
   */
  async changeOrderPaymentStatus(
    orderStatus: OrderStatusType,
    paymentStatus: PaymentStatusType,
    tracking_number: number,
  ) {
    // atualizar no banco de dados a order
    const orderData = await this.getOrderByIdOrTrackingNumber(tracking_number);
    orderData.order_status = orderStatus;
    orderData.payment_status = paymentStatus;
    orderData.updated_at = new Date();
    orderData.children = [...orderData.children].map((child) => {
      child.order_status = OrderStatusType.COMPLETED;
      child.payment_status = PaymentStatusType.SUCCESS;
      return child;
    });
    orderData.payment_intent = null;


    const updatedOrder = await this.orderModel.findByIdAndUpdate(orderData.id, orderData, {
      new: true,
    }).lean().exec();

    return {
      id: updatedOrder._id.toString(),
      ...updatedOrder,
    }
  }

  async webhookPix(req: Request) {
    // verificar se a requisição vem do ip da efi 34.193.116.226
    const body: PixWebhook = req.body;
    const pix = body.pix;

    console.log(pix)
    console.log(req.ip)
    if (req.ip === "34.193.116.226") {
      pix.forEach(async (pix) => {
        const order = await this.orderModel.findOne({ "payment_intent.payment_intent_info.txid": pix.txid }).lean().exec();

        if (order) {
          if (order.payment_status === PaymentStatusType.PENDING) {
            // atualizar o pedido
            const updatedOrder = await this.changeOrderPaymentStatus(OrderStatusType.COMPLETED, PaymentStatusType.SUCCESS, order.tracking_number);

            console.log(updatedOrder);

          }
        }
      }
      );
      return HttpStatus.OK;

    } else {
      console.log("Não passou na verificação")
      return HttpStatus.OK;
    }
  }
}
