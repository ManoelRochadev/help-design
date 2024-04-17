import { Module } from '@nestjs/common';
import { PaymentIntentController } from './payment-intent.controller';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentModule } from 'src/payment/payment.module';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { StripePaymentService } from 'src/payment/stripe-payment.service';

@Module({
  imports: [
    PaymentModule, 
    StripeModule.forRoot(StripeModule, {
      apiKey: "sk_test_51K9Z0dFu1cI6jFK0fMQMcNLYOiNYOlUjEeGQ9fL7jC4XdmtGrCyI0EgOGIZhrAztKqAG4zlHi4brnpmIUZUp1uVB00QmAlmkbC",
      apiVersion: '2022-11-15',
    }),
  ],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService, StripePaymentService],
})
export class PaymentIntentModule {}
