import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { StripeModule } from '@golevelup/nestjs-stripe';

@Module({
  imports: [
    AuthModule,
    StripeModule.forRoot(StripeModule, {
      apiKey: "sk_test_51K9Z0dFu1cI6jFK0fMQMcNLYOiNYOlUjEeGQ9fL7jC4XdmtGrCyI0EgOGIZhrAztKqAG4zlHi4brnpmIUZUp1uVB00QmAlmkbC",
      apiVersion: '2022-11-15',
    }),
  ],
  providers: [ PaypalPaymentService, StripePaymentService],
  exports: [ PaypalPaymentService, StripePaymentService],
})
export class PaymentModule {}
