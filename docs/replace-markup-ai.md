# Move terminology from Acrolinx into your own content desk

Checked 2026-11-20. [Acrolinx is now Markup AI](https://www.acrolinx.com/). The documented export used here is the Acrolinx terminology export, which does not establish a native Markup Business export format.

## Export and map

In Acrolinx, open Term import and export, then Export, select CSV and download the result. The vendor allows configurable delimiters and filters. Export comma-separated UTF-8 for this importer, with one term per row and a stable term identifier. [Vendor export instructions](https://support.markup.ai/hc/en-us/articles/10210997339538-Export-Terms).

Inspect the actual headers. Copy fixtures/acrolinx-map.json and map id, term, language, domain, status and optional replacement. Each original status needs an explicit status_values entry mapping it to preferred, deprecated or proposed. Do not assume the synthetic fixture headings are your vendor defaults. Normalize the export to one row per term if it contains multi-language wide columns. Keep an unchanged source copy.

```bash
npm run standards -- import acrolinx --file="my-export.csv" --map="my-map.json" --source="my-acrolinx-tenant" --exported-at=2026-11-20T00:00:00Z --owner="Terminology owner" --review-due=2027-01-01 --actor="Operator" --dry-run
```

Use the actual export time and an owner-agreed review date. Reconcile preview counts and representative terms, then repeat without --dry-run. import markup-ai is an alias for this same legacy format, not a claim of native Markup Business compatibility. For a different export, map its columns and confirm the status semantics with the vendor before import.

## What carries over

The mapped terms, language tags, domain, status and replacement become operating records. The complete input CSV, mapping and every source row stay in the database. Source plus source id makes repeat imports idempotent. Changed exports require a later timestamp. Conflicting local reviews stop the entire import. Missing rows never delete terms. Owner and review date are initial local policy values and are not overwritten on repeat imports.

## What needs separate work

This importer does not recreate style packages, models, editor settings, scorecards, user accounts, approved-message relationships, translated concepts or analytics. Extra columns are preserved as source evidence but do not drive checks. Original content comes from your authoring system as plain text or Markdown. For broader legacy exports, [Acrolinx documents a support request](https://support.markup.ai/hc/en-us/articles/10218943933458-Managed-Cloud-Data-Storage-and-Privacy-Information).

## Prove the switch

Test on a copy first. Compare term counts, statuses, languages, domains and replacements. Check representative content manually alongside the old workflow. Record claims and evidence per revision. Complete a reviewer sign-off and release-check, export an archive, and restore-test a database backup before retiring anything. A clean import is not evidence of feature parity.
