import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConfirmBookingPaymentDto } from './dto/confirm-booking-payment.dto';
import { Booking } from './booking.entity';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
interface AuthenticatedRequest extends Request {
    user: AuthUser;
}
export declare class BookingsController {
    private readonly bookingsService;
    private readonly stripeService;
    private readonly emailService;
    constructor(bookingsService: BookingsService, stripeService: StripeService, emailService: EmailService);
    create(dto: CreateBookingDto, request: AuthenticatedRequest): Promise<{
        booking: Booking;
        checkoutUrl: string | null;
    }>;
    confirmPayment(dto: ConfirmBookingPaymentDto, request: AuthenticatedRequest): Promise<Booking>;
    findMine(request: AuthenticatedRequest): Promise<Booking[]>;
    findMineOne(id: string, request: AuthenticatedRequest): Promise<Booking>;
    findAll(): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    remove(id: string): Promise<void>;
}
export {};
