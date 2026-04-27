# Architecture Diagram

## Module Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         app.module.ts                           │
│                     (Root Module)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HealthModule                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Controller   │───▶│  Service     │───▶│ Repository   │     │
│  │              │    │              │    │              │     │
│  │ HTTP Layer   │    │ Business     │    │ Database     │     │
│  │              │    │ Logic        │    │ Access       │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                   │              │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │     DTO      │    │    Types     │    │   Interfaces │     │
│  │              │    │              │    │              │     │
│  │ Validation   │    │ Domain       │    │ Contracts    │     │
│  │ & APIs       │    │ Models       │    │              │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
HTTP Request
     │
     ▼
┌──────────────────┐
│  Controller      │  ◄─── Handles HTTP only
│                  │
│  • Route         │
│  • Validate DTO  │
│  • Map Request   │
└────────┬─────────┘
         │
         │ delegate
         ▼
┌──────────────────┐
│  Service         │  ◄─── Business logic only
│                  │
│  • Validate      │
│  • Transform     │
│  • Orchestrate   │
└────────┬─────────┘
         │
         │ use
         ▼
┌──────────────────┐
│  Repository      │  ◄─── Database access only
│                  │
│  • Query DB      │
│  • Persist       │
│  • Retrieve      │
└────────┬─────────┘
         │
         │ query
         ▼
┌──────────────────┐
│  Database        │
│  (Prisma/TypeORM)│
└──────────────────┘
```

## Layer Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client                                  │
│                    (Frontend/Mobile)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Request
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Controller Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Responsibility: HTTP Concerns Only                      │  │
│  │                                                          │  │
│  │  ✓ Define routes (@Get, @Post, @Put, @Delete)           │  │
│  │  ✓ Set HTTP status codes                                │  │
│  │  ✓ Validate request DTOs                                │  │
│  │  ✓ Map entities to DTOs                                 │  │
│  │  ✓ Return HTTP responses                                │  │
│  │                                                          │  │
│  │  ✗ NO business logic                                    │  │
│  │  ✗ NO database access                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Delegate
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Responsibility: Business Logic Only                      │  │
│  │                                                          │  │
│  │  ✓ Implement business rules                              │  │
│  │  ✓ Validate data for business requirements               │  │
│  │  ✓ Transform data                                        │  │
│  │  ✓ Orchestrate multiple repository calls                 │  │
│  │  ✓ Implement use cases                                   │  │
│  │                                                          │  │
│  │  ✗ NO HTTP concerns                                     │  │
│  │  ✗ NO direct database access                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Use
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Repository Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Responsibility: Database Access Only                    │  │
│  │                                                          │  │
│  │  ✓ Execute database queries                              │  │
│  │  ✓ Persist data (Create, Update, Delete)                 │  │
│  │  ✓ Retrieve data (Find, FindAll)                         │  │
│  │  ✓ Handle database-specific logic                        │  │
│  │                                                          │  │
│  │  ✗ NO business logic                                    │  │
│  │  ✗ NO HTTP concerns                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Query
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Prisma ORM                                            │  │
│  │  • TypeORM                                               │  │
│  │  • PostgreSQL / MySQL / MongoDB                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                      HealthModule                               │
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│  │   DTO       │      │    Types    │      │ Interfaces  │    │
│  │             │      │             │      │             │    │
│  │ • Request   │      │ • Domain    │      │ • BaseRepo  │    │
│  │ • Response  │      │ • Internal  │      │ • BaseService│    │
│  │ • Enums     │      │ • Helpers   │      │             │    │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘    │
│         │                    │                    │            │
│         │                    │                    │            │
│         ▼                    │                    ▼            │
│  ┌─────────────┐             │            ┌─────────────┐    │
│  │ Controller  │             │            │ Repository  │    │
│  │             │             │            │             │    │
│  │ ┌─────────┐ │             │            │ Implements  │    │
│  │ │ Routes  │ │             │            │ BaseRepo    │    │
│  │ └────┬────┘ │             │            │             │    │
│  │      │      │             │            │ ┌─────────┐ │    │
│  │ ┌────▼────┐ │             │            │ │ Queries │ │    │
│  │ │ Validate│ │             │            │ └────┬────┘ │    │
│  │ └────┬────┘ │             │            │      │      │    │
│  │      │      │             │            │ ┌────▼────┐ │    │
│  │ ┌────▼────┐ │             │            │ │ CRUD    │ │    │
│  │ │ Map DTO │ │             │            │ └─────────┘ │    │
│  │ └────┬────┘ │             │            └─────────────┘    │
│  └──────┼──────┘             │                   │            │
│         │                    │                   │            │
│         └────────────────────┴───────────────────┘            │
│                              │                                │
│                              ▼                                │
│                    ┌─────────────┐                           │
│                    │   Service   │                           │
│                    │             │                           │
│                    │ Implements  │                           │
│                    │ BaseService │                           │
│                    │             │                           │
│                    │ ┌─────────┐ │                           │
│                    │ │ Business│ │                           │
│                    │ │ Logic   │ │                           │
│                    │ └────┬────┘ │                           │
│                    │      │      │                           │
│                    │ ┌────▼────┐ │                           │
│                    │ │ Orchest.│ │                           │
│                    │ │ Repo    │ │                           │
│                    │ └─────────┘ │                           │
│                    └─────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## SOLID Principles in Action

### Single Responsibility Principle (SRP)
```
Controller  →  Handles HTTP only
Service     →  Business logic only
Repository  →  Database access only
DTO         →  Validation only
Types       →  Type definitions only
```

### Open/Closed Principle (OCP)
```
BaseRepositoryInterface  →  Open for extension, closed for modification
BaseServiceInterface     →  Same pattern for services
```

### Liskov Substitution Principle (LSP)
```
HealthRepository  →  Can be substituted for BaseRepositoryInterface
HealthService     →  Can be substituted for BaseServiceInterface
```

### Interface Segregation Principle (ISP)
```
Small, focused interfaces instead of large ones:
- BaseRepositoryInterface (CRUD operations)
- BaseServiceInterface (business operations)
- Separate interfaces for specific concerns if needed
```

### Dependency Inversion Principle (DIP)
```
High-level modules (Service) depend on abstractions (Interfaces)
Low-level modules (Repository) implement abstractions (Interfaces)
Dependencies injected via constructor:
  constructor(private readonly repo: BaseRepositoryInterface<T>) {}
