# syntax=docker/dockerfile:1

# ============================================================================
# Stage 1 — deps: install all deps with bun (fast, no postinstall)
# ============================================================================
FROM node:22-slim AS deps

WORKDIR /app

# Install bun for fast install, openssl for Prisma engine
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates openssl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.bun/bin:$PATH"

# Copy lockfile + manifest first for layer cache
COPY package.json bun.lock ./
COPY prisma ./prisma

# Install dependencies (frozen lockfile, ignore postinstall scripts
# to avoid Bun generating an ESM-flavoured Prisma client)
RUN bun install --frozen-lockfile --ignore-scripts

# ============================================================================
# Stage 2 — build: generate Prisma client with Node, then compile TS
# ============================================================================
FROM deps AS build

WORKDIR /app

COPY . .

# Generate Prisma client using the Node-compatible prisma binary
# (Bun's prisma generate produces ESM with import.meta; Node's produces CJS)
RUN ./node_modules/.bin/prisma generate

# Compile TypeScript -> dist/
RUN bun run build

# Prune devDependencies for the production image
RUN bun install --frozen-lockfile --production --ignore-scripts

# ============================================================================
# Stage 3 — runtime: slim Node image
# ============================================================================
FROM node:22-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Install openssl (Prisma engine needs it) + wget for healthcheck
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