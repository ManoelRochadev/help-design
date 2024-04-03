import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Attachment } from "src/common/entities/attachment.entity";
import { Banner, TypeSettings } from "src/types/entities/type.entity";

@Schema()
export  class Types extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true})
  slug: string;
  @Prop()
  image: Attachment;
  @Prop()
  icon: string;
  @Prop()
  banners?: Banner[];
  @Prop()
  promotional_sliders?: Attachment[];
  @Prop()
  settings?: TypeSettings;
  @Prop()
  language: string;
  @Prop({required: true})
  translated_languages: string[];
  @Prop({required: true})
  created_at: Date;
  @Prop({required: true})
  updated_at: Date;
}

export const TypesSchema = SchemaFactory.createForClass(Types);