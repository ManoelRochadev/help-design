import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Attachment } from "src/common/entities/attachment.entity";
import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";

class File {
  id: string | number;
  name: string;
  attachment_id: number;
  created_at: Date;
  updated_at: Date;
  fileable: Product;
  fileable_id?: number;
}

@Schema()
export class OrderFile extends Document {
  @Prop({ required: true })
  _id: string;
  
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  fileable_id: number;

  @Prop({ required: true })
  purchase_key: string;

  @Prop({ required: true })
  tracking_number: number;

  @Prop({ required: true })
  customer_id: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop({ required: true })
  order: Order;

  @Prop()
  file?: File;
  
  @Prop()
  digital_file_id?: number;

  @Prop()
  order_id: string;
}

export const OrderFileSchema = SchemaFactory.createForClass(OrderFile);