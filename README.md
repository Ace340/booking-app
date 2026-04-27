# Booking App

Full-stack booking application built with a monorepo architecture.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo + TypeScript
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Package Manager**: pnpm
- **Monorepo Tool**: Turborepo

## Project Structure

```
booking-app/
├── apps/
│   ├── web/          # Next.js web dashboard
│   ├── mobile/       # React Native mobile app (Expo)
│   └── api/          # NestJS API backend
├── packages/
│   ├── ui/           # Shared React components
│   ├── config/       # Shared ESLint, Prettier, TypeScript configs
│   └── types/        # Shared TypeScript types
└── turbo.json        # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Installation

1. Clone the repository and navigate to the project:
```bash
cd booking-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/booking_app"
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
MOBILE_API_URL=http://localhost:3001
```

4. Set up the database:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

## Development

### Run all applications in parallel:
```bash
pnpm dev
```

### Run individual applications:

**Web Dashboard:**
```bash
cd apps/web
pnpm dev
```
Visit: http://localhost:3000

**Mobile App:**
```bash
cd apps/mobile
pnpm start
```
Use Expo Go app or run:
- `pnpm ios` for iOS simulator
- `pnpm android` for Android emulator
- `pnpm web` for web version

**API Backend:**
```bash
cd apps/api
pnpm start:dev
```
Visit: http://localhost:3001

## Available Scripts

### Root-level scripts:
```bash
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm format           # Format all packages
pnpm format:check     # Check formatting
pnpm test             # Run all tests
pnpm type-check       # Type check all packages
pnpm clean            # Clean all build artifacts
```

### Package-specific scripts:
Each package has its own scripts defined in its `package.json`.

## Shared Packages

### @booking-app/ui
Shared React components that work across web and mobile platforms.

### @booking-app/config
Shared configuration files:
- ESLint configs (base, Next.js, React Native, NestJS)
- Prettier config
- TypeScript configs

### @booking-app/types
Shared TypeScript types and interfaces used across all applications.

## Coding Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with shared configs
- **Formatting**: Prettier with consistent rules
- **Naming**: 
  - Files: kebab-case
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

## Database Schema

Database schema is managed with Prisma ORM. See `apps/api/prisma/schema.prisma`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `API_PORT` | API server port | 3001 |
| `NEXT_PUBLIC_API_URL` | API URL for web app | http://localhost:3001 |
| `MOBILE_API_URL` | API URL for mobile app | http://localhost:3001 |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `NODE_ENV` | Environment (development/production) | development |

## License

MIT
