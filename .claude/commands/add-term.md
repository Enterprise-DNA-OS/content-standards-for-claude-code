---
description: Add a term.
---

Read CLAUDE.md. Add a term. Optional --language=en --domain=general --replacement="<preferred wording>". Use the actual language tag consistently.

```bash
npm run standards -- add-term --code=TERM-NEW --term="<phrase>" --status=proposed --owner="<owner>" --review-due=YYYY-MM-DD --actor="<operator>"
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
