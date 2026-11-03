# Technical Decisions

## tRPC Over REST or GraphQL

**Decision:** Use tRPC as the API layer between the Next.js frontend and backend.

**Reasoning:**
- **Type safety without a contract layer:** tRPC infers TypeScript types directly from server procedures. The client knows procedure names, input shapes, and return types at compile time. There is no OpenAPI spec, GraphQL schema, or code generation step to keep in sync.
- **Single language:** Both client and server are TypeScript. This eliminates the impedance mismatch of maintaining separate client and server type definitions.
- **Smaller surface area:** One endpoint (`/api/trpc`) handles all procedures. No need to design REST resource URLs or version them.

**Trade-off:** The API is TypeScript-only. Consumers outside the TypeScript ecosystem (mobile apps, other backend services) cannot easily call it without an adapter. For this application, all consumers are within the same TypeScript codebase, so this is not a concern.

## Server-Side Rendering for the Task List

**Decision:** Render the task list page on the server (SSR) using Next.js Server Components.

**Reasoning:**
- **Fresh data on every request:** Task data changes frequently (users create, update, delete tasks). SSR guarantees the user sees current data immediately on page load without a client-side fetch waterfall.
- **Fast first paint:** The server sends fully rendered HTML. The browser displays content immediately, then hydrates for interactivity.
- **Simple data access:** The in-memory store is cheap to read per request, so the server-load cost of SSR is negligible at this scale.

**Trade-off:** SSR does work on every request, which increases server load compared to static generation. For a task list with read-heavy, low-traffic usage, this is acceptable.

## In-Memory Data Store

**Decision:** Store tasks in a module-level TypeScript array (`lib/tasks.ts`) with no database persistence.

**Reasoning:**
- **Simplicity:** No database setup, migrations, or connection management. The store is a plain array with CRUD functions.
- **Appropriate for scope:** The application is a task manager prototype. Durability across server restarts is not a requirement.
- **Predictable behavior:** Data resets on server restart, which is documented and expected.

**Trade-off:** Data is lost when the server process stops. This is a known limitation and is acceptable for the current scope. If persistence becomes necessary, the store layer can be replaced with a database adapter without changing the tRPC procedures.

## Next.js App Router

**Decision:** Use the App Router (`app/` directory) with Server Components by default.

**Reasoning:**
- **Modern Next.js default:** The App Router is the recommended architecture for Next.js v15.
- **Server Components reduce client JS:** Pages that only need to render data (like the task list) can run on the server without shipping JavaScript to the client.
- **File-system routing:** Routes map directly to the folder structure, eliminating a separate `routes.ts` or `urls.py` equivalent.

**Trade-off:** The mental model of Server vs. Client Components requires care. Components that use browser APIs or React hooks (`useState`, `useEffect`, React Query) must be marked `'use client'`.

## Zod for Input Validation

**Decision:** Use Zod schemas to validate tRPC procedure inputs.

**Reasoning:**
- **Runtime safety:** TypeScript types are compile-time only. Zod validates actual runtime data, guarding against malformed requests.
- **Type inference:** Zod schemas infer TypeScript types, so validation and type definitions stay in one place.

**Trade-off:** Zod adds a runtime validation step. For a small application with trusted internal clients, this is overhead, but it prevents invalid data from entering the store.

## Error Handling

**Decision:** Fail loudly by throwing typed errors at the function boundary (missing title, nonexistent task id).

**Reasoning:**
- **Explicit failures:** Errors are raised at the boundary where they occur, rather than silently logged and ignored.
- **Caller responsibility:** The caller (tRPC procedure or frontend) decides how to surface the error to the user.

**Trade-off:** Throwing errors requires callers to handle them. For a small application, this is preferable to "log and continue," which can mask bugs.

## File Organization

**Decision:** Separate concerns by layer: `types/` for shared types, `lib/` for data access, `server/trpc/` for API procedures, `app/` for UI.

**Reasoning:**
- **Clear boundaries:** The store does not import from tRPC; tRPC imports from the store. The dependency direction is types → store → tRPC → routes.
- **Testability:** Store functions can be tested in isolation without the tRPC layer or Next.js.

**Trade-off:** More files than a single-file prototype, but each file has a single, clear responsibility.

