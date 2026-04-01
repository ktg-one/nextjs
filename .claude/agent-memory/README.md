# Agent Memory

This directory stores persistent memory files for agents.

Each agent with `memory: project` in its frontmatter maintains a `MEMORY.md` here.
The first 200 lines are auto-injected at agent startup.

## Structure
```
agent-memory/
  cs-frontend-dev/MEMORY.md   — Frontend patterns learned, component decisions
  cs-api-dev/MEMORY.md         — API patterns, schema decisions, auth patterns
  cs-code-reviewer/MEMORY.md   — Common issues found, team conventions
```

## Convention
Agents should:
1. Review their memory at session start
2. Update after completing significant work
3. Record decisions, not just actions
