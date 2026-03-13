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
export declare class StripeService {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    createCheckoutSession(params: CreateSessionParams): Promise<Stripe.Checkout.Session>;
    retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session>;
    constructEvent(payload: Buffer, signature: string, secret: string): Stripe.Event;
}
