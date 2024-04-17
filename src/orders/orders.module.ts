import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import {
  DownloadInvoiceController,
  OrderExportController,
  OrderFilesController,
  OrdersController,
  OrderStatusController,
} from './orders.controller';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from 'src/schemas/order.schema';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { UserInitial, UserSchema } from 'src/schemas/user.schema';
import { SettingsSchema } from 'src/schemas/settings.schema';
import { ProductSchema } from 'src/schemas/product.schema';
import { OrderFileSchema } from 'src/schemas/orderFile';
import { UploadSchema } from 'src/schemas/upload.schema';

@Module({
  imports: [
    AuthModule, 
    PaymentModule,
    MongooseModule.forFeature([
      {
        name: 'Order',
        schema: OrderSchema,
      },
      {
        name: UserInitial.name, schema: UserSchema
      },
      {
         name: 'Settings', schema: SettingsSchema 
      }, 
      {
        name: 'Product',
        schema: ProductSchema,
      },
      {
        name: 'OrderFile',
        schema: OrderFileSchema,
      },
      { name: 'Upload', schema: UploadSchema }
    ]),
    StripeModule.forRoot(StripeModule, {
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
    }),
    
  ],
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
