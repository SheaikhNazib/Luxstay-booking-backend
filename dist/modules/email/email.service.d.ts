import { ConfigService } from '@nestjs/config';
export interface BookingConfirmationPayload {
    to: string;
    userName: string;
    serviceName: string;
    checkInDate: string;
    checkOutDate: string;
    price: number;
    bookingId: string;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendBookingConfirmation(payload: BookingConfirmationPayload): Promise<void>;
}