## Partial Updates via Spread Merge

**Decision:** `taskUpdate` accepts only `title` and/or `description` as optional fields; `id` and `createdAt` are never modified by the update procedure.

**Reasoning:**
- **Immutable identity:** The task `id` is set at creation and never changes; allowing clients to modify it would break references and cache keys.
- **Immutable creation time:** `createdAt` records when the task was first created and should not change on edits.
- **Flexible edits:** Clients can update just the title, just the description, or both, without needing to send the full task object.
- **Store-level enforcement:** The `updateTask` function in `lib/tasks.ts` uses spread merge (`{ ...task, ...updates }`), so only provided fields override existing values.

**Trade-off:** Clients cannot change a task's ID or creation timestamp after creation. If a task needs a different ID, it must be deleted and recreated.

## Mutation vs Query in tRPC

**Decision:** Use `query` procedures for reads (`taskList`) and `mutation` procedures for writes (`taskCreate`, `taskUpdate`, `taskDelete`).

**Reasoning:**
- **Semantic correctness:** Queries are read-only and side-effect-free; mutations modify state. This distinction matches REST's GET vs POST/PUT/DELETE.
- **React Query integration:** TanStack React Query caches query results and refetches on mutation, providing automatic cache invalidation for the task list after creates, updates, or deletes.
- **Client expectations:** Queries can be called safely multiple times; mutations represent actions with side effects and should not be cached or retried blindly.

**Trade-off:** Mutations require explicit cache management (React Query handles this automatically via `onSuccess` callbacks or `invalidateQueries`).

## Validation Boundary (Defense in Depth)

**Decision:** Validate input at both the tRPC API boundary (Zod) and inside the store functions (`addTask`, `updateTask`).

**Reasoning:**
- **API boundary:** Zod schemas reject malformed requests before they reach the handler, returning clear 400 errors to the client.
- **Store protection:** Store functions validate their own invariants (e.g., `addTask` rejects empty titles), so invalid data can never enter the store even if called directly or bypassing tRPC.
- **Defense in depth:** Two layers of validation mean a bug in one layer doesn't silently corrupt data.

**Trade-off:** Some validation logic is duplicated (e.g., title required is checked by both Zod and `addTask`). This is intentional and acceptable for a small application.

## Client-Side Form Validation

**Decision:** Add client-side form validation on create and edit pages to block submission when title is empty, with inline error messages.

**Reasoning:**
- **Better UX:** Users get immediate feedback without a server round-trip. Empty titles are caught before the request is sent.
- **Reduced server load:** Invalid requests never reach the server, saving processing.
- **Consistent experience:** Both create and edit forms enforce the same validation rule (title required).

**Trade-off:** Validation logic exists in both client and server (Zod), which is intentional for defense in depth.

## UpdateTask Creates Missing Task (Upsert)

**Decision:** `taskUpdate` creates a new task if the provided ID does not exist in the store, rather than throwing an error.

**Reasoning:**
- **Resilience:** The in-memory store resets on every dev server restart. Without upsert, editing a task whose ID was lost on restart would fail with a task not found error.
- **Better UX:** Editing a task that no longer exists creates it fresh instead of showing an error, keeping the flow functional.
- **Simplicity:** Avoids requiring clients to handle 404 errors for update operations they expect to succeed.

**Trade-off:** Creates a task silently if the ID is wrong (e.g., typo in URL), which could result in duplicate tasks with different IDs. This is acceptable for a small in-memory store where exact ID matching is not critical.

## Infinite Scroll Pagination (M4 #56-58)

**Decision:** Implement infinite scroll on the task list page using TanStack React Query's `useInfiniteQuery` with `IntersectionObserver`.

**Reasoning:**
- **User experience:** Users see tasks immediately (first 10) and can scroll to load more without pagination controls.
- **Performance:** Only fetches what's needed. Initial load is fast (10 items), subsequent pages fetched on demand.
- **React Query integration:** `useInfiniteQuery` provides built-in caching, deduping, `fetchNextPage`, `hasNextPage`, and `isFetchingNextPage` states.
- **Simpler than offset pagination UI:** No page numbers, previous/next buttons, or page size selectors to maintain.

