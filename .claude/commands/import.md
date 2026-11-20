---
description: Read docs/replace-markup-ai.
---

Read CLAUDE.md. Read docs/replace-markup-ai.md. This accepts documented legacy Acrolinx terminology CSV, not an assumed native Markup export. Inspect headers and set the mapping and status_values. Preview, reconcile, then repeat without --dry-run under the operator’s import request.

```bash
npm run standards -- import acrolinx --file="<export.csv>" --map=fixtures/acrolinx-map.json --source="<tenant-export>" --exported-at=2026-11-20T00:00:00Z --owner="<owner>" --review-due=YYYY-MM-DD --actor="<operator>" --dry-run
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
