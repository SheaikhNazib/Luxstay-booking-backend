import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ServicesModule,
    BookingsModule,
    StripeModule,
    EmailModule,
    AuthModule,
  ],
})
export class AppModule {}
