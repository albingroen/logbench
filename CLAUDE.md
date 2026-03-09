# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Logbench is a full-stack local log viewer and ingestion service. Users create projects, stream logs in real-time via SSE, inspect JSON payloads, and organize logs with annotations and bookmarks.

## Commands

```bash
bun install                    # Install dependencies
bunx prisma generate           # Generate Prisma client (run after schema changes)
bunx prisma db push            # Create/update database schema
bun run dev                    # Start dev server (http://localhost:1447)
bun run build                  # Production build
bun run test                   # Run Vitest tests
bun run lint                   # ESLint
bun run format                 # Prettier
bun run check                  # Format + lint fix combined
```

## Architecture

**Stack:** TanStack Start (React 19 + Nitro server), Prisma with SQLite (libsql adapter), Tailwind CSS + shadcn/ui.

**Frontend** uses TanStack Router (file-based routing in `src/routes/`), TanStack React Query for data fetching/caching, and EventSource for real-time SSE updates.

**Backend** uses TanStack Start server functions (`createServerFn`) defined in `src/lib/server/` for all CRUD operations. These are called directly from React components — no HTTP client or REST routes needed. Request validation uses Zod schemas defined in `src/lib/`.

**Real-time flow:** The ingest endpoint (`api.projects.$projectId.logs.ingest.ts`) handles both POST (create log) and GET with `?stream=1` (SSE subscription). An in-memory `Map<string, Set<Client>>` tracks subscribers per project. On log creation, the server publishes to all subscribers, and the frontend updates the React Query cache directly without refetching.

**MCP server:** A local MCP endpoint at `POST /mcp` (`src/routes/mcp.ts`) exposes read-only tools (`get_projects`, `get_project`, `get_logs`, `get_log`) for AI assistants. Uses `@modelcontextprotocol/sdk` with Streamable HTTP transport, localhost-only access.

**Database:** Two models — `Project` and `Log` (with cascade delete). Schema in `prisma/schema.prisma`. SQLite file at `dev.db`.

## Key Directories

- `src/routes/` — File-based routes (pages), the ingest API endpoint, and the MCP server
- `src/lib/server/` — TanStack Start server functions for CRUD operations (projects, logs)
- `src/components/ui/` — shadcn/ui base components
- `src/components/` — Feature components (sidebar, log table, log content viewer, etc.)
- `src/lib/` — Prisma client, Zod schemas, utilities, syntax highlighting setup
- `src/hooks/` — Custom React hooks
- `prisma/` — Database schema

## Code Style

- TypeScript strict mode, path alias `@/*` → `./src/*`
- Prettier: no semicolons, single quotes, trailing commas
- ESLint: `@tanstack/eslint-config`
- UI icons from `@remixicon/react`
