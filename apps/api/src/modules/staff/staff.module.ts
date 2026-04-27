/**
 * Staff Module
 *
 * Provides staff management functionality.
 * Exports service for use in other modules if needed.
 */

import { Module } from '@nestjs/common';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { StaffRepository } from './repositories/staff.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [StaffController],
  providers: [PrismaService, StaffRepository, StaffService],
  exports: [StaffService],
})
export class StaffModule {}
