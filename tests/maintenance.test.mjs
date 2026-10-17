import ts from 'typescript';import fs from 'node:fs';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync('schema.sql','utf8'));sql.exec("INSERT INTO clients VALUES('leaf','The Leaf'),('other','Otro'); INSERT INTO technicians VALUES('joshua','Joshua Lopez Gonzalez','j@example.com'),('other-tech','Otro','o@example.com');");
const db={prepare(query){let args=[];return {bind(...values){args=values;return this},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:r.changes},success:true}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const bucket=new Map();globalThis.testEnv={BUCKET:{async put(id,bytes,options){bucket.set(id,{bytes,options})},async get(id){const f=bucket.get(id);return f?{arrayBuffer:async()=>f.bytes,body:f.bytes}:null},async delete(id){bucket.delete(id)}},ASSETS:{fetch:async()=>new Response('',{status:404})}};globalThis.testContext={admin:true,db,u:{},t:null,contact:null};
let src=fs.readFileSync('server/maintenance.ts','utf8').replace("import {env} from 'cloudflare:workers';","const env=globalThis.testEnv;").replace("import {access,failure} from './access';","const access=async()=>globalThis.testContext;const failure=e=>Response.json({error:e.message},{status:e.message==='403'?403:400});").replace("import {maintenancePdf} from './maintenance-pdf';","const maintenancePdf=async()=>new TextEncoder().encode('%PDF-test');");
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
globalThis.testContext={admin:false,db,u:{},t:{id:'joshua'}};const jobId=jobs[0].id;
assert.equal((await post({action:'task',jobId,taskId:read(jobId).tasks[0].id,state:'Realizada'})).status,400);
assert.equal((await post({action:'start',jobId},'https://evil.local')).status,403);
assert.equal((await post({action:'start',jobId})).status,200);const started=read(jobId).started;assert.equal((await post({action:'start',jobId})).status,200);assert.equal(read(jobId).started,started);
assert.equal((await post({action:'finish',jobId})).status,400);
for(const t of read(jobId).tasks)assert.equal((await post({action:'task',jobId,taskId:t.id,state:'Realizada',notes:'Probado'})).status,200);
assert.equal((await post({action:'details',jobId,summary:'Prueba simulada',materials:'Sin material',observations:'Prueba'})).status,200);
assert.equal((await post({action:'finish',jobId})).status,400); // exige evidencia
const image=fs.readFileSync('public/logo-pctechnosystem.jpg');for(const t of read(jobId).tasks.filter(t=>t.photo)){const f=new FormData();f.set('job',jobId);f.set('task',t.id);f.set('file',new File([image],'prueba.jpg',{type:'image/jpeg'}));assert.equal((await handle(new Request('https://test.local/api/maintenance',{method:'POST',headers:{Origin:'https://test.local'},body:f}))).status,200)}
r=await post({action:'finish',jobId});assert.equal(r.status,200,await r.clone().text());assert.equal(read(jobId).closed,true);assert.equal(sql.prepare('SELECT status FROM jobs WHERE id=?').get(jobId).status,'Terminado');assert.equal(sql.prepare('SELECT count(*) n FROM reports').get().n,1);
assert.equal((await post({action:'finish',jobId})).status,200);assert.equal(sql.prepare('SELECT count(*) n FROM reports').get().n,1);
assert.equal((await post({action:'task',jobId,taskId:read(jobId).tasks[0].id,state:'Pendiente'})).status,400);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'other'}};assert.equal((await handle(new Request('https://test.local/api/maintenance?pdf='+jobId))).status,403);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'leaf'}};assert.equal((await handle(new Request('https://test.local/api/maintenance?pdf='+jobId))).status,200);
console.log('OK: 8 sábados, cierre mensual, programación sin duplicados, permisos, inicio, guardado, fotos obligatorias, cierre, publicación, PDF privado e idempotencia.');
let refSrc=fs.readFileSync('server/technical-reference.ts','utf8').replace("import {env} from 'cloudflare:workers';","const env=globalThis.testEnv;").replace("import {access,failure} from './access';","const access=async()=>globalThis.testContext;const failure=e=>Response.json({error:e.message},{status:e.message==='403'?403:400});");
const {handle:reference}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(refSrc,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));
globalThis.testContext={admin:true,db,u:{}};const f=new FormData();f.set('clientId','leaf');f.set('file',new File([JSON.stringify({name:'Prueba',sheets:[{name:'Datos',rows:[['IP','contraseña'],['192.0.2.1','valor-simulado']]}]})],'test.json',{type:'application/json'}));assert.equal((await reference(new Request('https://test.local/api/technical-reference',{method:'POST',headers:{Origin:'https://test.local'},body:f}))).status,200);
// Adaptador de bucket para referencias JSON.
const get=globalThis.testEnv.BUCKET.get;globalThis.testEnv.BUCKET.get=async id=>{const obj=await get(id);if(!obj)return null;return {...obj,text:async()=>typeof obj.body==='string'?obj.body:new TextDecoder().decode(obj.body)}};
globalThis.testContext={admin:false,db,u:{},t:{id:'joshua'}};r=await reference(new Request('https://test.local/api/technical-reference?job='+jobId));assert.equal(r.status,200);assert.equal((await r.json()).reference.name,'Prueba');
globalThis.testContext={admin:false,db,u:{},t:{id:'other-tech'}};assert.equal((await reference(new Request('https://test.local/api/technical-reference?job='+jobId))).status,403);
globalThis.testContext={admin:false,db,u:{},contact:{client_id:'leaf'}};assert.equal((await reference(new Request('https://test.local/api/technical-reference?job='+jobId))).status,403);assert(!sql.prepare('SELECT payload FROM reports WHERE job_id=?').get(jobId).payload.includes('valor-simulado'));
console.log('OK: referencia técnica privada, acceso solo por asignación y exclusión del portal y reporte.');
