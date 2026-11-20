# Operate a private review desk

Node 20 or newer on Windows or Linux. PGlite runs in .data/db by default. Set DATA_DIR to a separate directory for each local workspace. PostgreSQL uses DATABASE_URL and a trusted database owner connection. Apply npm run migrate before use. Never seed a working database. Hosted demo seeding requires --demo-database.

Use one local PGlite writer at a time. PostgreSQL business writes take a transaction lock for this small desk. All imported rows succeed together or roll back. --dry-run rolls back business writes. Read-only documents run inside read-only transactions.

The database owner can bypass application rules. Row-level security and revoked public privileges prevent accidental anonymous access, but this base is not a multi-user access system. Operator actor labels are not authenticated. Keep the database, files and backups inside the business’s access boundary.

Review packets, archives and drafts include private text. Generated files use private creation modes where supported. OUTPUT_DIR redirects generated outputs. A JSON archive carries all domain records, including original CSV and review evidence, but is not a tested database restore format. Back up PostgreSQL with your database tooling, or copy a closed PGlite data directory. Restore to an isolated directory and verify records before relying on the backup.

Inputs are plain text or Markdown. Convert office and PDF files separately and verify the extracted text. Use matching language tags and domain names. General rules apply to every domain in the same language. All approval history is retained. Current readiness comes from release-check, not the presence of an old approval.
