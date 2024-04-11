import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Attachment } from "src/common/entities/attachment.entity";
import { Report } from "src/reviews/entities/reports.entity";
import { Feedback } from 'src/feedbacks/entities/feedback.entity';

@Schema()
export class Review extends Document {
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  shop_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  product_id: string;

  @Prop()
  variation_option_id?: string;

  @Prop()
  photos: Attachment[];

  @Prop()
  feedbacks: Feedback[];

  @Prop()
  my_feedback: Feedback;

}

export const ReviewSchema = SchemaFactory.createForClass(Review);