import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { BookingsService } from '../bookings/bookings.service';
import { EmailService } from '../email/email.service';

@ApiTags('Stripe Webhook')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingsService: BookingsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Event processed' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';

    let event: import('stripe').default.Event;
    try {
      event = this.stripeService.constructEvent(
        req.rawBody ?? Buffer.alloc(0),
        signature,
        webhookSecret,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown webhook error';
      this.logger.error(
        `Webhook signature verification failed: ${message}`,
      );
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        const result = await this.bookingsService.markAsPaid(session.id);

        if (result.justMarkedPaid) {
          await this.emailService.sendBookingConfirmation({
            to: result.booking.email,
            userName: result.booking.userName,
            serviceName: result.booking.service?.name ?? 'Hotel Service',
            checkInDate: result.booking.checkInDate,
            checkOutDate: result.booking.checkOutDate,
            price: Number(result.booking.price),
            bookingId: result.booking.id,
          });
        }

        this.logger.log(`Payment confirmed for booking ${result.booking.id}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown payment processing error';
        this.logger.error(`Error processing payment: ${message}`);
      }
    }

    return { received: true };
  }
}
