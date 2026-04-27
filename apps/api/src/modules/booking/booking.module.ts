import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { BookingRepository } from './repositories/booking.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Booking Module
 *
 * Provides appointment booking functionality.
 * Exports service for use in other modules if needed.
 */
@Module({
  controllers: [BookingController],
  providers: [PrismaService, BookingRepository, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
