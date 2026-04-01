# Domain Pitfalls

**Domain:** Next.js 16 landing page with Three.js SDF shader, AI chatbot, custom cursor
**Project:** Good'ai (goodai.au)
**Researched:** 2026-04-01

## Critical Pitfalls

Mistakes that cause rewrites, broken deploys, or unusable product.

### Pitfall 1: Three.js SSR Crash and Hydration Mismatch

**What goes wrong:** Three.js requires `window`, `document`, `WebGLRenderingContext` -- none of which exist during SSR. Importing Three.js at the top level of a module that runs on the server causes an immediate crash. Even if you guard with `typeof window !== 'undefined'`, React will produce a hydration mismatch because the server renders nothing while the client renders a canvas.

**Why it happens:** Next.js App Router renders Server Components by default. Any component importing `three` without explicit client-only boundaries gets server-executed.

**Consequences:** Build failures on `next build`, hydration warnings flooding console, flash of empty content before canvas mounts.

**Prevention:**
1. Create the shader component as a dedicated `'use client'` component in its own file.
2. Import it into the page layout using `next/dynamic` with `ssr: false`:
   ```typescript
   const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), {
     ssr: false,
     loading: () => <div className="fixed inset-0 bg-[#0C0C0C]" />,
   })
   ```
3. Never import `three` in any file that could be evaluated server-side, even transitively.
4. The `loading` fallback must match the visual baseline (Deep Tech Onyx background) to prevent layout shift.

**Detection:** `ReferenceError: window is not defined` during build. Hydration mismatch warnings in dev console. Blank flash on page load.

**Phase:** Phase 1 (Shader Background) -- must be correct from the first implementation.

---

### Pitfall 2: GLSL File Import Fails with Turbopack

**What goes wrong:** Next.js 16 uses Turbopack by default for `next dev`. The old webpack `raw-loader` config syntax (`module.rules`) does not apply to Turbopack. GLSL files either fail to import (module not found) or import as an object/module instead of a string.

**Why it happens:** Turbopack has its own loader configuration under `turbopack.rules` in `next.config.ts`. The previous `experimental.turbo` key was removed in Next.js 16. Many tutorials and Stack Overflow answers reference the webpack config which is ignored by Turbopack.

**Consequences:** Shader compilation fails at runtime. Vertex/fragment shader source is `[object Module]` instead of GLSL string. Dev works but build breaks (or vice versa) if webpack and Turbopack configs diverge.

**Prevention:** Use the Turbopack-native `raw` module type instead of installing `raw-loader`:
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.glsl': { type: 'raw' },
      '*.vert': { type: 'raw' },
      '*.frag': { type: 'raw' },
    },
  },
  // Also configure webpack for production build if not using Turbopack for build
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      use: 'raw-loader',
    });
    return config;
  },
};

