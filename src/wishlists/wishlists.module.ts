import { Module } from '@nestjs/common';
import { MyWishlistsController } from './my-wishlists.controller';
import { MyWishlistService } from './my-wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from 'src/schemas/product.schema';
import { UserInitial, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'Product', schema: ProductSchema}, 
      { name: UserInitial.name, schema: UserSchema }
    ])
  ],
  controllers: [WishlistsController, MyWishlistsController],
  providers: [WishlistsService, MyWishlistService],
})
export class WishlistsModule {}
