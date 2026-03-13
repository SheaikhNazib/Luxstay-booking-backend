"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async sendBookingConfirmation(payload) {
        const { to, userName, serviceName, checkInDate, checkOutDate, price, bookingId, } = payload;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #1a73e8; color: #fff; padding: 24px 32px; }
            .header h1 { margin: 0; font-size: 24px; }
            .body { padding: 32px; color: #333; }
            .detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .footer { background: #f4f4f4; text-align: center; padding: 16px; font-size: 12px; color: #999; }
            .badge { background: #34a853; color: #fff; padding: 4px 12px; border-radius: 16px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
              <span class="badge">&#10003; Payment Successful</span>
            </div>
            <div class="body">
              <p>Dear <strong>${userName}</strong>,</p>
              <p>Thank you for your booking. Your reservation has been confirmed and payment received.</p>

              <h3>Booking Details</h3>
              <div class="detail-row"><span class="label">Booking ID</span><span>${bookingId}</span></div>
              <div class="detail-row"><span class="label">Room / Service</span><span>${serviceName}</span></div>
              <div class="detail-row"><span class="label">Check-in Date</span><span>${checkInDate}</span></div>
              <div class="detail-row"><span class="label">Check-out Date</span><span>${checkOutDate}</span></div>
              <div class="detail-row"><span class="label">Total Paid</span><span><strong>$${Number(price).toFixed(2)}</strong></span></div>

              <p style="margin-top:24px;">If you have any questions, please contact our support team.</p>
              <p>We look forward to welcoming you!</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Hotel Booking System. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
        try {
            await this.transporter.sendMail({
                from: `"Hotel Booking System" <${this.configService.get('EMAIL_USER')}>`,
                to,
                subject: `Booking Confirmed — ${serviceName}`,
                html,
            });
            this.logger.log(`Confirmation email sent to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map