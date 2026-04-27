import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Users Module
 *
 * Provides user-related endpoints.
 * Exports service for use in other modules if needed.
 */
@Module({
  controllers: [UsersController],
  providers: [PrismaService, UserRepository, UserService],
  exports: [UserService],
})
export class UsersModule {}
