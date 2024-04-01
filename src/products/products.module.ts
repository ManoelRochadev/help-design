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

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Product', schema: ProductSchema} ])
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
