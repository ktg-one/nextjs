---
name: nextjs-dev
description: "Next.js 16 development patterns from Vercel's official Next.js Agent Skills (394 snippets). App Router, RSC boundaries, cache components, Turbopack, proxy.ts, Server Actions, metadata/SEO."
user-invocable: false
---

# Next.js 16 Development Patterns (Official Vercel Source)

> Based on `/vercel-labs/next-skills` — the official Vercel-maintained skill pack for Next.js agents.

## File Conventions (App Router)

| File | Purpose | Scope |
|------|---------|-------|
| `page.tsx` | UI unique to a route | Route segment |
| `layout.tsx` | Shared UI wrapping children | Route segment + children |
| `loading.tsx` | Instant loading UI (Suspense) | Route segment |
| `error.tsx` | Error boundary (`'use client'` required) | Route segment |
| `not-found.tsx` | 404 UI | Route segment |
| `route.ts` | API route handler | Route segment |
| `template.tsx` | Re-rendered layout (no state persistence) | Route segment |
| `default.tsx` | Parallel route fallback | Parallel slot |
| `global-error.tsx` | Root error boundary | App-wide |
| `proxy.ts` | Request rewriting/routing (replaces middleware in v16) | Project root |

### Route Groups
```
src/app/
  (marketing)/      # force-static — landing, blog, docs
  (app)/             # force-dynamic — dashboard, settings
  (auth)/            # auth flows — login, register, callback
```

## React Server Component (RSC) Boundaries

### Decision Tree
1. Does it handle user interaction (clicks, forms, state)? → `'use client'`
2. Does it only render data? → Server Component (default)
3. Does it need browser APIs (window, localStorage)? → `'use client'`
4. Is it heavy (chart, editor, map)? → `next/dynamic` with `ssr: false`
5. Does it fetch data? → Server Component with `async` + direct DB/API call

### Directives
```typescript
// Server Action file — ALL exports become server actions
'use server'

// Client Component — opts into client rendering
'use client'

// Cache directive (Next.js 16 PPR) — caches component output
'use cache'
```

### Boundary Rules
- Server Components can import Client Components ✅
- Client Components CANNOT import Server Components ❌
- Client Components CAN render Server Components as `children` ✅
- `'use client'` marks the boundary — everything imported below is client

```typescript
// ✅ Correct: Server Component passes Server Component as children
import ClientShell from './client-shell'
import ServerData from './server-data'

export default function Page() {
  return (
    <ClientShell>
      <ServerData />  {/* stays on server */}
    </ClientShell>
  )
}
```

## Async Patterns (Next.js 16)

### params and searchParams are Promises
```typescript
// ✅ Next.js 16 — await params
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <Article slug={slug} />
}

// ✅ Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return { title: `Article: ${slug}` }
}
```

### Parallel Data Fetching — ALWAYS for independent data
```typescript
// ✅ Parallel — no waterfall
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
])

// ❌ Sequential waterfall
const user = await getUser(id)
const posts = await getPosts(id)      // waits for user
const comments = await getComments(id) // waits for posts
```

### Suspense Streaming
```typescript
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<CardSkeleton />}>
        <RevenueChart />  {/* streams when ready */}
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <LatestInvoices /> {/* streams independently */}
      </Suspense>
    </div>
  )
}
```

## Cache Components (Next.js 16 PPR)

```typescript
// Cacheable component with 'use cache'
async function CachedProductList() {
  'use cache'
  const products = await db.product.findMany()
  return <ProductGrid products={products} />
}

// Cache with time-based revalidation
import { cacheLife } from 'next/cache'

async function CachedStats() {
  'use cache'
  cacheLife('hours')  // revalidate every hour
  const stats = await getStats()
  return <StatsDisplay stats={stats} />
}

// Pass-through Server Actions in cached components
import { cacheTag } from 'next/cache'

async function CachedList({ tag }: { tag: string }) {
  'use cache'
  cacheTag(tag)
  const items = await getItems()
  return <ItemList items={items} />
}
```

