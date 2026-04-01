# Architecture Patterns

**Domain:** Single-page landing with WebGL + AI chatbot
**Researched:** 2026-04-01

## Recommended Architecture

Single-page with Server Component shell that lazy-loads Client Component islands. Three.js shader runs in a self-contained client component. AI chat uses a streaming API route.

```
┌─────────────────────────────────────────────────────────┐
│  layout.tsx (Server Component)                          │
│  - next/font (DM Sans, JetBrains Mono)                 │
│  - metadata, global CSS, design tokens                  │
├─────────────────────────────────────────────────────────┤
│  page.tsx (Server Component)                            │
│  - Static shell, renders client islands via next/dynamic│
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ ShaderBackground (Client, ssr: false)          │     │
│  │ - Three.js canvas, SDF lens blur GLSL shader   │     │
│  │ - Reads pointermove from window directly        │     │
│  │ - z-index: 0 (behind everything)               │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ CursorEffects (Client, ssr: false)             │     │
│  │ - Custom cursor div + ambient glow gradient     │     │
│  │ - Reads pointermove from window directly        │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ HeroSection (Client)                           │     │
│  │ - State machine: landing | chatting | lead      │     │
│  │                                                 │     │
│  │  ┌──────────────────────────────────────┐      │     │
│  │  │ ChatInterface                        │      │     │
│  │  │ - useChat hook (AI SDK v6)           │      │     │
│  │  │ - Message list, input, quick-replies │      │     │
│  │  └──────────────────────────────────────┘      │     │
│  │                                                 │     │
│  │  ┌──────────────────────────────────────┐      │     │
│  │  │ LeadCaptureCard                      │      │     │
│  │  │ - react-hook-form + zod validation   │      │     │
│  │  │ - Web3Forms client-side POST         │      │     │
│  │  └──────────────────────────────────────┘      │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ NoiseOverlay (CSS pseudo-element)              │     │
│  │ - Static noise PNG + radial vignette           │     │
│  └────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│  /api/chat/route.ts (Server)                            │
│  - streamText via AI Gateway, Perth persona prompt      │
└─────────────────────────────────────────────────────────┘
```

### Three.js Integration Decision: Vanilla vs R3F

**Use vanilla Three.js, not React Three Fiber.** Rationale:

1. The shader reference (codrops-sdf-lensblur) is vanilla Three.js with raw `THREE.ShaderMaterial`. R3F adds abstraction for zero benefit on a single fullscreen quad.
2. No 3D scene to manage -- no multiple meshes, cameras, lights, or interactable objects. R3F's declarative model is designed for complex scenes.
3. R3F adds ~45KB bundle weight (reconciler, scheduler, hooks) that won't be used.
4. Direct Three.js gives full control over the render loop for 60fps cursor-reactive animation.
5. A single `useEffect` with cleanup is simpler than R3F's Canvas + mesh + material tree for one shader.

**If v2 adds interactive 3D demos (voice agent visualization, automation flow 3D), reconsider R3F at that point.**

### Component Boundaries

| Component | Responsibility | Communicates With | Directive |
|-----------|---------------|-------------------|-----------|
| `layout.tsx` | Font loading, metadata, CSS tokens | -- | Server |
| `page.tsx` | Static shell, dynamic imports | -- | Server |
| `ShaderBackground` | Three.js canvas, SDF shader, cursor uniform updates | Reads pointermove from window | Client |
| `CursorEffects` | Custom cursor div, ambient glow gradient | Reads pointermove from window | Client |
| `HeroSection` | Landing/chat state machine, layout orchestration | Parent of ChatInterface + LeadCaptureCard | Client |
| `ChatInterface` | useChat hook, message rendering, input | Calls /api/chat, notifies HeroSection | Client |
| `LeadCaptureCard` | Form + validation, Web3Forms POST | Receives visibility + transcript from HeroSection | Client |
| `/api/chat/route.ts` | streamText + AI Gateway + persona prompt | Vercel AI Gateway (external) | Server |

### Data Flow

```
User lands
  └─> page.tsx (Server) renders shell
       ├─> dynamic() loads ShaderBackground (no SSR)
       ├─> dynamic() loads CursorEffects (no SSR)
       └─> renders HeroSection
            └─> Landing state: wordmark + input + chips

User submits message
  └─> HeroSection.phase = 'chatting'
       └─> ChatInterface activates
            └─> useChat.sendMessage()
                 └─> POST /api/chat
                      └─> streamText(AI Gateway) -> SSE -> useChat
                           └─> First AI response arrives
                                └─> HeroSection.showLeadCapture = true
                                     └─> LeadCaptureCard slides in

Lead form submit
  └─> react-hook-form + zod validates
       └─> fetch POST to Web3Forms
            └─> Email with name, phone, transcript
```

