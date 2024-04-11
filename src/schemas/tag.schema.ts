import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Attachment } from "src/common/entities/attachment.entity";
import { Type } from 'src/types/entities/type.entity';

@Schema()
export class Tags extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];

  @Prop()
  icon: string;

  @Prop()
  image: Attachment;

  @Prop()
  details: string;

  @Prop()
  type_id: string;

  @Prop()
  type: Type;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tags);