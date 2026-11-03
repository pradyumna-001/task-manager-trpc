# tRPC API Reference

This document describes every procedure exposed by the tRPC router (`server/trpc/router.ts`). All procedures share TypeScript types automatically via the `AppRouter` type export.

## Procedures

### taskList (Query)

Returns tasks sorted by creation date, newest first. Supports pagination via `skip` and `take` parameters.

**Input:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `skip` | `number` | No | `0` | Number of tasks to skip (offset). Must be >= 0. |
| `take` | `number` | No | `10` | Number of tasks to return. Must be 1-100. |

**Output:** `Task[]`

```ts
// First page (default 10 items)
const tasks = await caller.taskList({ skip: 0, take: 10 });

// Second page
const tasks = await caller.taskList({ skip: 10, take: 10 });
```

**Example response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "createdAt": "2026-11-03T10:00:00.000Z"
  }
]
```

**Errors:** None (always returns an array, possibly empty).

**Pagination notes:**
- Tasks are sorted by `createdAt` descending (newest first), then by `id` for stable ordering.
- When response length < `take`, no more pages exist.
- Infinite scroll frontend uses `skip=0,take=10` then `skip=10,take=10`, etc.

---

### taskCreate (Mutation)

Creates a new task.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Task title. Must not be empty. |
| `description` | `string` | No | Optional task description. |

**Output:** `Task` (the created task with generated `id` and `createdAt`)

```ts
const task = await caller.taskCreate({ title: "Buy groceries", description: "Milk, eggs, bread" });
```

**Errors:**
- `Title is required` — thrown when `title` is empty or missing (Zod validation).

---

### taskUpdate (Mutation)

Updates an existing task. Only `title` and/or `description` can be changed; `id` and `createdAt` are immutable.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | ID of the task to update. |
| `title` | `string` | No | New task title. Must not be empty if provided. |
| `description` | `string` | No | New task description. |

**Output:** `Task` (the updated task)

```ts
const updated = await caller.taskUpdate({ id: "550e8400-...", title: "Buy groceries and milk" });
```

**Errors:**
- `Title is required` — thrown when `title` is provided but empty (Zod validation).

**Note:** If the provided `id` does not exist, a new task is created (upsert behavior). This handles in-memory store resets during development.

---

### taskDelete (Mutation)

Removes a task by ID.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | ID of the task to delete. |

**Output:** `boolean` (`true` if the task was deleted)

```ts
const success = await caller.taskDelete({ id: "550e8400-..." });
```

**Errors:**
- `Task with id X not found` — thrown when no task with the given `id` exists.

---

### hello (Query)

Health check procedure. Returns a greeting string.

**Input:** None

**Output:** `string`

```ts
const greeting = await caller.hello(); // "hello"
```

**Errors:** None.

---

## Type Reference

### Task

```ts
interface Task {
  id: string;           // Unique identifier (UUID v4)
  title: string;        // Task title (required)
  description?: string; // Optional task description
  createdAt: Date;      // Creation timestamp
}
```

## Error Handling

All errors are thrown as standard `Error` instances from the server and propagated to the client via tRPC's error handling. Frontend code should catch and display these errors to the user.

Common error codes:
- `VALIDATION_ERROR` — Zod validation failed (e.g., empty title)
- `NOT_FOUND` — Task not found for update/delete
- `INTERNAL_ERROR` — Unexpected server error (logged server-side)