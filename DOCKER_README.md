# Docker Setup for Booking-App

This directory contains Docker configurations for running the booking-app in production and development environments.

## 📁 Files Created

- **`apps/api/Dockerfile`** - Multi-stage Dockerfile for NestJS API backend
- **`apps/web/Dockerfile`** - Multi-stage Dockerfile for Next.js web application
- **`apps/mobile/Dockerfile`** - Dockerfile for building React Native/Expo mobile apps (CI/CD)
- **`apps/mobile/docker-build.sh`** - Build script for mobile app production builds
- **`.dockerignore`** (root) - Root Docker ignore patterns
- **`apps/api/.dockerignore`** - API-specific ignore patterns
- **`apps/web/.dockerignore`** - Web-specific ignore patterns
- **`apps/mobile/.dockerignore`** - Mobile-specific ignore patterns
- **`docker-compose.yml`** - Docker Compose configuration for all services

## 🚀 Quick Start

### Production Build

#### Build and Start All Services
```bash
# From the booking-app root directory
docker-compose up -d
```

This will:
- Start PostgreSQL database on port 5434
- Build and start API server on port 3001
- Build and start Web app on port 3000

#### Build Individual Services
```bash
# Build API only
docker-compose build api

# Build Web only
docker-compose build web

# Build both
docker-compose build
```

### Development Mode

#### Using Development Docker Targets
```bash
# Uncomment the api-dev and web-dev services in docker-compose.yml
docker-compose up api-dev web-dev postgres
```

This enables hot-reload with volume mounts for local development.

#### Local Development (No Docker)
```bash
# Start database
docker-compose up -d postgres

# Start API (local)
cd apps/api
pnpm install
pnpm run start:dev

# Start Web (local)
cd apps/web
pnpm install
pnpm run dev
```

## 🔧 Manual Docker Builds

### API (NestJS)

#### Production Build
```bash
cd apps/api
docker build --target runner -t booking-api:latest .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e CLERK_SECRET_KEY="your-clerk-secret" \
  -e STRIPE_SECRET_KEY="your-stripe-secret" \
  booking-api:latest
```

#### Development Build
```bash
cd apps/api
docker build --target development -t booking-api:dev .
docker run -p 3001:3001 \
  -v $(pwd)/src:/app/apps/api/src \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  booking-api:dev
```

### Web (Next.js)

#### Production Build
```bash
cd apps/web
docker build --target runner -t booking-web:latest .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:3001" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-key" \
  booking-web:latest
```

#### Development Build
```bash
cd apps/web
docker build --target development -t booking-web:dev .
docker run -p 3000:3000 \
  -v $(pwd)/src:/app/apps/web/src \
  -e NEXT_PUBLIC_API_URL="http://localhost:3001" \
  booking-web:dev
```

### Mobile (React Native/Expo)

The mobile Dockerfile is designed for CI/CD pipelines to build production APK/IPA files.

#### Setup EAS Configuration
First, create `apps/mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  }
}
```

#### Build Mobile App (CI/CD)
```bash
cd apps/mobile
docker build -t booking-mobile:builder .

# Build Android APK
docker run \
  -e EXPO_TOKEN="your-expo-token" \
  -e PLATFORM="android" \
  -v $(pwd)/build:/app/apps/mobile/build \
  booking-mobile:builder

# Build iOS IPA
docker run \
  -e EXPO_TOKEN="your-expo-token" \
  -e PLATFORM="ios" \
  -v $(pwd)/build:/app/apps/mobile/build \
  booking-mobile:builder

# Build Both
docker run \
  -e EXPO_TOKEN="your-expo-token" \
  -e PLATFORM="all" \
  -v $(pwd)/build:/app/apps/mobile/build \
  booking-mobile:builder
```

**Note:** Building iOS requires macOS with Xcode or Expo EAS cloud builds.

## 📋 Environment Variables

### Required for Production

Create a `.env` file in the booking-app root:

```env
# Database
DATABASE_URL=postgresql://booking_user:booking_password@postgres:5432/booking_app

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# API Configuration
CORS_ORIGIN=https://your-production-domain.com
JWT_SECRET=your-jwt-secret-min-32-chars
NEXT_PUBLIC_API_URL=https://api.your-production-domain.com

# Mobile Build
EXPO_TOKEN=your-expo-token
```

