import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Product, ProductStatus, ProductType, Video } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ReviewEnt } from 'src/reviews/entities/review.entity';

// Definindo o schema para a subdocument "Image"
@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  id: number;

  @Prop()
  original: string;

  @Prop()
  thumbnail: string;
}

@Schema({ _id: false })
export class DigitalFile {
  @Prop()
  id: number;

  @Prop()
  attachment_id: string;

  @Prop()
  name: string;

  @Prop()
  size: number;

  @Prop()
  type: string;

  @Prop()
  url: string;
}

@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  zip: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  street_address: string;
}

export class Settings {
  contact: string;
  socials: { url: string; icon: string }[];
  website: string;
  location: string[];
}

export class RatingCount {
  rating: number;
  total: number;
  positive_feedbacks_count: number;
  negative_feedbacks_count: number;
  my_feedback: string;
  abusive_reports_count: number;
}

// Definindo o schema principal para o produto
@Schema()
export class ProductDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type_id: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  shop_id: string;

  @Prop()
  sale_price: number;

  @Prop({ required: true })
  language: string;

  @Prop()
  min_price: number;

  @Prop()
  max_price: number;

  @Prop({ required: true })
  sku: string;

  @Prop()
  image: Attachment;

  @Prop()
  video: Video[];

  @Prop()
  gallery: Attachment[];

  @Prop()
  deleted_at: Date;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop()
  author_id: string;

  @Prop()
  manufacturer_id: number;

  @Prop({ required: true })
  is_digital: number;

  @Prop({ required: true })
  is_external: number;

  @Prop()
  external_product_url: string;

  @Prop()
  external_product_button_text: string;

  @Prop({ required: true, default: 0 })
  orders_count: number;

  @Prop({ required: true, default: 0 })
  ratings: number;

  @Prop({ required: true })
  total_reviews: number;

  @Prop()
  rating_count: RatingCount[];

  @Prop()
  my_review: ReviewEnt[];

  @Prop({ required: true })
  in_wishlist: boolean;

  @Prop({ default: 0 })
  total_downloads: number;

  @Prop({ type: [Date] })
  blocked_dates: Date[];

  @Prop()
  translated_languages: string[];

  @Prop()
  digital_file: DigitalFile;

  @Prop()
  shop: Shop;

  @Prop()
  categories: Category[];

  @Prop()
  tags: Tag[];

  @Prop()
  type: Type;

  @Prop()
  product_type: ProductType;

  @Prop({ required: true, default: true })
  in_stock: boolean;

  @Prop()
  is_taxable: boolean;

  @Prop()
  status: ProductStatus;

  @Prop()
  quantity: number;

  @Prop()
  unit: string;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);
