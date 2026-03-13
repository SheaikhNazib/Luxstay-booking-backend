import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConfirmBookingPaymentDto } from './dto/confirm-booking-payment.dto';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create booking & get Stripe checkout URL' })
  @ApiResponse({
    status: 201,
    description: 'Booking created, returns checkout URL',
    schema: {
      properties: {
        booking: { $ref: '#/components/schemas/Booking' },
        checkoutUrl: { type: 'string' },
      },
    },
  })
  create(@Body() dto: CreateBookingDto, @Req() request: AuthenticatedRequest) {
    return this.bookingsService.create(dto, request.user);
  }

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm Stripe payment for the current authenticated user booking' })
  @ApiResponse({ status: 200, type: Booking })
  async confirmPayment(
    @Body() dto: ConfirmBookingPaymentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Booking> {
    const session = await this.stripeService.retrieveCheckoutSession(dto.sessionId);
    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Stripe session has not been paid yet.');
    }

    const result = await this.bookingsService.confirmPaidForUser(
      dto.sessionId,
      request.user.id,
    );

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

    return result.booking;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings for the current authenticated user' })
  @ApiResponse({ status: 200, type: [Booking] })
  findMine(@Req() request: AuthenticatedRequest): Promise<Booking[]> {
    return this.bookingsService.findForUser(request.user.id);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single booking for the current authenticated user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: Booking })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findMineOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Booking> {
    return this.bookingsService.findOneForUser(id, request.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings (admin)' })
  @ApiResponse({ status: 200, type: [Booking] })
  findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: Booking })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Booking> {
    return this.bookingsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel/delete booking (admin)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Booking cancelled' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bookingsService.remove(id);
  }
}