```

## Request Lifecycle Example

```
GET /health
  │
  │ 1. HTTP Request
  ▼
HealthController.getHealth()
  │
  │ 2. Validate request (DTO validation)
  │ 3. Delegate to service
  ▼
HealthService.performHealthCheck()
  │
  │ 4. Business logic
  │ 5. Get system health
  │ 6. Call repository
  ▼
HealthRepository.checkDatabaseConnection()
  │
  │ 7. Execute database query
  │ 8. Return result
  ▼
HealthService
  │
  │ 9. Orchestrate results
  │ 10. Return health check result
  ▼
HealthController
  │
  │ 11. Map to DTO
  │ 12. Set HTTP status
  │ 13. Return response
  ▼
HTTP Response
  {
    "data": {
      "status": "healthy",
      "timestamp": "2024-01-01T00:00:00Z",
      ...
    }
  }
```

## File Organization Best Practices

```
modules/
├── feature-name/              # Feature-based organization
│   ├── controllers/           # HTTP handlers
│   │   └── *.controller.ts    # One controller per feature
│   ├── services/              # Business logic
│   │   └── *.service.ts       # One service per feature
│   ├── repositories/          # Data access
│   │   └── *.repository.ts    # One repository per entity
│   ├── dto/                   # Data transfer objects
│   │   ├── *.dto.ts           # One DTO per operation
│   │   └── index.ts           # Barrel export
│   ├── types/                 # Type definitions
│   │   └── *.types.ts         # Module-specific types
│   ├── feature.module.ts      # Module definition
│   └── index.ts               # Public API
│
└── common/                    # Shared utilities
    ├── decorators/            # Custom decorators
    ├── filters/               # Exception filters
    ├── interceptors/          # Request/response interceptors
    ├── interfaces/            # Base interfaces
    └── pipes/                 # Custom pipes
```

## Error Handling Flow

```
Exception occurs
       │
       ▼
Repository Layer
  • Catch database errors
  • Wrap in domain exceptions
       │
       ▼
Service Layer
  • Catch repository exceptions
  • Add business context
  • Throw appropriate exceptions
       │
       ▼
Controller Layer
  • Catch service exceptions
  • Map to HTTP status codes
  • Return error response
       │
       ▼
HTTP Response
  {
    "error": {
      "code": "USER_NOT_FOUND",
      "message": "User with ID 123 not found",
      "details": [...]
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
```
