# Prisma Setup

This directory contains the Prisma schema for the booking application.

## Prerequisites

Before setting up the database, ensure you have:

1. **PostgreSQL** installed and running (version 12 or higher recommended)
2. **pnpm** package manager installed (this project uses pnpm workspaces)
3. Node.js 18 or higher

### Installation

First, install all dependencies:

```bash
# From the project root
pnpm install

# Or install only API dependencies
cd apps/api
pnpm install
```

## Database Configuration

### 1. Create .env file

Copy the following template and create a `.env` file in the `apps/api` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/booking_app?schema=public"
```

Replace the connection string with your actual PostgreSQL database credentials.

### 2. Database Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

- **USER**: PostgreSQL username
- **PASSWORD**: PostgreSQL password
- **HOST**: Database host (e.g., `localhost` or database URL)
- **PORT**: Database port (default: `5432`)
- **DATABASE**: Database name (e.g., `booking_app`)
- **SCHEMA**: Database schema (default: `public`)

## Running Migrations

### 1. Verify Schema

```bash
cd apps/api
npx prisma validate
npx prisma format
```

### 2. Generate Prisma Client

```bash
cd apps/api
npx prisma generate
```

### 2. Create Database (if it doesn't exist)

```bash
# Using psql
createdb booking_app

# Or using the PostgreSQL CLI
psql -U postgres -c "CREATE DATABASE booking_app;"
```

### 3. Run Migrations

```bash
cd apps/api
npx prisma migrate dev --name init
```

This will:
- Create the database tables based on the schema
- Generate the Prisma Client
- Create a new migration file

## Schema Overview

The schema includes the following models:

### Company
- Multi-tenant root entity
- Contains company information
- One-to-many relationship with Users, Services, Staff, and Appointments

### User
- Represents application users
- Belongs to a Company
- Has many Appointments

### Service
- Represents services that can be booked
- Belongs to a Company
- Has duration (minutes) and price
- Has many Appointments

### Staff
- Represents staff members who provide services
- Belongs to a Company
- Has many Appointments

### Appointment
- Represents booking appointments
- Belongs to a Company, User, Staff, and Service
- Has start time, end time, and status
- Status can be: SCHEDULED, COMPLETED, CANCELLED

## Multi-Tenant Architecture

All data models (except Company) include a `company_id` field to ensure data isolation between companies. This enables a multi-tenant SaaS architecture where each company's data is completely separated.

## Development Workflow

### View Database

```bash
npx prisma studio
```

This opens a web-based database viewer.

### Format Schema

```bash
npx prisma format
```

### Validate Schema

```bash
npx prisma validate
```

## Important Notes

- Never commit `.env` files to version control
- Use different database names for development, staging, and production
- Keep your database credentials secure
- Run migrations in a transactional manner for production
