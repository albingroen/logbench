# Logbench

Logbench is a local log viewer and ingestion service built with TanStack Start, React, and Prisma + SQLite.

It gives you a lightweight UI to create projects, stream logs in real time, inspect log payloads, and delete entries.

## Features

- Project-based log organization
- Real-time log updates via Server-Sent Events (SSE)
- JSON log payload rendering with level badges
- Fast in-table log search with keyboard shortcut (`Cmd/Ctrl + F`)
- Local SQLite storage through Prisma

## Tech Stack

- TanStack Start + TanStack Router
- React + React Query
- Prisma + `@prisma/adapter-libsql` + SQLite
- Tailwind CSS + shadcn/ui
- Vite

## Getting Started

### Prerequisites

- Bun (recommended) or npm
- Node.js 20+

### Install

```bash
bun install
```

### Prepare Database

```bash
bunx prisma generate
bunx prisma db push
```

This creates/updates the local `dev.db` SQLite database based on `prisma/schema.prisma`.

### Run Development Server

```bash
bun run dev
```

App runs on `http://localhost:1447`.

## Scripts

- `bun run dev` - start local dev server
- `bun run build` - build production bundle
- `bun run preview` - preview production build
- `bun run test` - run Vitest test suite
- `bun run lint` - run ESLint
- `bun run format` - run Prettier
- `bun run check` - run Prettier write + ESLint fix

## API Endpoints

### Projects

- `GET /api/projects` - list projects
- `POST /api/projects` - create project (`{ "title": "My Project" }`)
- `GET /api/projects/:projectId` - get a single project

### Logs

- `GET /api/projects/:projectId/logs` - list logs for a project (newest first)
- `GET /api/projects/:projectId/logs/:logId` - get one log
- `DELETE /api/projects/:projectId/logs/:logId` - delete one log

### Ingestion + Live Stream

- `POST /api/projects/:projectId/logs/ingest` - ingest a log payload (`{ "content": ... }`)
- `GET /api/projects/:projectId/logs/ingest?stream=1` - subscribe to SSE events

Example ingest request:

```bash
curl -X POST "http://localhost:1447/api/projects/<projectId>/logs/ingest" \
  -H "Content-Type: application/json" \
  -d '{"content":{"message":"Hello from curl","level":"INFO"}}'
```

## JavaScript SDK

The official JavaScript/TypeScript SDK is available as [`logbench-js`](https://www.npmjs.com/package/logbench-js).

### Install

```bash
bun add logbench-js
```

```bash
npm install logbench-js
```

### Usage

```typescript
import { Logbench } from "logbench-js";

const logger = new Logbench({
  url: "http://localhost:1447",
  projectId: "your-project-id",
});

logger.info("Server started on port 3000");
logger.warn("Disk usage above 80%");
logger.err("Failed to connect to database");
```

The SDK provides three log-level methods: `info`, `warn`, and `err`. All methods accept any number of arguments of any type. Values are serialized with [superjson](https://github.com/flightcontrolhq/superjson), so types like `Date`, `Set`, `Map`, `BigInt`, and `RegExp` are preserved.

```typescript
logger.info("User signed in", { userId: "abc123", at: new Date() });
logger.err("Request failed", { status: 500, headers: new Map([["x-request-id", "abc"]]) });
```

Errors from the HTTP call are silently caught so logging never crashes your application.

## Notes

- Database file (`dev.db`) is local and gitignored.
- Generated Prisma client is in `generated/prisma` and gitignored.
- The project header includes a "Copy POST URL" action for quickly sending logs from other local tools.
