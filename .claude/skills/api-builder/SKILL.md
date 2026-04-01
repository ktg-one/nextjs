---
name: api-builder
description: "API Route Handler, Server Action, and data mutation patterns for Next.js 16. Zod validation, error handling, auth patterns, cache revalidation."
user-invocable: false
---

# API Builder Patterns (Official Vercel Source)

> Based on Next.js Agent Skills, Vercel React Best Practices, and Next.js 16 documentation.

## Route Handler Template

```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check first (Vercel rule: server-auth-actions)
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input with Zod
    const body = await request.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // 3. Execute business logic
    const result = await createResource(parsed.data)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API] POST /api/resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  const { items, total } = await getResources({ page, limit })

  return NextResponse.json({
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
```

## Server Action Template

```typescript
// src/app/actions/user.ts
'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
})

// Return type for form state
type ActionResult = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function updateUser(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 1. Auth — ALWAYS authenticate server actions (Vercel rule: server-auth-actions)
  const session = await auth()
  if (!session?.user) {
    return { error: 'You must be logged in' }
  }

  // 2. Validate
  const parsed = UpdateUserSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  // 3. Authorize — check ownership
  const user = await getUser(session.user.id)
  if (!user) {
    return { error: 'User not found' }
  }

  // 4. Mutate
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    })
  } catch (error) {
    console.error('[Action] updateUser:', error)
    return { error: 'Failed to update profile' }
  }

  // 5. Revalidate
  revalidatePath('/profile')
  revalidateTag('user-data')

  return { success: true }
}
```

## Server Action with useActionState (React 19)

```typescript
// src/components/features/edit-profile-form.tsx
'use client'

import { useActionState } from 'react'
import { updateUser } from '@/app/actions/user'

export default function EditProfileForm() {
  const [state, formAction, isPending] = useActionState(updateUser, {})

  return (
    <form action={formAction}>
      <input name="name" required />
      {state.fieldErrors?.name && (
        <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
      )}

      <input name="email" type="email" required />
      {state.fieldErrors?.email && (
        <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
      )}

      <textarea name="bio" maxLength={500} />

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

## Cache Revalidation Patterns

```typescript
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
export async function publishPost(id: string) {
  await db.post.update({ where: { id }, data: { published: true } })
  revalidatePath('/blog')           // revalidate blog listing
  revalidatePath(`/blog/${id}`)     // revalidate specific post
}

// Revalidate by tag (preferred for fine-grained control)
export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data })
  revalidateTag('products')         // all product caches
  revalidateTag(`product-${id}`)    // specific product cache
}

// Router refresh from client after mutation
'use client'
import { useRouter } from 'next/navigation'

function MutationButton() {
  const router = useRouter()
  async function handleClick() {
    await serverAction()
    router.refresh() // invalidates client router cache
  }
  return <button onClick={handleClick}>Update</button>
}
```

## Error Response Standard

```typescript
// Consistent error shape across all API routes
interface ApiError {
  error: string              // Human-readable message
  code?: string              // Machine-readable error code
  details?: Record<string, unknown>  // Validation details, etc.
}

// Status code reference
// 400 — validation failure (Zod errors)
// 401 — not authenticated (no session)
// 403 — not authorized (wrong role/ownership)
// 404 — resource not found
// 409 — conflict (duplicate, stale data)
// 422 — unprocessable entity (valid format, invalid semantics)
// 429 — rate limited
// 500 — internal server error (NEVER expose internals)
```

## Optimistic Updates

```typescript
'use client'

import { useOptimistic } from 'react'
import { toggleLike } from '@/app/actions/likes'

interface LikeButtonProps {
  postId: string
  isLiked: boolean
  likeCount: number
}

export default function LikeButton({ postId, isLiked, likeCount }: LikeButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(
    { isLiked, likeCount },
    (state, newIsLiked: boolean) => ({
      isLiked: newIsLiked,
      likeCount: state.likeCount + (newIsLiked ? 1 : -1),
    })
  )

  async function handleToggle() {
    setOptimistic(!optimistic.isLiked)
    await toggleLike(postId)
  }

  return (
    <button onClick={handleToggle}>
      {optimistic.isLiked ? '❤️' : '🤍'} {optimistic.likeCount}
    </button>
  )
}
```

## Non-Blocking Operations (Vercel rule: server-after-nonblocking)

```typescript
// Use after() for analytics, logging — don't block response
import { after } from 'next/server'

export async function POST(request: NextRequest) {
  const result = await createOrder(data)

  after(async () => {
    // These run AFTER the response is sent
    await sendConfirmationEmail(result.id)
    await trackAnalyticsEvent('order_created', result)
  })

  return NextResponse.json(result, { status: 201 })
}
```

## Request Deduplication (Vercel rule: server-cache-react)

```typescript
import { cache } from 'react'

// Per-request deduplication — call getUser() multiple times, DB hit once
export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// Use in multiple server components within same request
async function UserHeader() {
  const user = await getUser(userId) // first call hits DB
  return <h1>{user.name}</h1>
}

async function UserSidebar() {
  const user = await getUser(userId) // deduped — returns cached result
  return <aside>{user.bio}</aside>
}
```

## API Rules (Enforced by cs-code-reviewer)

1. **Zod-first** — every route handler and server action validates input with Zod
2. **Auth at top** — authentication check is the first operation, not buried in logic
3. **Structured errors** — always return `{ error, code?, details? }`, never raw strings
4. **Log with context** — `console.error('[API] METHOD /path:', error)`
5. **Never expose internals** — production errors return generic messages
6. **Server Actions authenticate** — treat exactly like API routes for auth
7. **Revalidate after mutation** — use `revalidatePath` or `revalidateTag`
8. **Paginate by default** — all list endpoints return paginated responses
