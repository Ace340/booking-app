# Authentication Setup

This document describes the environment variables needed for the authentication system.

## Environment Variables

Create a `.env` file in the `apps/api` directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1h

# Database Configuration (already configured)
DATABASE_URL="postgresql://user:password@localhost:5432/booking_app?schema=public"
```

## JWT Configuration

### JWT_SECRET
- A secret key used to sign JWT tokens
- **Must be at least 32 characters long**
- Should be different in production than in development
- **Never commit this to version control**
- Generate a strong secret using: `openssl rand -base64 32`

### JWT_EXPIRES_IN
- Token expiration time
- Examples: `1h`, `2d`, `7d`, `1w`
- Default: `1h` (1 hour)

## Database Update

The authentication system requires updates to the User model. After updating `prisma/schema.prisma`, run:

```bash
cd apps/api
npx prisma migrate dev --name add-auth-fields
npx prisma generate
```

## Usage Examples

### Register a User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "companyId": "company-uuid",
  "role": "CLIENT"  // Optional, defaults to CLIENT
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }
}
```

### Protect Routes

```typescript
import { Controller, Get } from '@nestjs/common';
import { JwtAuthGuard, AuthUser, Roles } from './modules/auth';
import { UserRole } from '@prisma/client';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('profile')
  getProfile(@AuthUser() user: AuthUser) {
    return { user };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminData(@AuthUser() user: AuthUser) {
    return { message: 'Admin data', user };
  }
}
```

### Make Routes Public

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth';

@Controller('public')
export class PublicController {
  @Get('health')
  @Public()
  getHealth() {
    return { status: 'ok' };
  }
}
```

## Security Best Practices

1. **Never commit `.env` files** - Add `.env` to `.gitignore`
2. **Use strong JWT secrets** - At least 32 characters, randomly generated
3. **Use HTTPS in production** - Never transmit tokens over HTTP
4. **Validate all inputs** - All DTOs use class-validator for validation
5. **Hash passwords** - Passwords are hashed with bcrypt (salt rounds: 10)
6. **Never expose passwords** - Passwords are never returned in API responses
7. **Set appropriate token expiration** - Shorter expirations for sensitive operations
8. **Rotate secrets regularly** - Change JWT_SECRET periodically in production

## User Roles

The system supports three roles:

- **ADMIN** - Full system access, can manage all resources
- **STAFF** - Company-specific access, can manage company resources
- **CLIENT** - User-specific access, can only access own resources

## Troubleshooting

### "Invalid token" error
- Check that JWT_SECRET is set correctly in `.env`
- Ensure token hasn't expired
- Verify token is sent in `Authorization: Bearer <token>` header

### "Email already registered" error
- The email already exists in the database
- Use login instead of register for existing users

### Database connection errors
- Verify DATABASE_URL is correct in `.env`
- Ensure PostgreSQL is running
- Check database schema is up to date: `npx prisma migrate dev`

### Module not found errors
- Run `npx pnpm install` from the project root
- Ensure all dependencies are installed
