import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { OrderFiles, PaymentGatewayType } from '../entities/order.entity';
import { DigitalFile } from 'src/schemas/product.schema';
import { Product } from 'src/products/entities/product.entity';

export class CreateOrderDto {
  shop_id?: number;
  coupon_id?: number;
  status: string;
  customer_contact: string;
  products: ConnectProductOrderPivot[];
  amount: number;
  sales_tax: number;
  total: number;
  paid_total: number;
  payment_id: string;
  payment_gateway: PaymentGatewayType;
  discount: number;
  delivery_fee?: number;
  delivery_time: string;
  card?: CardInput;
  billing_address: UserAddressInput;
  shipping_address: UserAddressInput;
  payment_intent: PaymentIntent;
  language: string;
  order_status: string;
  payment_status: string;
}

export class UserAddressInput {
  street_address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
}

export class ConnectProductOrderPivot {
  product_id: number | string;
  variation_option_id?: number;
  order_quantity: number;
  unit_price: number;
  subtotal: number;
  digital_file?: OrderFiles;
}

export class CardInput {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email?: string;
}
