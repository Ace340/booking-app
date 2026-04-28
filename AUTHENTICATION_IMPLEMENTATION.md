# Clerk Authentication Implementation

## Overview

Authentication is managed by [Clerk](https://clerk.com/) across all three apps (API, Web, Mobile). Clerk handles sign-up, sign-in, passwords, social auth, and session management. Our backend syncs user data via webhooks and protects routes with token verification.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Clerk     │────>│  Web (Next)  │────>│                  │
│  Dashboard  │────>│ Mobile (Expo)│────>│  API (NestJS)    │
│             │     └──────────────┘     │  - Clerk Guard   │
│  Users &    │                          │  - Role Guard     │
│  Sessions   │──webhooks──>             │  - User Sync      │
└─────────────┘                          └──────────────────┘
```

**Clerk manages**: Signup, login, passwords, sessions, social auth, MFA
**Our API manages**: User sync, route protection, role-based authorization

---

## What Clerk Handles (No Custom Code Needed)

- User registration and sign-in
- Password management and reset
- Social authentication (Google, GitHub, etc.)
- Session management and token refresh
- Email verification
- Two-factor authentication (2FA)

---

## Web App (Next.js) — `@clerk/nextjs`

### Setup
- `ClerkProvider` wraps the app in `layout.tsx`
- `middleware.ts` protects routes using `clerkMiddleware`
- Sign-in/Sign-up pages use Clerk's pre-built components

### Data Fetching Pattern
Client components use `useAuth().getToken()` from `@clerk/nextjs` to obtain session tokens:

```
Component → Hook (useAuth) → Service (token param) → API Client (Bearer header)
```

Hooks call `getToken()` internally and pass the token through services to the API client.

### Key Files
- `apps/web/src/lib/api/client.ts` — HTTP client, attaches Bearer token
- `apps/web/src/app/layout.tsx` — ClerkProvider wrapper
- `apps/web/src/middleware.ts` — Route protection
- `apps/web/src/app/sign-in/` — Sign-in page
- `apps/web/src/app/sign-up/` — Sign-up page

---

## Mobile App (Expo) — `@clerk/expo`

### Setup
- `ClerkProvider` wraps the app in `_layout.tsx` with `tokenCache` for secure storage
- Custom sign-in/sign-up screens use Clerk hooks (`useSignIn`, `useSignUp`)
- Auth state derived from `useAuth().isSignedIn`

### Data Fetching Pattern
The API client auto-attaches Clerk tokens via `getClerkInstance()`:

```
Component → Hook → Service → API Client (auto-attaches token)
```

### Key Files
- `apps/mobile/src/app/_layout.tsx` — ClerkProvider wrapper
- `apps/mobile/src/services/api-client.ts` — Auto-attaches Clerk tokens
- `apps/mobile/src/app/(auth)/sign-in.tsx` — Custom sign-in
- `apps/mobile/src/app/(auth)/sign-up.tsx` — Custom sign-up with email verification

---

## API Backend (NestJS) — `@clerk/backend`

### Authentication Flow
1. Client sends request with `Authorization: Bearer <clerk-session-token>`
2. `ClerkAuthGuard` verifies the token using `@clerk/backend` `verifyToken()`
3. Guard looks up local DB user by `clerkId`
4. Attaches `AuthUser` to `request.user` for controllers

### User Synchronization
Clerk webhooks keep local DB in sync:
- `user.created` → Create local User record
- `user.updated` → Update local User record
- `user.deleted` → Delete local User record

Webhook verification uses Svix signatures (Clerk's standard).

### Authorization
- `@Public()` — Skip authentication
- `@Roles(UserRole.ADMIN)` — Require specific role(s)
- `@CurrentUser()` — Access authenticated user in controllers

### Key Files
- `apps/api/src/modules/auth/guards/clerk-auth.guard.ts` — Token verification
- `apps/api/src/modules/auth/guards/roles.guard.ts` — Role-based access
- `apps/api/src/modules/auth/controllers/clerk-webhook.controller.ts` — Webhook handler
- `apps/api/src/modules/auth/services/auth.service.ts` — User sync
- `apps/api/src/modules/auth/decorators/` — @Public, @Roles, @CurrentUser

---

## Environment Variables

### API Backend
```env
CLERK_SECRET_KEY=sk_test_xxx          # Required: Clerk secret key
CLERK_PUBLISHABLE_KEY=pk_test_xxx     # Optional: Publishable key
CLERK_JWT_KEY=                        # Optional: For local JWT verification
CLERK_WEBHOOK_SECRET=whsec_xxx        # Required: For webhook verification
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,exp://192.168.*.*:19000
```

### Web App
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Mobile App
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Usage Examples

### Protect a Route (API)
```typescript
@Controller('my-resource')
@UseGuards(ClerkAuthGuard)
export class MyResourceController {
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return { data: [], user }
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminData(@CurrentUser() user: AuthUser) {
    return { adminData: true, user }
  }
}
```

### Make a Route Public (API)
```typescript
@Get('public-info')
@Public()
getPublicInfo() {
  return { message: 'Public info' }
}
```

### Fetch Data in Client Component (Web)
```typescript
const { data } = useAppointments({})  // Token handled automatically
```

### Check Auth State (Mobile)
```typescript
const { isSignedIn } = useAuth()
const { user } = useUser()
const { signOut } = useClerk()
```

---

## Security Features

1. **Token Verification** — Every request verified via `@clerk/backend`
2. **Role-Based Access** — ADMIN, STAFF, CLIENT roles enforced by `RolesGuard`
3. **Webhook Signatures** — Svix verification prevents spoofed webhooks
4. **No Password Storage** — Clerk handles passwords, none stored locally
5. **Secure Token Storage** — Mobile uses `expo-secure-store` via Clerk's token cache
6. **Authorized Parties** — Prevents token misuse across domains

---

## Status

**Complete and Ready for Testing**
