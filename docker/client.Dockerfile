# =============================================================================
# YARN CLIENT DOCKERFILE (Next.js)
# =============================================================================

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
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
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY . .
COPY client ./client
COPY shared ./shared

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build client
WORKDIR /app/client
RUN npm run build

# =============================================================================
# Production image
# =============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/client/public ./client/public
COPY --from=builder --chown=nextjs:nodejs /app/client/.next ./client/.next
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/shared ./shared

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/client

CMD ["npm", "start"]
