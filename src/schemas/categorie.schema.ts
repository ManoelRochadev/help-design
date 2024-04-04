import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "src/categories/entities/category.entity";
import { Attachment } from "src/common/entities/attachment.entity";
import { Product } from "src/products/entities/product.entity";
import { Type } from 'src/types/entities/type.entity';

@Schema()
export class Categorie extends Document {
  @Prop()
  id?: string;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  parent: Category;

  @Prop()
  type: Type

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;

  @Prop()
  children?: Category[];

  @Prop()
  details?: string;

  @Prop()
  image?: Attachment;

  @Prop()
  icon?: string;

  @Prop()
  products?: Product[];

  @Prop()
  language: string;

  @Prop()
  translated_languages: string[];

  @Prop()
  parent_id: string;
}

export const CategorieSchema = SchemaFactory.createForClass(Categorie);