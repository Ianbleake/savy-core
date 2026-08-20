# syntax=docker/dockerfile:1

# ============================================================================
# Stage 1 — deps: install all deps + generate Prisma client
# ============================================================================
FROM oven/bun:1.1 AS deps

WORKDIR /app

# Copy lockfile + manifest first for layer cache
COPY package.json bun.lock ./
COPY prisma ./prisma

# postinstall script runs `prisma generate` (needs prisma/schema.prisma)
RUN bun install --frozen-lockfile

# ============================================================================
# Stage 2 — build: compile TypeScript -> dist/
# ============================================================================
FROM deps AS build

WORKDIR /app

COPY . .

# nest build compiles src/ -> dist/.
# Prisma client (src/generated/prisma/) gets compiled into dist/generated/prisma/
RUN bun run build

# Prune devDependencies for the production image
RUN bun install --frozen-lockfile --production

# ============================================================================
# Stage 3 — runtime: slim Node image
# ============================================================================
FROM node:22-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install openssl (Prisma engine needs it) + wget for healthcheck
# hadolint ignore=DL3008
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl wget ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy production node_modules (includes prisma client + adapter-pg)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd  --system --uid 1001 --gid nodejs nestjs && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/api/docs || exit 1

CMD ["node", "dist/main.js"]