import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
//import { StripePaymentService } from './stripe-payment.service';

@Module({
  imports: [AuthModule],
  providers: [ PaypalPaymentService],
  exports: [ PaypalPaymentService],
})
export class PaymentModule {}
