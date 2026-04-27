# NestJS Architecture Documentation

## Overview

This project follows a scalable, modular NestJS architecture with strict separation of concerns. Each feature is organized into a module with clear layer boundaries.

## Architecture Principles

### Core Principles (from code-quality.md)
- **Modular Design**: Single responsibility per module
- **Functional Approach**: Pure functions, immutability, composition
- **Explicit Dependencies**: All dependencies injected via constructor
- **Small Functions**: Keep functions < 50 lines
- **No Side Effects**: Pure business logic in services

### Clean Code Principles (from clean-code.md)
- Meaningful names that reveal intent
- Functions do one thing (Single Responsibility)
- Avoid deep nesting (use guard clauses)
- DRY (Don't Repeat Yourself)
- Explicit error handling

## Directory Structure

```
apps/api/src/
├── common/                      # Shared utilities and patterns
│   └── interfaces/              # Base interfaces for consistency
│       ├── base-repository.interface.ts
│       └── base-service.interface.ts
├── modules/                     # Feature modules
│   └── health/                  # Health check module (example)
│       ├── controllers/         # HTTP layer only
│       │   └── health.controller.ts
│       ├── services/            # Business logic
│       │   └── health.service.ts
│       ├── repositories/        # Database access
│       │   └── health.repository.ts
│       ├── dto/                 # Data transfer objects
│       │   ├── health.dto.ts
│       │   └── index.ts
│       ├── types/               # Module-specific types
│       │   └── health.types.ts
│       ├── health.module.ts     # Module definition
│       └── index.ts             # Public exports
├── app.module.ts                # Root module
└── main.ts                      # Application bootstrap
```

## Layer Responsibilities

### 1. Controller Layer (`controllers/`)

**Purpose**: Handle HTTP requests and responses only

**Responsibilities**:
- Define routes and HTTP methods
- Request/response validation
- HTTP status codes
- Delegates all logic to services

**Rules**:
- ✅ Handle HTTP concerns (routing, status codes, responses)
- ✅ Validate incoming requests (DTOs)
- ✅ Map domain objects to DTOs
- ❌ NO business logic
- ❌ NO database access
- ❌ NO complex computations

**Example**:
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => this.toDto(user));
  }
}
```

### 2. Service Layer (`services/`)

**Purpose**: Contain business logic and orchestrate operations

**Responsibilities**:
- Business rules and validation
- Orchestrate multiple repository calls
- Transform data for business needs
- Implement use cases

**Rules**:
- ✅ Business logic
- ✅ Orchestrate repository calls
- ✅ Data transformation
- ✅ Implement base service interface
- ❌ NO HTTP concerns
- ❌ NO direct database access (use repositories)
- ❌ NO framework-specific code

**Example**:
```typescript
@Injectable()
export class UsersService implements BaseServiceInterface<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Business logic
    const validatedUser = this.validateUserData(createUserDto);
    const hashedPassword = await this.hashPassword(validatedUser.password);

    // Repository call
    return this.usersRepository.create({
      ...validatedUser,
      password: hashedPassword,
    });
  }
}
```

### 3. Repository Layer (`repositories/`)

**Purpose**: Handle all database access

**Responsibilities**:
- Database queries
- Data persistence
- Data retrieval
- Database-specific operations

**Rules**:
- ✅ Database access (CRUD operations)
- ✅ Database-specific logic
- ✅ Implement base repository interface
- ❌ NO business logic
- ❌ NO HTTP concerns
- ❌ NO data transformation (return raw entities)

**Example**:
```typescript
@Injectable()
export class UsersRepository implements BaseRepositoryInterface<User> {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

### 4. DTO Layer (`dto/`)

**Purpose**: Data transfer objects for validation and API contracts

**Responsibilities**:
- Define API request/response shapes
- Validation rules (class-validator)
- Type safety for API

**Rules**:
- ✅ Validation decorators
- ✅ Type definitions
- ✅ Export from index.ts
- ❌ NO business logic
- ❌ NO database access

**Example**:
```typescript
export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 5. Types Layer (`types/`)

**Purpose**: Module-specific TypeScript types and interfaces

**Responsibilities**:
- Domain types
- Internal interfaces
- Helper types

**Rules**:
- ✅ TypeScript types and interfaces
- ✅ Domain models
- ✅ Internal contracts
- ❌ NO runtime logic
- ❌ NO decorators (use DTOs for validation)

**Example**:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';
```

## Base Interfaces

All services and repositories must implement their respective base interfaces for consistency.

### BaseRepositoryInterface<T>

```typescript
interface BaseRepositoryInterface<T> {
  findById(id: string): Promise<T | null>;
  findAll(criteria?: Partial<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
```

### BaseServiceInterface<T, CreateDto, UpdateDto>

```typescript
interface BaseServiceInterface<T, CreateDto, UpdateDto> {
  findOne(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  create(createDto: CreateDto): Promise<T>;
  update(id: string, updateDto: UpdateDto): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
```

## Module Definition

Each module follows this pattern:

```typescript
@Module({
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService], // Export service for other modules to use
})
export class FeatureModule {}
```

## Dependency Injection

All dependencies are explicitly injected via constructor:

```typescript
@Injectable()
export class FeatureService {
  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly logger: Logger,
  ) {}
}
```

## Code Quality Standards

### Naming Conventions
- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Methods/Functions**: `camelCase`
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUserService`)
- **Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

### Function Guidelines
- Keep functions < 50 lines
- Single responsibility
- Pure functions when possible
- Early returns to avoid nesting
- Explicit error handling

### Error Handling

```typescript
async findById(id: string): Promise<User | null> {
  if (!id) {
    throw new BadRequestException('ID is required');
  }

  try {
    return await this.usersRepository.findById(id);
  } catch (error) {
    this.logger.error(`Failed to find user ${id}`, error);
    throw new InternalServerErrorException('Failed to retrieve user');
  }
}
```

## Example: Creating a New Module

```bash
# Create module structure
mkdir -p src/modules/users/{controllers,services,repositories,dto,types}

# Create files
touch src/modules/users/users.module.ts
touch src/modules/users/controllers/users.controller.ts
touch src/modules/users/services/users.service.ts
touch src/modules/users/repositories/users.repository.ts
touch src/modules/users/dto/create-user.dto.ts
touch src/modules/users/dto/update-user.dto.ts
touch src/modules/users/types/user.types.ts
touch src/modules/users/index.ts
```

Then implement each layer following the patterns above.

## API Design Standards (from api-design.md)

### REST Endpoints
- Use nouns, not verbs: `/users` not `/getUsers`
- Proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Consistent response format: `{ data, meta }`
- Proper status codes: 200, 201, 204, 400, 401, 403, 404, 422, 500

### Response Format

```typescript
// Success
{
  data: { /* entity data */ },
  meta: { timestamp: '2024-01-01T00:00:00Z' }
}

// Error
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [ /* validation errors */ ]
  },
  meta: { timestamp: '2024-01-01T00:00:00Z' }
}
```

## Testing Strategy

- **Unit Tests**: Test services and repositories in isolation
- **Integration Tests**: Test controllers with mocked services
- **E2E Tests**: Test full request/response cycle
- **Coverage Goal**: 90%+ for services, 80%+ for controllers

## Next Steps

1. Add database integration (Prisma/TypeORM)
2. Implement authentication module
3. Add exception filters
4. Implement logging interceptor
5. Add API documentation (Swagger)
6. Write comprehensive tests

## References

- NestJS Documentation: https://docs.nestjs.com
- Clean Code by Robert C. Martin
- SOLID Principles
- Repository Pattern
- Dependency Injection
