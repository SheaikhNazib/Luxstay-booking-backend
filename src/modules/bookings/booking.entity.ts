import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../services/services.entity';
import { User } from '../auth/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  userName: string;

  @ApiProperty({ example: 'john@example.com' })
  @Column()
  email: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  userId: string | null;

  @ApiProperty()
  @Column()
  serviceId: string;

  @ApiProperty()
  @Column({ type: 'date' })
  checkInDate: string;

  @ApiProperty()
  @Column({ type: 'date' })
  checkOutDate: string;

  @ApiProperty({ example: 199.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  stripeSessionId: string;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ManyToOne(() => Service, (service) => service.bookings, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
