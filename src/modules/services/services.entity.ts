import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../bookings/booking.entity';

@Entity('services')
export class Service {
  @ApiProperty({ example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Deluxe King Room' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Spacious room with ocean view' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 199.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int' })
  capacity: number;

  @ApiProperty({
    example: 'https://example.com/room.jpg or data:image/jpeg;base64,...',
  })
  @Column({ type: 'text', nullable: true })
  image: string;

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
