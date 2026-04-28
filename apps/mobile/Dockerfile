# Dockerfile for React Native/Expo Mobile App Build
# Designed for CI/CD pipelines to build APK/IPA using Expo EAS

FROM node:18-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Install system dependencies needed for Expo/EAS
RUN apk add --no-cache \
    bash \
    git \
    openssh-client \
    rsync \
    unzip \
    zip

# Stage 1: Dependencies
FROM base AS dependencies

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/mobile/package.json apps/mobile/pnpm-lock.yaml ./apps/mobile/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build (for CI/CD)
FROM base AS builder

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/mobile/node_modules ./apps/mobile/node_modules
COPY --from=dependencies /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy source files
COPY . .

# Install Expo CLI globally
RUN npm install -g expo-cli@latest

# Install EAS CLI for production builds
RUN npm install -g eas-cli@latest

WORKDIR /app/apps/mobile

# Expose port for Expo dev server (not used in production builds)
EXPOSE 19000 19001 19002

# For CI/CD: Build with EAS (requires EXPO_TOKEN environment variable)
# Example: docker run -e EXPO_TOKEN=xxx -e PLATFORM=android mobile-builder
ENV NODE_ENV=production
ENV PLATFORM=all

# Build script
COPY docker-build.sh /app/docker-build.sh
RUN chmod +x /app/docker-build.sh

CMD ["/app/docker-build.sh"]

# Development variant (use: docker build --target development -t booking-mobile:dev .)
FROM base AS development

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/mobile/node_modules ./apps/mobile/node_modules
COPY --from=dependencies /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy source files
COPY . .

WORKDIR /app/apps/mobile

# Install Expo CLI
RUN npm install -g expo-cli@latest

# Expose ports for Expo development
EXPOSE 19000 19001 19002

# Start Expo development server
CMD ["expo", "start", "--web"]
