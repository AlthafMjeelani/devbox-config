---
name: react-state-and-query
description: Manage React state and data fetching - TanStack Query for server state, Zustand for client state, React Hook Form + Zod for forms, and Next.js App Router caching.
---

# React State and Query

## Where state lives
| State | Tool |
|---|---|
| Server data (lists, entities) | TanStack Query |
| Global UI/client state | Zustand (small slices, selectors) |
| Form state | React Hook Form + Zod resolver |
| URL-shareable state | search params |
| Local ephemeral | `useState` |

## TanStack Query
- Query key factories (`keys.todos.list(filters)`); never inline ad-hoc keys.
- Set `staleTime` deliberately; use `select` to derive data; `placeholderData: keepPreviousData` for pagination.
- Mutations: optimistic update via `onMutate`, rollback in `onError`, `invalidateQueries` in `onSettled`.

## Zustand
- Select narrowly: `useStore(s => s.count)`; use `useShallow` for multiple fields.
- Keep actions in the store; use `persist` middleware only for non-sensitive data.

## Forms
- `useForm({ resolver: zodResolver(schema) })`; share the schema with the server.
- Use `Controller` for controlled UI libs; surface server errors with `setError`.

## Next.js App Router
- Fetch in Server Components by default; pass data to client components as props or hydrate TanStack Query with `HydrationBoundary`.
- Caching: `fetch` options (`cache`, `next.revalidate`, `next.tags`); invalidate with `revalidateTag`/`revalidatePath` in Server Actions.
- Mark `'use client'` as low in the tree as possible.
