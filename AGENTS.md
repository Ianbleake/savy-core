# AGENTS.md — savy-core

Code rules and conventions for the API (NestJS + TypeScript + Prisma).

---

## Architecture

### Module structure

- Each domain module in `src/{domain}/`:
  - `{domain}.module.ts` — NestJS module
  - `{domain}.controller.ts` — REST controller
  - `{domain}.service.ts` — business logic
  - `dto/` — request/response DTOs with class-validator decorators
  - `{domain}.d.ts` — ambient types (if needed)

### Shared modules

- `src/prisma/` — PrismaModule (global, exports PrismaService)
- `src/auth/` — AuthModule with Supabase admin client, JWT strategy, guards
- `src/common/` — shared decorators, filters, interceptors, pipes

## Conventions

### Types

- **NEVER use `any`** — investigate the type first
- Use Prisma-generated types from `../../generated/prisma/client.js`
- DTOs use class-validator decorators for runtime validation
- Use `import type` for type-only imports

### Auth

- All routes require JWT by default (global `JwtAuthGuard`)
- Use `@Public()` decorator on routes that should be public
- Use `@CurrentUser()` decorator to get the authenticated user
- JWT comes from Supabase Auth — validated with `SUPABASE_JWT_SECRET`

### Database

- Prisma 7 with `@prisma/adapter-pg` (driver adapter)
- All queries go through `PrismaService` (injected, global)
- Schema uses `@@map()` for snake_case table names + camelCase TS fields
- Soft delete for accounts (`isActive` flag)
- Cascade deletes on user removal

### General

- Package manager: **bun**
- Biome for linting/formatting (tabs, double quotes, 100 cols, semicolons)
- Named exports only
- All endpoints under `/api` prefix
- Pino logger with pino-pretty in dev

### Naming

- Module files: `{domain}.module.ts`
- Controllers: `{domain}.controller.ts`
- Services: `{domain}.service.ts`
- DTOs: `{action}-{domain}.dto.ts` or `{domain}.dto.ts`
- Guards: `{name}.guard.ts`
- Decorators: `{name}.decorator.ts`
- Strategies: `{name}.strategy.ts`
