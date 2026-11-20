# Verification

npm test uses an isolated temporary PGlite database. TEST_DATABASE_URL explicitly selects a disposable PostgreSQL database for CI. The suite applies migrations twice, seeds twice, exercises every command and tests approval invalidation, evidence gaps, ambiguity, Unicode phrase boundaries, atomic imports, dry runs, repeat imports, stale sources, local conflicts, append-only history and HTML generation.

.github/workflows/ci.yml runs Windows and Linux on Node 20 and 22, plus PostgreSQL 17. The workflow is manual to match the shared template. No live customer data or service is needed.

Verified 2026-11-20: 68 assertions covering all 29 CLI commands. PGlite passed on Windows and Linux with Node 20 and 22, and PostgreSQL 17 passed on Linux: https://github.com/Enterprise-DNA-OS/content-standards-for-claude-code/actions/runs/44665338446 . The demo, three review packets and weekly view also passed. Desktop and 390-pixel mobile views were inspected headlessly. There are 33 slash recipes, including docs, view, customise and new-view. Three real demo outputs are committed under docs/demo.
