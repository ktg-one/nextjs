# Good'ai — Business Automations Platform

## What This Is

Good'ai (goodai.au) is a Perth-based business automations company targeting SMEs ($1M–$30M turnover). The site serves as both a lead generation tool and a product demo platform. v1 is a single hero page with an SDF lens blur shader background, AI chatbot intake assistant, and lead capture — designed to qualify leads through consultative conversation. Future versions add interactive demos for voice agents, automation workflows, and text-to-speech. Built with Next.js 16, shadcn/ui, and Tailwind CSS v4.

## Core Value

A business owner lands on the page, tells us their problem, gets a useful conversation with an AI that sounds like a switched-on Perth mate — and leaves their details so the team can follow up. If the chat doesn't convert visitors into warm leads, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] SDF lens blur shader background renders at 60fps with cursor-reactive interactivity (Three.js client component)
- [ ] Landing state: wordmark "Good'ai" + subtitle + shadcn Input "Tell us your problem." + Perth badge
- [ ] Chat interface activates on first message submission with smooth transition
- [ ] AI chatbot responds via Vercel AI Gateway using Perth-voice persona (no "AI" jargon)
- [ ] Lead capture card (shadcn Card + Input + Button) slides in after first AI response
- [ ] Lead data submitted via Web3Forms to owner's email with conversation transcript
- [ ] Custom cursor with smooth lerp follow and hover expansion on interactive elements
- [ ] Ambient glow radial gradient follows cursor
- [ ] Noise texture overlay + vignette for depth
- [ ] Responsive layout (640px breakpoint), custom cursor disabled on touch devices
- [ ] Perth Disruptor color palette: Deep Tech Onyx bg, Silicon Copper accent, Cottesloe Sand text
- [ ] Typography: DM Sans (body) + JetBrains Mono (mono/utility) via next/font
- [ ] Deploy to Vercel on goodai.au domain

### Out of Scope

- Voice agent demo — v2+ feature
- Automation workflow demo — v2+ feature
- Text-to-speech integration — v2+ feature
- Multi-page navigation — v1 is single page only
- User authentication — no user accounts needed
- Database — stateless, chat is client-side, leads go to Web3Forms
- Mobile app — web only

## Context

- **Pivot**: Company pivoted from AI voice agents to n8n automations. Perth customers reject "AI" as a word — position as "automations specialist"
- **Brand**: "Good'ai" with copper apostrophe — buries AI inside Australian phrase "good eye mate". Campaign line: "Good'AI mate" (not displayed in v1)
- **Wordmark rules**: Always "Good'ai" — never "GoodAI", "GOODAI", "Good AI", or "Good.ai"
- **Target audience**: Perth SME owners, often 50s-60s, practical, suspicious of tech hype. Tradies, professional services, small retail/hospitality
- **Inbox assets**: Complete landing page HTML, brand board, brand audit, UI spec, app spec, shader reference (codrops-sdf-lensblur), API routes (chat.js, lead.js)
- **Shader reference**: codrops-sdf-lensblur (MIT license) in inbox/HERO PAGE EFFECT/ — Three.js SDF shapes with cursor-driven edge parameter modulation
- **Existing Vercel project**: goodai_site (team: ktg88, project ID: prj_Bznq9r5slcMCAvtcj7AeUhAebr0n)
- **Design system**: Perth Disruptor palette — #0C0C0C bg, #D86A3D accent, #D7D2CB text, #EDE9E3 headings

## Constraints

- **Tech stack**: Next.js 16 (App Router, React 19), shadcn/ui components, Tailwind CSS v4
- **Shader integration**: Three.js GLSL shader as React client component (raw .glsl import via next.config.ts)
- **AI backend**: Vercel AI Gateway via @ai-sdk/openai-compatible (not direct Anthropic SDK)
- **Lead capture**: Web3Forms (client-side POST)
- **Brand compliance**: AI persona must never say "AI", use bullet points, or use corporate speak
- **Performance**: 60fps shader, page load under 2s on 4G, Lighthouse 90+
- **Design tokens**: Perth Disruptor palette mapped to Tailwind theme + CSS custom properties

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over vanilla | Future demos (voice agent, automation, TTS) need routing, API routes, server components | — Pending |
| shadcn/ui for components | Consistent, accessible UI primitives — Input, Card, Button for chat + lead form | — Pending |
| Vercel AI Gateway over direct Anthropic | Rate limiting, analytics, provider flexibility | — Pending |
| Web3Forms over Resend | Client-side, no backend needed for lead capture | — Pending |
| Shader as React client component | Must integrate with Next.js, not separate Vite build | — Pending |

---
*Last updated: 2026-04-01 after initialization*
