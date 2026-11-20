alter table approvals add column evidence_hash text;
alter table approvals add column evidence_snapshot jsonb;
-- Existing approvals lack a snapshot and require a fresh review.
