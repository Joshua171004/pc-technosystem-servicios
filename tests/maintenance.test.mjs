import ts from 'typescript';import fs from 'node:fs';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync('schema.sql','utf8'));sql.exec("INSERT INTO clients VALUES('leaf','The Leaf'),('other','Otro'); INSERT INTO technicians VALUES('joshua','Joshua Lopez Gonzalez','j@example.com'),('other-tech','Otro','o@example.com');");
const db={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:r.changes},success:true}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const bucket=new Map();globalThis.testEnv={BUCKET:{async put(id,bytes,options){bucket.set(id,{bytes,options})},async get(id){const f=bucket.get(id);return f?{arrayBuffer:async()=>f.bytes,body:f.bytes}:null},async delete(id){bucket.delete(id)}},ASSETS:{fetch:async()=>new Response('',{status:404})}};globalThis.testContext={admin:true,db,u:{},t:null,contact:null};
async function sourceModule(path){return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'))}
const visibility=await sourceModule('server/job-visibility.ts');const fixedNow=new Date('2026-10-17T17:00:00Z');globalThis.testVisibility={jobVisible:j=>visibility.jobVisible(j,fixedNow),tomorrowInCancun:()=>visibility.tomorrowInCancun(fixedNow)};
globalThis.testFlow=await sourceModule('src/maintenance-flow.ts');
assert.equal(visibility.tomorrowInCancun(new Date('2026-11-01T04:59:59Z')),'2026-11-01');assert.equal(visibility.tomorrowInCancun(new Date('2026-11-01T05:00:00Z')),'2026-11-02');
assert.equal(visibility.tomorrowInCancun(new Date('2026-12-31T17:00:00Z')),'2027-01-01');
assert.equal(globalThis.testVisibility.jobVisible({kind:'Mantenimiento',date:'2026-10-18'}),true);assert.equal(globalThis.testVisibility.jobVisible({kind:'Mantenimiento',date:'2026-10-19'}),false);assert.equal(globalThis.testVisibility.jobVisible({kind:'Trabajo',date:'2027-01-01'}),true);
let src=fs.readFileSync('server/maintenance.ts','utf8').replace("import {normalizeVisit,taskComplete,stageTasks} from '../src/maintenance-flow';","const {normalizeVisit,taskComplete,stageTasks}=globalThis.testFlow;").replace("import {jobVisible} from './job-visibility';","const {jobVisible}=globalThis.testVisibility;").replace("import {env} from 'cloudflare:workers';","const env=globalThis.testEnv;").replace("import {access,failure} from './access';","const access=async()=>globalThis.testContext;const failure=e=>Response.json({error:e.message},{status:e.message==='403'?403:400});").replace("import {maintenancePdf} from './maintenance-pdf';","const maintenancePdf=async()=>new TextEncoder().encode('%PDF-test');");
const {handle}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));
const planModule=ts.transpileModule(fs.readFileSync('src/leaf-plan.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;const {leafVisits,routine}=await import('data:text/javascript;base64,'+Buffer.from(planModule).toString('base64'));
async function post(body,origin='https://test.local'){return handle(new Request('https://test.local/api/maintenance',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}))}
let r=await post({action:'save-plan',clientId:'leaf',technician:'joshua',name:'The Leaf',routine,visits:leafVisits});assert.equal(r.status,200);const planId=(await r.json()).id;
assert.equal((await post({action:'schedule-plan',planId,startDate:'2026-10-23'})).status,400);
assert.equal((await post({action:'schedule-plan',planId,startDate:'2026-10-24'})).status,200);
assert.equal(sql.prepare('SELECT count(*) n FROM jobs').get().n,8);
assert.equal((await post({action:'schedule-plan',planId,startDate:'2026-10-24'})).status,400);assert.equal(sql.prepare('SELECT count(*) n FROM jobs').get().n,8);
const jobs=sql.prepare('SELECT * FROM jobs ORDER BY date').all();assert.equal(jobs[0].date,'2026-10-24');assert.equal(jobs[7].date,'2026-12-12');
const read=id=>JSON.parse(sql.prepare('SELECT value FROM settings WHERE id=?').get('maintenance:'+id).value);
const backup=j=>read(j.id).tasks.some(t=>t.title.includes('respaldo de la base'));assert.equal(backup(jobs[1]),true);assert.equal(backup(jobs[5]),true);assert.equal(backup(jobs[0]),false);
globalThis.testContext={admin:false,db,u:{},t:{id:'other-tech'}};assert.equal((await handle(new Request('https://test.local/api/maintenance?job='+jobs[0].id))).status,403);
globalThis.testContext={admin:false,db,u:{},t:{id:'joshua'}};const jobId=jobs[0].id;assert.equal((await handle(new Request('https://test.local/api/maintenance?job='+jobId))).status,403);sql.prepare('UPDATE jobs SET date=? WHERE id=?').run('2026-10-17',jobId);
assert.equal((await post({action:'task',jobId,taskId:read(jobId).tasks[0].id,state:'Realizada'})).status,400);
assert.equal((await post({action:'start',jobId},'https://evil.local')).status,403);
assert.equal((await post({action:'start',jobId})).status,200);const started=read(jobId).started;assert.equal((await post({action:'start',jobId})).status,200);assert.equal(read(jobId).started,started);
assert.equal((await post({action:'finish',jobId})).status,400);
assert.equal((await post({action:'advance',jobId})).status,400);
assert.equal((await post({action:'task',jobId,taskId:read(jobId).tasks.find(t=>t.stage===2).id,state:'Realizada'})).status,400);
const image=fs.readFileSync('public/logo-pctechnosystem.jpg');
for(const stage of [1,2]){
 for(const t of read(jobId).tasks.filter(t=>t.stage===stage))assert.equal((await post({action:'task',jobId,taskId:t.id,state:'Realizada',notes:'Probado'})).status,200);
 assert.equal((await post({action:'advance',jobId})).status,400);
 for(const t of read(jobId).tasks.filter(t=>t.photo&&t.stage===stage)){const f=new FormData();f.set('job',jobId);f.set('task',t.id);f.set('file',new File([image],'prueba.jpg',{type:'image/jpeg'}));assert.equal((await handle(new Request('https://test.local/api/maintenance',{method:'POST',headers:{Origin:'https://test.local'},body:f}))).status,200)}
 assert.equal((await post({action:'advance',jobId})).status,200);
}
assert.equal(read(jobId).stage,3);assert.equal((await post({action:'advance',jobId})).status,400);
assert.equal((await post({action:'details',jobId,summary:'Prueba simulada',materials:'Sin material',observations:'Prueba'})).status,200);
assert.equal((await post({action:'advance',jobId})).status,200);assert.equal(read(jobId).stage,4);
assert.equal((await post({action:'back',jobId})).status,200);assert.equal(read(jobId).stage,3);assert.equal((await post({action:'finish',jobId})).status,400);assert.equal((await post({action:'advance',jobId})).status,200);
r=await post({action:'finish',jobId});assert.equal(r.status,200,await r.clone().text());assert.equal(read(jobId).closed,true);assert.equal(sql.prepare('SELECT status FROM jobs WHERE id=?').get(jobId).status,'Terminado');assert.equal(sql.prepare('SELECT count(*) n FROM reports').get().n,1);
assert.equal((await post({action:'finish',jobId})).status,200);assert.equal(sql.prepare('SELECT count(*) n FROM reports').get().n,1);
assert.equal((await post({action:'task',jobId,taskId:read(jobId).tasks[0].id,state:'Pendiente'})).status,400);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'other'}};assert.equal((await handle(new Request('https://test.local/api/maintenance?pdf='+jobId))).status,403);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'leaf'}};assert.equal((await handle(new Request('https://test.local/api/maintenance?pdf='+jobId))).status,200);
console.log('OK: 8 sábados, cierre mensual, programación sin duplicados, permisos, inicio, guardado, fotos obligatorias, cierre, publicación, PDF privado e idempotencia.');
let refSrc=fs.readFileSync('server/technical-reference.ts','utf8').replace("import {jobVisible} from './job-visibility';","const {jobVisible}=globalThis.testVisibility;").replace("import {env} from 'cloudflare:workers';","const env=globalThis.testEnv;").replace("import {access,failure} from './access';","const access=async()=>globalThis.testContext;const failure=e=>Response.json({error:e.message},{status:e.message==='403'?403:400});");
const {handle:reference}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(refSrc,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));
globalThis.testContext={admin:true,db,u:{}};const f=new FormData();f.set('clientId','leaf');f.set('file',new File([JSON.stringify({name:'Prueba',sheets:[{name:'Datos',rows:[['IP','contraseña'],['192.0.2.1','valor-simulado']]}]})],'test.json',{type:'application/json'}));assert.equal((await reference(new Request('https://test.local/api/technical-reference',{method:'POST',headers:{Origin:'https://test.local'},body:f}))).status,200);
// Adaptador de bucket para referencias JSON.
const get=globalThis.testEnv.BUCKET.get;globalThis.testEnv.BUCKET.get=async id=>{const obj=await get(id);if(!obj)return null;return {...obj,text:async()=>typeof obj.body==='string'?obj.body:new TextDecoder().decode(obj.body)}};
globalThis.testContext={admin:false,db,u:{},t:{id:'joshua'}};r=await reference(new Request('https://test.local/api/technical-reference?job='+jobId));assert.equal(r.status,200);assert.equal((await r.json()).reference.name,'Prueba');
globalThis.testContext={admin:false,db,u:{},t:{id:'other-tech'}};assert.equal((await reference(new Request('https://test.local/api/technical-reference?job='+jobId))).status,403);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'leaf'}};assert.equal((await reference(new Request('https://test.local/api/technical-reference?job='+jobId))).status,403);assert(!sql.prepare('SELECT payload FROM reports WHERE job_id=?').get(jobId).payload.includes('valor-simulado'));
console.log('OK: referencia técnica privada, acceso solo por asignación y exclusión del portal y reporte.');

