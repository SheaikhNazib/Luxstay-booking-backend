import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ServicesService } from '../services/services.service';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
export declare class BookingsService {
    private readonly bookingRepo;
    private readonly servicesService;
    private readonly stripeService;
    private readonly configService;
    constructor(bookingRepo: Repository<Booking>, servicesService: ServicesService, stripeService: StripeService, configService: ConfigService);
    create(dto: CreateBookingDto, user: AuthUser): Promise<{
        booking: Booking;
        checkoutUrl: string | null;
    }>;
    findAll(): Promise<Booking[]>;
    findForUser(userId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    findOneForUser(id: string, userId: string): Promise<Booking>;
    remove(id: string): Promise<void>;
    markAsPaid(stripeSessionId: string): Promise<{
        booking: Booking;
        justMarkedPaid: boolean;
    }>;
    confirmPaidForUser(stripeSessionId: string, userId: string): Promise<{
        booking: Booking;
        justMarkedPaid: boolean;
    }>;
}
