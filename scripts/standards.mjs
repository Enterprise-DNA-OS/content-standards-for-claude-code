#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
export const digest=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const req=(f,k)=>{if(typeof f[k]!=='string'||!f[k].trim())throw Error(`--${k} is required`);return f[k].trim();};
const date=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x)||!Number.isFinite(Date.parse(x))||new Date(x).toISOString().slice(0,10)!==x)throw Error('Date must be a real YYYY-MM-DD date');return x;};
const choice=(x,choices)=>{if(!choices.includes(x))throw Error(`Expected one of ${choices.join(', ')}`);return x;};
const today=()=>new Date().toISOString().slice(0,10);
const code=x=>{if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(x))throw Error('Code requires letters, digits, hyphen or underscore');return x;};
const scoped=(row,doc)=>row.language===doc.language&&(row.domain==='general'||row.domain===doc.domain);
export function contains(body,phrase){
 const escaped=phrase.normalize('NFC').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,'iu').test(body.normalize('NFC'));
}
export async function resolve(db,tableName,value){
 if(!value)throw Error('A record name, code or id is required');
 const label=tableName==='terms'?'term':tableName==='rules'?'phrase':'title';
 let rows=await db.query(`select * from ${tableName} where lower(code)=lower($1) or lower(${label})=lower($1) or id::text=$1`,[value]);
 if(!rows.length)rows=(await db.query(`select * from ${tableName} order by code`)).filter(r=>r.id.startsWith(value.toLowerCase())||r[label].toLowerCase().includes(value.toLowerCase())||r.code.toLowerCase().includes(value.toLowerCase()));
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${value}: ${rows.map(r=>`${r.code} (${r[label]})`).join(', ')}`:`No ${tableName} match: ${value}`);
 return rows[0];
}
async function current(db,value){const d=await resolve(db,'documents',value);const [r]=await db.query('select * from v_current where id=$1',[d.id]);if(!r)throw Error('Document has no revision');return r;}
export async function standards(db,doc){
 const terms=(await db.query('select code,term,language,domain,status,replacement,review_due from terms order by code')).filter(r=>scoped(r,doc));
 const rules=(await db.query('select code,phrase,kind,domain,language,reason from rules where active order by code')).filter(r=>scoped(r,doc));
 const snapshot={engine:'literal-unicode-v1',terms,rules};return {snapshot,hash:digest(snapshot)};
}
export function inspect(doc,snapshot){
 const findings=[];
 for(const t of snapshot.terms){
 if(t.status==='deprecated'&&contains(doc.body,t.term))findings.push({rule:t.code,kind:'deprecated-term',text:t.term,action:t.replacement||'Review this term'});
 if(t.review_due<today())findings.push({rule:t.code,kind:'term-review-overdue',text:t.term,action:'Review terminology before sign-off'});
 }
 for(const r of snapshot.rules){const found=contains(doc.body,r.phrase);if((r.kind==='required'&&!found)||(r.kind==='prohibited'&&found))findings.push({rule:r.code,kind:r.kind,text:r.phrase,action:r.reason});}
 return findings;
}
async function scan(db,doc,actor){
 const st=await standards(db,doc);const findings=inspect(doc,st.snapshot);
 const [row]=await db.query('insert into scans(revision_id,standards_hash,findings,standards_snapshot,actor) values($1,$2,$3,$4,$5) returning id',[doc.revision_id,st.hash,JSON.stringify(findings),JSON.stringify(st.snapshot),actor]);
 return {scan_id:row.id,code:doc.code,version:doc.version,findings};
}
export async function readiness(db,doc){
 const st=await standards(db,doc);
 const scans=await db.query('select * from scans where revision_id=$1 order by created_at desc,id desc',[doc.revision_id]);
 const s=scans.find(x=>x.standards_hash===st.hash);
 const reasons=[];
 if(!s)reasons.push('No check against current standards');
 // Re-evaluate date-sensitive rules even if the standards fingerprint has not changed.
 const findings=inspect(doc,st.snapshot);if(findings.length)reasons.push(`${findings.length} current standards finding(s)`);
 const gaps=await db.query('select rule,finding from v_compliance where id=$1',[doc.id]);reasons.push(...gaps.map(g=>`${g.rule}: ${g.finding}`));
 return {doc,scan:s,reasons,findings};
}
async function log(db,actor,kind,note,document=null,payload={}){await db.query('insert into events(document_id,kind,actor,note,payload) values($1,$2,$3,$4,$5)',[document,kind,actor,note,JSON.stringify(payload)]);}
const reads={
 terms:'select code,term,language,domain,status,replacement,owner,review_due from terms order by code',
 rules:'select code,phrase,kind,domain,language,reason,active from rules order by code',
 documents:'select * from v_review_queue order by code',
 'term-review':'select * from v_term_review order by code',
 'review-queue':'select * from v_review_queue order by review_due,code',
 compliance:'select code,rule,finding from v_compliance order by code,rule',
 'owner-workload':'select * from v_owner_workload order by owner',
 imports:'select source,exported_at,sha256,actor,row_count from imports order by created_at',
 audit:'select kind,actor,note,created_at from events order by created_at,id'
};
export const commands=[...Object.keys(reads),'attention','weekly-review','detail','history','release-check','add-term','review-term','add-rule','retire-rule','add','revise','set-review-date','record-claim','check-content','approve','log','draft-review','import','export','help'];
async function doImport(db,f,actor){
 const source=req(f,'source'), exported=req(f,'exported-at');
 if(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(exported)||!Number.isFinite(Date.parse(exported)))throw Error('exported-at requires ISO timestamp with timezone');
 const raw=fs.readFileSync(req(f,'file'),'utf8');const mapping=JSON.parse(fs.readFileSync(req(f,'map'),'utf8'));const rows=parseCsv(raw);if(!rows.length)throw Error('CSV has no rows');
 for(const k of ['id','term','language','domain','status'])if(!mapping[k]||!Object.hasOwn(rows[0],mapping[k]))throw Error(`Mapping missing column for ${k}`);
 const due=date(req(f,'review-due')),owner=req(f,'owner'),seen=new Set();let created=0,updated=0,unchanged=0;
 const normalized=rows.map((r,i)=>{
  const get=k=>String(r[mapping[k]]??'').trim();const id=get('id');if(!id||seen.has(id))throw Error(`Row ${i+2}: missing or duplicate source id`);seen.add(id);
  const term=get('term');if(!term)throw Error(`Row ${i+2}: empty term`);
  const status=mapping.status_values?.[get('status')];choice(status,['preferred','deprecated','proposed']);
  if(!get('language')||!get('domain'))throw Error('Language and domain must be explicit');
  return {id,term,language:get('language'),domain:get('domain'),status,replacement:get('replacement'),raw:r};
 });
 const [batch]=await db.query('insert into imports(source,exported_at,sha256,original_csv,mapping,actor,row_count) values($1,$2,$3,$4,$5,$6,$7) returning id',[source,exported,digest(raw),raw,JSON.stringify(mapping),actor,rows.length]);
 for(const r of normalized){
  let [old]=await db.query('select * from terms where source=$1 and source_id=$2',[source,r.id]);
  if(old){
   const same=['term','language','domain','status','replacement'].every(k=>old[k]===r[k]);
   if(!same&&old.local_changed)throw Error(`Local edit conflict: ${old.code}`);
   if(new Date(old.source_at)>new Date(exported))throw Error(`Stale export: ${old.code}`);
   if(!same&&new Date(old.source_at).getTime()===new Date(exported).getTime())throw Error(`Changed export needs a later exported-at: ${old.code}`);
   if(same){unchanged++;if(!old.local_changed)await db.query('update terms set source_at=$1 where id=$2',[exported,old.id]);}
   else{await db.query('update terms set term=$1,language=$2,domain=$3,status=$4,replacement=$5,source_at=$6 where id=$7',[r.term,r.language,r.domain,r.status,r.replacement,exported,old.id]);updated++;}
  }else{
   [old]=await db.query('insert into terms(code,term,language,domain,status,replacement,owner,review_due,source,source_id,source_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',['IMP-'+digest(source+'\0'+r.id).slice(0,20),r.term,r.language,r.domain,r.status,r.replacement,owner,due,source,r.id,exported]);created++;
  }
  await db.query('insert into term_versions(term_id,import_id,raw) values($1,$2,$3)',[old.id,batch.id,JSON.stringify(r.raw)]);
 }
 await log(db,actor,'import',`Imported ${rows.length} terminology rows`,null,{source,exported,created,updated,unchanged});
 return {source,rows:rows.length,created,updated,unchanged,dry_run:!!f['dry-run']};
}
export async function execute(db,args=[],f={}){
 const [cmd='help',value]=args;
 if(cmd==='help')return commands.map(command=>({command}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='detail'){const d=await current(db,value);return {document:d,claims:await db.query('select * from claims where revision_id=$1',[d.revision_id])};}
 if(cmd==='history'){
  const d=await resolve(db,'documents',value);return {revisions:await db.query('select version,sha256,actor,claims_declaration,created_at from revisions where document_id=$1 order by version',[d.id]),events:await db.query('select kind,actor,note,payload,created_at from events where document_id=$1 order by created_at',[d.id]),approvals:await db.query('select r.version,a.reviewer,a.note,a.created_at from approvals a join revisions r on r.id=a.revision_id where r.document_id=$1',[d.id])};
 }
 if(cmd==='release-check'||cmd==='attention'){
  const docs=value?[await current(db,value)]:await db.query('select * from v_current order by code');const result=[];
  for(const d of docs){const rr=await readiness(db,d);const approvals=rr.scan?await db.query('select reviewer from approvals where revision_id=$1 and scan_id=$2',[d.revision_id,rr.scan.id]):[];const reasons=[...rr.reasons];if(!approvals.length)reasons.push('No approval for current check');
   if(cmd==='release-check'||reasons.length)result.push({code:d.code,title:d.title,owner:d.owner,version:d.version,ready:!reasons.length,reasons:reasons.join('; ')});
  }return result;
 }
 if(cmd==='weekly-review')return {attention:await execute(db,['attention']),terms:await execute(db,['term-review']),compliance:await execute(db,['compliance']),owners:await execute(db,['owner-workload'])};
 if(cmd==='export'){
  const out={format:'content-standards-v1',exported_at:new Date().toISOString()};for(const t of ['terms','rules','documents','revisions','claims','scans','approvals','events','imports','term_versions'])out[t]=await db.query(`select * from ${t} order by id`);
  const file=path.resolve(f.file||path.join(process.env.OUTPUT_DIR||REPO_ROOT,'exports',`content-standards-${Date.now()}.json`));fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return {file,records:Object.values(out).filter(Array.isArray).reduce((n,x)=>n+x.length,0)};
 }
 if(cmd==='draft-review'){
  const d=await current(db,value);const rr=await readiness(db,d);const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`${d.code}-${Date.now()}-${crypto.randomUUID().slice(0,8)}.md`);
  fs.writeFileSync(file,`# Draft review: ${d.title}\n\nRevision ${d.version}. Owner: ${d.owner}.\n\n${rr.reasons.length?rr.reasons.map(x=>'- '+x).join('\n'):'Recorded checks have no current gaps. Request a human sign-off.'}\n\nDraft only. Nothing sent.\n`,{mode:0o600,flag:'wx'});return {file,version:d.version};
 }
 if(!commands.includes(cmd))throw Error(`Unknown command: ${cmd}`);
 const actor=req(f,'actor');await db.exec('BEGIN');
 try{
  // Serialize business changes on PostgreSQL too. PGlite already has one local writer.
  await db.exec('lock table terms,rules,documents,revisions,claims,scans,approvals,imports in share row exclusive mode');
  let result;
  if(cmd==='import'){
   if(!['acrolinx','markup-ai'].includes(value))throw Error('Use import acrolinx or import markup-ai for the documented Acrolinx terminology CSV format');result=await doImport(db,f,actor);
  }else if(cmd==='add-term'){
   result=(await db.query('insert into terms(code,term,language,domain,status,replacement,owner,review_due) values($1,$2,$3,$4,$5,$6,$7,$8) returning code,term,status',[code(req(f,'code')),req(f,'term'),f.language||'en',f.domain||'general',choice(f.status||'proposed',['preferred','deprecated','proposed']),f.replacement||'',req(f,'owner'),date(req(f,'review-due'))]))[0];
  }else if(cmd==='review-term'){
   const t=await resolve(db,'terms',value);result=(await db.query('update terms set status=$1,replacement=$2,owner=$3,review_due=$4,local_changed=true where id=$5 returning code,term,status',[choice(req(f,'status'),['preferred','deprecated','proposed']),f.replacement??t.replacement,f.owner||t.owner,date(req(f,'review-due')),t.id]))[0];
  }else if(cmd==='add-rule'){
   result=(await db.query('insert into rules(code,phrase,kind,domain,language,reason) values($1,$2,$3,$4,$5,$6) returning code,phrase,kind',[code(req(f,'code')),req(f,'phrase'),choice(req(f,'kind'),['required','prohibited']),f.domain||'general',f.language||'en',req(f,'reason')]))[0];
  }else if(cmd==='retire-rule'){
   const rule=await resolve(db,'rules',value);result=(await db.query('update rules set active=false where id=$1 returning code,active',[rule.id]))[0];req(f,'note');
  }else if(cmd==='add'||cmd==='revise'){
   let d;
   if(cmd==='add') [d]=await db.query('insert into documents(code,title,owner,language,domain,review_due) values($1,$2,$3,$4,$5,$6) returning *',[code(req(f,'code')),req(f,'title'),req(f,'owner'),f.language||'en',f.domain||'general',date(req(f,'review-due'))]);else d=await resolve(db,'documents',value);
   const body=fs.readFileSync(req(f,'file'),'utf8');if(!body.trim())throw Error('Content must not be empty');
   const [{version}]=await db.query('select coalesce(max(version),0)+1 version from revisions where document_id=$1',[d.id]);
   await db.query('insert into revisions(document_id,version,body,sha256,actor,claims_declaration) values($1,$2,$3,$4,$5,$6)',[d.id,version,body,digest(body),actor,choice(f.claims||'unreviewed',['unreviewed','none','listed'])]);
   result={code:d.code,version};await log(db,actor,cmd,`Content revision ${version}`,d.id,result);
  }else{
   const d=await current(db,value);
   if(cmd==='set-review-date'){result=(await db.query('update documents set review_due=$1 where id=$2 returning code,review_due',[date(req(f,'review-due')),d.id]))[0];req(f,'note');}
   else if(cmd==='record-claim'){
    if(d.claims_declaration!=='listed')throw Error('Create a revision with --claims=listed first');
    const statement=req(f,'statement');if(!d.body.includes(statement))throw Error('Claim statement must appear in the current revision');
    result=(await db.query('insert into claims(revision_id,statement,evidence,reviewer,valid_until) values($1,$2,$3,$4,$5) returning id,statement,valid_until',[d.revision_id,statement,req(f,'evidence'),actor,date(req(f,'valid-until'))]))[0];
   }else if(cmd==='check-content')result=await scan(db,d,actor);
   else if(cmd==='approve'){
    if(d.actor.trim().toLowerCase()===actor.toLowerCase())throw Error('Reviewer must differ from revision author');const rr=await readiness(db,d);if(rr.reasons.length)throw Error(`Approval blocked: ${rr.reasons.join('; ')}`);
    result=(await db.query('insert into approvals(revision_id,scan_id,reviewer,note) values($1,$2,$3,$4) returning id,reviewer',[d.revision_id,rr.scan.id,actor,req(f,'note')]))[0];
   }else if(cmd==='log')result={code:d.code,note:req(f,'note')};
   else throw Error('Unsupported operation');
   await log(db,actor,cmd,f.note||cmd,d.id,result);
  }
  if(['add-term','review-term','add-rule','retire-rule'].includes(cmd))await log(db,actor,cmd,f.note||cmd,null,result);
  await db.exec(f['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function parseArgs(argv){const args=[],flags={};for(const a of argv){if(a.startsWith('--')){const i=a.indexOf('=');if(i<0)flags[a.slice(2)]=true;else flags[a.slice(2,i)]=a.slice(i+1);}else args.push(a);}return {args,flags};}
export function display(result){
 if(Array.isArray(result)){if(!result.length)return '(none)';const rows=result.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='object'&&v!==null?JSON.stringify(v):v])));return table(rows,Object.keys(rows[0]).map(key=>({key,label:key,width:key==='reasons'?110:65})));}
 if(result&&typeof result==='object')return Object.entries(result).map(([k,v])=>Array.isArray(v)?`${k}\n${display(v)}`:`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join('\n');return String(result);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const {args,flags}=parseArgs(process.argv.slice(2));let db;
 try{db=await getDb();const result=await execute(db,args,flags);console.log(flags.json?JSON.stringify(result,null,2):display(result));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}
}
