// upload.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Upload extends Document {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);