/**
 * Root Application Module
 *
 * Wires together every feature module and shared provider.
 * Uses AppConfigModule (validated, typed config) instead of raw ConfigModule.
 */

import { Module } from '@nestjs/common';
import { AppConfigModule } from './config';
import { HealthModule } from './modules/health';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { BookingModule } from './modules/booking';
import { NotificationModule } from './modules/notification';
import { PaymentModule } from './modules/payment';
import { PrismaService } from './common/prisma/prisma.service';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
    AuthModule,
    UsersModule,
    BookingModule,
    NotificationModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
