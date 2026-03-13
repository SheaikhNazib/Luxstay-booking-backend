import { Service } from '../services/services.entity';
import { User } from '../auth/user.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    CANCELLED = "cancelled"
}
export declare class Booking {
    id: string;
    userName: string;
    email: string;
    userId: string | null;
    serviceId: string;
    checkInDate: string;
    checkOutDate: string;
    price: number;
    stripeSessionId: string;
    paymentStatus: PaymentStatus;
    service: Service;
    user: User | null;
    createdAt: Date;
}
