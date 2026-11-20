---
description: Export all domain records, raw imports, revisions and evidence.
---

Read CLAUDE.md. Export all domain records, raw imports, revisions and evidence. Existing files are never overwritten. Contains private content. JSON archive, not a direct vendor restore or database backup.

```bash
npm run standards -- export --file="<new private backup.json>"
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
