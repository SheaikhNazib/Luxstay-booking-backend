import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateSessionParams {
  bookingId: string;
  serviceName: string;
  unitAmountCents: number;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2026-02-25.clover' },
    );
  }

  async createCheckoutSession(
    params: CreateSessionParams,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: params.unitAmountCents,
            product_data: {
              name: params.serviceName,
              description: `Booking ID: ${params.bookingId}`,
            },
          },
          quantity: params.quantity,
        },
      ],
      metadata: { bookingId: params.bookingId },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  constructEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
