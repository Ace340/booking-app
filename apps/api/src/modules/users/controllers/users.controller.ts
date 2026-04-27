/**
 * Users Controller
 *
 * Example controller demonstrating authentication and authorization usage.
 * Shows how to protect routes and use role-based access control.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  Public,
  Roles,
  AuthUser as AuthUserType,
} from '../../auth';
import { UserRole } from '@prisma/client';

/**
 * Users Controller
 *
 * Demonstrates various authentication patterns:
 * - Public routes (no authentication)
 * - Protected routes (authentication required)
 * - Role-protected routes (specific roles required)
 */
@Controller('users')
export class UsersController {
  /**
   * Public endpoint - no authentication required
   */
  @Get('public')
  @Public()
  getPublicInfo() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Protected endpoint - authentication required
   * Returns current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthUserType) {
    return {
      message: 'This is a protected endpoint',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Admin-only endpoint - admin role required
   */
  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminDashboard(@CurrentUser() user: AuthUserType) {
    return {
      message: 'This is an admin-only endpoint',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      dashboardData: {
        totalUsers: 0,
        activeUsers: 0,
        revenue: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Staff or admin endpoint - staff or admin role required
   */
  @Get('staff/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  getStaffSchedule(@CurrentUser() user: AuthUserType) {
    return {
      message: 'This is a staff/admin endpoint',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      schedule: [
        { time: '09:00', appointment: 'Client A' },
        { time: '10:00', appointment: 'Client B' },
        { time: '11:00', appointment: 'Client C' },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Client endpoint - client role required
   */
  @Get('client/appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  getClientAppointments(@CurrentUser() user: AuthUserType) {
    return {
      message: 'This is a client-only endpoint',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      appointments: [
        { id: '1', date: '2024-01-15', time: '10:00', service: 'Haircut' },
        { id: '2', date: '2024-01-20', time: '14:00', service: 'Massage' },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint accessible by authenticated users (any role)
   * Demonstrates accessing specific user properties
   */
  @Get('email')
  @UseGuards(JwtAuthGuard)
  getUserEmail(@CurrentUser('email') email: string) {
    return {
      message: 'Your email is',
      email,
      timestamp: new Date().toISOString(),
    };
  }
}
