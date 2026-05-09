# ============================================================
# Next.js Web Production Dockerfile - Isolated Context
# ============================================================

# Stage 1: Build & Dependencies
FROM node:24.14.0-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# 1. Build local SDK
COPY arkadas-sdk ./arkadas-sdk
WORKDIR /app/arkadas-sdk
RUN npm install && npm run build

# 2. Build Web app
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Runner
FROM node:24.14.1-alpine AS runner
WORKDIR /app

RUN apk add --no-cache tini && rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
