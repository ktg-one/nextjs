# Technology Stack

**Project:** Good'ai Business Automations Landing Page
**Researched:** 2026-04-01

## Recommended Stack

### Core Framework (Already Installed)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.2.1 | App framework | Already installed. App Router, Turbopack default, React 19 support. Single-page landing with API route for chat. | HIGH |
| React | 19.2.4 | UI library | Already installed. Needed for R3F v9 compatibility. | HIGH |
| TypeScript | ^5 | Type safety | Already installed. Strict mode per project rules. | HIGH |
| Tailwind CSS | v4 | Styling | Already installed. CSS-first config, design token mapping for Perth Disruptor palette. | HIGH |

### 3D / Shader Stack

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| three | 0.183.2 | 3D engine | Latest stable. Required peer dep for R3F. SDF lens blur shader runs on Three.js ShaderMaterial. | HIGH |
| @react-three/fiber | 9.5.0 | React renderer for Three.js | R3F v9 pairs with React 19. Declarative Three.js in JSX. `useFrame` for 60fps shader uniform updates (cursor position, time). Canvas as client component. | HIGH |
| @react-three/drei | 10.7.7 | R3F helpers | `shaderMaterial` helper for typed uniforms with auto setter/getters. Also provides `OrthographicCamera`, `Plane` for fullscreen quad. | HIGH |
| raw-loader | latest | GLSL string import | Turbopack supports raw-loader via `turbopack.rules` in next.config.ts. Imports .glsl/.vert/.frag as strings. | HIGH |

**GLSL Loading Config (next.config.ts):**
```typescript
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
      '*.vert': { loaders: ['raw-loader'], as: '*.js' },
      '*.frag': { loaders: ['raw-loader'], as: '*.js' },
    },
  },
};
```

**TypeScript declaration (src/types/glsl.d.ts):**
```typescript
declare module '*.glsl' { const value: string; export default value; }
declare module '*.vert' { const value: string; export default value; }
declare module '*.frag' { const value: string; export default value; }
```

### AI Chat Stack

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ai | 6.0.142 | AI SDK core | Latest stable (v6). Provides `streamText` for API route and `useChat` hook for client. Single import handles streaming, message state, form submission. AI SDK 6 is current -- v5 is already outdated. | HIGH |
| @ai-sdk/openai-compatible | 2.0.37 | Vercel AI Gateway provider | Connects to Vercel AI Gateway using OpenAI-compatible protocol. Provider flexibility (swap Anthropic/OpenAI/etc via Gateway dashboard). PROJECT.md specifies this over direct Anthropic SDK. | HIGH |

**Pattern:**
```typescript
// src/app/api/chat/route.ts (Server)
import { streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const gateway = createOpenAICompatible({
  name: 'vercel-ai-gateway',
  baseURL: process.env.AI_GATEWAY_URL!,
  apiKey: process.env.AI_GATEWAY_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4-20250514'),
    system: `You are a Perth business automations specialist...`,
    messages,
  });
  return result.toUIMessageStreamResponse();
}

// Client component
import { useChat } from 'ai/react';
const { messages, input, handleInputChange, handleSubmit } = useChat();
```

### UI Components (Already Installed)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| shadcn/ui (radix-ui) | 1.4.2 | UI primitives | Already installed. Input, Card, Button for chat + lead form. Copy-paste components, full control. | HIGH |
| class-variance-authority | ^0.7.1 | Variant styling | Already installed. Component variant definitions for shadcn. | HIGH |
| clsx + tailwind-merge | latest | Class merging | Already installed. Conditional class composition. | HIGH |
| lucide-react | ^0.468.0 | Icons | Already installed. Send icon for chat, loading spinner, etc. | HIGH |

### Form / Lead Capture

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Web3Forms | API (no npm) | Lead submission | Client-side POST to `https://api.web3forms.com/submit`. No backend needed, free tier = 250 submissions/month. PROJECT.md specifies this. Simple fetch POST with access_key. | HIGH |
| react-hook-form | ^7.54.2 | Form state | Already installed. Validation + submission handling for lead capture card. | HIGH |
| zod | ^4.3.6 | Schema validation | Already installed. Validate name/email/phone before submission. | HIGH |

### Typography

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| next/font | (built-in) | Font loading | Zero-layout-shift Google Fonts loading. DM Sans (body) + JetBrains Mono (mono/utility) per brand spec. | HIGH |

### Animation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| CSS transitions/animations | native | UI transitions | Chat panel slide-in, lead card appearance, cursor glow. No need for framer-motion on a single-page landing -- CSS handles this with less bundle weight. | MEDIUM |

