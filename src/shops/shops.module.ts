import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import {
  DisapproveShop,
  FollowShopController,
  ShopsController,
  StaffsController,
  TopShopsController,
  FollowedShops,
  NearByShopController,
  NewShopsController,
  DisapproveShopController,
  ApproveShopController,
} from './shops.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopDb, ShopSchema } from 'src/schemas/shop.schema';
import { UserInitial, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShopDb.name, schema: ShopSchema },
      { name: UserInitial.name, schema: UserSchema }
    ]),
  ],
  controllers: [
    ShopsController,
    StaffsController,
    TopShopsController,
    DisapproveShop,
    FollowShopController,
    FollowedShops,
    DisapproveShopController,
    ApproveShopController,
    NearByShopController,
    NewShopsController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}
