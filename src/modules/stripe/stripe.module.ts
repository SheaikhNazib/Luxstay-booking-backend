import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, forwardRef(() => BookingsModule), EmailModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
