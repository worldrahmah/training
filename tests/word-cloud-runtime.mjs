import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'te-word-cloud-runtime-'));
const port=4100+Math.floor(Math.random()*300);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const base=`http://127.0.0.1:${port}`;
let child;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'});}
async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,300));child=null;}}
async function wait(){for(let i=0;i<70;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('server start timeout')}
async function req(p,{token,method='GET',json,headers={},expectJson=true}={}){const h={...headers};if(token)h['X-Session-Token']=token;let body;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'';const d=expectJson&&ct.includes('application/json')?await r.json():await r.text();if(!r.ok)throw Object.assign(Error(`${method} ${p} -> ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`),{data:d,status:r.status});return d}
async function login(username,password){return req('/api/login',{method:'POST',json:{username,password}})}
function wcCourse(){return {format:'training-engine-course',schema_version:'2.0',course:{id:'stage1a-word-cloud-acceptance',version:'1.0',title:'Stage 1A Word Cloud Acceptance',description:'Runtime acceptance fixture',language:'en',direction:'ltr',duration_minutes:10,objectives:[],modules:[{id:'m1',title:'Word Cloud',activities:[{id:'wc1',type:'word_cloud',title:'One word for AI',content:{question:'What word comes to mind when you hear AI?',blocks:[]},results_display:'word_cloud',word_cloud:{max_entries:2,max_characters:24,allow_phrases:true,moderation:'pre',identity_visibility:'trainer_only'},trainer:{cue:'Invite short responses.'}},{id:'wc2',type:'word_cloud',title:'Anonymous cloud',content:{question:'Share one anonymous concern',blocks:[]},results_display:'word_cloud',word_cloud:{max_entries:1,max_characters:30,allow_phrases:true,moderation:'pre',identity_visibility:'anonymous'},trainer:{cue:'Protect participant identity.'}}],missions:[],paths:[]}]}}}
function word(summary,norm){return (summary.word_cloud||[]).find(x=>x.normalized===norm)}
try{
  start();await wait();
  let tr=await login('TRAINER','TRAIN1234'),s1=await login('DEMO01','D1001'),s2=await login('DEMO02','D1002');
  const users=(await req('/api/students',{token:tr.token})).students;const u1=users.find(x=>x.username==='DEMO01'),u2=users.find(x=>x.username==='DEMO02');assert.ok(u1&&u2);
  const course=Buffer.from(JSON.stringify(wcCourse()));
  const vr=await fetch(base+'/api/courses/validate',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'word-cloud.course.json'},body:course});const vd=await vr.json();assert.equal(vr.status,200,JSON.stringify(vd));assert.equal(vd.ok,true,JSON.stringify(vd));
  const ir=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'word-cloud.course.json'},body:course});const imp=await ir.json();assert.equal(ir.status,201,JSON.stringify(imp));
  const cl=await req('/api/classes',{token:tr.token,method:'POST',json:{course_version_id:imp.version_id,title:'Word Cloud Runtime Class',capacity:20,participant_ids:[u1.id,u2.id],status:'planned'}});const cid=cl.id;
  await req(`/api/classes/${cid}/activate`,{token:tr.token,method:'POST'});
  const launch=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'m1',activity_id:'wc1'}});const iid=launch.instance_id;
  await req(`/api/responses/${iid}`,{token:s1.token,method:'POST',json:{answer:[' AI! ','Future'],client_submission_id:'s1-1'}});
  await req(`/api/responses/${iid}`,{token:s2.token,method:'POST',json:{answer:['ai','Jobs'],client_submission_id:'s2-1'}});
  let live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(live.results.summary.moderation_pending,4);assert.equal(live.results.summary.word_cloud.length,0);
  const aiEntries=live.results.summary.moderation_entries.filter(x=>x.normalized==='ai');assert.equal(aiEntries.length,2);
  for(const e of aiEntries)await req(`/api/live/${cid}/word-cloud/${iid}/moderation`,{token:tr.token,method:'PATCH',json:{entry_id:e.entry_id,status:'approved'}});
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(word(live.results.summary,'ai').count,2);
  await req(`/api/responses/${iid}`,{token:s1.token,method:'POST',json:{answer:['AI','Skills'],client_submission_id:'s1-1'}});
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(word(live.results.summary,'ai').count,2);const s1ai=live.results.summary.moderation_entries.find(x=>x.student_id===u1.id&&x.normalized==='ai');assert.equal(s1ai.status,'approved');
  const skills=live.results.summary.moderation_entries.find(x=>x.student_id===u1.id&&x.normalized==='skills');assert.equal(skills.status,'pending');await req(`/api/live/${cid}/word-cloud/${iid}/moderation`,{token:tr.token,method:'PATCH',json:{entry_id:skills.entry_id,status:'approved'}});
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;const jobs=live.results.summary.moderation_entries.find(x=>x.student_id===u2.id&&x.normalized==='jobs');await req(`/api/live/${cid}/word-cloud/${iid}/moderation`,{token:tr.token,method:'PATCH',json:{entry_id:jobs.entry_id,status:'rejected'}});
  let publicLive=(await req(`/api/live?class_id=${cid}`)).live;assert.equal(publicLive.state.phase,'activity');assert.deepEqual(Object.keys(publicLive.results.summary).sort(),['total']);assert.equal(publicLive.results.answers,undefined);
  await req(`/api/live/${cid}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${cid}/reveal`,{token:tr.token,method:'POST'});
  publicLive=(await req(`/api/live?class_id=${cid}`)).live;assert.equal(publicLive.state.phase,'results');assert.equal(word(publicLive.results.summary,'ai').count,2);assert.equal(word(publicLive.results.summary,'skills').count,1);assert.equal(word(publicLive.results.summary,'jobs'),undefined);assert.equal(publicLive.results.summary.moderation_entries,undefined);assert.equal(publicLive.results.summary.moderation_pending,undefined);assert.equal(publicLive.results.answers,undefined);
  const dash=await req(`/api/student/dashboard?class_id=${cid}`,{token:s1.token});assert.equal(word(dash.active.results.summary,'ai').count,2);assert.equal(dash.active.results.summary.moderation_entries,undefined);assert.equal(dash.active.results.answers,undefined);
  const detail=await req(`/api/classes/${cid}/student/${u1.id}`,{token:tr.token});const response=detail.responses.find(x=>x.activity_type==='word_cloud');assert.ok(response);assert.ok(response.answer.word_cloud.entries.some(x=>x.normalized==='ai'&&x.status==='approved'));
  const csvRes=await fetch(`${base}/api/reports/export?kind=responses&class_id=${cid}`,{headers:{'X-Session-Token':tr.token}});const csv=await csvRes.text();assert.equal(csvRes.status,200);assert.match(csv,/word_cloud/);assert.match(csv,/skills/i);
  const backup=await req('/api/system/backups/create',{token:tr.token,method:'POST'});assert.ok(backup.backup.name);
  await stop();start();await wait();
  tr=await login('TRAINER','TRAIN1234');s1=await login('DEMO01','D1001');
  live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(live.state.phase,'results');assert.equal(word(live.results.summary,'ai').count,2);assert.equal(word(live.results.summary,'skills').count,1);
  const oneAi=live.results.summary.moderation_entries.find(x=>x.normalized==='ai');await req(`/api/live/${cid}/word-cloud/${iid}/moderation`,{token:tr.token,method:'PATCH',json:{entry_id:oneAi.entry_id,status:'rejected'}});live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(word(live.results.summary,'ai').count,1);
  await req('/api/system/backups/restore',{token:tr.token,method:'POST',json:{name:backup.backup.name}});
  tr=await login('TRAINER','TRAIN1234');live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(word(live.results.summary,'ai').count,2);assert.equal(word(live.results.summary,'skills').count,1);assert.equal(live.results.summary.moderation_rejected,1);
  s1=await login('DEMO01','D1001');await req(`/api/live/${cid}/clear`,{token:tr.token,method:'POST'});const anonLaunch=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'m1',activity_id:'wc2'}});await req(`/api/responses/${anonLaunch.instance_id}`,{token:s1.token,method:'POST',json:{answer:['Private idea'],client_submission_id:'anon-1'}});live=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;const anonEntry=live.results.summary.moderation_entries[0];assert.equal(anonEntry.text,'Private idea');assert.ok(live.results.answers.every(x=>x.anonymous===true&&x.submitted===true&&!('student_id' in x)&&!('answer' in x)));assert.equal(anonEntry.name,undefined);assert.equal(anonEntry.student_id,undefined);assert.equal(anonEntry.team_id,undefined);await req(`/api/live/${cid}/word-cloud/${anonLaunch.instance_id}/moderation`,{token:tr.token,method:'PATCH',json:{entry_id:anonEntry.entry_id,status:'approved'}});await req(`/api/live/${cid}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${cid}/reveal`,{token:tr.token,method:'POST'});
  const anonDetail=await req(`/api/classes/${cid}/student/${u1.id}`,{token:tr.token});const anonResponse=anonDetail.responses.find(x=>x.activity_id==='wc2');assert.deepEqual(anonResponse.answer,{anonymous:true,submitted:true,entry_count:1});const anonCsvRes=await fetch(`${base}/api/reports/export?kind=responses&class_id=${cid}`,{headers:{'X-Session-Token':tr.token}});const anonCsv=await anonCsvRes.text();assert.equal(anonCsvRes.status,200);assert.doesNotMatch(anonCsv,/Private idea/);assert.match(anonCsv,/anonymous/);
  console.log('WORD_CLOUD_RUNTIME_PASS');
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
