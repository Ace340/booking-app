# Multi-stage build for Next.js Web App
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy source files
COPY . .

# Build web app with standalone output
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./
COPY --chown=nextjs:nodejs apps/web/package.json ./apps/web/
COPY --chown=nextjs:nodejs packages/config ./packages/config
COPY --chown=nextjs:nodejs packages/types ./packages/types
COPY --chown=nextjs:nodejs packages/ui ./packages/ui

# Copy production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy built app (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

# Development variant (use: docker build --target development -t booking-web:dev .)
FROM node:18-alpine AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./apps/web/
COPY packages/ ./packages/
RUN pnpm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["pnpm", "--filter", "@booking-app/web", "dev"]
