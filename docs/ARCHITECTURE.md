# Architecture

## System Overview

The task manager is a single-page Next.js v15 application with a typed RPC (tRPC) backend. The frontend and backend share TypeScript types, so the client knows the server's procedure signatures at compile time.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌─────────────┐      ┌─────────────────────────────────┐  │
│  │  page.tsx   │─────▶│   tRPC Client (React Query)     │  │
│  │  (Client)   │      │   createTRPCReact + QueryClient │  │
│  └─────────────┘      └──────────────┬──────────────────┘  │
└─────────────────────────────────────┼───────────────────────┘
                                      │ HTTP POST (JSON)
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router (Server)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  app/api/trpc/[trpc]/route.ts                       │   │
│  │  fetchRequestHandler (@trpc/server/adapters/fetch)  │   │
│  └──────────────────────────┬─────────────────────────┘   │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────┐   │
│  │  server/trpc/router.ts                              │   │
│  │  t.initTRPC().router({ hello, ... })                │   │
│  └──────────────────────────┬─────────────────────────┘   │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────┐   │
│  │  lib/tasks.ts                                       │   │
│  │  In-memory Task[] store                             │   │
│  │  addTask / listTasks / updateTask / deleteTask      │   │
│  └──────────────────────────┬─────────────────────────┘   │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────┐   │
│  │  types/task.ts                                      │   │
│  │  Task interface (shared by client & server)         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Client → Server (tRPC Query/Mutation)

1. Client calls a tRPC procedure (e.g., `trpc.taskList.query()`)
2. `httpBatchLink` serializes the call as JSON and POSTs to `/api/trpc`
3. Next.js route handler invokes `fetchRequestHandler` from `@trpc/server/adapters/fetch`
4. tRPC routes the call to the matching procedure in `server/trpc/router.ts`
5. Procedure calls a function in `lib/tasks.ts` (the in-memory store)
6. Result is serialized back to the client as JSON
7. React Query caches the result and re-renders the UI

### Server Component Boundary

- `app/layout.tsx` wraps all pages with `TrpcProvider` (a Client Component)
- `app/page.tsx` is a Client Component (`'use client'`) because it uses React Query hooks (`useQuery`)
- tRPC procedures run on the server; the client never accesses `lib/tasks.ts` directly

## Component Boundaries

| Layer | Responsibility | Can access store? | Can access browser APIs? |
|-------|---------------|-------------------|--------------------------|
| `app/page.tsx` | UI rendering, user interaction | No (via tRPC only) | Yes |
| `app/_trpc/client.ts` | tRPC client configuration | No | Yes |
| `app/_trpc/provider.tsx` | React Query + tRPC context | No | Yes |
| `app/api/trpc/[trpc]/route.ts` | HTTP request adapter | No | No (server only) |
| `server/trpc/router.ts` | Procedure definitions | Yes (via lib/tasks.ts) | No |
| `lib/tasks.ts` | In-memory CRUD operations | Yes (owns the array) | No |
| `types/task.ts` | Type definitions | N/A | N/A |

## Key Design Properties

- **Single source of truth for types:** `types/task.ts` is imported by both `lib/tasks.ts` and `server/trpc/router.ts`. The client infers procedure types from `AppRouter` exported by the router.
- **No direct store access from client:** The browser cannot read or write `lib/tasks.ts`. All data mutations go through tRPC procedures.
- **Stateless route handler:** `createContext` returns an empty object `{}`; the in-memory store is module-level state in `lib/tasks.ts`, not request-scoped.
