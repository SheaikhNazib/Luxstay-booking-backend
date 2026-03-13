import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Service } from '../services/services.entity';
import { Booking } from '../bookings/booking.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Service, Booking, User],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
