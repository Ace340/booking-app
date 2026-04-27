/**
 * BookingRepository Unit Tests
 *
 * Tests data access logic with PrismaService mocked.
 * Focus: overlap detection query, filter building, CRUD operations.
 */

import { Test } from '@nestjs/testing';
import { AppointmentStatus } from '@prisma/client';

import { BookingRepository } from './booking.repository';
import { PrismaService } from '../../../common/prisma/prisma.service';

import { createMockAppointment } from '../../../../test/utils/mock-factories';

describe('BookingRepository', () => {
  let repository: BookingRepository;
  let prisma: {
    appointment: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    staff: {
      findFirst: jest.Mock;
    };
    service: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      staff: {
        findFirst: jest.fn(),
      },
      service: {
        findFirst: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        BookingRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get(BookingRepository);
  });

  // ===========================================================================
  // findOverlapping — core overlap detection
  // ===========================================================================
  describe('findOverlapping', () => {
    it('queries with correct overlap conditions', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const startTime = new Date('2026-06-01T10:00:00.000Z');
      const endTime = new Date('2026-06-01T11:00:00.000Z');

      await repository.findOverlapping('staff-1', startTime, endTime, 'company-1');

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: {
          staffId: 'staff-1',
          companyId: 'company-1',
          status: AppointmentStatus.SCHEDULED,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
    });

    it('excludes a specific appointment when excludeId is provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const startTime = new Date('2026-06-01T10:00:00.000Z');
      const endTime = new Date('2026-06-01T11:00:00.000Z');

      await repository.findOverlapping(
        'staff-1',
        startTime,
        endTime,
        'company-1',
        'exclude-this-id',
      );

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: { not: 'exclude-this-id' },
        }),
      });
    });

    it('returns overlapping appointments when they exist', async () => {
      const overlapping = [
        createMockAppointment({
          startTime: new Date('2026-06-01T10:00:00.000Z'),
          endTime: new Date('2026-06-01T11:00:00.000Z'),
        }),
      ];
      prisma.appointment.findMany.mockResolvedValue(overlapping);

      const result = await repository.findOverlapping(
        'staff-1',
        new Date('2026-06-01T10:30:00.000Z'),
        new Date('2026-06-01T11:30:00.000Z'),
        'company-1',
      );

      expect(result).toHaveLength(1);
    });

    it('returns empty array when no overlaps exist', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await repository.findOverlapping(
        'staff-1',
        new Date('2026-06-01T09:00:00.000Z'),
        new Date('2026-06-01T10:00:00.000Z'),
        'company-1',
      );

      expect(result).toEqual([]);
    });

    it('only checks SCHEDULED appointments (not cancelled or completed)', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findOverlapping(
        'staff-1',
        new Date('2026-06-01T10:00:00.000Z'),
        new Date('2026-06-01T11:00:00.000Z'),
        'company-1',
      );

      const callArgs = prisma.appointment.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe(AppointmentStatus.SCHEDULED);
    });
  });

  // ===========================================================================
  // findByFilters
  // ===========================================================================
  describe('findByFilters', () => {
    it('filters by companyId only when no other filters provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({ companyId: 'company-1' });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where).toEqual({ companyId: 'company-1' });
    });

    it('applies staffId filter when provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({
        companyId: 'company-1',
        staffId: 'staff-1',
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.staffId).toBe('staff-1');
    });

    it('applies userId filter when provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({
        companyId: 'company-1',
        userId: 'user-1',
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe('user-1');
    });

    it('applies status filter when provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({
        companyId: 'company-1',
        status: AppointmentStatus.CANCELLED,
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('applies date range filter when dateFrom and dateTo provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const dateFrom = new Date('2026-06-01T00:00:00.000Z');
      const dateTo = new Date('2026-06-30T23:59:59.000Z');

      await repository.findByFilters({
        companyId: 'company-1',
        dateFrom,
        dateTo,
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.startTime).toEqual({
        gte: dateFrom,
        lte: dateTo,
      });
    });

    it('applies only dateFrom when dateTo is not provided', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const dateFrom = new Date('2026-06-01T00:00:00.000Z');

      await repository.findByFilters({
        companyId: 'company-1',
        dateFrom,
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.startTime).toEqual({ gte: dateFrom });
    });

    it('applies all filters simultaneously', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({
        companyId: 'company-1',
        staffId: 'staff-1',
        userId: 'user-1',
        status: AppointmentStatus.SCHEDULED,
        dateFrom: new Date('2026-06-01'),
        dateTo: new Date('2026-06-30'),
      });

      const where = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(where.companyId).toBe('company-1');
      expect(where.staffId).toBe('staff-1');
      expect(where.userId).toBe('user-1');
      expect(where.status).toBe(AppointmentStatus.SCHEDULED);
      expect(where.startTime).toBeDefined();
    });

    it('orders results by startTime ascending', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      await repository.findByFilters({ companyId: 'company-1' });

      const orderBy = prisma.appointment.findMany.mock.calls[0][0].orderBy;
      expect(orderBy).toEqual({ startTime: 'asc' });
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================
  describe('findById', () => {
    it('returns appointment with related entities', async () => {
      const mockAppointment = createMockAppointment();
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await repository.findById('appt-1');

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        include: expect.objectContaining({
          user: expect.any(Object),
          staff: expect.any(Object),
          service: expect.any(Object),
        }),
      });
    });

    it('returns null when appointment not found', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    it('creates appointment with correct data', async () => {
      const mockAppointment = createMockAppointment();
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const bookingData = {
        companyId: 'company-1',
        userId: 'user-1',
        staffId: 'staff-1',
        serviceId: 'service-1',
        startTime: new Date('2026-06-01T10:00:00.000Z'),
        endTime: new Date('2026-06-01T11:00:00.000Z'),
      };

      const result = await repository.create(bookingData);

      expect(result).toEqual(mockAppointment);
      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          companyId: bookingData.companyId,
          userId: bookingData.userId,
          staffId: bookingData.staffId,
          serviceId: bookingData.serviceId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        },
        include: expect.objectContaining({
          user: expect.any(Object),
          staff: expect.any(Object),
          service: expect.any(Object),
        }),
      });
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('returns updated appointment on success', async () => {
      const updated = createMockAppointment({
        status: AppointmentStatus.CANCELLED,
      });
      prisma.appointment.update.mockResolvedValue(updated);

      const result = await repository.update('appt-1', {
        status: AppointmentStatus.CANCELLED,
      });

      expect(result).toEqual(updated);
    });

    it('returns null when appointment not found', async () => {
      prisma.appointment.update.mockRejectedValue(new Error('Not found'));

      const result = await repository.update('nonexistent', {
        status: AppointmentStatus.CANCELLED,
      });

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('returns true when appointment is deleted', async () => {
      prisma.appointment.delete.mockResolvedValue({});

      const result = await repository.delete('appt-1');

      expect(result).toBe(true);
    });

    it('returns false when appointment not found', async () => {
      prisma.appointment.delete.mockRejectedValue(new Error('Not found'));

      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // exists
  // ===========================================================================
  describe('exists', () => {
    it('returns true when appointment exists', async () => {
      prisma.appointment.findUnique.mockResolvedValue(createMockAppointment());

      const result = await repository.exists('appt-1');

      expect(result).toBe(true);
    });

    it('returns false when appointment does not exist', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      const result = await repository.exists('nonexistent');

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // findStaffById
  // ===========================================================================
  describe('findStaffById', () => {
    it('returns staff member when found in company', async () => {
      const mockStaff = { id: 'staff-1', name: 'John Barber' };
      prisma.staff.findFirst.mockResolvedValue(mockStaff);

      const result = await repository.findStaffById('staff-1', 'company-1');

      expect(result).toEqual(mockStaff);
      expect(prisma.staff.findFirst).toHaveBeenCalledWith({
        where: { id: 'staff-1', companyId: 'company-1' },
        select: { id: true, name: true },
      });
    });

    it('returns null when staff not found', async () => {
      prisma.staff.findFirst.mockResolvedValue(null);

      const result = await repository.findStaffById('nonexistent', 'company-1');

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // findServiceById
  // ===========================================================================
  describe('findServiceById', () => {
    it('returns service with duration when found in company', async () => {
      const mockService = { id: 'service-1', name: 'Haircut', duration: 60 };
      prisma.service.findFirst.mockResolvedValue(mockService);

      const result = await repository.findServiceById('service-1', 'company-1');

      expect(result).toEqual(mockService);
      expect(prisma.service.findFirst).toHaveBeenCalledWith({
        where: { id: 'service-1', companyId: 'company-1' },
        select: { id: true, name: true, duration: true },
      });
    });

    it('returns null when service not found', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      const result = await repository.findServiceById('nonexistent', 'company-1');

      expect(result).toBeNull();
    });
  });
});
