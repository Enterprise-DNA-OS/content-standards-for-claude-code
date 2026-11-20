# Verification

npm test uses an isolated temporary PGlite database. TEST_DATABASE_URL explicitly selects a disposable PostgreSQL database for CI. The suite applies migrations twice, seeds twice, exercises every command and tests approval invalidation, evidence gaps, ambiguity, Unicode phrase boundaries, atomic imports, dry runs, repeat imports, stale sources, local conflicts, append-only history and HTML generation.

.github/workflows/test.yml runs Windows and Linux on Node 20 and 22, plus PostgreSQL 17. The final verified result is recorded after the private push. No live customer data or service is needed.
