---
description: Record a completed scheduling review.
---

Read CLAUDE.md. Record a completed scheduling review. Never change the date just to hide an overdue item.

```bash
npm run standards -- set-review-date "<document>" --review-due=YYYY-MM-DD --note="<review reason>" --actor="<reviewer>"
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
