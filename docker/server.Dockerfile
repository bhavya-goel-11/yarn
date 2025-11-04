# =============================================================================
# YARN SERVER DOCKERFILE (Express + TypeScript)
# =============================================================================

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install dependencies
RUN npm ci

# =============================================================================
# Build the application
# =============================================================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY . .
COPY server ./server
COPY shared ./shared

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm run build

# =============================================================================
# Production image
# =============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built application
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/shared ./shared

USER expressjs

EXPOSE 5000

ENV PORT=5000

WORKDIR /app/server

CMD ["npm", "start"]
