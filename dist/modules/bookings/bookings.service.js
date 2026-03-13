"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./booking.entity");
const services_service_1 = require("../services/services.service");
const stripe_service_1 = require("../stripe/stripe.service");
const config_1 = require("@nestjs/config");
let BookingsService = class BookingsService {
    bookingRepo;
    servicesService;
    stripeService;
    configService;
    constructor(bookingRepo, servicesService, stripeService, configService) {
        this.bookingRepo = bookingRepo;
        this.servicesService = servicesService;
        this.stripeService = stripeService;
        this.configService = configService;
    }
    async create(dto, user) {
        const service = await this.servicesService.findOne(dto.serviceId);
        const checkIn = new Date(dto.checkInDate);
        const checkOut = new Date(dto.checkOutDate);
        if (checkOut <= checkIn) {
            throw new common_1.BadRequestException('checkOutDate must be after checkInDate');
        }
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const nightlyRateCents = Math.round(Number(service.price) * 100);
        const totalPrice = Number(((nightlyRateCents * nights) / 100).toFixed(2));
        const booking = this.bookingRepo.create({
            ...dto,
            userId: user.id,
            userName: user.name,
            email: user.email,
            price: totalPrice,
            paymentStatus: booking_entity_1.PaymentStatus.PENDING,
        });
        const savedBooking = await this.bookingRepo.save(booking);
        const clientUrl = this.configService.get('CLIENT_URL');
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
    async findAll() {
        return this.bookingRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findForUser(userId) {
        return this.bookingRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const booking = await this.bookingRepo.findOne({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with id "${id}" not found`);
        }
        return booking;
    }
    async findOneForUser(id, userId) {
        const booking = await this.bookingRepo.findOne({ where: { id, userId } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with id "${id}" not found`);
        }
        return booking;
    }
    async remove(id) {
        const booking = await this.findOne(id);
        await this.bookingRepo.remove(booking);
    }
    async markAsPaid(stripeSessionId) {
        const booking = await this.bookingRepo.findOne({
            where: { stripeSessionId },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with session "${stripeSessionId}" not found`);
        }
        if (booking.paymentStatus === booking_entity_1.PaymentStatus.PAID) {
            return { booking, justMarkedPaid: false };
        }
        booking.paymentStatus = booking_entity_1.PaymentStatus.PAID;
        const savedBooking = await this.bookingRepo.save(booking);
        return { booking: savedBooking, justMarkedPaid: true };
    }
    async confirmPaidForUser(stripeSessionId, userId) {
        const booking = await this.bookingRepo.findOne({
            where: { stripeSessionId, userId },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with session "${stripeSessionId}" not found`);
        }
        if (booking.paymentStatus === booking_entity_1.PaymentStatus.PAID) {
            return { booking, justMarkedPaid: false };
        }
        booking.paymentStatus = booking_entity_1.PaymentStatus.PAID;
        const savedBooking = await this.bookingRepo.save(booking);
        return { booking: savedBooking, justMarkedPaid: true };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        services_service_1.ServicesService,
        stripe_service_1.StripeService,
        config_1.ConfigService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map