let serviceSrc=fs.readFileSync('server/service.ts','utf8').replace("import {jobVisible,tomorrowInCancun} from './job-visibility';","const {jobVisible,tomorrowInCancun}=globalThis.testVisibility;").replace("import {access as context} from './access';","const context=async()=>globalThis.testContext;").replace("import {env} from 'cloudflare:workers';","const env=globalThis.testEnv;");
const {GET:serviceGet}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(serviceSrc,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));
globalThis.testContext={admin:false,db,u:{},t:{id:'joshua'}};let agenda=await (await serviceGet(new Request('https://test.local/api/service'))).json();assert.equal(agenda.jobs.length,1);
sql.prepare('UPDATE jobs SET date=? WHERE id=?').run('2026-10-18',jobs[1].id);agenda=await (await serviceGet(new Request('https://test.local/api/service'))).json();assert.equal(agenda.jobs.length,2);
assert.equal((await handle(new Request('https://test.local/api/maintenance?job='+jobs[1].id))).status,200);
assert.equal((await reference(new Request('https://test.local/api/technical-reference?job='+jobs[2].id))).status,403);
globalThis.testContext={admin:true,db,u:{},t:null};agenda=await (await serviceGet(new Request('https://test.local/api/service'))).json();assert.equal(agenda.jobs.length,8);assert.equal((await handle(new Request('https://test.local/api/maintenance?job='+jobs[2].id))).status,200);
const legacy=read(jobs[2].id);delete legacy.stage;delete legacy.routineCount;legacy.tasks.forEach(t=>delete t.stage);legacy.started='2026-10-17T17:00:00Z';sql.prepare('UPDATE settings SET value=? WHERE id=?').run(JSON.stringify(legacy),'maintenance:'+jobs[2].id);
const migrated=(await (await handle(new Request('https://test.local/api/maintenance?job='+jobs[2].id))).json()).visit;assert.equal(migrated.stage,1);assert.equal(migrated.tasks.filter(t=>t.stage===1).length,routine.length);
console.log('OK: etapas secuenciales, evidencias por etapa, retroceso, visitas antiguas, disponibilidad en API y referencias, víspera, vencidos, administrador, fin de mes y año en Cancún.');
