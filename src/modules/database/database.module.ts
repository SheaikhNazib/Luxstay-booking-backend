import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Service } from '../services/services.entity';
import { Booking } from '../bookings/booking.entity';
import { User } from '../auth/user.entity';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [Service, Booking, User],
          // Running schema sync on cold starts is expensive and risky in production.
          synchronize: parseBoolean(
            config.get<string>('DB_SYNCHRONIZE'),
            !isProduction,
          ),
          ssl: {
            rejectUnauthorized: false,
          },
          logging: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
