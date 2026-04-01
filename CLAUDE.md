# CLAUDE.md — Next.js 16 Agent-Ready Scaffold

## Project Identity
- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Deployment:** Vercel Edge

## Architecture Rules

### Rendering Strategy
- Static (force-static) for marketing/public pages in `(marketing)` route group
- ISR for content pages (revalidate: 3600)
- Dynamic (force-dynamic) for authenticated/user-specific views in `(app)` route group
- Server Components by default. Only add `'use client'` when interactivity required.

### File Conventions
- Components: `src/components/` — PascalCase files, default exports
- Utilities: `src/lib/` — camelCase files, named exports
- Hooks: `src/hooks/` — `use` prefix, one hook per file
- Types: `src/types/` — `.d.ts` for global, `.ts` for module types
- API Routes: `src/app/api/` — route.ts files only
- Tests mirror source: `__tests__/unit/`, `__tests__/e2e/`, `__tests__/integration/`

### Performance (Vercel Best Practices — 57 Rules)
- CRITICAL: No barrel imports. Import directly from module files.
- CRITICAL: Use `next/dynamic` for heavy components (charts, editors, maps)
- CRITICAL: Use `Promise.all()` for independent async operations
- HIGH: Use `React.cache()` for per-request deduplication in Server Components
- HIGH: Minimize data passed to Client Components via props
- MEDIUM: Use `startTransition` for non-urgent state updates
- MEDIUM: Extract expensive work into memoized components

### Error Log
<!-- After corrections, add entries here so the mistake isn't repeated -->
<!-- Format: [DATE] MISTAKE → FIX -->

## Agent Dispatch
See `.claude/agents/` for available agents. Resolution order:
1. Skill (inline, zero context overhead)
2. Agent (own context, autonomous work)
3. Command (user-initiated /slash entry points)

## CLI Fleet
| Agent | Command | Use For |
|---|---|---|
| Claude Code | `claude -p "..."` | Primary dev, refactoring, features |
| Gemini | `gemini -p "..."` | Research, long context, verification |
| Codex | `codex exec "..."` | Bulk mechanical edits |

## Settings Hierarchy
1. `.claude/settings.json` — team-shared (committed)
2. `.claude/settings.local.json` — personal (git-ignored)
3. `~/.claude/settings.json` — global personal defaults
