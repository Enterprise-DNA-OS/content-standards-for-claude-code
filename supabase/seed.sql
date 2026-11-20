do $$ begin
if exists(select 1 from documents) or exists(select 1 from terms) or exists(select 1 from rules) then return; end if;
insert into terms(code,term,status,replacement,owner,review_due) values
 ('TERM-001','best in class','deprecated','state the measured result','Language editor',current_date+30),
 ('TERM-002','customer','preferred','','Language editor',current_date+30),
 ('TERM-003','green','proposed','','Product editor',current_date-5),
 ('TERM-004','fully guaranteed','deprecated','describe the actual warranty','Product editor',current_date-2);
insert into rules(code,phrase,kind,reason) values
 ('RULE-001','Terms apply','required','Demo house rule: show a qualification before approval'),
 ('RULE-002','zero risk','prohibited','Demo house rule: absolute promise requires rewrite');
insert into documents(code,title,owner,review_due) values
 ('DOC-001','Summer product sheet','Product editor',current_date-3),
 ('DOC-002','Customer help note','Support editor',current_date+30),
 ('DOC-003','Efficiency claim brief','Product editor',current_date+10);
insert into revisions(document_id,version,body,sha256,actor,claims_declaration)
 select id,1,case code when 'DOC-001' then 'Our best in class service has zero risk.' when 'DOC-002' then 'Contact our customer team for the service guide. Terms apply.' else 'This process reduces turnaround time. Terms apply.' end,case code when 'DOC-001' then '3205add54c0435dded59e3cf8f46c4eace349b68c1d73485c960a50fb8e33cc2' when 'DOC-002' then 'c5db2fa320b2885b16b02ae28f3110bd343b23476c78b17e45a3487c0067d3af' when 'DOC-003' then '4e33c41d2c77d05ad94a7c9e7c8cdea3bd563e4cbd8c330c0032878647b28b78' end,'Demo author',case code when 'DOC-002' then 'none' when 'DOC-003' then 'listed' else 'unreviewed' end from documents;
insert into claims(revision_id,statement,evidence,reviewer,valid_until)
 select r.id,'reduces turnaround time','Synthetic study reference, not real substantiation','Demo reviewer',current_date-1 from revisions r join documents d on d.id=r.document_id where d.code='DOC-003';
insert into events(kind,actor,note) values('seed','Demo setup','All content, people and evidence are synthetic');
end $$;
