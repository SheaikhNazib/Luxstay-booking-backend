import { Booking } from '../bookings/booking.entity';
export declare class Service {
    id: string;
    name: string;
    description: string;
    price: number;
    capacity: number;
    image: string;
    bookings: Booking[];
    createdAt: Date;
    updatedAt: Date;
}
