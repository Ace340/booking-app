# Architecture Quick Reference

## Module Template

Use this template when creating new modules:

```bash
# Create directory structure
mkdir -p src/modules/feature/{controllers,services,repositories,dto,types}

# Create files
touch src/modules/feature/feature.module.ts
touch src/modules/feature/controllers/feature.controller.ts
touch src/modules/feature/services/feature.service.ts
touch src/modules/feature/repositories/feature.repository.ts
touch src/modules/feature/dto/create-feature.dto.ts
touch src/modules/feature/dto/update-feature.dto.ts
touch src/modules/feature/dto/index.ts
touch src/modules/feature/types/feature.types.ts
touch src/modules/feature/index.ts
```

## File Templates

### 1. Feature Module (`feature.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { FeatureController } from './controllers/feature.controller';
import { FeatureService } from './services/feature.service';
import { FeatureRepository } from './repositories/feature.repository';

@Module({
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### 2. Controller (`controllers/feature.controller.ts`)

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { FeatureService } from '../services/feature.service';
import { CreateFeatureDto, UpdateFeatureDto } from '../dto';

@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  async findAll() {
    return this.featureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateFeatureDto) {
    return this.featureService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateFeatureDto) {
    return this.featureService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.featureService.delete(id);
  }
}
```

### 3. Service (`services/feature.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { BaseServiceInterface } from '../../../common/interfaces/base-service.interface';
import { FeatureRepository } from '../repositories/feature.repository';
import { CreateFeatureDto, UpdateFeatureDto } from '../dto';
import { Feature } from '../types/feature.types';

@Injectable()
export class FeatureService implements BaseServiceInterface<Feature, CreateFeatureDto, UpdateFeatureDto> {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async findOne(id: string): Promise<Feature | null> {
    return this.featureRepository.findById(id);
  }

  async findAll(filters?: Record<string, unknown>): Promise<Feature[]> {
    return this.featureRepository.findAll();
  }

  async create(createDto: CreateFeatureDto): Promise<Feature> {
    // Business logic here
    return this.featureRepository.create(createDto);
  }

  async update(id: string, updateDto: UpdateFeatureDto): Promise<Feature | null> {
    // Business logic here
    return this.featureRepository.update(id, updateDto);
  }

  async delete(id: string): Promise<boolean> {
    return this.featureRepository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.featureRepository.exists(id);
  }
}
```

### 4. Repository (`repositories/feature.repository.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { Feature } from '../types/feature.types';

@Injectable()
export class FeatureRepository implements BaseRepositoryInterface<Feature> {
  constructor(/* private readonly prisma: PrismaService */) {}

  async findById(id: string): Promise<Feature | null> {
    // TODO: Implement database query
    return null;
  }

  async findAll(criteria?: Partial<Feature>): Promise<Feature[]> {
    // TODO: Implement database query
    return [];
  }

  async create(data: Partial<Feature>): Promise<Feature> {
    // TODO: Implement database insert
    return {} as Feature;
  }

  async update(id: string, data: Partial<Feature>): Promise<Feature | null> {
    // TODO: Implement database update
    return null;
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Implement database delete
    return false;
  }

  async exists(id: string): Promise<boolean> {
    // TODO: Implement database exists check
    return false;
  }
}
```

### 5. DTOs (`dto/create-feature.dto.ts`)

```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(10)
  description: string;
}
```

### 6. DTO Index (`dto/index.ts`)

```typescript
export * from './create-feature.dto';
export * from './update-feature.dto';
export * from './feature-response.dto';
```

### 7. Types (`types/feature.types.ts`)

```typescript
export interface Feature {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureStatus = 'active' | 'inactive' | 'archived';
```

### 8. Module Index (`index.ts`)

```typescript
export * from './feature.module';
export * from './services/feature.service';
export * from './controllers/feature.controller';
export * from './dto';
export * from './types/feature.types';
```

## Common Decorators

### Controller Decorators
```typescript
@Controller('path')           // Define route base path
@Get()                       // GET endpoint
@Post()                      // POST endpoint
@Put(':id')                  // PUT endpoint
@Patch(':id')                // PATCH endpoint
@Delete(':id')               // DELETE endpoint
@Param('id')                 // Extract route parameter
@Body()                      // Extract request body
@Query()                     // Extract query parameters
@Headers()                   // Extract headers
@HttpCode(HttpStatus.OK)     // Set HTTP status code
```

### Validation Decorators (class-validator)
```typescript
@IsString()                  // Must be string
@IsNumber()                  // Must be number
@IsEmail()                   // Must be email
@IsOptional()                // Optional field
@IsNotEmpty()                // Cannot be empty
@MinLength(5)                // Minimum length
@MaxLength(100)              // Maximum length
@Min(0)                      // Minimum value
@Max(100)                    // Maximum value
@IsEnum(Status)              // Must be enum value
@IsArray()                   // Must be array
@IsDateString()              // Must be date string
```

### Swagger Decorators (class-validator)
```typescript
@ApiTags('Feature')          // API tag for grouping
@ApiOperation({ summary: 'Description' })
@ApiResponse({ status: 200, type: ResponseDto })
@ApiProperty()               // Document DTO property
```

## HTTP Status Codes

```typescript
200 OK                       // Successful GET, PUT, PATCH
201 Created                  // Successful POST
204 No Content               // Successful DELETE
400 Bad Request              // Invalid input
401 Unauthorized             // Missing/invalid auth
403 Forbidden                // Authenticated but not authorized
404 Not Found                // Resource doesn't exist
409 Conflict                 // Resource conflict
422 Unprocessable Entity     // Validation errors
500 Internal Server Error    // Unexpected error
503 Service Unavailable      // Temporary unavailability
```

## Error Handling

```typescript
// Built-in exceptions
throw new BadRequestException('Invalid data');
throw new UnauthorizedException('Not authenticated');
throw new ForbiddenException('Not authorized');
throw new NotFoundException('Resource not found');
throw new ConflictException('Resource already exists');
throw new InternalServerErrorException('Server error');

// Custom exception
export class CustomException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}
```

## Common Patterns

### Guard Clauses (Avoid deep nesting)

```typescript
// ❌ Bad - Deep nesting
async getUser(id: string) {
  if (id) {
    const user = await this.repo.findById(id);
    if (user) {
      if (user.isActive) {
        return user;
      }
    }
  }
  return null;
}

