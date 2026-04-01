# Roadmap: Good'ai

## Overview

Good'ai ships in five phases that deliver incrementally from config through to production. Phase 1 lays the foundation (GLSL imports, design tokens, fonts). Phase 2 builds the entire visual layer -- shader background, landing UI, and cursor effects -- in parallel streams. Phase 3 delivers the core product value: AI chat with Perth-voice persona. Phase 4 adds lead capture (the business outcome). Phase 5 hardens everything for mobile and production deployment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js config, design tokens, fonts, GLSL imports
- [ ] **Phase 2: Visual Layer** - SDF shader background, landing UI, custom cursor
- [ ] **Phase 3: Chat Core** - AI backend route, chat interface, landing-to-chat transition
- [ ] **Phase 4: Lead Capture** - Lead form card, Web3Forms submission, conversation transcript
- [ ] **Phase 5: Polish + Hardening** - Responsive layout, mobile optimizations, Vercel deployment

## Phase Details

### Phase 1: Foundation
**Goal**: Developer can build components against the correct palette, fonts, and GLSL pipeline
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. A `.glsl` file can be imported in a TypeScript component without build errors in both dev (Turbopack) and production (webpack)
  2. Perth Disruptor color tokens (#0C0C0C, #D86A3D, #D7D2CB, #EDE9E3) are available as Tailwind classes and CSS custom properties
  3. DM Sans and JetBrains Mono render on the page with zero layout shift
  4. TypeScript provides autocomplete for `.glsl`, `.frag`, `.vert` imports without type errors
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Visual Layer
**Goal**: Visitor sees a premium, cursor-reactive landing page with shader background, branded layout, and smooth animations
**Depends on**: Phase 1
**Requirements**: SHDR-01, SHDR-02, SHDR-03, SHDR-04, SHDR-05, SHDR-06, SHDR-07, SHDR-08, LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07, LAND-08, LAND-09, CURS-01, CURS-02, CURS-03, CURS-04, CURS-05, CURS-06
**Success Criteria** (what must be TRUE):
  1. Full-viewport copper-tinted SDF shader renders at 60fps and responds to cursor movement with damped tracking
  2. Landing page displays "Good'ai" wordmark, subtitle, input field with submit arrow, hint text, and Perth badge -- all with staggered fade-in animations
  3. Custom cursor follows mouse with smooth lerp, expands on hover over interactive elements, and is completely absent on touch devices
  4. Noise texture overlay and vignette are visible, adding visual depth without obscuring content
  5. If WebGL is unavailable, a dark gradient fallback renders instead of a broken canvas
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Chat Core
**Goal**: Visitor types a problem, gets a warm Perth-voice AI response, and can hold a natural conversation
**Depends on**: Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, AIBE-01, AIBE-02, AIBE-03, AIBE-04, AIBE-05, AIBE-06, AIBE-07, AIBE-08
**Success Criteria** (what must be TRUE):
  1. Submitting a message in the landing input transitions the page from centered landing mode to top-aligned conversation mode (wordmark shrinks, subtitle hides, input moves to bottom)
  2. AI responds in Perth voice -- casual, warm, under 3 sentences, no bullet points, never says "AI"
  3. User and AI messages are visually distinct (right-aligned copper vs left-aligned surface with "GOOD'AI" label)
  4. Typing indicator with bouncing dots appears while waiting for AI response, and input is disabled during that time
  5. Rate limit (429) and server errors (500) display friendly messages instead of error traces
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Lead Capture
**Goal**: Engaged visitor leaves their contact details without interrupting the conversation flow
**Depends on**: Phase 3
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, LEAD-08, LEAD-09
**Success Criteria** (what must be TRUE):
  1. Lead capture card slides into the conversation 600ms after the first AI response with "Want us to look into this?" heading
  2. Visitor can submit name and phone (required) with optional business and email, then sees "Nice one. We'll be in touch within 24 hours."
  3. Web3Forms receives the contact details plus the full conversation transcript
  4. Card only appears once per session -- dismissed or submitted, it does not return
  5. Visitor can continue chatting after submitting or ignoring the lead form
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Polish + Hardening
**Goal**: Site works flawlessly on mobile, loads fast on 4G, and deploys to production on goodai.au
**Depends on**: Phase 4
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05, DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05
**Success Criteria** (what must be TRUE):
  1. Below 640px, layout adjusts with appropriate typography, padding, stacked lead card fields, and reduced noise opacity
  2. Custom cursor and ambient glow are completely hidden on touch devices, shader pixel ratio is reduced for mobile performance
  3. Page loads under 2 seconds on a 4G connection with Lighthouse performance score 90+
  4. Site is live on goodai.au via Vercel with zero console errors in production
  5. AI_GATEWAY_API_KEY is server-side only and never exposed to the browser
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Visual Layer | 0/? | Not started | - |
| 3. Chat Core | 0/? | Not started | - |
| 4. Lead Capture | 0/? | Not started | - |
| 5. Polish + Hardening | 0/? | Not started | - |
