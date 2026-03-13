import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, PaymentStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ServicesService } from '../services/services.service';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly servicesService: ServicesService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    dto: CreateBookingDto,
    user: AuthUser,
  ): Promise<{ booking: Booking; checkoutUrl: string | null }> {
    const service = await this.servicesService.findOne(dto.serviceId);

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    if (checkOut <= checkIn) {
      throw new BadRequestException('checkOutDate must be after checkInDate');
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const nightlyRateCents = Math.round(Number(service.price) * 100);
    const totalPrice = Number(((nightlyRateCents * nights) / 100).toFixed(2));

    const booking = this.bookingRepo.create({
      ...dto,
      userId: user.id,
      userName: user.name,
      email: user.email,
      price: totalPrice,
      paymentStatus: PaymentStatus.PENDING,
    });
    const savedBooking = await this.bookingRepo.save(booking);

    const clientUrl = this.resolveClientUrl();
    const session = await this.stripeService.createCheckoutSession({
      bookingId: savedBooking.id,
      serviceName: service.name,
      unitAmountCents: nightlyRateCents,
      quantity: nights,
      successUrl: `${clientUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientUrl}/booking/cancel`,
    });

    savedBooking.stripeSessionId = session.id;
    await this.bookingRepo.save(savedBooking);

    return { booking: savedBooking, checkoutUrl: session.url };
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findForUser(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }
    return booking;
  }

  async findOneForUser(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id, userId } });
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }
    return booking;
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepo.remove(booking);
  }

  async markAsPaid(
    stripeSessionId: string,
  ): Promise<{ booking: Booking; justMarkedPaid: boolean }> {
    const booking = await this.bookingRepo.findOne({
      where: { stripeSessionId },
    });
    if (!booking) {
      throw new NotFoundException(
        `Booking with session "${stripeSessionId}" not found`,
      );
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      return { booking, justMarkedPaid: false };
    }

    booking.paymentStatus = PaymentStatus.PAID;
    const savedBooking = await this.bookingRepo.save(booking);
    return { booking: savedBooking, justMarkedPaid: true };
  }

  async confirmPaidForUser(
    stripeSessionId: string,
    userId: string,
  ): Promise<{ booking: Booking; justMarkedPaid: boolean }> {
    const booking = await this.bookingRepo.findOne({
      where: { stripeSessionId, userId },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with session "${stripeSessionId}" not found`,
      );
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      return { booking, justMarkedPaid: false };
    }

    booking.paymentStatus = PaymentStatus.PAID;
    const savedBooking = await this.bookingRepo.save(booking);
    return { booking: savedBooking, justMarkedPaid: true };
  }

  private resolveClientUrl(): string {
    const configuredUrl = this.configService.get<string>('CLIENT_URL')?.trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (configuredUrl) {
      const normalizedConfiguredUrl = configuredUrl.startsWith('http')
        ? configuredUrl
        : `https://${configuredUrl}`;
      const isLocalhostConfigured = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(
        configuredUrl,
      );

      if (!isProduction || !isLocalhostConfigured) {
        return normalizedConfiguredUrl;
      }
    }

    const vercelUrl = this.configService.get<string>('VERCEL_URL')?.trim();
    if (vercelUrl) {
      return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    }

    if (!isProduction) {
      return 'http://localhost:3000';
    }

    throw new InternalServerErrorException(
      'CLIENT_URL is invalid for production. Set it to your deployed frontend URL.',
    );
  }
}