### For Mobile Builds
- `EXPO_TOKEN` - Required for EAS builds (get from https://expo.dev)
- `PLATFORM` - `android`, `ios`, or `all` (default: `android`)

## 🔍 Health Checks

All services include health checks:

### API Health Check
```bash
curl http://localhost:3001/health
```

### Web Health Check
```bash
curl http://localhost:3000/api/health
```

### Docker Health Status
```bash
docker-compose ps
```

## 🏗️ Docker Architecture

### Multi-Stage Builds

All Dockerfiles use multi-stage builds for optimized production images:

1. **Dependencies Stage** - Installs all npm dependencies
2. **Builder Stage** - Builds the application
3. **Runner Stage** - Minimal production image with only required files

### Image Sizes (Approximate)
- API (Production): ~150MB
- Web (Production): ~180MB
- Mobile (Builder): ~250MB

### Security Features
- ✅ Non-root user (nestjs/nextjs)
- ✅ Minimal Alpine Linux base
- ✅ No development dependencies in production
- ✅ Health checks for monitoring
- ✅ Read-only root filesystem (recommended for production)

## 🐛 Troubleshooting

### Build Failures

**Issue:** `pnpm install` fails
```bash
# Clear Docker cache and retry
docker system prune -a
docker-compose build --no-cache
```

**Issue:** Database connection fails
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart services
docker-compose restart api web
```

### Runtime Issues

**Issue:** API returns 502/503 errors
```bash
# Check API health
docker-compose logs api

# Verify environment variables
docker-compose exec api env

# Restart API
docker-compose restart api
```

**Issue:** Web app can't connect to API
```bash
# Verify web container can reach api
docker-compose exec web ping api

# Check web logs
docker-compose logs web
```

### Mobile Build Issues

**Issue:** EXPO_TOKEN invalid or missing
```bash
# Get your token from https://expo.dev/accounts/[account]/settings/access-tokens
# Export it before running the build
export EXPO_TOKEN=your-token-here
```

**Issue:** EAS build fails
```bash
# Check EAS configuration
cat apps/mobile/eas.json

# View build logs
docker logs booking-mobile-builder

# Test EAS build locally first
cd apps/mobile
npx eas build --platform android --local
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 api
```

### Resource Usage
```bash
# Container stats
docker stats

# Specific container
docker stats booking-app-api
```

### Shell Access
```bash
# Access API container
docker-compose exec api sh

# Access Web container
docker-compose exec web sh

# Access PostgreSQL
docker-compose exec postgres psql -U booking_user -d booking_app
```

## 🚢 Deployment

### Push to Container Registry

#### Docker Hub
```bash
# Tag images
docker tag booking-api:latest your-username/booking-api:latest
docker tag booking-web:latest your-username/booking-web:latest

# Push images
docker push your-username/booking-api:latest
docker push your-username/booking-web:latest
```

#### AWS ECR
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag booking-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/booking-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/booking-api:latest
```

### Kubernetes Deployment

Example `deployment.yaml` for API:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: booking-api
  template:
    metadata:
      labels:
        app: booking-api
    spec:
      containers:
      - name: api
        image: your-username/booking-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: booking-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use secrets management** - AWS Secrets Manager, Azure Key Vault, etc.
3. **Scan images for vulnerabilities** - Use `docker scan` or tools like Snyk
4. **Run as non-root user** - Already configured in Dockerfiles
5. **Use read-only root filesystem** - Add `--read-only` flag to docker run
6. **Enable content trust** - `export DOCKER_CONTENT_TRUST=1`
7. **Regular updates** - Keep base images updated

## 📚 Next Steps

1. ✅ Create `.env` file with production values
2. ✅ Set up container registry (Docker Hub, ECR, GCR)
3. ✅ Configure CI/CD pipeline (GitHub Actions recommended)
4. ✅ Set up monitoring (Sentry, Datadog, etc.)
5. ✅ Configure SSL/TLS certificates
6. ✅ Set up log aggregation
7. ✅ Configure backup strategy for database

## 🆘 Support

For issues or questions:
- Check logs: `docker-compose logs [service]`
- Verify environment variables
- Ensure all required secrets are set
- Review Dockerfile and docker-compose.yml configuration