**Implementation details:**
- Backend: `taskList` query accepts optional `skip` (default 0) and `take` (default 10, max 100) parameters via Zod schema. `listTasks(skip, take)` uses `.slice(skip, skip + take)` on sorted array.
- Frontend: `app/page.tsx` converted to Client Component (`'use client'`). Uses `trpc.useInfiniteQuery(['taskList'], { skip: 0, take: 10 }, { getNextPageParam: (lastPage, allPages) => lastPage.length < 10 ? undefined : { skip: allPages.length * 10, take: 10 } })`.
- Scroll detection: `IntersectionObserver` on a sentinel div at bottom of list with `rootMargin: '100px'`. Calls `fetchNextPage()` when sentinel intersects viewport.
- Fetch guard: Synchronous boolean ref (`isFetchingRef.current`) set immediately before `fetchNextPage()`, cleared in `finally` block. Prevents concurrent fetches when observer fires multiple times in same tick.
- End state: `hasNextPage` becomes `false` when page returns fewer than `take` items. Shows "No more tasks" message.

**Trade-offs:**
- **SSR vs Client Component:** Task list page converted from Server Component to Client Component to support `useInfiniteQuery` and `IntersectionObserver`. Loses initial SSR render; shows "Loading tasks..." briefly.
- **State in URL:** Scroll position and page not persisted in URL (no deep linking to specific page). Acceptable for a simple task list.
- **Initial page size:** Fixed at 10 items. Could be made configurable but adds complexity.

## Mutation Feedback: Loading States, Success/Error Toasts, Delete Confirmation (M4 #23-26)

**Decision:** Add consistent feedback for all mutations: loading states, success toasts with auto-redirect/reload, error toasts, and delete confirmation dialog.

**Reasoning:**
- **Perceived performance:** Loading states (Creating..., Updating..., Deleting...) give immediate feedback that action was registered.
- **Success confirmation:** Green toast ("Task created/updated/deleted successfully!") confirms completion. Auto-redirect (create/update) or reload (delete) after 1s keeps user in flow.
- **Error visibility:** Red toast shows error message if mutation fails. User can retry without losing form data.
- **Destructive action guard:** Delete requires confirmation dialog to prevent accidental data loss.

**Implementation details:**
- **Create (`app/tasks/new/page.tsx`):** Button disabled during `create.isPending`, shows "Creating...". `onSuccess` sets success toast, redirects to `/` after 1s. `onError` sets error toast with `error.message`.
- **Update (`app/tasks/[id]/edit/page.tsx`):** Button disabled during `update.isPending`, shows "Updating...". Inputs disabled during mutation. `onSuccess` sets success toast, redirects after 1s. `onError` sets error toast.
- **Delete (`app/tasks/TaskRow.tsx`):** Button disabled during `del.isPending`, shows "Deleting...". `window.confirm()` before mutate. `onSuccess` sets success toast, reloads page after 1s. `onError` sets error toast.
- **Toast styling:** Inline styled divs (green for success, red for error) with 1px border, padding, rounded corners. Positioned near form/button.

**Trade-offs:**
- **Toast position:** Inline near action rather than global notification system. Simpler, no portal/z-index management.
- **Auto-dismiss timing:** Fixed 1s delay before redirect/reload. Could be configurable but adds complexity.
- **Error message source:** Uses `error.message` from tRPC error. Assumes server returns user-friendly messages (currently does via Zod validation errors and explicit throws).

## Error Handling: Graceful Error Boundaries (M4 #27)

**Decision:** (Pending) Handle backend errors gracefully without exposing raw stack traces to the client.

**Reasoning:**
- **Security:** Stack traces can leak internal implementation details, file paths, and dependencies.
- **UX:** Raw error dumps are not actionable for users; they should see friendly messages.
- **Debugging:** Errors should be logged server-side for developers, not sent to client.

**Implementation plan:**
- Wrap tRPC procedures in try/catch or use tRPC error formatting
- Return structured error codes/messages to client (e.g., `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`)
- Log full stack traces server-side (console.error or logging service)
- Client displays user-friendly message based on error code

**Trade-off:** Requires mapping internal errors to user-facing codes. Adds complexity but improves security and UX.