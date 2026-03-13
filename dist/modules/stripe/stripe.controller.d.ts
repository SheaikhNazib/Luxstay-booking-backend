import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { BookingsService } from '../bookings/bookings.service';
import { EmailService } from '../email/email.service';
export declare class StripeController {
    private readonly stripeService;
    private readonly bookingsService;
    private readonly emailService;
    private readonly configService;
    private readonly logger;
    constructor(stripeService: StripeService, bookingsService: BookingsService, emailService: EmailService, configService: ConfigService);
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
