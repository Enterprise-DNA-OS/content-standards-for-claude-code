# Content Standards for Claude Code

Your product wording changes. The evidence and sign-off should follow the exact revision. Keep terminology, phrase rules, content versions and review decisions in a database you own.

## Three ways to use it

- **Do it yourself:** free MIT source. Run the demo and operate your own review desk with Claude Code, Codex, OpenCode or Cursor.
- **We customise it:** Enterprise DNA brings your terminology across and builds your fields, review rules, editor connections and screens. Setup fee, then a retainer.
- **We run it for you:** installed, connected and operated through **Omni by Enterprise DNA**. Setup fee, then a retainer. [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=markup-ai&utm_medium=readme).

## Quick start

Node 20 or newer. Windows and Linux. Embedded PGlite needs no server. DATABASE_URL selects PostgreSQL.

```bash
npm install
npm run demo
npm run standards -- attention
npm run standards -- check-content DOC-001 --actor="Demo operator"
npm run standards -- weekly-review
npm run view
npm run docs
npm test
```

Use a fresh demo database. Synthetic content includes overdue terminology, missing declarations and expired evidence. Required wording and review dates are house policies, not statutory rules.

## The content week

/term-review settles proposed and stale wording. /review-queue assigns document reviews. /check-content stores literal findings with the exact standards snapshot. /compliance finds recorded evidence gaps. /release-check identifies changed content, changed standards and expired review dates. /weekly-review combines these into the next work list.

Every term has a language and domain. General terms apply alongside the document domain. Language tags must match exactly. Checks use Unicode whole-phrase boundaries and ignore case. They do not infer synonyms, plurals, grammar or truth. Proposed terms appear in term-review and are not prohibited automatically.

## Bring your terminology

```bash
npm run standards -- import acrolinx --file=fixtures/acrolinx.csv --map=fixtures/acrolinx-map.json --source=demo-export --exported-at=2026-11-20T00:00:00Z --owner="Demo editor" --review-due=2027-01-01 --actor="Demo operator" --dry-run
```

The import supports the documented legacy Acrolinx terminology CSV path. Markup AI is the current brand. A native Markup Business export is not assumed to have the same format. Inspect your export and map the columns first. The sample is synthetic, not a captured vendor export. Repeat without --dry-run once reconciled. [Switch guide](docs/replace-markup-ai.md).

## Ten questions answered by your own records

1. Which documents still need a release decision? attention.
2. Which terms are awaiting an owner’s decision? term-review.
3. Which content revisions have no claim declaration? compliance.
4. Which claims have expired evidence? compliance.
5. Which owner has the most overdue documents? owner-workload.
6. Which documents were checked against older standards? release-check.
7. What wording was in the exact approved revision? history and detail.
8. Which phrases break our own current rules? check-content.
9. What did our terminology export originally contain? export.
10. Which documents changed after their last approval? release-check and history.

These are working queries, not a claim that the vendor cannot answer them. The difference is that you can combine your own evidence and change the rules without buying a reporting tier.

## Commands

- /help: List the available operations.
- /terms: Read the terminology register, status, replacement and review date.
- /rules: Read active and retired phrase rules.
- /documents: Read current content revisions and review ownership.
- /term-review: Decide proposed terms and overdue terminology reviews. Use review-term for an authorised decision.
- /review-queue: Prepare the content review queue in due-date order. Approval counts are historical, not current readiness.
- /compliance: Show recorded claim-evidence and review-date gaps. Read docs/compliance.md. A clear result is not a legal conclusion.
- /owner-workload: See each owner’s overdue documents and undeclared claims.
- /imports: Review source export dates and import counts.
- /audit: Read the local actor labels and recorded changes. Actor labels are not authenticated identities.
- /attention: Show documents blocked by content findings, stale checks, missing evidence or missing approval.
- /weekly-review: Combine attention, term-review, compliance and owner-workload. Name the owner and next action for each blocker.
- /detail: Read the exact current text and its claims before taking action.
- /history: Read all revisions, events and historical approvals.
- /release-check: Check current readiness. This records no publication and sends nothing.
- /add-term: Add a term. Optional --language=en --domain=general --replacement="<preferred wording>". Use the actual language tag consistently.
- /review-term: Read the term first. Status is preferred, deprecated or proposed. Optional --replacement and --owner. Local review prevents conflicting source updates.
- /add-rule: Kind is required or prohibited. Optional --domain and --language. Rules match literal whole phrases, not meaning. New standards invalidate old checks.
- /retire-rule: Retire an obsolete house rule without deleting it.
- /add: Add plain text or Markdown. Optional --domain and --language. Claims declaration is unreviewed, none or listed. Never guess that a document has no claims.
- /revise: Append a revision. Evidence and approvals remain with the old revision. Review and record evidence for the new version.
- /set-review-date: Record a completed scheduling review. Never change the date just to hide an overdue item.
- /record-claim: Requires a current revision declaring listed claims. The statement must appear in that text. Record actual evidence and assessment, not an invented reference. To replace wrong or expired evidence, append a revised document and record the new evidence.
- /check-content: Store findings and the exact standards snapshot. Checking does not approve. Fix text with revise, or review standards through their own commands.
- /approve: Read detail, compliance and release-check first. Reviewer label must differ from author. A current clean check, claim declaration, current evidence and review dates are required. The reviewer must assess omitted claims and legal applicability. Nothing is published.
- /log: Append an operating note without changing the content.
- /draft-review: Write a review brief under drafts. Read it and report the path. Never send it.
- /import: Read docs/replace-markup-ai.md. This accepts documented legacy Acrolinx terminology CSV, not an assumed native Markup export. Inspect headers and set the mapping and status_values. Preview, reconcile, then repeat without --dry-run under the operator’s import request.
- /export: Export all domain records, raw imports, revisions and evidence. Existing files are never overwritten. Contains private content. JSON archive, not a direct vendor restore or database backup.

All commands support --json. Writes require --actor. Names are case-insensitive, unique partial names and id prefixes work, and ambiguous selections list candidates with exit 1. See the matching .claude/commands recipe for exact arguments. /customise and /new-view extend the same database.

## Documents and views

Set business name, colours and logo in brand.json. npm run docs creates one content review packet per document: current wording, evidence gaps, claims, checks and historical approvals. npm run view creates the weekly read-only dashboard. Nothing publishes or sends. Use release-check for live readiness: reports are snapshots.

## Your first hour: ten things to ask for

1. Put our name on the review packet.
2. Show the content that needs a decision.
3. Explain the terms awaiting review.
4. Show the oldest owner backlog.
5. Check the summer product wording.
6. Explain why a previous approval is stale.
7. Preview our terminology export.
8. Draft a note for the content reviewer.
9. Add our product range with /customise.
10. Add a weekly regional view with /new-view.

## Operating scope

The free base is a trusted-operator content standards desk. It checks literal phrases and records human substantiation decisions. It does not recreate Markup AI’s language models, grammar engine, editor integrations, crawling, citability scoring, identity management or hosted publishing controls. Enterprise DNA can scope the connections and interface your team needs. [Why no front end](docs/why-no-front-end.md).

[Evidence rules](docs/compliance.md), [operations](docs/operations.md), [research](docs/research.md), [verification](docs/verification.md). MIT. Not affiliated with Markup AI, Acrolinx or Anthropic. Hosting, agent access and operation remain your costs.
