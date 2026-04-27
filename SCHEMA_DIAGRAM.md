# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────┐
│     Company         │
├─────────────────────┤
│ id: UUID (PK)       │
│ name: String        │
│ created_at: DateTime│
│ updated_at: DateTime│
└─────────┬───────────┘
          │
          ├─────────────────────────────┬──────────────────────┬───────────────────┐
          │                             │                      │                   │
          │ 1                           │ 1                    │ 1                 │ 1
          │                             │                      │                   │
          │ N                           │ N                    │ N                 │ N
          ▼                             ▼                      ▼                   ▼
┌───────────────────┐         ┌──────────────────┐    ┌──────────────┐    ┌───────────────────┐
│       User        │         │     Service      │    │    Staff     │    │   Appointment     │
├───────────────────┤         ├──────────────────┤    ├──────────────┤    ├───────────────────┤
│ id: UUID (PK)     │         │ id: UUID (PK)    │    │ id: UUID (PK)│    │ id: UUID (PK)     │
│ company_id: UUID  │         │ company_id: UUID │    │ company_id:  │    │ company_id: UUID  │
│ email: String     │         │ name: String     │    │   UUID       │    │ user_id: UUID     │
│ name: String      │         │ duration: Int    │    │ name: String │    │ staff_id: UUID    │
│ created_at:       │         │ price: Decimal   │    │ email: String│    │ service_id: UUID  │
│   DateTime        │         │ created_at:      │    │ created_at:  │    │ start_time:       │
│ updated_at:       │         │   DateTime       │    │   DateTime   │    │   DateTime        │
│   DateTime        │         │ updated_at:      │    │ updated_at:  │    │ end_time:         │
└─────────┬─────────┘         │   DateTime       │    │   DateTime   │    │   DateTime        │
          │                   └────────┬─────────┘    └──────┬───────┘    │ status: Enum       │
          │ 1                         │ 1                   │ 1           │ created_at:       │
          │                           │                     │             │   DateTime        │
          │ N                         │ N                   │ N           │ updated_at:       │
          │                           │                     │             │   DateTime        │
          └─────────────┬─────────────┴─────────────────────┴─────────────┴──────────┬─────────┘
                        │
                        │ N
                        │
                        │ 1
                        ▼
                  ┌──────────────┐
                  │ Appointment  │
                  └──────────────┘

Legend:
┌─────┐  = Entity (Table)
│     │
└─────┘

│      = Relationship
──►

PK     = Primary Key
FK     = Foreign Key (company_id, user_id, etc.)
UUID   = Universal Unique Identifier
Enum   = Enumeration (SCHEDULED, COMPLETED, CANCELLED)

```

## Table Relationships

### Company (Root Entity)
```
Company 1 ────── N  User
Company 1 ────── N  Service
Company 1 ────── N  Staff
Company 1 ────── N  Appointment
```

### Appointment (Central Entity)
```
User      1 ────── N  Appointment
Staff     1 ────── N  Appointment
Service   1 ────── N  Appointment
Company   1 ────── N  Appointment
```

## Cascade Delete Rules

### Cascade on Delete
When a **Company** is deleted:
- ✅ All Users in that company are deleted
- ✅ All Services in that company are deleted
- ✅ All Staff in that company are deleted
- ✅ All Appointments in that company are deleted

### Restrict on Delete
When trying to delete:
- ❌ User with existing appointments → BLOCKED
- ❌ Staff with existing appointments → BLOCKED
- ❌ Service with existing appointments → BLOCKED

## Multi-Tenant Data Flow

```
Request comes in with company_id
        ↓
All queries filtered by company_id
        ↓
User sees only their company's data
        ↓
Company A data is isolated from Company B
```

## Index Strategy

### Primary Indexes (Automatic)
- All tables: `id` (UUID, primary key)

### Foreign Key Indexes (Performance)
- User: `company_id`
- Service: `company_id`
- Staff: `company_id`
- Appointment: `company_id`, `user_id`, `staff_id`, `service_id`

### Query Optimization Indexes
- Appointment: `start_time` (for scheduling queries)

## Common Query Patterns

### Get all users for a company
```sql
SELECT * FROM users WHERE company_id = 'company-uuid';
```

### Get appointments for a specific date range
```sql
SELECT * FROM appointments
WHERE company_id = 'company-uuid'
  AND start_time >= '2026-04-20'
  AND start_time < '2026-04-21';
```

### Get staff availability
```sql
SELECT s.* FROM staff s
WHERE s.company_id = 'company-uuid'
  AND s.id NOT IN (
    SELECT staff_id FROM appointments
    WHERE start_time = '2026-04-20 10:00:00'
  );
```

### Get service bookings
```sql
SELECT a.*, u.name as user_name, s.name as staff_name
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN staff s ON a.staff_id = s.id
WHERE a.service_id = 'service-uuid'
  AND a.company_id = 'company-uuid';
```

## Data Volume Considerations

### Estimated Records per Company
- Users: 10-1,000
- Services: 5-100
- Staff: 2-50
- Appointments: 100-10,000/day

### Total Potential Records (Multi-tenant)
- Companies: 100-10,000
- Total Users: 1,000-10,000,000
- Total Appointments: 10,000-100,000,000/day

### Performance Optimization
- Partition by `company_id` (future enhancement)
- Archive old appointments (soft delete)
- Regular index maintenance
- Connection pooling

## Schema Evolution Path

### Phase 1: Current (MVP)
✅ Basic booking system
✅ Multi-tenant architecture
✅ Core entities and relationships

### Phase 2: Enhanced Features
🔄 User authentication (password_hash, roles)
🔄 Staff availability schedules
🔄 Service categories and tags
🔄 Recurring appointments

### Phase 3: Advanced Features
⏳ Payment processing
⏳ Notifications (email, SMS)
⏳ Analytics and reporting
⏳ Waitlist management
⏳ Integration with calendars

## Security Model

### Data Access Control
```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (NestJS + Business Logic)         │
└──────────────┬──────────────────────┘
               │
               │ company_id validation
               │
┌──────────────▼──────────────────────┐
│         Database Layer              │
│  (Prisma + PostgreSQL)             │
│  - Row-level security (optional)    │
│  - Foreign key constraints          │
│  - Unique constraints               │
└─────────────────────────────────────┘
```

### Access Patterns
1. **User Request** → Validate company_id → Query with company_id filter
2. **Cross-tenant prevention** → Always include company_id in WHERE clause
3. **Data isolation** → Database constraints enforce boundaries

## Migration Strategy

### Initial Migration
```bash
prisma migrate dev --name init
```

### Schema Changes
1. Update `schema.prisma`
2. Create migration: `prisma migrate dev --name feature_name`
3. Review generated SQL
4. Apply migration
5. Regenerate client: `prisma generate`

### Rollback Strategy
```bash
# View migration history
prisma migrate status

# Rollback to specific migration
prisma migrate resolve --rolled-back migration_name

# Reset database (dev only)
prisma migrate reset
```

---

**Schema Version**: 1.0
**Last Updated**: 2026-04-20
**Prisma Version**: 5.7.1
