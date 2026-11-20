---
description: Requires a current revision declaring listed claims.
---

Read CLAUDE.md. Requires a current revision declaring listed claims. The statement must appear in that text. Record actual evidence and assessment, not an invented reference. To replace wrong or expired evidence, append a revised document and record the new evidence.

```bash
npm run standards -- record-claim "<document>" --statement="<exact text>" --evidence="<evidence reference and assessment>" --valid-until=YYYY-MM-DD --actor="<reviewer>"
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
