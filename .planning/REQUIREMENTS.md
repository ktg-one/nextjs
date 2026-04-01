# Requirements: Good'ai

**Defined:** 2026-04-01
**Core Value:** Convert visitors into warm leads through AI-powered consultative conversation

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Next.js config supports .glsl file imports (Turbopack raw type + webpack raw-loader)
- [ ] **FOUND-02**: Design tokens (Perth Disruptor palette) mapped to Tailwind CSS v4 theme + CSS custom properties
- [ ] **FOUND-03**: DM Sans + JetBrains Mono loaded via next/font with correct weights
- [ ] **FOUND-04**: TypeScript declarations for .glsl/.frag/.vert module imports

### Shader Background

- [ ] **SHDR-01**: SDF lens blur shader renders full-viewport at 60fps (Three.js + OrthographicCamera + PlaneGeometry)
- [ ] **SHDR-02**: Shader responds to cursor position with damped mouse tracking (THREE.MathUtils.damp)
- [ ] **SHDR-03**: Shader color output is copper-tinted (#D86A3D) not monochrome white
- [ ] **SHDR-04**: Shader component uses next/dynamic with ssr: false (no SSR hydration errors)
- [ ] **SHDR-05**: Shader handles resize correctly (camera bounds, quad scale, resolution uniform)
- [ ] **SHDR-06**: Shader pixel ratio capped at 2 for performance, further reduced on mobile
- [ ] **SHDR-07**: Three.js resources disposed on component unmount (no memory leaks)
- [ ] **SHDR-08**: Graceful fallback if WebGL unavailable (dark gradient + noise overlay)

### Landing UI

- [ ] **LAND-01**: Wordmark "Good'ai" centered with copper apostrophe at 0.7 opacity
- [ ] **LAND-02**: Subtitle "business automations, sorted" in JetBrains Mono below wordmark
- [ ] **LAND-03**: Input field with placeholder "Tell us your problem." using shadcn Input
- [ ] **LAND-04**: Submit button (arrow icon) inside input field, right-aligned
- [ ] **LAND-05**: Hint text "We'll figure out how to fix it." below input
- [ ] **LAND-06**: Perth badge "PERTH / WA" fixed bottom center
- [ ] **LAND-07**: Staggered fadeUp animations on load (0.3s, 0.55s, 0.7s, 1.2s delays)
- [ ] **LAND-08**: Noise texture overlay (SVG feTurbulence, 0.028 opacity)
- [ ] **LAND-09**: Vignette overlay (radial gradient, transparent center to 0.4 black edge)

### Custom Cursor

- [ ] **CURS-01**: Custom cursor div follows mouse with 0.12 lerp factor via requestAnimationFrame
- [ ] **CURS-02**: Default state: 20px circle, 1.5px copper border at 0.35 opacity, mix-blend-mode difference
- [ ] **CURS-03**: Hover state: expands to 48px on interactive elements (inputs, buttons, links)
- [ ] **CURS-04**: Ambient glow: 700px radial gradient follows cursor with 0.9s cubic-bezier transition
- [ ] **CURS-05**: Custom cursor completely disabled on touch devices (ontouchstart detection)
- [ ] **CURS-06**: Hover listeners re-registered when new DOM elements injected (chat messages, lead card)

### Chat Interface

- [ ] **CHAT-01**: Container transitions from centered landing to top-aligned conversation mode on first submit
- [ ] **CHAT-02**: Wordmark shrinks from 34px to 20px in conversation mode
- [ ] **CHAT-03**: Subtitle and Perth badge hide in conversation mode
- [ ] **CHAT-04**: Fixed bottom input bar appears in conversation mode
- [ ] **CHAT-05**: User messages: right-aligned, copper-tinted background, rounded corners (bottom-right sharp)
- [ ] **CHAT-06**: AI messages: left-aligned, surface background, "GOOD'AI" label in accent-soft
- [ ] **CHAT-07**: Typing indicator: three dots with staggered bounce animation
- [ ] **CHAT-08**: Input disabled + dimmed while waiting for AI response
- [ ] **CHAT-09**: Conversation auto-scrolls to bottom on new messages
- [ ] **CHAT-10**: Chat history stored client-side in array (not persisted)

### AI Backend

- [ ] **AIBE-01**: Next.js Route Handler at /api/chat accepts POST with messages array
- [ ] **AIBE-02**: Routes through Vercel AI Gateway via @ai-sdk/openai-compatible
- [ ] **AIBE-03**: Uses anthropic/claude-sonnet-4-20250514 model with max_tokens 300
- [ ] **AIBE-04**: System prompt enforces Perth voice: casual, warm, direct, no "AI" jargon
- [ ] **AIBE-05**: System prompt enforces no bullet points, under 3 sentences, no corporate speak
- [ ] **AIBE-06**: Maps frontend 'ai' role to 'assistant' role for API compatibility
- [ ] **AIBE-07**: Rate limit (429) returns friendly message, not error trace
- [ ] **AIBE-08**: Server errors (500) return friendly message, not stack trace

### Lead Capture

- [ ] **LEAD-01**: Lead capture card appears 600ms after first AI response in conversation flow
- [ ] **LEAD-02**: Card uses shadcn Card component with accent border, surface-raised background
- [ ] **LEAD-03**: Heading "Want us to look into this?" + subtext about no obligation
- [ ] **LEAD-04**: Form fields: Name (required), Business (optional), Phone (required), Email (optional)
- [ ] **LEAD-05**: Submit button "Get a callback" using shadcn Button with accent background
- [ ] **LEAD-06**: Submits to Web3Forms API with contact details + conversation transcript
- [ ] **LEAD-07**: Success state: checkmark + "Nice one. We'll be in touch within 24 hours."
- [ ] **LEAD-08**: Card only shows once per session (leadCaptured flag)
- [ ] **LEAD-09**: User can continue chatting after form submission

### Responsive

- [ ] **RESP-01**: Mobile breakpoint at 640px with adjusted typography and padding
- [ ] **RESP-02**: Custom cursor and ambient glow completely hidden on touch devices
- [ ] **RESP-03**: Lead card rows stack vertically on mobile
- [ ] **RESP-04**: Shader resolution reduced on mobile for performance
- [ ] **RESP-05**: Noise overlay opacity reduced to 0.02 on mobile

### Deployment

- [ ] **DEPL-01**: Deploys to Vercel on goodai.au domain
- [ ] **DEPL-02**: AI_GATEWAY_API_KEY set as server-side env var (never exposed to browser)
- [ ] **DEPL-03**: Page loads under 2 seconds on 4G connection
- [ ] **DEPL-04**: Zero console errors in production
- [ ] **DEPL-05**: Lighthouse performance score 90+

## v2 Requirements

### Voice Agent Demo

- **VDMO-01**: Interactive voice agent demo page at /demos/voice-agent
- **VDMO-02**: Text-to-speech integration for AI responses

### Automation Demo

- **ADMO-01**: Automation workflow visualization at /demos/automation
- **ADMO-02**: Interactive n8n workflow builder preview

### Enhanced Chat

- **ECHAT-01**: Quick-reply suggestion chips below input
- **ECHAT-02**: Streaming responses via Server-Sent Events
- **ECHAT-03**: Chat session persistence across page reloads

## Out of Scope

| Feature | Reason |
|---------|--------|
| React Three Fiber | Adds ~45KB overhead for a single shader quad — vanilla Three.js is correct |
| Separate Vite build | Next.js handles GLSL via raw loader config, no separate build needed |
| Database/persistence | Stateless by design — chat is client-side, leads go to Web3Forms |
| User authentication | No user accounts — this is a lead capture page |
| Real-time WebSocket chat | SSE streaming sufficient for v1, WebSocket is v2+ consideration |
| Mobile app | Web-only, responsive design handles mobile |
| OAuth/social login | Not applicable |
| Analytics dashboard | Vercel Analytics handles this natively |
| Campaign line "Good'AI mate" | Not displayed in v1 per brand audit |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| SHDR-01 | Phase 2 | Pending |
| SHDR-02 | Phase 2 | Pending |
| SHDR-03 | Phase 2 | Pending |
| SHDR-04 | Phase 2 | Pending |
| SHDR-05 | Phase 2 | Pending |
| SHDR-06 | Phase 2 | Pending |
| SHDR-07 | Phase 2 | Pending |
| SHDR-08 | Phase 2 | Pending |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-04 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| LAND-06 | Phase 2 | Pending |
| LAND-07 | Phase 2 | Pending |
| LAND-08 | Phase 2 | Pending |
| LAND-09 | Phase 2 | Pending |
| CURS-01 | Phase 2 | Pending |
| CURS-02 | Phase 2 | Pending |
| CURS-03 | Phase 2 | Pending |
| CURS-04 | Phase 2 | Pending |
| CURS-05 | Phase 2 | Pending |
| CURS-06 | Phase 2 | Pending |
| CHAT-01 | Phase 3 | Pending |
| CHAT-02 | Phase 3 | Pending |
| CHAT-03 | Phase 3 | Pending |
| CHAT-04 | Phase 3 | Pending |
| CHAT-05 | Phase 3 | Pending |
| CHAT-06 | Phase 3 | Pending |
| CHAT-07 | Phase 3 | Pending |
| CHAT-08 | Phase 3 | Pending |
| CHAT-09 | Phase 3 | Pending |
| CHAT-10 | Phase 3 | Pending |
| AIBE-01 | Phase 3 | Pending |
| AIBE-02 | Phase 3 | Pending |
| AIBE-03 | Phase 3 | Pending |
| AIBE-04 | Phase 3 | Pending |
| AIBE-05 | Phase 3 | Pending |
| AIBE-06 | Phase 3 | Pending |
| AIBE-07 | Phase 3 | Pending |
| AIBE-08 | Phase 3 | Pending |
| LEAD-01 | Phase 4 | Pending |
| LEAD-02 | Phase 4 | Pending |
| LEAD-03 | Phase 4 | Pending |
| LEAD-04 | Phase 4 | Pending |
| LEAD-05 | Phase 4 | Pending |
| LEAD-06 | Phase 4 | Pending |
| LEAD-07 | Phase 4 | Pending |
| LEAD-08 | Phase 4 | Pending |
| LEAD-09 | Phase 4 | Pending |
| RESP-01 | Phase 5 | Pending |
| RESP-02 | Phase 5 | Pending |
| RESP-03 | Phase 5 | Pending |
| RESP-04 | Phase 5 | Pending |
| RESP-05 | Phase 5 | Pending |
| DEPL-01 | Phase 5 | Pending |
| DEPL-02 | Phase 5 | Pending |
| DEPL-03 | Phase 5 | Pending |
| DEPL-04 | Phase 5 | Pending |
| DEPL-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 64 total
- Mapped to phases: 64
- Unmapped: 0

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after roadmap creation*