export default nextConfig;
```
Also add TypeScript declarations:
```typescript
// src/types/shaders.d.ts
declare module '*.glsl' { const value: string; export default value; }
declare module '*.vert' { const value: string; export default value; }
declare module '*.frag' { const value: string; export default value; }
```

**Important:** Turbopack's `type: 'raw'` (added in 16.2.0) returns the file contents as a string natively -- no loader package needed. But `next build` still uses webpack by default unless you opt into Turbopack builds, so you need BOTH configs. Alternatively, use inline import attributes per-file: `import shader from './shader.glsl' with { turbopackModuleType: 'raw' }`.

**Detection:** `THREE.WebGLShader: gl.getShaderInfoLog()` errors at runtime. Shader source logged as `[object Object]`. Build succeeds but canvas is black.

**Phase:** Phase 1 (Shader Background) -- blocks all shader work.

---

### Pitfall 3: Three.js Memory Leak on Component Unmount

**What goes wrong:** Three.js WebGL context, geometries, materials, textures, and render targets are GPU resources that are NOT garbage collected by JavaScript. If the component unmounts (e.g., route navigation in future versions, React strict mode double-mount in dev), these resources leak. After several mounts/unmounts, the browser runs out of WebGL contexts (hard limit of ~16 per page) and rendering fails silently.

**Why it happens:** React's component lifecycle doesn't know about GPU resources. `useEffect` cleanup runs, but developers forget to dispose Three.js objects explicitly. React 19 Strict Mode double-invokes effects in dev, doubling the leak rate.

**Consequences:** Browser tab crashes after repeated dev hot-reloads. "Too many active WebGL contexts" warning. Gradual FPS degradation. Mobile Safari is especially aggressive about killing WebGL contexts.

**Prevention:**
```typescript
useEffect(() => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
  const scene = new THREE.Scene();
  // ... setup

  return () => {
    // Dispose ALL GPU resources
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    renderer.dispose();
    renderer.forceContextLoss();
  };
}, []);
```

Cancel any `requestAnimationFrame` loop in the cleanup function. Store the RAF ID and call `cancelAnimationFrame(rafId)`.

**Detection:** Chrome DevTools > Performance Monitor > GPU memory rising over time. "WARNING: Too many active WebGL contexts" in console.

**Phase:** Phase 1 (Shader Background) -- must be built into the initial implementation, not retrofitted.

---

### Pitfall 4: Vercel AI Gateway OIDC Auth Fails in Local Dev

**What goes wrong:** Vercel AI Gateway uses OIDC tokens for authentication when deployed to Vercel. Locally, these tokens don't exist. Developers set up the gateway, it works in production, but local dev returns 401/403 errors. Alternatively, they set an API key that works locally but then the OIDC path is never tested before deploy.

**Why it happens:** OIDC tokens are automatically injected only in Vercel deployments. For local dev, you must either run `vercel dev` (which manages tokens automatically) or `vercel env pull` (tokens expire after 12 hours). If any API key is present in env vars -- even an invalid one -- it takes precedence over OIDC, masking the auth flow entirely.

**Consequences:** Chat works locally but breaks in production (or vice versa). Silent auth failures that surface only after deploy. Expired tokens causing intermittent failures.

**Prevention:**
1. Use `vercel dev` for local development instead of `next dev` when testing AI features.
2. Set `AI_GATEWAY_API_KEY` only for local dev, use OIDC for production.
3. Test the deployed preview URL (Vercel preview deployments) before merging.
4. Do NOT commit API keys to `.env.local` -- use `.env.example` with placeholder values.

**Detection:** 401/403 from AI Gateway endpoint. Chat input sends but no response streams back. Network tab shows failed POST to `ai-gateway.vercel.sh`.

**Phase:** Phase 2 (AI Chat) -- first point where AI Gateway is integrated.

---

### Pitfall 5: Edge Function Timeout Kills AI Streaming Response

**What goes wrong:** Vercel Edge Functions have a strict timeout on time-to-first-byte (TTFB). If the AI model takes too long to start generating (e.g., Anthropic thinking time, cold start, or complex system prompt processing), the Edge Function is killed before streaming begins. The user sees the chat submit, a loading state, then... nothing.

**Why it happens:** Vercel Pro plan defaults to 15s TTFB timeout (configurable up to 300s). Anthropic Claude models with long system prompts or complex reasoning can take 5-10s to first token. Under load, this compounds. Free/Hobby tier has even stricter limits.

**Consequences:** Intermittent chat failures. Works in dev (no timeout), fails in production. Users think the site is broken.

**Prevention:**
1. Configure `maxDuration` in the API route:
   ```typescript
   // src/app/api/chat/route.ts
   export const maxDuration = 60; // seconds
   ```
2. Use Node.js runtime instead of Edge if streaming duration is a concern:
   ```typescript
   export const runtime = 'nodejs'; // not 'edge'
   ```
3. Keep system prompts concise. The Perth-voice persona prompt should be tight -- under 500 tokens.
4. Add client-side timeout handling with a user-facing message ("Still thinking...") after 5s.

**Detection:** Responses work locally but timeout in production. Vercel function logs show `FUNCTION_INVOCATION_TIMEOUT`. Intermittent failures under load.

**Phase:** Phase 2 (AI Chat) -- must be configured when creating the API route.

## Moderate Pitfalls

### Pitfall 6: Custom Cursor Breaks on Dynamically Injected Chat Elements

**What goes wrong:** The custom cursor relies on `mouseover`/`mouseenter` events on interactive elements to trigger hover expansion. Chat messages and the lead capture card are injected into the DOM dynamically after the cursor event listeners are set up. New elements don't trigger hover states because event listeners are bound to elements that existed at mount time.

**Prevention:**
1. Use event delegation on a parent container instead of binding to individual elements:
   ```typescript
   containerRef.current.addEventListener('mouseover', (e) => {
     const target = (e.target as HTMLElement).closest('[data-cursor-hover]');
     if (target) setCursorExpanded(true);
   });
   ```
2. Use `data-cursor-hover` attributes on interactive elements rather than targeting specific class names or tag names.
3. Alternatively, implement the cursor hover detection in the RAF loop using `document.elementFromPoint(mouseX, mouseY)` -- eliminates the event binding problem entirely.

**Detection:** Cursor doesn't expand on chat buttons or lead capture inputs. Works on static elements (wordmark, initial input) but not dynamic ones.

**Phase:** Phase 1 (Custom Cursor) and Phase 2 (Chat UI) intersection. Design the cursor with delegation from the start.

---

### Pitfall 7: Shader Kills Mobile Performance (Battery + Thermal Throttling)

**What goes wrong:** An SDF lens blur shader running at 60fps on a full-viewport canvas is GPU-intensive. On mobile devices, this causes thermal throttling within 30-60 seconds, dropping to 15-20fps. Battery drain is severe. Older Android devices may not support required WebGL extensions. iOS Safari aggressively kills WebGL contexts under memory pressure.

**Prevention:**
1. Limit `renderer.setPixelRatio()` to `Math.min(window.devicePixelRatio, 2)` -- never use full DPR on mobile.
2. Reduce shader resolution on mobile: render to a smaller buffer and scale up with CSS.
3. Use `IntersectionObserver` to pause the render loop when the canvas is not visible (e.g., mobile keyboard pushes it off screen).
4. Detect mobile and reduce shader complexity: fewer SDF iterations, lower sample counts, simpler blur kernel.
5. Consider using `matchMedia('(prefers-reduced-motion: reduce)')` to show a static gradient fallback.
6. Add a static fallback image for devices where `WebGLRenderingContext` is not available.

**Detection:** FPS drops below 30 on mobile within 60 seconds. Phone gets warm. Battery percentage drops noticeably. Users report "slow" or "laggy" site.

**Phase:** Phase 1 (Shader Background) -- mobile detection and fallbacks must be baked in, not afterthoughts.

---

### Pitfall 8: Lead Capture Card Interrupts Chat Flow and Kills Conversion

**What goes wrong:** The lead capture card slides in after the first AI response. If it covers the chat, blocks the conversation, or feels like a popup/gate, the user bounces. The target audience (Perth SME owners, 50s-60s, suspicious of tech) will close the tab if it feels like a bait-and-switch.

**Prevention:**
1. Lead capture card must appear ALONGSIDE the chat, not blocking it. Position it as a side panel on desktop, bottom sheet on mobile -- never as a modal or overlay.
2. Chat must remain fully functional without providing contact details. The card is an invitation, not a gate.
3. Use soft language: "Want us to follow up?" not "Enter your details to continue."
4. Reduce fields to minimum: Name + Phone (not email -- Perth tradies prefer phone calls). Email optional.
5. Don't auto-focus the lead capture input -- let the user's attention stay on the chat.
6. Allow dismissal. If dismissed, show a subtle persistent CTA (small "Get in touch" link) rather than re-showing the card.

**Detection:** High bounce rate after first AI response. Users stop chatting after lead card appears. Low form completion rate despite chat engagement.

**Phase:** Phase 2 (Lead Capture) -- UX decisions must be made before implementation, not after.

---

### Pitfall 9: Web3Forms Submission Fails Silently

**What goes wrong:** Web3Forms is a third-party service. Client-side POST requests can fail due to CORS issues, rate limiting, invalid access keys, or network errors. Without error handling, the form appears to submit (button state changes) but no email arrives. The business loses leads without knowing.

**Prevention:**
1. Always check the Web3Forms response:
   ```typescript
   const res = await fetch('https://api.web3forms.com/submit', {
     method: 'POST',
     body: formData,
   });
   const data = await res.json();
   if (!data.success) {
     // Show error to user, log for monitoring
   }
   ```
2. Include the conversation transcript in the submission -- this is the primary value of the lead.
3. Add a fallback: if Web3Forms fails, store the lead data in `localStorage` and show "We'll retry" messaging.
4. Test the access key in production -- Web3Forms keys can be domain-restricted.
5. Add basic Sentry or Vercel Analytics error tracking for submission failures.

**Detection:** Form submits with no error but no email received. Test with an actual phone/email in production.

**Phase:** Phase 2 (Lead Capture) -- test the full submission flow early, not just the UI.

## Minor Pitfalls

### Pitfall 10: requestAnimationFrame Loop Conflict Between Cursor and Shader

**What goes wrong:** Both the custom cursor (lerp follow) and the Three.js shader (render loop) run their own `requestAnimationFrame` loops. Two competing RAF loops can cause frame scheduling conflicts, especially on lower-powered devices, leading to janky cursor movement or shader stuttering.

**Prevention:** Consolidate into a single RAF loop that drives both the cursor update and the Three.js render:
```typescript
function animate() {
  rafId = requestAnimationFrame(animate);
  updateCursorPosition(); // lerp toward target
  renderer.render(scene, camera);
}
```
Or, use Three.js `renderer.setAnimationLoop()` which manages RAF internally, and drive cursor updates from a `clock` event or the same loop.

**Detection:** Cursor movement feels "choppy" while shader runs smoothly, or vice versa. Two RAF loops visible in Performance DevTools timeline.

**Phase:** Phase 1 -- architectural decision when setting up both cursor and shader.

---

### Pitfall 11: Font Loading Causes Layout Shift

**What goes wrong:** DM Sans and JetBrains Mono loaded via `next/font` can cause a flash of unstyled text (FOUT) or layout shift if font metrics don't match the fallback. The wordmark "Good'ai" may jump when the web font loads.

**Prevention:**
1. Use `next/font/google` with `display: 'swap'` and explicit `adjustFontFallback` settings.
2. Preload the fonts used in the hero/wordmark.
3. Set explicit `font-size` and `line-height` on the wordmark container to prevent reflow.

**Detection:** Lighthouse CLS score > 0.1. Visible text jump on slow connections.

**Phase:** Phase 1 (Landing State) -- font configuration is foundational.

---

### Pitfall 12: Cursor Visible on Touch Devices Creates Ghost Element

**What goes wrong:** Custom cursor div renders on touch devices where there is no mouse. It either sits at (0,0) permanently or follows the first touch then sticks. Looks broken.

**Prevention:**
```typescript
// Detect touch device and disable custom cursor
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) return null; // Don't render cursor component
```
PROJECT.md already specifies "custom cursor disabled on touch devices" -- this must be enforced at the component level, not just via CSS `display: none`.

**Detection:** Ghost dot visible on mobile. Cursor element in DOM on tablet devices.

**Phase:** Phase 1 (Custom Cursor) -- guard clause at mount time.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Shader Background | SSR crash, GLSL import failure, memory leak | `dynamic()` with `ssr: false`, dual Turbopack/webpack config, explicit dispose in cleanup |
| Custom Cursor | Touch device ghost, RAF conflict, dynamic element hover miss | Touch detection guard, single RAF loop, event delegation |
| AI Chat Integration | OIDC auth mismatch, Edge timeout, system prompt too long | `vercel dev` for local, `maxDuration` config, tight persona prompt |
| Lead Capture | Interrupts chat flow, Web3Forms silent failure | Non-blocking card position, response validation, localStorage fallback |
| Mobile Performance | Thermal throttling, WebGL context loss, high DPR | Pixel ratio cap, reduced complexity path, static fallback |
| Typography | Layout shift from font loading | `next/font` with preload, explicit sizing on wordmark |

## Sources

- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error) -- HIGH confidence
- [Next.js Turbopack Configuration (v16.2.2)](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) -- HIGH confidence, verified via official docs
- [Vercel AI Gateway Provider Docs](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway) -- HIGH confidence
- [Three.js Forum: Memory Leak Discussions](https://discourse.threejs.org/t/dispose-things-correctly-in-three-js/6534) -- MEDIUM confidence
- [Building Efficient Three.js Scenes (Codrops, Feb 2025)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) -- MEDIUM confidence
- [100 Three.js Tips (Utsubo, 2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) -- MEDIUM confidence
- [Custom Cursor Performance (14islands)](https://medium.com/14islands/developing-a-performant-custom-cursor-89f1688a02eb) -- MEDIUM confidence
- [Lead Capture Form Best Practices (LeadsHook, 2026)](https://www.leadshook.com/blog/lead-capture-forms-best-practices/) -- LOW confidence, general advice adapted to this context
- [Next.js GLSL Shader Setup (Loopspeed/Pragmattic)](https://blog.pragmattic.dev/nextjs-setup-glsl-shaders) -- MEDIUM confidence, pre-Turbopack guidance adapted
