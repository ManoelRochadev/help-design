import { HttpException, Injectable } from '@nestjs/common';
import settingJson from '@db/settings.json';
import { Setting } from 'src/settings/entities/setting.entity';
import { plainToClass } from 'class-transformer';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import paymentGatewayJson from '@db/payment-gateway.json';
import { Order } from 'src/orders/entities/order.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import {
  CardElementDto,
  CreatePaymentIntentDto,
  StripeCreateCustomerDto,
} from './dto/stripe.dto';
import {
  StripeCustomer,
  StripeCustomerList,
  StripePaymentIntent,
  StripePaymentMethod,
} from './entity/stripe.entity';

const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
const setting = plainToClass(Setting, settingJson);

@Injectable()
export class StripePaymentService {
  private paymentGateways: PaymentGateWay[] = paymentGateways;

  constructor(@InjectStripeClient() private readonly stripeClient: Stripe) {}

  async createCustomer(createCustomerDto: StripeCreateCustomerDto): Promise<StripeCustomer> {
    try {
      console.log(createCustomerDto)
      return await this.stripeClient.customers.create(createCustomerDto);
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to create customer.', 500);
    }
  }

  async retrieveCustomer(id: string): Promise<StripeCustomer> {
    try {
      return await this.stripeClient.customers.retrieve(id);
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to retrieve customer.', 500);
    }
  }

  async listAllCustomer(): Promise<StripeCustomerList> {
    try {
      return await this.stripeClient.customers.list();
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to list all customers.', 500);
    }
  }

  async createPaymentMethod(cardElementDto: CardElementDto): Promise<StripePaymentMethod> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.create({
        type: 'card',
        card: cardElementDto,
      });
      const { ...newPaymentMethod } = paymentMethod;
      return newPaymentMethod;
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to create payment method.', 500);
    }
  }

  async retrievePaymentMethod(method_key: string): Promise<StripePaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.retrieve(method_key);
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to retrieve payment method.', 500);
    }
  }

  async retrievePaymentMethodByCustomerId(customer: string): Promise<StripePaymentMethod[]> {
    try {
      const { data } = await this.stripeClient.customers.listPaymentMethods(customer, {
        type: 'card',
      });
      return data;
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to retrieve payment methods by customer.', 500);
    }
  }

  async attachPaymentMethodToCustomer(method_key: string, customer_id: string): Promise<StripePaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.attach(method_key, {
        customer: customer_id,
      });
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to attach payment method to customer.', 500);
    }
  }

  async detachPaymentMethodFromCustomer(method_key: string): Promise<StripePaymentMethod> {
    try {
      return await this.stripeClient.paymentMethods.detach(method_key);
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to detach payment method from customer.', 500);
    }
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        ...createPaymentIntentDto,
        payment_method_types: ['card'],
      });
      const { ...newIntent } = paymentIntent;
      return newIntent;
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to create payment intent.', 500);
    }
  }

  async retrievePaymentIntent(payment_id: string): Promise<StripePaymentIntent> {
    try {
      return await this.stripeClient.paymentIntents.retrieve(payment_id);
    } catch(error) {
      console.log(error);
      throw new HttpException('Failed to retrieve payment intent.', 500);
    }
  }

  async retrivePaymentIntents(): Promise<StripePaymentIntent[]> {
    try {
      const paymentIntentList = await this.stripeClient.paymentIntents.list();
      return paymentIntentList.data;
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to retrieve payment intents.', 500);
    }
  }

  async makePaymentIntentParam(order: Order, me: User) {
    try {
      const customerList = await this.listAllCustomer();
      const currentCustomer = customerList.data.find((customer: StripeCustomer) => customer.email === me.email);
      if (!currentCustomer) {
        const newCustomer = await this.createCustomer({
          name: me.name,
          email: me.email,
        });
        currentCustomer.id = newCustomer.id;
      }
      return {
        customer: currentCustomer.id,
        amount: Math.ceil(order.paid_total),
        currency: process.env.DEFAULT_CURRENCY || setting.options.currency,
        payment_method_types: ['card'],
        metadata: {
          order_tracking_number: order.tracking_number,
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to make payment intent parameters.', 500);
    }
  }
}