## Server Actions

```typescript
'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export async function createUser(formData: FormData) {
  // 1. Validate
  const parsed = CreateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  // 2. Authenticate (treat like API route)
  const session = await auth()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  // 3. Mutate
  const user = await db.user.create({ data: parsed.data })

  // 4. Revalidate + redirect
  revalidatePath('/users')
  redirect(`/users/${user.id}`)
}

// Client-side refresh after mutation
'use client'
import { useRouter } from 'next/navigation'

function UpdateButton() {
  const router = useRouter()
  async function handleUpdate() {
    await updateItem(id)
    router.refresh() // invalidates client router cache
  }
  return <button onClick={handleUpdate}>Update</button>
}
```

## Data Fetching Patterns

```typescript
// Pattern 1: Server Component direct fetch
async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id) // direct DB call — no API route needed
  return <ProductView product={product} />
}

// Pattern 2: ISR with revalidation
export const revalidate = 3600 // revalidate every hour

async function BlogPage() {
  const posts = await getPosts()
  return <PostList posts={posts} />
}

// Pattern 3: generateStaticParams for SSG
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// Pattern 4: Force dynamic for per-request data
export const dynamic = 'force-dynamic'
```

## Route Handlers

```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const result = await createResource(parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API] POST /api/resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## proxy.ts (Replaces middleware.ts in Next.js 16)

```typescript
// proxy.ts — project root
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Conditional rewrites
  if (pathname.startsWith('/blog')) {
    return { rewrite: new URL('/marketing/blog' + pathname.slice(5), request.url) }
  }

  // Auth redirect
  if (pathname.startsWith('/dashboard') && !request.cookies.get('session')) {
    return { redirect: new URL('/login', request.url) }
  }
}
```

## Metadata / SEO

```typescript
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'App description',
  openGraph: {
    title: 'My App',
    description: 'App description',
    images: ['/og.png'],
  },
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  }
}

// OG Image generation
// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Default Title'
  return new ImageResponse(
    <div style={{ fontSize: 48, background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {title}
    </div>,
    { width: 1200, height: 630 }
  )
}
```

## Parallel & Intercepting Routes

```typescript
// Parallel routes — multiple slots in same layout
// src/app/@analytics/page.tsx
// src/app/@team/page.tsx
// src/app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      {children}
      {analytics}
      {team}
    </div>
  )
}

// Intercepting routes — modal pattern
// src/app/@modal/(.)photo/[id]/page.tsx  — intercepts /photo/[id]
// src/app/photo/[id]/page.tsx            — full page fallback
```

## Import Rules (Critical for Bundle Size)

```typescript
// ❌ WRONG — barrel import pulls entire library
import { Button, Card, Input } from '@/components/ui'

// ✅ RIGHT — direct imports, tree-shakeable
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ❌ WRONG — dynamic import at module level
import HeavyChart from '@/components/heavy-chart'

// ✅ RIGHT — lazy load heavy components
import dynamic from 'next/dynamic'
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})
```

## Turbopack (Default in Next.js 16)

- Turbopack is the default bundler for both `next dev` and `next build`
- No webpack configuration needed for standard use cases
- Built-in CSS, PostCSS, and Tailwind CSS support
- Filesystem caching enabled by default

```typescript
// next.config.ts — Turbopack cache configuration
const config = {
  // Turbopack uses filesystem caching by default
  // Custom cache directory (optional)
  experimental: {
    turbo: {
      // Turbopack-specific configuration if needed
    },
  },
}
```

## Environment Variables

- `NEXT_PUBLIC_*` — exposed to client bundle (public values only)
- Everything else — server-only (API keys, secrets, DB URLs)
- Never import `process.env` in client components without `NEXT_PUBLIC_` prefix
- Use `src/types/env.d.ts` for typed environment variables

## Error Handling

```typescript
// error.tsx — MUST be 'use client'
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// global-error.tsx — catches root layout errors
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```
