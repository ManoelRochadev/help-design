import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  PopularProductsController,
  FollowedShopsProductsController,
  ProductsStockController,
  DraftProductsController,
  BestSellingProductsController,
} from './products.controller';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from 'src/schemas/product.schema';
import { ShopDb, ShopSchema } from 'src/schemas/shop.schema';
import { TagSchema } from 'src/schemas/tag.schema';
import { TypesSchema } from 'src/schemas/type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Product', schema: ProductSchema}, { name: ShopDb.name, schema: ShopSchema }, { name: 'Tags', schema: TagSchema }, {name: 'Product', schema: ProductSchema}, { name: 'Types', schema: TypesSchema }])
  ],
  controllers: [
    ProductsController,
    PopularProductsController,
    FollowedShopsProductsController,
    BestSellingProductsController,
    ProductsStockController,
    DraftProductsController,
  ],
  providers: [ProductsService],
})
export class ProductsModule {}
