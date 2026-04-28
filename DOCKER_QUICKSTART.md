# 🐳 Docker Quick Reference

## Production (One-Command Start)
```bash
# From booking-app root
docker-compose up -d
```

## Development (Hot Reload)
```bash
# Uncomment api-dev and web-dev in docker-compose.yml
docker-compose up api-dev web-dev postgres
```

## Manual Builds

### API
```bash
# Production
docker build -f apps/api/Dockerfile --target runner -t booking-api:latest .

# Development
docker build -f apps/api/Dockerfile --target development -t booking-api:dev .
```

### Web
```bash
# Production
docker build -f apps/web/Dockerfile --target runner -t booking-web:latest .

# Development
docker build -f apps/web/Dockerfile --target development -t booking-web:dev .
```

### Mobile (CI/CD)
```bash
docker build -f apps/mobile/Dockerfile -t booking-mobile:builder .

# Build Android
docker run -e EXPO_TOKEN="your-token" -e PLATFORM="android" -v $(pwd)/apps/mobile/build:/app/apps/mobile/build booking-mobile:builder
```

## Common Commands

```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild
docker-compose up -d --build

# Access container
docker-compose exec api sh
docker-compose exec web sh
docker-compose exec postgres psql -U booking_user -d booking_app
```

## Health Checks

```bash
# API
curl http://localhost:3001/health

# Web
curl http://localhost:3000/api/health
```

## Environment Variables Required

Create `.env` in booking-app root:
```env
# Database (already set in docker-compose)
# DATABASE_URL=postgresql://booking_user:booking_password@postgres:5432/booking_app

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# API
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-jwt-secret-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3001

# Mobile
EXPO_TOKEN=your-expo-token
```

## Ports

- **Web**: 3000
- **API**: 3001
- **PostgreSQL**: 5434
- **Mobile Dev**: 19000-19002

## Services

| Service | Container Name | Port | Description |
|---------|----------------|------|-------------|
| PostgreSQL | booking-app-db | 5434 | Database |
| API | booking-app-api | 3001 | NestJS backend |
| Web | booking-app-web | 3000 | Next.js frontend |
| API Dev | booking-app-api-dev | 3001 | Hot reload API |
| Web Dev | booking-app-web-dev | 3000 | Hot reload Web |

## Troubleshooting

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# View specific service logs
docker-compose logs api
docker-compose logs web
docker-compose logs postgres

# Restart specific service
docker-compose restart api
docker-compose restart web
```

## Next Steps

1. ✅ Create `.env` file with production values
2. ✅ Run `docker-compose up -d` to start
3. ✅ Access Web at http://localhost:3000
4. ✅ Access API at http://localhost:3001
5. ✅ Check health: `curl http://localhost:3001/health`

For detailed documentation, see [DOCKER_README.md](./DOCKER_README.md)
