/**
 * BookingService Unit Tests
 *
 * Tests booking business logic with dependency injection:
 * - BookingRepository is mocked (data access layer)
 * - EventEmitter2 is mocked (notification side effects)
 *
 * Focus: booking creation, double-booking prevention, cancellation, authorization.
 */

import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentStatus } from '@prisma/client';

import { BookingService } from './booking.service';
import { BookingRepository } from '../repositories/booking.repository';

import {
  createMockAuthUser,
  createMockAdminUser,
  createMockStaffUser,
  createMockAppointment,
  createMockCreateBookingDto,
  createMockStaff,
  createMockService,
} from '../../../../test/utils/mock-factories';

describe('BookingService', () => {
  let service: BookingService;
  let repository: jest.Mocked<BookingRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByFilters: jest.fn(),
            findOverlapping: jest.fn(),
            findStaffById: jest.fn(),
            findServiceById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BookingService);
    repository = module.get(BookingRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  // ---------------------------------------------------------------------------
  // Helper — set up a valid creation scenario (all mocks for happy path)
  // ---------------------------------------------------------------------------
  const setupValidCreationMocks = (overrides: { serviceDuration?: number } = {}) => {
    repository.findStaffById.mockResolvedValue(createMockStaff());
    repository.findServiceById.mockResolvedValue(
      createMockService({ duration: overrides.serviceDuration ?? 60 }),
    );
    repository.findOverlapping.mockResolvedValue([]);
    repository.create.mockResolvedValue(
      createMockAppointment() as any,
    );
  };

  // ===========================================================================
  // createBooking
  // ===========================================================================
  describe('createBooking', () => {
    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------
    it('creates a booking successfully with valid data', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto({
        startTime: '2026-06-01T10:00:00.000Z',
      });
      setupValidCreationMocks({ serviceDuration: 60 });

      const result = await service.createBooking(dto, user);

      expect(result).toBeDefined();
      expect(result.id).toBe('appt-1');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: user.companyId,
          userId: user.id,
          staffId: dto.staffId,
          serviceId: dto.serviceId,
        }),
      );
    });

    it('calculates end time from service duration', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto({
        startTime: '2026-06-01T10:00:00.000Z',
      });
      setupValidCreationMocks({ serviceDuration: 45 });

      await service.createBooking(dto, user);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: new Date('2026-06-01T10:00:00.000Z'),
          endTime: new Date('2026-06-01T10:45:00.000Z'),
        }),
      );
    });

    it('emits booking created notification event', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto();
      setupValidCreationMocks();

      await service.createBooking(dto, user);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.booking.created',
        expect.objectContaining({
          companyId: user.companyId,
          userId: user.id,
          appointmentId: 'appt-1',
        }),
      );
    });

    // -------------------------------------------------------------------------
    // Validation failures
    // -------------------------------------------------------------------------
    it('throws BadRequestException when start time is in the past', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto({
        startTime: '2020-01-01T10:00:00.000Z',
      });

      await expect(service.createBooking(dto, user)).rejects.toThrow(BadRequestException);
      await expect(service.createBooking(dto, user)).rejects.toThrow(
        'Start time must be in the future',
      );
    });

    it('throws NotFoundException when staff does not exist', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto();
      repository.findStaffById.mockResolvedValue(null);

      await expect(service.createBooking(dto, user)).rejects.toThrow(NotFoundException);
      await expect(service.createBooking(dto, user)).rejects.toThrow(
        'Staff member not found',
      );
    });

    it('throws NotFoundException when service does not exist', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto();
      repository.findStaffById.mockResolvedValue(createMockStaff());
      repository.findServiceById.mockResolvedValue(null);

      await expect(service.createBooking(dto, user)).rejects.toThrow(NotFoundException);
      await expect(service.createBooking(dto, user)).rejects.toThrow(
        'Service not found',
      );
    });

    // -------------------------------------------------------------------------
    // Double booking prevention (primary requirement)
    // -------------------------------------------------------------------------
    describe('double booking prevention', () => {
      it('rejects booking when exact time overlap exists', async () => {
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T10:00:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([
          createMockAppointment() as any,
        ]);

        await expect(service.createBooking(dto, user)).rejects.toThrow(ConflictException);
        await expect(service.createBooking(dto, user)).rejects.toThrow(
          'Staff member already has a booking at this time',
        );
      });

      it('rejects booking when new booking starts during an existing booking', async () => {
        // Existing: 10:00–11:00  |  New: 10:30–11:30 (starts during existing)
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T10:30:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([
          createMockAppointment({
            startTime: new Date('2026-06-01T10:00:00.000Z'),
            endTime: new Date('2026-06-01T11:00:00.000Z'),
          }) as any,
        ]);

        await expect(service.createBooking(dto, user)).rejects.toThrow(ConflictException);
      });

      it('rejects booking when new booking ends during an existing booking', async () => {
        // Existing: 10:00–11:00  |  New: 09:30–10:30 (ends during existing)
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T09:30:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([
          createMockAppointment({
            startTime: new Date('2026-06-01T10:00:00.000Z'),
            endTime: new Date('2026-06-01T11:00:00.000Z'),
          }) as any,
        ]);

        await expect(service.createBooking(dto, user)).rejects.toThrow(ConflictException);
      });

      it('rejects booking when new booking wraps around an existing booking', async () => {
        // Existing: 10:00–11:00  |  New: 09:00–12:00 (wraps existing)
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T09:00:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 180 }));
        repository.findOverlapping.mockResolvedValue([
          createMockAppointment({
            startTime: new Date('2026-06-01T10:00:00.000Z'),
            endTime: new Date('2026-06-01T11:00:00.000Z'),
          }) as any,
        ]);

        await expect(service.createBooking(dto, user)).rejects.toThrow(ConflictException);
      });

      it('allows booking when new booking ends exactly when existing starts (adjacent)', async () => {
        // Existing: 10:00–11:00  |  New: 09:00–10:00 (ends exactly at start)
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T09:00:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([]); // No overlap
        repository.create.mockResolvedValue(createMockAppointment() as any);

        const result = await service.createBooking(dto, user);

        expect(result).toBeDefined();
        expect(repository.create).toHaveBeenCalled();
      });

      it('allows booking when new booking starts exactly when existing ends (adjacent)', async () => {
        // Existing: 10:00–11:00  |  New: 11:00–12:00 (starts exactly at end)
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T11:00:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([]); // No overlap
        repository.create.mockResolvedValue(createMockAppointment() as any);

        const result = await service.createBooking(dto, user);

        expect(result).toBeDefined();
        expect(repository.create).toHaveBeenCalled();
      });

      it('delegates overlap detection to repository with correct parameters', async () => {
        const user = createMockAuthUser();
        const dto = createMockCreateBookingDto({
          startTime: '2026-06-01T10:00:00.000Z',
        });

        repository.findStaffById.mockResolvedValue(createMockStaff());
        repository.findServiceById.mockResolvedValue(createMockService({ duration: 60 }));
        repository.findOverlapping.mockResolvedValue([]);
        repository.create.mockResolvedValue(createMockAppointment() as any);

        await service.createBooking(dto, user);

        expect(repository.findOverlapping).toHaveBeenCalledWith(
          'staff-1',
          new Date('2026-06-01T10:00:00.000Z'),
          new Date('2026-06-01T11:00:00.000Z'),
          'company-1',
        );
      });
    });
  });

  // ===========================================================================
  // getBookings
  // ===========================================================================
  describe('getBookings', () => {
    it('returns filtered bookings for company', async () => {
      const user = createMockAdminUser();
      const mockAppointments = [createMockAppointment() as any];
      repository.findByFilters.mockResolvedValue(mockAppointments);

      const result = await service.getBookings(user, { staffId: 'staff-1' });

      expect(result).toEqual(mockAppointments);
      expect(repository.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-1',
          staffId: 'staff-1',
        }),
      );
    });

    it('restricts CLIENT users to their own bookings only', async () => {
      const client = createMockAuthUser({ id: 'user-1', role: 'CLIENT' });
      repository.findByFilters.mockResolvedValue([]);

      await service.getBookings(client);

      expect(repository.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: client.companyId,
          userId: client.id,
        }),
      );
    });

    it('allows ADMIN users to see all bookings in company', async () => {
      const admin = createMockAdminUser();
      repository.findByFilters.mockResolvedValue([]);

      await service.getBookings(admin);

      expect(repository.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: admin.companyId,
        }),
      );

      // Should NOT have userId filter
      const calledWith = repository.findByFilters.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty('userId');
    });
  });

  // ===========================================================================
  // cancelBooking
  // ===========================================================================
  describe('cancelBooking', () => {
    it('cancels a booking successfully when user is the owner', async () => {
      const user = createMockAuthUser({ id: 'user-1' });
      const appointment = createMockAppointment({
        userId: 'user-1',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);
      repository.update.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      } as any);

      const result = await service.cancelBooking('appt-1', user);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(repository.update).toHaveBeenCalledWith('appt-1', {
        status: AppointmentStatus.CANCELLED,
      });
    });

    it('cancels a booking when user is assigned staff', async () => {
      const staffUser = createMockStaffUser({ id: 'staff-1' });
      const appointment = createMockAppointment({
        userId: 'user-1',
        staffId: 'staff-1',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);
      repository.update.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      } as any);

      const result = await service.cancelBooking('appt-1', staffUser);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('cancels a booking when user is admin', async () => {
      const admin = createMockAdminUser();
      const appointment = createMockAppointment({
        userId: 'different-user',
        staffId: 'different-staff',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);
      repository.update.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      } as any);

      const result = await service.cancelBooking('appt-1', admin);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('throws NotFoundException when appointment does not exist', async () => {
      const user = createMockAuthUser();
      repository.findById.mockResolvedValue(null);

      await expect(service.cancelBooking('nonexistent', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when appointment belongs to different company', async () => {
      const user = createMockAuthUser({ companyId: 'company-1' });
      const appointment = createMockAppointment({
        companyId: 'company-2',
        userId: user.id,
      });

      repository.findById.mockResolvedValue(appointment as any);

      await expect(service.cancelBooking('appt-1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when user is not authorized', async () => {
      const otherUser = createMockAuthUser({
        id: 'other-user',
        role: 'CLIENT',
      });
      const appointment = createMockAppointment({
        userId: 'user-1',
        staffId: 'staff-1',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);

      await expect(service.cancelBooking('appt-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when appointment is already cancelled', async () => {
      const user = createMockAuthUser({ id: 'user-1' });
      const appointment = createMockAppointment({
        userId: 'user-1',
        status: AppointmentStatus.CANCELLED,
      });

      repository.findById.mockResolvedValue(appointment as any);

      await expect(service.cancelBooking('appt-1', user)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelBooking('appt-1', user)).rejects.toThrow(
        'Only scheduled appointments can be cancelled',
      );
    });

    it('emits booking cancelled notification event', async () => {
      const user = createMockAuthUser({ id: 'user-1' });
      const appointment = createMockAppointment({
        userId: 'user-1',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);
      repository.update.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      } as any);

      await service.cancelBooking('appt-1', user);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.booking.cancelled',
        expect.objectContaining({
          appointmentId: 'appt-1',
        }),
      );
    });
  });

  // ===========================================================================
  // Notification resilience
  // ===========================================================================
  describe('notification resilience', () => {
    it('does not fail booking creation when event emission throws', async () => {
      const user = createMockAuthUser();
      const dto = createMockCreateBookingDto();
      setupValidCreationMocks();

      // Make eventEmitter.emit throw
      eventEmitter.emit.mockImplementation(() => {
        throw new Error('Event system down');
      });

      // Should NOT throw — notification failures are swallowed
      const result = await service.createBooking(dto, user);

      expect(result).toBeDefined();
      expect(result.id).toBe('appt-1');
    });

    it('does not fail booking cancellation when event emission throws', async () => {
      const user = createMockAuthUser({ id: 'user-1' });
      const appointment = createMockAppointment({
        userId: 'user-1',
        status: AppointmentStatus.SCHEDULED,
      });

      repository.findById.mockResolvedValue(appointment as any);
      repository.update.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      } as any);

      eventEmitter.emit.mockImplementation(() => {
        throw new Error('Event system down');
      });

      const result = await service.cancelBooking('appt-1', user);

      expect(result).toBeDefined();
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });
  });
});
