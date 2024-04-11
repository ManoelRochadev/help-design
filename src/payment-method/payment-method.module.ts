import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import { SettingsModule } from 'src/settings/settings.module';
import {
  PaymentMethodController,
  SavePaymentMethodController,
  SetDefaultCartController,
} from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { StripeModule } from '@golevelup/nestjs-stripe';

@Module({
  imports: [AuthModule, PaymentModule, SettingsModule,
    StripeModule.forRoot(StripeModule, {
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
    })],
  controllers: [
    PaymentMethodController,
    SetDefaultCartController,
    SavePaymentMethodController,
  ],
  providers: [PaymentMethodService, StripePaymentService],
})
export class PaymentMethodModule {}
