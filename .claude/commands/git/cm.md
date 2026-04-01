---
description: "Stage + commit with conventional commit format"
argument-hint: "[type(scope): message]"
---

Stage and commit changes:

1. Run `git status` to see changes
2. Stage relevant files (never `git add .` — be explicit)
3. Commit with conventional format: `type(scope): message`
   - feat: new feature
   - fix: bug fix
   - refactor: code restructure
   - docs: documentation
   - test: test additions
   - chore: tooling/config
4. Do NOT push
