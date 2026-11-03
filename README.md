# Task Manager

Simple task management application built with **Next.js v15**, **tRPC**, and **React**.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js v15 (App Router) | Server Components by default; file-system routing; SSR for the task list page |
| API layer | tRPC | End-to-end TypeScript type safety; no separate schema or codegen; client calls server procedures as local functions |
| Data validation | Zod | Runtime input validation with TypeScript type inference |
| State/cache | TanStack React Query | Caching, loading states, infinite queries, and mutation handling on the client |
| Data store | In-memory (TypeScript array) | Simple, functional backend without database overhead; data resets on server restart |
| Language | TypeScript | Single language across client and server; compile-time contract safety |

## Project Structure

```
task-manager-trpc/
├── app/
│   ├── layout.tsx              # Root layout; wraps pages with TrpcProvider
│   ├── page.tsx                # Client Component task list with infinite scroll
│   ├── api/trpc/[trpc]/        # tRPC route handler (GET/POST)
│   │   └── route.ts
│   ├── tasks/
│   │   ├── new/page.tsx        # Client Component form for creating tasks
│   │   └── [id]/edit/page.tsx  # Client Component form for editing tasks
│   └── _trpc/
│       ├── client.ts           # tRPC React client + httpBatchLink to /api/trpc
│       └── provider.tsx        # React Query + tRPC Provider wrapper
├── lib/
│   └── tasks.ts                # In-memory task store (CRUD functions + tasks array)
├── server/
│   └── trpc/
│       ├── context.ts          # tRPC context factory (per-request context)
│       └── router.ts           # tRPC app router (taskList, taskCreate, taskUpdate, taskDelete procedures)
├── types/
│   └── task.ts                 # Task interface shared by store and tRPC
├── docs/
│   ├── ARCHITECTURE.md         # Data flow and component boundaries
│   ├── DECISIONS.md            # Reasoning behind key technical decisions
│   └── API.md                  # tRPC procedure reference
├── package.json
├── next.config.ts
├── tsconfig.json
└── .gitignore
```

## How to Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the task list page.

To verify TypeScript compiles:

```bash
npx tsc --noEmit
```

## Features

- **Infinite Scroll**: Task list loads 10 items initially, fetches more as user scrolls down (100px before bottom)
- **Pagination**: Server-side pagination via `skip`/`take` parameters (tRPC `taskList` query)
- **CRUD Operations**: Create, read, update, delete tasks with full UI
- **Loading States**: All mutations show loading indicators (Creating..., Updating..., Deleting...)
- **Success/Error Feedback**: Toast notifications for all mutations with auto-dismiss
- **Delete Confirmation**: Confirmation dialog before deleting tasks
- **Infinite Query Caching**: React Query caches pages; scroll position preserved on navigation
- **Type-Safe API**: End-to-end TypeScript via tRPC from server procedures to React hooks

## Current State

- Next.js v15 App Router with task list page at `/`
- tRPC client-server wiring with React Query provider
- tRPC procedures: `hello`, `taskList`, `taskCreate`, `taskUpdate`, `taskDelete`
- In-memory task store with `addTask`, `listTasks`, `updateTask`, `deleteTask`
- Full CRUD UI: task list (infinite scroll), create form, edit page
- Mutation loading states, success/error toasts, delete confirmation
- See `docs/API.md` for the complete procedure reference

## Design Decisions

See `docs/DECISIONS.md` for the reasoning behind tRPC, SSR, in-memory store, App Router, Zod validation, error handling, partial updates, infinite scroll, mutation feedback, and more.

## Security

This repository is intended to be public. No secrets, passwords, API tokens, or personal information are committed. Environment variables should be provided locally via `.env.local` and are gitignored.