// ✅ Good - Guard clauses
async getUser(id: string) {
  if (!id) return null;
  const user = await this.repo.findById(id);
  if (!user) return null;
  if (!user.isActive) return null;
  return user;
}
```

### Pure Functions (No side effects)

```typescript
// ✅ Pure - Same input = same output
const formatUserName = (user: User) => `${user.firstName} ${user.lastName}`;

// ❌ Impure - Side effects
let counter = 0;
const increment = () => { counter += 1; return counter; };
```

### Immutability

```typescript
// ✅ Immutable - Create new data
const updateUser = (user: User, changes: Partial<User>): User => ({
  ...user,
  ...changes,
  updatedAt: new Date(),
});

// ❌ Mutable - Modify existing data
const updateUser = (user: User, changes: Partial<User>): User => {
  user.name = changes.name || user.name;
  return user;
};
```

### Composition

```typescript
// ✅ Compose small functions
const processUser = pipe(validateUser, transformUser, saveUser);

// ✅ Functional approach
const activeUsers = users.filter(u => u.isActive).map(u => formatUser(u));
```

## Testing Patterns

```typescript
// Service test
describe('FeatureService', () => {
  let service: FeatureService;
  let repository: FeatureRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: FeatureRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(FeatureService);
    repository = module.get(FeatureRepository);
  });

  it('should create a feature', async () => {
    const dto = { name: 'Test' };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

## Best Practices Checklist

- [ ] Each layer has single responsibility
- [ ] Controllers handle HTTP only
- [ ] Services contain business logic
- [ ] Repositories handle database access
- [ ] All dependencies injected via constructor
- [ ] Functions are < 50 lines
- [ ] Use guard clauses instead of deep nesting
- [ ] Pure functions when possible
- [ ] Immutability (create new data, don't modify)
- [ ] Explicit error handling
- [ ] DTOs for validation
- [ ] Implement base interfaces
- [ ] Export from index.ts files
- [ ] Add JSDoc comments
- [ ] Use TypeScript strict mode
- [ ] Write tests for critical logic
