---
name: component-builder
description: "React 19 + Server Component patterns from official Vercel/React docs. Component templates, hooks patterns, RSC boundaries, performance optimization."
user-invocable: false
---

# Component Builder Patterns (Official React 19 + Vercel Source)

> Based on React 19.2 docs, Vercel React Best Practices (57 rules), and Next.js Agent Skills.

## Server Component (Default)

```typescript
// src/components/features/product-card.tsx
// No directive needed — Server Component by default

interface ProductCardProps {
  id: string
  title: string
  price: number
  description?: string
}

export default async function ProductCard({ id, title, price, description }: ProductCardProps) {
  // Can directly access DB, filesystem, secrets
  const inventory = await getInventory(id)

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <p className="mt-2 text-xl font-bold">${price}</p>
      <span className="text-xs text-muted-foreground">
        {inventory.count} in stock
      </span>
    </div>
  )
}
```

## Client Component (Interactive)

```typescript
// src/components/features/search-input.tsx
'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
}

export default function SearchInput({
  placeholder = 'Search...',
  defaultValue = '',
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(value)}`)
      })
    },
    [router]
  )

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border px-3 py-2"
      aria-label="Search"
    />
  )
}
```

## Composition Pattern: Server + Client

```typescript
// src/app/dashboard/page.tsx (Server Component)
import InteractiveChart from '@/components/features/interactive-chart'

export default async function DashboardPage() {
  // Fetch data on server — no waterfall, no client bundle
  const data = await getAnalytics()

  // Pass serializable data to client component
  return (
    <div>
      <h1>Dashboard</h1>
      <InteractiveChart data={data} /> {/* client handles interactivity */}
    </div>
  )
}

// src/components/features/interactive-chart.tsx (Client Component)
'use client'

import { useState } from 'react'

interface InteractiveChartProps {
  data: AnalyticsData[] // serializable props only
}

export default function InteractiveChart({ data }: InteractiveChartProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')
  const filtered = data.filter((d) => matchesRange(d, timeRange))
  return (/* chart rendering */)
}
```

## React 19 Hooks Reference

### useState — State management
```typescript
const [count, setCount] = useState(0)
const [items, setItems] = useState<Item[]>([])

// ✅ Functional update for stable callbacks (Vercel rule: rerender-functional-setstate)
const increment = useCallback(() => setCount((c) => c + 1), [])

// ✅ Lazy initialization for expensive values (Vercel rule: rerender-lazy-state-init)
const [data, setData] = useState(() => computeExpensiveDefault())
```

### useCallback — Stable function references
```typescript
// ✅ Memoize callbacks passed to child components
const handleSubmit = useCallback(async (formData: FormData) => {
  await submitForm(formData)
}, [])

// ❌ Don't memoize simple inline handlers on DOM elements
<button onClick={() => setOpen(true)}>Open</button>  // fine as-is
```

### useMemo — Expensive computation caching
```typescript
// ✅ Use for genuinely expensive computations
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// ❌ Don't use for simple primitives (Vercel rule: rerender-simple-expression-in-memo)
// const isActive = useMemo(() => status === 'active', [status])  // wasteful
const isActive = status === 'active'  // just compute inline
```

### useTransition — Non-urgent updates
```typescript
// ✅ Use for navigation, filtering, tab switches (Vercel rule: rerender-transitions)
const [isPending, startTransition] = useTransition()

function handleTabChange(tab: string) {
  startTransition(() => {
    setActiveTab(tab)
  })
}
```

### useRef — Mutable values without re-renders
```typescript
// ✅ DOM refs
const inputRef = useRef<HTMLInputElement>(null)

// ✅ Transient values that change frequently (Vercel rule: rerender-use-ref-transient-values)
const scrollPosition = useRef(0)
```

### use() — React 19 context/promise consumer
```typescript
// ✅ Read context in Server Components
import { use } from 'react'

function ThemeButton() {
  const theme = use(ThemeContext)
  return <button className={theme.buttonClass}>Click</button>
}
```

## Heavy Component Loading

```typescript
// ✅ Dynamic import for heavy components (Vercel rule: bundle-dynamic-imports)
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/code-editor'), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded bg-muted" />,
})

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded bg-muted" />,
})
```

## Component Rules (Enforced by cs-code-reviewer)

1. **Default export always** — one component per file
2. **Props interface above component**, exported if reused
3. **No barrel files** — import directly from component file path
4. **Tailwind only** — no CSS modules, no styled-components
5. **Use `cn()` from `@/lib/utils`** for conditional classes
6. **Server Component by default** — only `'use client'` when needed
7. **Minimize client boundary** — push `'use client'` to smallest leaf component
8. **Parallel fetch in server components** — `Promise.all()` for independent data
9. **Suspense boundaries** — wrap async children for streaming
10. **Every component gets a test** in `__tests__/unit/components/`

## Vercel Performance Rules (Top Priority)

| Rule | Impact | Pattern |
|------|--------|---------|
| `async-parallel` | CRITICAL | `Promise.all()` for independent ops |
| `bundle-barrel-imports` | CRITICAL | Import from specific file, not index |
| `bundle-dynamic-imports` | CRITICAL | `next/dynamic` for heavy components |
| `server-serialization` | HIGH | Minimize data passed to client components |
| `rerender-memo` | MEDIUM | Extract expensive work into memoized components |
| `rerender-derived-state` | MEDIUM | Subscribe to derived booleans, not raw values |
| `rendering-conditional-render` | MEDIUM | Use ternary `? :`, not `&&` |
