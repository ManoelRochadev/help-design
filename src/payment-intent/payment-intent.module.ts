import { Module } from '@nestjs/common';
import { PaymentIntentController } from './payment-intent.controller';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService],
})
export class PaymentIntentModule {}
