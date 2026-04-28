# Multi-stage build for NestJS API
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/pnpm-lock.yaml ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules

# Copy source files
COPY . .

# Build API
WORKDIR /app/apps/api
RUN pnpm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Copy necessary files
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml ./
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/
COPY --chown=nestjs:nodejs apps/api/prisma ./apps/api/prisma
COPY --chown=nestjs:nodejs packages/config ./packages/config
COPY --chown=nestjs:nodejs packages/types ./packages/types
COPY --chown=nestjs:nodejs turbo.json ./

# Copy production dependencies and built app
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["pnpm", "--filter", "@booking-app/api", "start:prod"]

# Development variant (use: docker build --target development -t booking-api:dev .)
FROM node:18-alpine AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/pnpm-lock.yaml ./apps/api/
COPY packages/ ./packages/
RUN pnpm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3001

# Start development server with hot reload
CMD ["pnpm", "--filter", "@booking-app/api", "start:dev"]
