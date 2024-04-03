import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { SettingsOptions } from "src/settings/entities/setting.entity";

@Schema()
export class SettingsDocument extends Document {
  @Prop({ required: true })
  options: SettingsOptions;
  language: string;
  translated_languages: string[];
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsDocument);