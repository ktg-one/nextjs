# Project Research Summary

**Project:** Good'ai — Business Automations Landing Page (goodai.au)
**Domain:** Premium single-page landing with AI chatbot and lead capture
**Researched:** 2026-04-01
**Confidence:** HIGH

## Executive Summary

Good'ai is a premium single-page landing site for a Perth-based SME business automations company. The page's job is simple: impress the visitor, start a conversation, capture a lead. The recommended architecture is a Server Component shell that lazy-loads three independent Client Component islands (shader background, cursor effects, chat/lead-capture) with an Edge API route for AI streaming. Research strongly supports vanilla Three.js over React Three Fiber for the fullscreen shader quad — R3F adds ~45KB overhead with zero benefit for a single-mesh scene.

The recommended stack is almost entirely pre-installed. The gaps are three packages: `three` for the shader, `ai` v6 + `@ai-sdk/openai-compatible` for AI Gateway, and `raw-loader` (dev dependency) for GLSL import via Turbopack. The AI chat powered by Vercel AI Gateway with a Perth-voice persona is the core product differentiator — the shader background is the visual differentiator. Both are high-effort but well-documented paths.

The primary risks are: Three.js SSR crashes if `ssr: false` is omitted from dynamic imports, GLSL loading misconfiguration between Turbopack (dev) and webpack (prod build), GPU memory leaks on component unmount in dev Strict Mode, and Vercel AI Gateway OIDC auth differences between local dev and production. All four are fully preventable with known patterns documented in PITFALLS.md. The shader is the highest-complexity item and has a safe fallback: a dark gradient with noise overlay still looks premium and can ship if the shader blocks progress.

---

## Key Findings

### Recommended Stack

| Library | Version | Rationale |
|---------|---------|-----------|
| Next.js | 16.2.1 | Already installed. App Router, Turbopack default, React 19 support. |
| React | 19.2.4 | Already installed. Required for AI SDK v6 and React 19 patterns. |
| TypeScript | ^5 | Already installed. Strict mode per project rules. |
| Tailwind CSS | v4 | Already installed. CSS-first config, design token mapping. |
| three | 0.183.2 | Vanilla Three.js for fullscreen SDF shader — lighter than R3F for single mesh. |
| ai | 6.0.142 | AI SDK v6 (current stable). streamText + useChat for streaming chat. |
| @ai-sdk/openai-compatible | 2.0.37 | Connects to Vercel AI Gateway using OpenAI-compatible protocol. |
| raw-loader | latest (dev) | Imports .glsl/.vert/.frag as strings via Turbopack rules + webpack fallback. |
| shadcn/ui (radix-ui) | 1.4.2 | Already installed. Lead capture form primitives. |
| react-hook-form | ^7.54.2 | Already installed. Form state and validation. |
| zod | ^4.3.6 | Already installed. Schema validation before Web3Forms submission. |
| next/font | built-in | DM Sans + JetBrains Mono, zero-CLS loading. |
| Web3Forms | API only | Client-side lead submission with transcript. 250/mo free. No npm package. |

**Do not add:** framer-motion (CSS handles 3 transitions), R3F (overkill for single mesh), direct Anthropic SDK (bypasses AI Gateway), socket.io (AI SDK uses SSE natively), leva (debug only).

### Expected Features

**Must have (table stakes):**
- Clear value proposition headline — Perth SME owners decide in 3 seconds
- Single focused CTA — the chat input IS the CTA, no competing buttons
- Mobile responsive at 640px — 60%+ Australian SME traffic is mobile
- Page load under 2s on 4G — Lighthouse 90+ target
- Typing indicator — users assume site is broken without it
- Message bubbles with sender distinction — standard chat UX since 2015
- Auto-scroll to newest message with pause-on-manual-scroll
- Input pinned to bottom of viewport (not obscured by mobile keyboard)
- Perth locality signal — "Perth-based" badge, SME owners buy from locals
- Contact fallback (phone/email) for non-chat visitors

**Should have (differentiators):**
- SDF lens-blur shader background — highest wow factor, positions company as technically capable
- Perth-voice AI persona ("reckon", "no worries", no corporate speak) — the brand differentiator
- Conversational lead capture (not a form) — slides in after first AI response, never blocks chat
- Custom cursor with lerp follow — premium craft signal
- Quick-reply suggestion chips — reduces friction for visitors who don't know what to type
- Ambient glow + noise texture + vignette — low-cost visual depth layer
- Smooth landing-to-chat transition — craft signal
- Conversation transcript in lead email — sales team sees context before calling

**Defer (v2+):**
- Testimonials/social proof — need real customers first
- Voice agent demo — out of scope per PROJECT.md
- SEO/blog content — validate PMF before content marketing investment
- Analytics beyond Web3Forms conversion tracking

### Architecture Approach

Single-page app with a Server Component shell (`page.tsx`) that lazy-loads `ShaderBackground` and `CursorEffects` via `next/dynamic` with `ssr: false`. All chat and lead capture state lives in `HeroSection` (Client Component). The `useChat` hook lives in `ChatInterface` and calls back to `HeroSection` via an `onFirstResponse` prop to trigger lead card visibility and transcript pass-through. No external state library needed — four `useState` values cover the entire app. Both shader and cursor read `pointermove` directly from `window`, avoiding any shared state coupling.

**Major components:**
1. `ShaderBackground` — vanilla Three.js canvas, SDF GLSL shader, cursor-reactive uniforms, fixed z-index -10
2. `CursorEffects` — custom cursor div with lerp, ambient glow gradient, noise overlay, disabled on touch devices
3. `HeroSection` — landing/chat state machine, parent of ChatInterface and LeadCaptureCard, owns phase/showLeadCapture/transcript state
4. `ChatInterface` — `useChat` hook, message list, typing indicator, auto-scroll, bottom input
5. `LeadCaptureCard` — shadcn form, Web3Forms POST with transcript payload, non-blocking position alongside chat
6. `/api/chat/route.ts` — Edge runtime, `streamText` via AI Gateway, Perth-voice system prompt

### Critical Pitfalls

1. **Three.js SSR crash** — Always `next/dynamic({ ssr: false })` for ShaderBackground and CursorEffects. Never import `three` transitively from a server-evaluated module. Provide a fallback div matching Deep Tech Onyx background to prevent layout shift. Phase 1.

