import taxesJson from '@db/taxes.json';
import { HttpException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  PaymentIntent,
  PaymentIntentInfo,
} from './entries/payment-intent.entity';
import ordersJson from '@db/orders.json';
import { Order, PaymentGatewayType } from 'src/orders/entities/order.entity';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { PaypalPaymentService } from 'src/payment/paypal-payment.service';

const orders = plainToClass(Order, ordersJson);
const paymentIntents = plainToClass(PaymentIntent, taxesJson);

@Injectable()
export class PaymentIntentService {
  private paymentIntents: PaymentIntent[] = paymentIntents;
  constructor(
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
  ) { }
  async getPaymentIntent(query: GetPaymentIntentDto) {
    // requires_payment_method
    const payment_intent_info: PaymentIntentInfo = {
      is_redirect: false,
      payment_id: 'null',
      client_secret: null,
      redirect_url: null,
    };
    const { payment_gateway } = query;

    switch (payment_gateway) {

      case PaymentGatewayType.STRIPE:
        const list = await this.stripeService.retrivePaymentIntents();
        const { id, client_secret } = list.find(
          (s) => s.status == 'requires_payment_method' || !s.amount_received,
        );
        payment_intent_info['payment_id'] = id;
        payment_intent_info['is_redirect'] = false;
        payment_intent_info['client_secret'] = client_secret;

        break;

      case PaymentGatewayType.PAYPAL:
        const order = orders[0];
        const paypalIntent = await this.paypalService.createPaymentIntent(
          order,
        );
        payment_intent_info['is_redirect'] = true;
        payment_intent_info['payment_id'] = paypalIntent.id ?? '';
        payment_intent_info['redirect_url'] = paypalIntent.redirect_url ?? '';
        break;
    }
    if (!payment_intent_info.payment_id) {
      throw new HttpException('SOMETHING_WENT_WRONG', 400);
    }

    return {
      id: Number(new Date()),
      order_id: query.tracking_number,
      tracking_number: query.tracking_number,
      payment_gateway: query.payment_gateway,
      payment_intent_info: {
        ...payment_intent_info,
      },
    };
  }
}
