create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'Evidence records are append only'; end $$;
create table terms (
 id uuid primary key default gen_random_uuid(), code text not null unique, term text not null check(length(trim(term))>0),
 language text not null default 'en', domain text not null default 'general',
 status text not null check(status in ('preferred','deprecated','proposed')), replacement text not null default '',
 owner text not null, review_due date not null, source text, source_id text, source_at timestamptz,
 local_changed boolean not null default false, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(source,source_id)
);
create table rules (
 id uuid primary key default gen_random_uuid(), code text not null unique, phrase text not null check(length(trim(phrase))>0),
 kind text not null check(kind in ('required','prohibited')), domain text not null default 'general', language text not null default 'en',
 reason text not null, active boolean not null default true, created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table documents (
 id uuid primary key default gen_random_uuid(), code text not null unique, title text not null, owner text not null,
 language text not null default 'en', domain text not null default 'general', review_due date not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table revisions (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references documents, version integer not null,
 body text not null, sha256 text not null, actor text not null, claims_declaration text not null check(claims_declaration in ('unreviewed','none','listed')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(document_id,version)
);
create table claims (
 id uuid primary key default gen_random_uuid(), revision_id uuid not null references revisions, statement text not null,
 evidence text not null, reviewer text not null, valid_until date not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table scans (
 id uuid primary key default gen_random_uuid(), revision_id uuid not null references revisions,
 standards_hash text not null, findings jsonb not null, standards_snapshot jsonb not null, actor text not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table approvals (
 id uuid primary key default gen_random_uuid(), revision_id uuid not null references revisions, scan_id uuid not null references scans,
 reviewer text not null, note text not null, created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table events (
 id uuid primary key default gen_random_uuid(), document_id uuid references documents, kind text not null, actor text not null, note text not null,
 payload jsonb not null default '{}',created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), source text not null, exported_at timestamptz not null, sha256 text not null,
 original_csv text not null, mapping jsonb not null, actor text not null, row_count integer not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table term_versions (
 id uuid primary key default gen_random_uuid(),term_id uuid not null references terms,import_id uuid not null references imports,raw jsonb not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['terms','rules','documents','revisions','claims','scans','approvals','events','imports','term_versions'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 end loop;
 foreach t in array array['revisions','claims','scans','approvals','events','imports','term_versions'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',t);
 end loop;
end $$;
create view v_current as select d.*,r.id revision_id,r.version,r.body,r.sha256,r.actor,r.claims_declaration,r.created_at revised_at
 from documents d join lateral(select * from revisions where document_id=d.id order by version desc limit 1) r on true;
create view v_review_queue as select d.code,d.title,d.owner,d.version,d.review_due,d.claims_declaration,
 (select count(*)::int from claims c where c.revision_id=d.revision_id) claim_count,
 (select count(*)::int from scans s where s.revision_id=d.revision_id) scan_count,
 (select count(*)::int from approvals a where a.revision_id=d.revision_id) historical_approvals
 from v_current d;
create view v_term_review as select code,term,language,domain,status,owner,review_due,
 case when status='proposed' then 'term decision needed' else 'term review overdue' end reason
 from terms where status='proposed' or review_due<current_date;
create view v_compliance as
 select d.id,d.code,'CLAIM-DECLARATION' rule,'Current revision has no claim review declaration' finding from v_current d where claims_declaration='unreviewed'
 union all select d.id,d.code,'CLAIM-EVIDENCE','Listed claims have no evidence records' from v_current d where claims_declaration='listed' and not exists(select 1 from claims c where c.revision_id=d.revision_id)
 union all select d.id,d.code,'CLAIM-EVIDENCE','Evidence missing, expired or reviewer missing' from v_current d join claims c on c.revision_id=d.revision_id where nullif(trim(c.evidence),'') is null or nullif(trim(c.reviewer),'') is null or c.valid_until<current_date
 union all select d.id,d.code,'DECLARATION-CONFLICT','No-claims declaration conflicts with recorded claims' from v_current d where claims_declaration='none' and exists(select 1 from claims c where c.revision_id=d.revision_id)
 union all select d.id,d.code,'REVIEW-DUE','Content review date passed' from v_current d where review_due<current_date;
create view v_owner_workload as select owner,count(*)::int documents,count(*) filter(where review_due<current_date)::int overdue,
 count(*) filter(where claims_declaration='unreviewed')::int undeclared from v_current group by owner;
