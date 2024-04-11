import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { StripeModule } from '@golevelup/nestjs-stripe';

@Module({
  imports: [
    AuthModule,
    StripeModule.forRoot(StripeModule, {
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
    }),
  ],
  providers: [ PaypalPaymentService, StripePaymentService],
  exports: [ PaypalPaymentService, StripePaymentService],
})
export class PaymentModule {}
