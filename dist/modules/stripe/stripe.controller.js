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
var StripeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const stripe_service_1 = require("./stripe.service");
const bookings_service_1 = require("../bookings/bookings.service");
const email_service_1 = require("../email/email.service");
let StripeController = StripeController_1 = class StripeController {
    stripeService;
    bookingsService;
    emailService;
    configService;
    logger = new common_1.Logger(StripeController_1.name);
    constructor(stripeService, bookingsService, emailService, configService) {
        this.stripeService = stripeService;
        this.bookingsService = bookingsService;
        this.emailService = emailService;
        this.configService = configService;
    }
    async handleWebhook(req, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') ?? '';
        let event;
        try {
            event = this.stripeService.constructEvent(req.rawBody ?? Buffer.alloc(0), signature, webhookSecret);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown webhook error';
            this.logger.error(`Webhook signature verification failed: ${message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${message}`);
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown payment processing error';
                this.logger.error(`Error processing payment: ${message}`);
            }
        }
        return { received: true };
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe webhook endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event processed' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
exports.StripeController = StripeController = StripeController_1 = __decorate([
    (0, swagger_1.ApiTags)('Stripe Webhook'),
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        bookings_service_1.BookingsService,
        email_service_1.EmailService,
        config_1.ConfigService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map