import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from 'src/addresses/entities/address.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from 'src/users/entities/profile.entity';
import { Permission, User, Wallet } from 'src/users/entities/user.entity';

export type UserDocument = UserInitial & Document;

@Schema()
export class UserInitial extends User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop()
  permissions: Permission[];

  @Prop()
  profile: Profile;

  @Prop()
  shops: Shop[];

  @Prop()
  managed_shop: Shop;

  @Prop()
  is_active: boolean = true;

  @Prop()
  address: Address[];

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;

  @Prop()
  wallet: Wallet;

  @Prop()
  followingShops: Shop[];

  @Prop()
  wishlist_id: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserInitial);