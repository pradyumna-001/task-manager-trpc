# Task Manager

Simple task management application built with **Next.js v15**, **tRPC**, and **React**.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js v15 (App Router) | Server Components by default; file-system routing; SSR for the task list page |
| API layer | tRPC | End-to-end TypeScript type safety; no separate schema or codegen; client calls server procedures as local functions |
| Data validation | Zod | Runtime input validation with TypeScript type inference |
| State/cache | TanStack React Query | Caching, loading states, and mutation handling on the client |
| Data store | In-memory (TypeScript array) | Simple, functional backend without database overhead; data resets on server restart |
| Language | TypeScript | Single language across client and server; compile-time contract safety |

## Project Structure

```
task-manager-trpc/
├── app/
│   ├── layout.tsx              # Root layout; wraps pages with TrpcProvider
│   ├── page.tsx                # Home page; calls hello tRPC procedure (Client Component)
│   ├── api/trpc/[trpc]/        # tRPC route handler (GET/POST)
│   │   └── route.ts
│   └── _trpc/
│       ├── client.ts           # tRPC React client + httpBatchLink to /api/trpc
│       └── provider.tsx        # React Query + tRPC Provider wrapper
├── lib/
│   └── tasks.ts                # In-memory task store (CRUD functions + tasks array)
├── server/
│   └── trpc/
│       ├── context.ts          # tRPC context factory (per-request context)
│       └── router.ts           # tRPC app router (hello procedure placeholder)
├── types/
│   └── task.ts                 # Task interface shared by store and tRPC
├── docs/
│   ├── ARCHITECTURE.md         # Data flow and component boundaries
│   └── DECISIONS.md            # Reasoning behind key technical decisions
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

Open [http://localhost:3000](http://localhost:3000) to see the home page.

To verify TypeScript compiles:

```bash
npx tsc --noEmit
```

## Current State

- Next.js v15 App Router with root page at `/`
- tRPC client-server wiring with React Query provider
- `hello` query procedure exposed at `/api/trpc`
- Home page calls `hello` and displays the returned string
- In-memory task store with `addTask`, `listTasks`, `updateTask`, `deleteTask`

## Design Decisions

See `docs/DECISIONS.md` for the reasoning behind tRPC, SSR, in-memory store, and App Router choices.

## Security

This repository is intended to be public. No secrets, passwords, API tokens, or personal information are committed. Environment variables should be provided locally via `.env.local` and are gitignored.
