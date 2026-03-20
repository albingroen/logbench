<img width="3828" height="2490" alt="CleanShot 2026-03-12 at 15 26 36" src="https://github.com/user-attachments/assets/a6910045-9c57-4ccf-8285-fe048579e875" />

# Logbench

Logbench is a local log viewer and ingestion service built with TanStack Start, React, and Prisma + SQLite.

It gives you a lightweight UI to create projects, stream logs in real time, inspect log payloads, and delete entries.

## Features

- Project-based log organization
- Real-time log updates via Server-Sent Events (SSE)
- JSON log payload rendering with level badges
- Log detail side panel with visual JSON tree and raw syntax-highlighted views
- Bookmark and annotate individual logs with notes
- Fast in-table log search with keyboard shortcut (`Cmd/Ctrl + F`)
- Source file filter — filter logs by originating source file
- Delete individual logs or bulk clear all logs in a project
- Local SQLite storage through Prisma
- MCP server for AI assistant integration

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
- `bun run start` - run production build (`PORT=1447 node .output/server/index.mjs`)
- `bun run preview` - preview production build
- `bun run test` - run Vitest test suite
- `bun run lint` - run ESLint
- `bun run format` - run Prettier
- `bun run check` - run Prettier write + ESLint fix

## API

### Server Functions

Internal data operations (CRUD for projects and logs) use [TanStack Start server functions](https://tanstack.com/start) instead of REST endpoints. These are defined in `src/lib/server/` and called directly from React components — no HTTP client needed.

- `src/lib/server/projects.ts` — `getProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject`
- `src/lib/server/logs.ts` — `getLogs`, `getLog`, `updateLog`, `deleteLog`, `deleteLogs`

### Ingestion + Live Stream

The ingest endpoint is the only traditional API route, used for external log ingestion:

- `POST /api/projects/:projectId/logs/ingest` - ingest a log payload (`{ "content": ..., "level?": ..., "isBookmarked?": ..., "annotation?": ... }`)
- `GET /api/projects/:projectId/logs/ingest?stream=1` - subscribe to SSE events

Example ingest request:

```bash
curl -X POST "http://localhost:1447/api/projects/<projectId>/logs/ingest" \
  -H "Content-Type: application/json" \
  -d '{"content":{"message":"Hello from curl"},"level":"INFO","isBookmarked":true,"annotation":"my note"}'
```

## JavaScript SDK

The official JavaScript/TypeScript SDK is available as [`logbench-js`](https://www.npmjs.com/package/logbench-js).

### Install

```bash
bun add -D logbench-js
```

```bash
npm install -D logbench-js
```

### Usage

```typescript
import { Logbench } from 'logbench-js'

const logger = new Logbench({
  projectId: 'your-project-id',
})

logger.info('Server started on port 3000')
logger.warn('Disk usage above 80%')
logger.error('Failed to connect to database')
logger.log('Arbitrary message')
```

The SDK provides four log-level methods: `info`, `warn`, `error`, and `log`. All methods accept any number of arguments of any type. Values are serialized with [superjson](https://github.com/flightcontrolhq/superjson), so types like `Date`, `Set`, `Map`, `BigInt`, and `RegExp` are preserved.

```typescript
logger.info('User signed in', { userId: 'abc123', at: new Date() })
logger.error('Request failed', {
  status: 500,
  headers: new Map([['x-request-id', 'abc']]),
})
```

Errors from the HTTP call are silently caught so logging never crashes your application.

## MCP Server

Logbench exposes a local [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server at `POST /mcp`, allowing AI assistants like Claude to read your projects and logs directly.

### Available Tools

| Tool           | Description                          |
| -------------- | ------------------------------------ |
| `get_projects` | List all projects with log counts    |
| `get_project`  | Get a single project by ID           |
| `get_logs`     | List logs for a project (latest 100) |
| `get_log`      | Get a single log by ID               |

### Configuration

Add the following to your MCP client config (e.g. Claude Code `~/.claude.json` or Cursor settings):

```json
{
  "mcpServers": {
    "logbench": {
      "type": "url",
      "url": "http://localhost:1447/mcp"
    }
  }
}
```

The MCP endpoint is localhost-only and rejects requests from non-local origins.

## Notes

- Database file (`dev.db`) is local and gitignored.
- Generated Prisma client is in `generated/prisma` and gitignored.
- The project header includes a "Copy POST URL" action for quickly sending logs from other local tools.
