# Feature Landscape

**Domain:** Business automations landing page with WebGL + AI chatbot
**Researched:** 2026-04-01

## Table Stakes

Features users expect on a high-end landing page targeting SME decision-makers.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear value proposition above fold | Perth SME owners decide in 3 seconds. Benefit-driven, no jargon. | Low | Wordmark + subtitle. Not "AI-powered solutions." |
| Single focused CTA | Landing pages with one CTA convert 2-3x better. The chat input IS the CTA. | Low | "Tell us your problem" input doubles as CTA and chat entry point. |
| Mobile responsive layout | 60%+ of Australian SME traffic is mobile. Non-negotiable. | Med | 640px breakpoint. Touch-friendly chat, no custom cursor on mobile. |
| Fast page load (<2s on 4G) | 53% bounce if load >3s. Perth audience skews impatient. | Med | Shader lazy-load via `next/dynamic`, code-split Three.js. Lighthouse 90+. |
| Message bubbles with sender distinction | Standard chat UX. Dark for AI, lighter for user. | Low | shadcn Card primitives. Right-align user, left-align AI. |
| Auto-scroll to newest message | Chat must follow conversation. | Low | scrollIntoView with smooth behavior. Pause on manual scroll-up. |
| Input pinned to bottom | Users expect text input at bottom, mirroring messaging apps. | Low | Sticky position. Must not be obscured by mobile keyboard. |
| Perth/Australian locality signal | SME owners buy from locals. | Low | Perth badge in landing state per spec. |
| Contact fallback | Some visitors won't chat. Need phone/email somewhere. | Low | Subtle footer link. Not competing with chat CTA. |

## Differentiators

Features that set Good'ai apart from competitor landing pages.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SDF lens blur shader background | "This company is technically serious." Visual proof of capability. Cursor-reactive. | High | Three.js + custom GLSL. Must hit 60fps. Codrops reference (MIT). Biggest technical risk. |
| Conversational lead capture | Perth SMEs hate forms. Chat naturally asks name/number. 2-3x conversion vs static forms. | Med | Lead card slides in after first AI response. Must feel natural, not a gate. Allow skipping. |
| Perth-voice AI persona | AI talks like a switched-on Perth mate. Uses "reckon", "no worries". Avoids "AI", bullet points, corporate speak. | Med | System prompt engineering. Extensive persona testing needed. |
| Custom cursor with lerp follow | Smooth-interpolated cursor expanding on hover. Signals premium craft. | Med | requestAnimationFrame lerp. Disable on touch devices. |
| Ambient glow following cursor | Radial gradient tracking cursor. Creates "everything responds to you" feeling. | Low | CSS radial-gradient with JS position updates. Subtle -- 5-10% opacity max. |
| Noise texture + vignette | Film grain + darkened edges add depth. Makes shader feel cinematic. | Low | Static noise PNG at low opacity + CSS vignette. Pure CSS, no perf cost. |
| Quick-reply suggestion chips | Pre-built responses: "Invoicing is killing me", "I waste hours on email". Reduces friction. | Low | 3-4 chips below input. Disappear after first message. |
| Transcript in lead email | Sales team sees context before calling. Leads with context convert 3x better. | Low | Serialize chat history in Web3Forms payload. |

## Anti-Features

Features to explicitly NOT build in v1.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Navigation menu / multi-page | Adds exit points. Every link away = lost lead. | Single page, single CTA. |
| Cookie consent banner | Blocks viewport, creates friction. No tracking cookies in v1. | Privacy-respecting analytics later (Plausible/Umami). |
| Chatbot widget/popup | Floating bubble screams "template SaaS." | Full-viewport chat integrated into page layout. |
| Pricing page | Showing prices before understanding problem causes sticker shock. | AI captures problem, human follows up with pricing. |
| Testimonials (v1) | No customers yet. Fake ones destroy trust. Perth is small. | Add after 3-5 real customers with specific results. |
| "Powered by AI" badges | Perth SMEs suspicious of AI. Brand deliberately buries "AI" in name. | Never mention AI. Let experience speak. |
| Dark mode toggle | One design. Shader background IS the design. | Perth Disruptor palette only. |
| Sound effects | Unexpected audio universally hated. | Silent experience. Voice demo opt-in in v2. |
| Mandatory lead gate | Forcing info before AI responds kills trust. | AI responds first, proves value. Lead card is invitation, not gate. |
| Complex scroll animations | Single-viewport page. No scrolling in v1. | Reserve motion budget for shader + cursor + chat transition. |

## Feature Dependencies

```
Shader Background (Three.js) ──> Cursor Reactivity (shader uniforms accept mouse coords)
                              ──> Ambient Glow (layered above shader, below content)
                              ──> Noise + Vignette (layered above shader)

Landing State (wordmark + input) ──> Chat Interface (transition on first message)
                                 ──> Quick-Reply Chips (displayed in landing state)

Chat Interface ──> Message Bubbles (per message render)
               ──> Auto-scroll (follows new messages)
               ──> Lead Capture Card (after first AI response)

AI Backend (Vercel AI Gateway) ──> Perth-voice Persona (system prompt)
                               ──> Chat Interface (streams responses)

Lead Capture Card ──> Web3Forms Submission (lead + transcript)
```

## MVP Recommendation

### Must ship (core conversion loop):
1. Landing state with wordmark, subtitle, "Tell us your problem" input
2. Chat interface with message bubbles, auto-scroll, bottom input
3. AI backend with Perth-voice persona via Vercel AI Gateway
4. Lead capture card sliding in after first AI response
5. Web3Forms submission with conversation transcript
6. Responsive layout at 640px breakpoint
7. Quick-reply chips to reduce friction

### Ship if time allows (high-impact visual layer):
8. SDF lens blur shader background (biggest wow factor, highest risk)
9. Custom cursor with lerp (premium signal)
10. Ambient glow + noise + vignette (polish, low effort once shader works)

### Defer to v2+:
- Testimonials (need real customers)
- Voice agent demo (out of scope)
- SEO/blog (validate PMF first)

**Key insight:** The shader is the biggest wow factor but also the biggest risk. If it blocks progress, ship with a dark gradient + noise overlay -- that still looks premium. The chat experience and AI persona are what actually convert leads.

## Sources

- [Awwwards WebGL Winners](https://www.awwwards.com/websites/webgl/)
- [Unbounce: Landing Page Best Practices](https://unbounce.com/landing-page-articles/landing-page-best-practices/)
- [Shopify AU: High-Converting Landing Pages](https://www.shopify.com/au/blog/high-converting-landing-pages)
