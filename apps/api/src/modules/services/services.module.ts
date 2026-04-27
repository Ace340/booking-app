import { Module } from '@nestjs/common';
import { ServiceController } from './controllers/service.controller';
import { ServiceService } from './services/service.service';
import { ServiceRepository } from './repositories/service.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Services Module
 *
 * Provides service management functionality.
 * Exports service for use in other modules if needed.
 */
@Module({
  controllers: [ServiceController],
  providers: [PrismaService, ServiceRepository, ServiceService],
  exports: [ServiceService],
})
export class ServicesModule {}
