import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
//import { StripeModule } from '@golevelup/nestjs-stripe';
import { AddressesModule } from './addresses/addresses.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AttributesModule } from './attributes/attributes.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { CouponsModule } from './coupons/coupons.module';
import { FeedbackModule } from './feedbacks/feedbacks.module';
import { ImportsModule } from './imports/imports.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentIntentModule } from './payment-intent/payment-intent.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PaymentModule } from './payment/payment.module';
import { ProductsModule } from './products/products.module';
import { QuestionModule } from './questions/questions.module';
import { RefundsModule } from './refunds/refunds.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { ShippingsModule } from './shippings/shippings.module';
import { ShopsModule } from './shops/shops.module';
import { TagsModule } from './tags/tags.module';
import { TaxesModule } from './taxes/taxes.module';
import { TypesModule } from './types/types.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { WebHookModule } from './webhook/webhook.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { WithdrawsModule } from './withdraws/withdraws.module';
import { AiModule } from './ai/ai.module';
import { FaqsModule } from './faqs/faqs.module';
import { TermsAndConditionsModule } from './terms-and-conditions/terms-and-conditions.module';
import { FlashSaleModule } from './flash-sale/flash-sale.module';
import { RefundPoliciesModule } from './refund-policies/refund-policies.module';
import { RefundReasonModule } from './refund-reasons/refund-reasons.module';
import { NotifyLogsModule } from './notify-logs/notify-logs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StripeModule } from '@golevelup/nestjs-stripe';
@Module({
  imports: [
    ConfigModule.forRoot(),
    /*
    StripeModule.forRoot(StripeModule, {
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
    }),
    */
    UsersModule,
    CommonModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    AnalyticsModule,
    AttributesModule,
    ShippingsModule,
    TaxesModule,
    TagsModule,
    ShopsModule,
    TypesModule,
    WithdrawsModule,
    UploadsModule,
    SettingsModule,
    CouponsModule,
    AddressesModule,
    ImportsModule,
    AuthModule,
    RefundsModule,
    AuthorsModule,
    ManufacturersModule,
    NewslettersModule,
    ReviewModule,
    QuestionModule,
    WishlistsModule,
    ReportsModule,
    FeedbackModule,
    PaymentMethodModule,
    PaymentIntentModule,
    WebHookModule,
    PaymentModule,
    AiModule,
    FaqsModule,
    NotifyLogsModule,
    TermsAndConditionsModule,
    FlashSaleModule,
    RefundPoliciesModule,
    RefundReasonModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'uploadsuser'), // Diretório onde os arquivos foram salvos
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'xml', 'json', 'zip', 'rar', '7z', 'tar', 'gz', 'mp4', 'mp3', 'avi', 'flv', 'mov', 'wmv', 'wma', 'wav', 'ogg', 'webm', 'mkv', 'm4a', 'm4v', 'mpg', 'mpeg', 'm4v', '3gp', '3g2', 'ts', 'flac', 'aac', 'opus', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v'],
      },
      exclude: ['/api/(.*)'],
    }),
    StripeModule.forRoot(StripeModule, {
      apiKey: "sk_test_51K9Z0dFu1cI6jFK0fMQMcNLYOiNYOlUjEeGQ9fL7jC4XdmtGrCyI0EgOGIZhrAztKqAG4zlHi4brnpmIUZUp1uVB00QmAlmkbC",
      apiVersion: '2022-11-15',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
