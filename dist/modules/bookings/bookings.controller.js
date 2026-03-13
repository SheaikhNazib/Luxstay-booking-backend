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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const confirm_booking_payment_dto_1 = require("./dto/confirm-booking-payment.dto");
const booking_entity_1 = require("./booking.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const stripe_service_1 = require("../stripe/stripe.service");
const email_service_1 = require("../email/email.service");
let BookingsController = class BookingsController {
    bookingsService;
    stripeService;
    emailService;
    constructor(bookingsService, stripeService, emailService) {
        this.bookingsService = bookingsService;
        this.stripeService = stripeService;
        this.emailService = emailService;
    }
    create(dto, request) {
        return this.bookingsService.create(dto, request.user);
    }
    async confirmPayment(dto, request) {
        const session = await this.stripeService.retrieveCheckoutSession(dto.sessionId);
        if (session.payment_status !== 'paid') {
            throw new common_1.BadRequestException('Stripe session has not been paid yet.');
        }
        const result = await this.bookingsService.confirmPaidForUser(dto.sessionId, request.user.id);
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
    findMine(request) {
        return this.bookingsService.findForUser(request.user.id);
    }
    findMineOne(id, request) {
        return this.bookingsService.findOneForUser(id, request.user.id);
    }
    findAll() {
        return this.bookingsService.findAll();
    }
    findOne(id) {
        return this.bookingsService.findOne(id);
    }
    remove(id) {
        return this.bookingsService.remove(id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create booking & get Stripe checkout URL' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Booking created, returns checkout URL',
        schema: {
            properties: {
                booking: { $ref: '#/components/schemas/Booking' },
                checkoutUrl: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('confirm-payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm Stripe payment for the current authenticated user booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: booking_entity_1.Booking }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_booking_payment_dto_1.ConfirmBookingPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get bookings for the current authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [booking_entity_1.Booking] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('me/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single booking for the current authenticated user' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: booking_entity_1.Booking }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findMineOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings (admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [booking_entity_1.Booking] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: booking_entity_1.Booking }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel/delete booking (admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Booking cancelled' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "remove", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService,
        stripe_service_1.StripeService,
        email_service_1.EmailService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map