---
description: Add plain text or Markdown.
---

Read CLAUDE.md. Add plain text or Markdown. Optional --domain and --language. Claims declaration is unreviewed, none or listed. Never guess that a document has no claims.

```bash
npm run standards -- add --code=DOC-NEW --title="<title>" --owner="<owner>" --review-due=YYYY-MM-DD --file="<text file>" --claims=unreviewed --actor="<author>"
```

Use --json for structured output. Replace placeholders with facts supplied by the operator. Read before writing. Ambiguous names list candidates and exit 1. Present blockers with their owner. Never send or publish.
