# Content Standards for Claude Code

An operator-managed desk for terminology, literal phrase rules, content revisions and review evidence. All demo records are synthetic. Set brand.json to the business name before producing real review packets.

## Rules

Read the current document before changing it. Use scripts/standards.mjs for every business change. Never invent evidence, a review decision or a claim declaration. Draft only. Never send, publish, crawl a website or alter customer content outside this database. Actor strings are labels, not verified identities. Use this base with trusted operators only.

A check is literal phrase matching, not grammar, fact verification, semantic analysis or legal certification. The human reviewer checks context, omissions, evidence and legal applicability. Approval is tied to the revision and a standards snapshot. Use release-check for current readiness, never the historical approval count.

## Routing

- /help: npm run standards -- help. See .claude/commands/help.md.
- /terms: npm run standards -- terms. See .claude/commands/terms.md.
- /rules: npm run standards -- rules. See .claude/commands/rules.md.
- /documents: npm run standards -- documents. See .claude/commands/documents.md.
- /term-review: npm run standards -- term-review. See .claude/commands/term-review.md.
- /review-queue: npm run standards -- review-queue. See .claude/commands/review-queue.md.
- /compliance: npm run standards -- compliance. See .claude/commands/compliance.md.
- /owner-workload: npm run standards -- owner-workload. See .claude/commands/owner-workload.md.
- /imports: npm run standards -- imports. See .claude/commands/imports.md.
- /audit: npm run standards -- audit. See .claude/commands/audit.md.
- /attention: npm run standards -- attention. See .claude/commands/attention.md.
- /weekly-review: npm run standards -- weekly-review. See .claude/commands/weekly-review.md.
- /detail: npm run standards -- detail "<code or title>". See .claude/commands/detail.md.
- /history: npm run standards -- history "<code or title>". See .claude/commands/history.md.
- /release-check: npm run standards -- release-check "<code or title>". See .claude/commands/release-check.md.
- /add-term: npm run standards -- add-term --code=TERM-NEW --term="<phrase>" --status=proposed --owner="<owner>" --review-due=YYYY-MM-DD --actor="<operator>". See .claude/commands/add-term.md.
- /review-term: npm run standards -- review-term "<term code>" --status=preferred --review-due=YYYY-MM-DD --actor="<reviewer>". See .claude/commands/review-term.md.
- /add-rule: npm run standards -- add-rule --code=RULE-NEW --phrase="<literal phrase>" --kind=required --reason="<house policy>" --actor="<operator>". See .claude/commands/add-rule.md.
- /retire-rule: npm run standards -- retire-rule "<rule code>" --note="<reason>" --actor="<operator>". See .claude/commands/retire-rule.md.
- /add: npm run standards -- add --code=DOC-NEW --title="<title>" --owner="<owner>" --review-due=YYYY-MM-DD --file="<text file>" --claims=unreviewed --actor="<author>". See .claude/commands/add.md.
- /revise: npm run standards -- revise "<document>" --file="<text file>" --claims=unreviewed --actor="<author>". See .claude/commands/revise.md.
- /set-review-date: npm run standards -- set-review-date "<document>" --review-due=YYYY-MM-DD --note="<review reason>" --actor="<reviewer>". See .claude/commands/set-review-date.md.
- /record-claim: npm run standards -- record-claim "<document>" --statement="<exact text>" --evidence="<evidence reference and assessment>" --valid-until=YYYY-MM-DD --actor="<reviewer>". See .claude/commands/record-claim.md.
- /check-content: npm run standards -- check-content "<document>" --actor="<operator>". See .claude/commands/check-content.md.
- /approve: npm run standards -- approve "<document>" --note="<review scope and evidence decision>" --actor="<reviewer>". See .claude/commands/approve.md.
- /log: npm run standards -- log "<document>" --note="<actual observation>" --actor="<operator>". See .claude/commands/log.md.
- /draft-review: npm run standards -- draft-review "<document>". See .claude/commands/draft-review.md.
- /import: npm run standards -- import acrolinx --file="<export.csv>" --map=fixtures/acrolinx-map.json --source="<tenant-export>" --exported-at=2026-11-20T00:00:00Z --owner="<owner>" --review-due=YYYY-MM-DD --actor="<operator>" --dry-run. See .claude/commands/import.md.
- /export: npm run standards -- export --file="<new private backup.json>". See .claude/commands/export.md.
- /view: npm run view. Read-only weekly report.
- /docs: npm run docs. Versioned review evidence packet.
- /customise: write and test a migration, update the CLI, imports, tests and reports, then apply to the authorised database.
- /new-view: add a read-only query and branded report.

## Data

Read docs/operations.md before real use and docs/replace-markup-ai.md before importing. DATABASE_URL selects PostgreSQL, otherwise PGlite lives in .data/db. DATA_DIR changes local storage, OUTPUT_DIR changes generated report paths. Keep real content, exports and drafts private. Never seed an operating database.

The .claude commands are the one command library for Claude Code, Codex, OpenCode and Cursor. AGENTS.md routes here. Read docs/compliance.md before interpreting evidence checks.

Built and run through Omni by Enterprise DNA. https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=markup-ai&utm_medium=instructions
