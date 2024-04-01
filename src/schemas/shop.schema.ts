import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { Balance, ShopSettings } from "src/shops/entities/shop.entity";
import { User } from 'src/users/entities/user.entity';

@Schema()
export class ShopDb {
  @Prop({ required: true})
  owner_id: string;

  @Prop({ required: true})
  owner: User;

  @Prop()
  staffs?: User[];

  @Prop({ required: true})
  is_active: boolean;

  @Prop({ required: true})
  orders_count: number;

  @Prop({ required: true})
  products_count: number;

  @Prop()
  balance?: Balance;

  @Prop({ required: true})
  name: string;

  @Prop({ required: true, unique: true})
  slug: string;

  @Prop()
  description?: string;

  @Prop({ required: true})
  cover_image: Attachment;

  @Prop()
  logo?: Attachment;

  @Prop({ required: true})
  address: UserAddress;

  @Prop()
  settings?: ShopSettings;

  @Prop()
  distance?: string;

  @Prop()
  lat?: string;

  @Prop()
  lng?: string;
}

export type ShopDocument = ShopDb & Document;

export const ShopSchema = SchemaFactory.createForClass(ShopDb);