2. **GLSL import fails with Turbopack** — Use `turbopack.rules` with `type: 'raw'` for dev. Add webpack `raw-loader` config separately for production builds (Turbopack doesn't run on `next build`). Add `src/types/glsl.d.ts`. Phase 1, blocks all shader work.

3. **Three.js GPU memory leak** — In `useEffect` cleanup: traverse scene, dispose all geometries and materials, call `renderer.dispose()` + `renderer.forceContextLoss()`, cancel RAF loop. React 19 Strict Mode double-invokes effects in dev — leaks double without this. Phase 1.

4. **AI Gateway OIDC auth mismatch** — Use `vercel dev` (not `next dev`) for local AI testing. OIDC tokens auto-inject only in Vercel deployments. Never commit `AI_GATEWAY_API_KEY`. Phase 3.

5. **Edge Function timeout kills streaming** — Set `export const maxDuration = 60` on the chat route. Keep Perth-voice system prompt under 500 tokens. Add "Still thinking..." client-side fallback after 5s. Phase 3.

---

## Implications for Roadmap

### Phase 1: Foundation + Config
**Rationale:** Unblocks everything else. GLSL loading config must exist before shader work starts. Design tokens and font loading affect every subsequent component.
**Delivers:** Working Next.js 16 project with GLSL imports (Turbopack + webpack), TypeScript declarations, design tokens, fonts, base layout.
**Addresses:** Perth Disruptor palette setup, DM Sans + JetBrains Mono via next/font
**Avoids:** GLSL import failures (Pitfall 2), font layout shift (Pitfall 11)

### Phase 2: Visual Layer
**Rationale:** ShaderBackground and CursorEffects have zero data dependencies. Build and visually verify in isolation before any chat logic exists. Getting the visual layer right means the rest of the UI is built against the real background.
**Delivers:** Fullscreen SDF shader at 60fps, custom cursor with lerp, ambient glow, noise overlay, vignette. Mobile fallback to static gradient.
**Uses:** Three.js 0.183.2 (vanilla), raw-loader, Turbopack rules from Phase 1
**Implements:** ShaderBackground + CursorEffects components
**Avoids:** SSR crash (Pitfall 1), memory leak (Pitfall 3), touch device ghost cursor (Pitfall 12), RAF loop conflict (Pitfall 10), mobile thermal throttling (Pitfall 7)

### Phase 3: Chat Core
**Rationale:** The AI chat is the core product value. The API route must exist before the chat UI can be tested against real responses. HeroSection's landing-to-chat transition depends on ChatInterface existing.
**Delivers:** Working AI chat with Perth-voice persona, streaming responses, message bubbles, typing indicator, auto-scroll, quick-reply chips, landing-to-chat transition.
**Uses:** ai v6, @ai-sdk/openai-compatible, Vercel AI Gateway (Edge runtime)
**Implements:** /api/chat/route.ts + ChatInterface + HeroSection state machine
**Avoids:** AI Gateway OIDC auth mismatch (Pitfall 4), Edge timeout (Pitfall 5)

### Phase 4: Lead Capture
**Rationale:** Depends on chat existing — the lead card triggers on first AI response and includes the conversation transcript. Web3Forms submission is the business outcome of the entire build.
**Delivers:** LeadCaptureCard alongside chat (never blocking), name/phone form, Web3Forms POST with transcript, thank-you state.
**Uses:** react-hook-form, zod, Web3Forms API, shadcn Card
**Implements:** LeadCaptureCard + transcript serialization + HeroSection showLeadCapture state
**Avoids:** Lead capture interrupts chat flow (Pitfall 8), Web3Forms silent failure (Pitfall 9), cursor hover miss on dynamic elements (Pitfall 6)

### Phase 5: Polish + Hardening
**Rationale:** Polish can only be properly assessed once the full flow works end-to-end. Responsive, mobile, and transition refinements depend on real components being in place.
**Delivers:** Responsive 640px breakpoint, touch device detection, mobile performance optimizations (pixel ratio cap, shader complexity reduction), error states, slow network handling.
**Avoids:** Mobile thermal throttling (Pitfall 7), custom cursor on touch (Pitfall 12)

### Phase Ordering Rationale

- Phase 1 is a hard prerequisite — GLSL loading failure blocks Phase 2 entirely, and missing design tokens means every component is built to the wrong palette.
- Phase 2 is ordered before Phase 3 because visual components are data-independent and provide the real rendering context for building chat UI on top of.
- Phase 3 must precede Phase 4 because lead capture triggers on first AI response and includes chat transcript — both require the chat to exist.
- Phase 5 is always last because polish requires the complete flow to evaluate correctly.
- The shader (Phase 2) is the highest-risk item. If it falls behind, Phases 3-4 can proceed in parallel and the shader can drop in later — the dark gradient fallback is sufficient to ship.

### Research Flags

Phases needing careful implementation (patterns documented, no additional research needed):
- **Phase 2 (Shader):** High implementation complexity. Follow ARCHITECTURE.md's vanilla Three.js pattern exactly. GLSL from Codrops SDF lens-blur reference. Do not invent the shader from scratch.
- **Phase 3 (AI persona):** Perth-voice prompt requires iteration. Build the API route first with a placeholder prompt, then tune persona as a sub-task. Use `vercel dev` for local testing.

Phases with standard, low-risk patterns (skip deep research):
- **Phase 1 (Foundation):** Official Next.js docs cover everything.
- **Phase 4 (Lead Capture):** Standard form + fetch pattern. Web3Forms API is trivial.
- **Phase 5 (Polish):** CSS breakpoints and touch detection are standard React patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via official package pages and docs. Compatibility matrix confirmed (AI SDK v6 = current stable). |
| Features | MEDIUM-HIGH | Table stakes grounded in conversion research and standard chat UX. Perth-voice persona effectiveness requires real-world testing. |
| Architecture | HIGH | Official Next.js App Router docs, AI SDK docs, and Vercel AI Gateway docs confirmed. Vanilla Three.js over R3F is well-reasoned. |
| Pitfalls | HIGH (critical) / MEDIUM (moderate) | Critical pitfalls verified via official sources. Moderate pitfalls (mobile thermal, lead card UX) are MEDIUM — community consensus, real-world testing will refine. |

**Overall confidence:** HIGH

### Gaps to Address

- **AI SDK import path:** STACK.md references `@ai-sdk/openai-compatible` as a separate package. ARCHITECTURE.md notes the AI Gateway provider may be built into `ai` directly in v6 with no separate package needed. Verify the correct import pattern before writing the API route — check official AI SDK v6 docs.
- **Perth-voice persona quality:** Cannot be evaluated without real users. Build a feedback loop from first 10 leads to inform prompt iteration.
- **Shader visual outcome:** The GLSL shader is adapted from a reference implementation. Validate against the Perth Disruptor palette during Phase 2. Keep dark gradient fallback ready.
- **Web3Forms domain restriction:** Test the access key on the actual Vercel preview URL before considering lead capture complete — keys can be domain-restricted.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16 official docs — turbopack config, App Router, dynamic imports, Turbopack rules
- AI SDK v6 docs (ai-sdk.dev) — useChat, streamText, AI Gateway provider, migration guide
- Vercel AI Gateway docs (vercel.com/docs/ai-gateway) — OIDC auth, OpenAI compat
- @react-three/fiber npm + docs — v9/React 19 compatibility confirmed

### Secondary (MEDIUM confidence)
- Codrops SDF lens-blur shader tutorial (tympanus.net, Dec 2024) — GLSL reference implementation
- Maxime Heckel — shaders with React Three Fiber — shader uniform patterns
- Three.js community discourse — memory leak dispose patterns
- 14islands — performant custom cursor implementation
- BricxLabs — 16 chat UI design patterns 2025
- Loopspeed/Pragmattic — Next.js GLSL shader setup (pre-Turbopack, adapted)

### Tertiary (LOW confidence)
- LeadsHook — lead capture form best practices (general advice, adapted to Perth SME context)
- Unbounce — landing page best practices (single CTA, load speed benchmarks)
- Moburst — landing page design trends 2026
- Shopify AU — high-converting landing pages for Australian SMEs

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