## State Management

No external state library needed. Four pieces of state in one component:

| State | Type | Managed By | Consumed By |
|-------|------|------------|-------------|
| `phase` | `'landing' \| 'chatting'` | HeroSection | Layout transitions |
| `showLeadCapture` | `boolean` | HeroSection | LeadCaptureCard visibility |
| `messages` | `UIMessage[]` | useChat (ChatInterface) | ChatInterface + transcript |
| `leadSubmitted` | `boolean` | LeadCaptureCard | Form vs thank-you state |

Cursor position is NOT React state. Both ShaderBackground and CursorEffects read `pointermove` from window independently via `useRef`.

## Patterns to Follow

### Pattern 1: Dynamic Import with SSR Disabled
```typescript
// page.tsx
import dynamic from 'next/dynamic';
const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0C0C0C]" />,
});
```
**Why:** Three.js requires browser APIs. Loading fallback matches the design's dark background.

### Pattern 2: Vanilla Three.js in useEffect
```typescript
'use client';
export default function ShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    // ... setup scene, material, uniforms, RAF loop
    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      renderer.forceContextLoss();
    };
  }, []);
  return <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden="true" />;
}
```
**Why:** Full lifecycle control. Explicit GPU resource cleanup prevents WebGL context leaks.

### Pattern 3: State Machine for Page Phases
```typescript
type PagePhase = 'landing' | 'chatting';
const [phase, setPhase] = useState<PagePhase>('landing');
```
**Why:** Prevents impossible states (lead card showing before chat starts).

### Pattern 4: Edge Runtime for Chat API
```typescript
export const runtime = 'edge'; // or 'nodejs' if timeout is concern
export const maxDuration = 60;
```
**Why:** Edge = low latency for streaming. Set maxDuration to prevent timeout on slow first-token.

### Pattern 5: Pointer Event Sharing via DOM (No Shared State)
Both ShaderBackground and CursorEffects read `pointermove` from `window` independently. No React context, no shared state, no coupling.

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Instead |
|-------------|---------|---------|
| React state for per-frame values | 60 re-renders/sec kills perf | useRef + imperative updates |
| Three.js in Server Component | window/document undefined, SSR crash | 'use client' + dynamic(ssr: false) |
| Loading shaders via fetch from /public | Extra network request, loading state, cache issues | Import as module via raw-loader (build-time bundled) |
| Barrel exports (components/index.ts) | Defeats tree-shaking, CLAUDE.md forbids it | Direct imports |
| Global state library for 4 pieces of state | Overkill: adds bundle, boilerplate, indirection | useState in HeroSection |

## File Structure

```
src/
  app/
    layout.tsx              # Server: fonts, metadata, global CSS
    page.tsx                # Server: static shell, dynamic imports
    api/chat/route.ts       # Server: AI SDK streamText handler
  components/
    ShaderBackground.tsx    # Client: Three.js canvas + SDF shader
    CursorEffects.tsx       # Client: custom cursor + ambient glow
    HeroSection.tsx         # Client: state machine, layout
    ChatInterface.tsx       # Client: useChat, messages, input
    LeadCaptureCard.tsx     # Client: form, validation, Web3Forms
    NoiseOverlay.tsx        # Client: CSS noise texture + vignette
    ui/                     # shadcn/ui primitives (already scaffolded)
  shaders/
    sdf-lensblur.vert       # Vertex shader (GLSL)
    sdf-lensblur.frag       # Fragment shader (GLSL)
  hooks/
    useMediaQuery.ts        # Touch device detection
  lib/
    web3forms.ts            # Web3Forms POST utility
    chatPersona.ts          # System prompt
  types/
    glsl.d.ts               # .glsl/.vert/.frag module declarations
```

## Sources

- [Next.js Turbopack Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) -- HIGH
- [AI SDK Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) -- HIGH
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- HIGH
- [Three.js Performance Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) -- MEDIUM
- [R3F Installation](https://r3f.docs.pmnd.rs/getting-started/installation) -- HIGH (consulted to confirm overhead)
