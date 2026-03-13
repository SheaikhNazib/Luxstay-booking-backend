import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface BookingConfirmationPayload {
  to: string;
  userName: string;
  serviceName: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  bookingId: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendBookingConfirmation(
    payload: BookingConfirmationPayload,
  ): Promise<void> {
    const {
      to,
      userName,
      serviceName,
      checkInDate,
      checkOutDate,
      price,
      bookingId,
    } = payload;

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
        from: `"Hotel Booking System" <${this.configService.get<string>('EMAIL_USER')}>`,
        to,
        subject: `Booking Confirmed — ${serviceName}`,
        html,
      });
      this.logger.log(`Confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
