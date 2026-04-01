---
description: "Scaffold a new page with layout, loading, and error boundaries"
argument-hint: "[/route/path]"
---

Create a new page:

1. Determine route group: `(marketing)`, `(app)`, or `(auth)`
2. Create directory under `src/app/{group}/{route}/`
3. Create `page.tsx` — Server Component by default
4. Create `loading.tsx` — Suspense fallback
5. Create `error.tsx` — Error boundary (must be `'use client'`)
6. If shared layout needed, create `layout.tsx`
7. Set metadata export for SEO
