import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Address } from "./product.schema";
import { User } from "src/users/entities/user.entity";
import { PaymentIntent } from "src/payment-intent/entries/payment-intent.entity";
import { ConnectProductOrderPivot } from "src/orders/dto/create-order.dto";
import { Children, OrderFiles, PaymentGatewayType } from "src/orders/entities/order.entity";

@Schema()
export class OrderDb {
  @Prop({ required: true })
  customer: User;

  @Prop({ required: true })
  customer_id: string;

  @Prop({ required: true})
  tracking_number: number;

  @Prop({ required: true })
  customer_contact: string;

  @Prop({ required: true })
  customer_name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  sales_tax?: number;

  @Prop()
  paid_total?: number;

  @Prop({ required: true })
  total: number;

  @Prop()
  note?: string;

  @Prop()
  cancelled_amount?: number;

  @Prop()
  cancelled_tax?: number;

  @Prop()
  cancelled_delivery_fee?: number;

  @Prop({ required: true })
  language: string;

  @Prop()
  coupon_id?: string;

  @Prop()
  parent_id?: string;

  @Prop()
  shop_id?: string;

  @Prop()
  discount?: number;
  
  @Prop({ required: true })
  payment_gateway: PaymentGatewayType;

  @Prop()
  altered_payment_gateway?: string;

  @Prop()
  shipping_address?: Address;

  @Prop()
  billing_address?: Address;
  
  @Prop()
  logistics_provider?: string;

  @Prop()
  order_status?: string;

  @Prop({ required: true})
  payment_status: string;

  @Prop({required: true})
  created_at: Date;

  @Prop({required: true})
  updated_at: Date;

  @Prop()
  translated_languages?: string[];

  @Prop()
  status: string;

  @Prop()
  children?: Children[];

  @Prop()
  payment_intent?: PaymentIntent;

  @Prop()
  products?: ConnectProductOrderPivot[];

  @Prop()
  digital_file?: OrderFiles;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDb);