**Rationale for no framer-motion:** The project has exactly three transitions: (1) chat panel activation, (2) lead card slide-in, (3) cursor glow. All are achievable with CSS `transition` + `transform` + conditional class toggling. Adding framer-motion (~30kb) for three transitions is unjustified on a performance-critical landing page targeting Lighthouse 90+.

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| framer-motion | Overkill. Three CSS transitions don't justify 30kb. Revisit only if v2 demos need physics-based animation. |
| vanilla Three.js (no R3F) | Imperative Three.js in React = lifecycle bugs, no hot reload, manual cleanup. R3F handles all of this declaratively. |
| react-three/postprocessing | No post-processing needed. Shader is the background, not a scene with effects. Noise/vignette go in the fragment shader itself. |
| Direct Anthropic SDK (@anthropic-ai/sdk) | PROJECT.md specifies Vercel AI Gateway for rate limiting, analytics, provider flexibility. Direct SDK bypasses these. |
| Resend / SendGrid | Over-engineered for lead capture. Web3Forms is client-side, no API route needed for form submission. |
| vite-plugin-glsl | Turbopack, not Vite. raw-loader via turbopack.rules is the correct approach. |
| glslify | Adds import/require system to GLSL. Unnecessary complexity for a single shader file. Inline everything. |
| leva | Debug UI for shader uniforms. Useful in dev but don't ship it -- use `useControls` behind a dev-only flag if needed during shader tuning. |
| WebGPU / TSL | Future-looking but unnecessary. WebGL2 via Three.js ShaderMaterial is the proven path for GLSL shaders. WebGPU requires TSL rewrite of all GLSL code. The codrops reference shader is GLSL. |
| Socket.io / WebSockets | AI SDK uses Server-Sent Events (SSE) for streaming. Built-in, no extra infrastructure. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| 3D integration | @react-three/fiber | vanilla Three.js | Lifecycle management nightmare in React. R3F is the standard. |
| GLSL loading | raw-loader + turbopack.rules | vite-plugin-glsl | Wrong bundler. Turbopack is default in Next.js 16. |
| AI SDK | ai v6 + @ai-sdk/openai-compatible | ai v5 | v5 is outdated. v6 has codemod migration path and is current stable. |
| Chat streaming | AI SDK useChat + streamText | Custom SSE implementation | useChat handles message state, streaming, error handling, loading state -- all in one hook. |
| Form backend | Web3Forms | Formspree, FormBold | Web3Forms is free (250/mo), simpler API, already decided in PROJECT.md. |
| Animation | CSS transitions | framer-motion | Bundle size vs. three simple transitions. CSS wins. |
| Shader approach | drei shaderMaterial | Raw THREE.ShaderMaterial | drei shaderMaterial adds typed uniforms, auto HMR via .key prop, declarative JSX usage. Less boilerplate. |

## Installation

```bash
# 3D / Shader stack
npm install three @react-three/fiber @react-three/drei

# AI chat
npm install ai @ai-sdk/openai-compatible

# GLSL loading (dev dependency for Turbopack)
npm install -D raw-loader

# Types
npm install -D @types/three
```

**Already installed (no action needed):**
- next, react, react-dom, typescript, tailwindcss
- radix-ui, class-variance-authority, clsx, tailwind-merge, lucide-react
- react-hook-form, zod

## Version Compatibility Matrix

| Package | Version | React 19 | Next.js 16 | Notes |
|---------|---------|----------|------------|-------|
| @react-three/fiber | 9.5.0 | Yes (v9 = React 19) | Yes (client component) | v8 is NOT compatible with React 19 |
| @react-three/drei | 10.7.7 | Yes | Yes | Must match R3F v9 |
| three | 0.183.2 | N/A | N/A | Peer dep of R3F |
| ai | 6.0.142 | Yes | Yes (App Router) | v6 is current. v5 works but outdated. |
| @ai-sdk/openai-compatible | 2.0.37 | N/A | Yes | Provider package for AI Gateway |

## Sources

- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) -- v9.5.0 confirmed
- [@react-three/drei shaderMaterial docs](https://drei.docs.pmnd.rs/shaders/shader-material)
- [R3F installation docs](https://r3f.docs.pmnd.rs/getting-started/installation) -- React 19 compatibility confirmed
- [AI SDK getting started (Next.js App Router)](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [AI SDK 6 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0)
- [Vercel AI Gateway OpenAI compat](https://vercel.com/docs/ai-gateway/openai-compat/chat-completions)
- [Next.js Turbopack config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) -- raw-loader rules
- [Next.js 16.2 Turbopack per-import loaders](https://nextjs.org/blog/next-16-2-turbopack)
- [Codrops shader reveal with R3F + GLSL](https://tympanus.net/codrops/2024/12/02/how-to-code-a-shader-based-reveal-effect-with-react-three-fiber-glsl/)
- [Maxime Heckel shaders with R3F](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
- [Web3Forms](https://web3forms.com/) -- client-side form API
