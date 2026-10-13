import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-result-recall-'));
const port=4380+Math.floor(Math.random()*220);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const base=`http://127.0.0.1:${port}`;
let child;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'});}
async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));child=null;}}
async function wait(){for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,80))}throw Error('server start timeout')}
async function req(p,{token,method='GET',json,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;let body;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const d=(r.headers.get('content-type')||'').includes('application/json')?await r.json():await r.text();if(!r.ok)throw Object.assign(Error(`${method} ${p} -> ${r.status}: ${JSON.stringify(d)}`),{status:r.status,data:d});return d}
async function login(username,password){return req('/api/login',{method:'POST',json:{username,password}})}
function course(){return {format:'training-engine-course',schema_version:'2.0',course:{id:'result-recall-test',version:'1.0',title:'Result Recall Test',language:'en',direction:'ltr',modules:[{id:'m1',title:'M1',activities:[{id:'wc1',type:'word_cloud',title:'AI Cloud',content:{question:'Words for AI?'},results_display:'word_cloud',word_cloud:{max_entries:3,max_characters:32,allow_phrases:true,moderation:'off',identity_visibility:'trainer_only'}},{id:'p2',type:'poll',title:'Next Poll',content:{question:'Ready?',options:['Yes','No']},results_display:'horizontal_bar'}],missions:[],paths:[]}]}}}
try{
  start();await wait();
  const tr=await login('TRAINER','TRAIN1234'),s1=await login('DEMO01','D1001'),s2=await login('DEMO02','D1002');
  const users=(await req('/api/students',{token:tr.token})).students,u1=users.find(x=>x.username==='DEMO01'),u2=users.find(x=>x.username==='DEMO02');assert.ok(u1&&u2);
  const body=Buffer.from(JSON.stringify(course()));
  const ir=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'result-recall.json'},body});const imp=await ir.json();assert.equal(ir.status,201,JSON.stringify(imp));
  const cl=await req('/api/classes',{token:tr.token,method:'POST',json:{course_version_id:imp.version_id,title:'Recall Class',capacity:20,participant_ids:[u1.id,u2.id],status:'planned'}}),cid=cl.id;
  await req(`/api/classes/${cid}/activate`,{token:tr.token,method:'POST'});
  let launch=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'m1',activity_id:'wc1'}}),iid=launch.instance_id;
  await req(`/api/responses/${iid}`,{token:s1.token,method:'POST',json:{answer:['AI','Jobs']}});
  await req(`/api/responses/${iid}`,{token:s2.token,method:'POST',json:{answer:['AI','Education']}});
  await req(`/api/live/${cid}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${cid}/reveal`,{token:tr.token,method:'POST'});
  let history=await req(`/api/live/${cid}/results-history`,{token:tr.token});assert.equal(history.history.length,1);assert.equal(history.history[0].participants,2);assert.equal(history.history[0].entries,4);assert.equal(history.history[0].activity_type,'word_cloud');
  const pair=await req(`/api/live/${cid}/projector-pair`,{token:tr.token,method:'POST',json:{label:'Recall Projector'}});assert.ok(pair.pair_token);
  let live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;await req(`/api/live/${cid}/clear`,{token:tr.token,method:'POST',json:{expected_revision:live.state.revision}});
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(live.state.phase,'waiting');
  await req(`/api/live/${cid}/projector-result`,{token:tr.token,method:'POST',json:{instance_id:iid,expected_revision:live.state.revision}});
  let proj=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(proj.state.phase,'waiting','recalling results must not rewind workflow/live phase');assert.equal(proj.projector_recall.active,true);assert.equal(proj.projector_recall.instance.id,iid);assert.equal(proj.projector_recall.results.summary.total,2);assert.equal(proj.projector_recall.results.summary.word_cloud.reduce((n,x)=>n+Number(x.count||0),0),4);assert.equal(proj.projector_recall.results.answers,undefined,'projector recall must be audience-sanitized');
  let studentLive=(await req(`/api/live?class_id=${cid}`,{token:s1.token})).live;assert.equal(studentLive.projector_recall,null,'participant payload must not receive recalled result data');assert.equal(studentLive.state.phase,'waiting');
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;await req(`/api/live/${cid}/projector-result`,{token:tr.token,method:'POST',json:{instance_id:null,expected_revision:live.state.revision}});proj=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(proj.projector_recall,null);
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;launch=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'m1',activity_id:'p2',expected_revision:live.state.revision}});live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(live.state.phase,'activity');assert.equal(live.state.activity_id,'p2');
  await req(`/api/live/${cid}/projector-result`,{token:tr.token,method:'POST',json:{instance_id:iid,expected_revision:live.state.revision}});proj=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(proj.state.phase,'activity');assert.equal(proj.state.activity_id,'p2');assert.equal(proj.projector_recall.instance.id,iid,'recall must coexist with a current activity without reopening the old activity');
  studentLive=(await req(`/api/live?class_id=${cid}`,{token:s2.token})).live;assert.equal(studentLive.state.activity_id,'p2');assert.equal(studentLive.projector_recall,null);
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;await req(`/api/live/${cid}/projector-mode`,{token:tr.token,method:'POST',json:{mode:'waiting',expected_revision:live.state.revision}});proj=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(proj.projector_recall,null,'Return to course must clear result recall');assert.equal(proj.state.activity_id,'p2');
  const projectorSource=fs.readFileSync(path.join(ROOT,'app/public/projector.js'),'utf8'),liveSource=fs.readFileSync(path.join(ROOT,'app/public/live.js'),'utf8');assert.match(projectorSource,/projectorResultMeta/);assert.match(projectorSource,/projector_recall/);assert.match(liveSource,/Results history/);assert.match(liveSource,/Show on Projector/);
  console.log('PROJECTOR_RESULT_RECALL_PASS');
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
