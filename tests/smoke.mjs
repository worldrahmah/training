import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-smoke-'));
const port=3200+Math.floor(Math.random()*500);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
const base=`http://127.0.0.1:${port}`;
async function wait(){for(let i=0;i<60;i++){try{const r=await fetch(base+'/api/health');if(r.ok)return await r.json()}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error('server did not start\n'+log)}
async function req(p,{token,method='GET',json,body,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'';const data=ct.includes('application/json')?await r.json():await r.text();if(!r.ok){const e=new Error(`${method} ${p} -> ${r.status}: ${JSON.stringify(data)}`);e.status=r.status;e.data=data;throw e}return data}
async function login(username,password){return req('/api/login',{method:'POST',json:{username,password}})}
function line(name){console.log('PASS',name)}
try{
  const health=await wait();assert.equal(health.ok,true);line('server starts');
  for(const [route,title] of [['/trainer','Training Engine ONE — Trainer'],['/student','Training Engine ONE — Participant'],['/present','Training Engine ONE — Projector']]){const r=await fetch(base+route);assert.equal(r.status,200);const t=await r.text();assert.ok(t.includes(title));line(`${route} loads`)}

  const tr=await login('TRAINER','TRAIN1234');assert.equal(tr.user.role,'trainer');line('trainer login');
  const st=await login('DEMO01','D1001');assert.equal(st.user.role,'student');line('student login');
  const dash=await req('/api/dashboard/trainer',{token:tr.token});assert.ok(dash.summary.courses>=1);line('trainer dashboard');
  let sd=await req('/api/student/dashboard',{token:st.token});assert.ok(sd.active);const demoClass=sd.active.class.id;line('student dashboard + enrollment');

  let launch=await req(`/api/live/${demoClass}/launch`,{token:tr.token,method:'POST',json:{module_id:'welcome',activity_id:'quick-poll'}});assert.ok(launch.instance_id);line('launch generic poll');
  sd=await req('/api/student/dashboard',{token:st.token});assert.equal(sd.active.item.id,'quick-poll');
  await req(`/api/responses/${launch.instance_id}`,{token:st.token,method:'POST',json:{answer:'Ready'}});let live=await req(`/api/live?class_id=${demoClass}`);assert.equal(live.live.results.summary.total,1);line('student response persisted');
  await req(`/api/live/${demoClass}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${demoClass}/reveal`,{token:tr.token,method:'POST'});live=await req(`/api/live?class_id=${demoClass}`);assert.equal(live.live.state.phase,'results');assert.equal(live.live.results.summary.counts.Ready,1);line('close and reveal results');
  await req(`/api/live/${demoClass}/clear`,{token:tr.token,method:'POST'});line('clear live state');

  const history=await req(`/api/history?class_id=${demoClass}`,{token:tr.token});assert.ok(history.events.some(e=>e.event_type==='response_submitted'));line('trainer history');
  const backup=await req('/api/system/backups/create',{token:tr.token,method:'POST'});assert.ok(backup.backup.name);const backups=await req('/api/system/backups',{token:tr.token});assert.ok(backups.backups.length>=1);line('backup create/list');

  const pkg=fs.readFileSync(path.join(ROOT,'authoring-kit/examples/ENGINE_DEMO_COURSE_v1.0.course.zip'));
  const val=await req('/api/courses/validate',{token:tr.token,method:'POST',body:pkg,headers:{'X-File-Name':encodeURIComponent('ENGINE_DEMO_COURSE_v1.0.course.zip')}});assert.equal(val.ok,true);assert.equal(val.summary.modules,1);line('course package validation');
  const imp=await req('/api/courses/import',{token:tr.token,method:'POST',body:pkg,headers:{'X-File-Name':encodeURIComponent('ENGINE_DEMO_COURSE_v1.0.course.zip')}});assert.ok(imp.version_id);line('transactional course import');
  const asset=await fetch(`${base}/api/assets/${imp.version_id}/assets/readme.txt`,{headers:{'X-Session-Token':tr.token}});assert.equal(asset.status,200);assert.match(await asset.text(),/harmless static asset/);line('course asset import/serve');

  const classPayload={format:'training-engine-class',schema_version:'1.0',class:{course_slug:'engine-demo-course',course_version:'1.0',title:'Imported Acceptance Class',start_date:'2026-11-10',end_date:'2026-11-10',start_time:'10:00',end_time:'11:00',capacity:4,sessions:[{title:'Session 1',date:'2026-11-10',start_time:'10:00',end_time:'11:00'}]}};
  const ci=await req('/api/classes/import',{token:tr.token,method:'POST',json:classPayload});assert.ok(ci.id);line('class template import');
  const roster=Buffer.from('username,full_name,password,email,role,organization,specialty\nTEST01,Test One,T4101,,Student,Lab,Design\nTEST02,Test Two,T4102,,Student,Lab,Data\n');
  const rr=await req(`/api/classes/${ci.id}/roster`,{token:tr.token,method:'POST',body:roster});assert.equal(rr.enrolled,2);line('CSV roster import');
  await req(`/api/classes/${ci.id}/teams/auto`,{token:tr.token,method:'POST',json:{count:1}});const cd=await req(`/api/classes/${ci.id}`,{token:tr.token});assert.equal(cd.teams.length,1);assert.equal(cd.teams[0].members.length,2);line('team assignment');
  await req(`/api/classes/${ci.id}/activate`,{token:tr.token,method:'POST'});const testStudent=await login('TEST01','T4101');line('imported participant login');
  const teamLaunch=await req(`/api/live/${ci.id}/launch`,{token:tr.token,method:'POST',json:{module_id:'interactive-start',activity_id:'team-idea'}});await req(`/api/responses/${teamLaunch.instance_id}`,{token:testStudent.token,method:'POST',json:{answer:'Use clearer examples'}});live=await req(`/api/live?class_id=${ci.id}`,{token:tr.token});assert.equal(live.live.results.summary.total,1);assert.equal(live.live.results.summary.response_scope,'team');line('team-scoped response');
  await req(`/api/live/${ci.id}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${ci.id}/reveal`,{token:tr.token,method:'POST'});await req(`/api/live/${ci.id}/clear`,{token:tr.token,method:'POST'});

  await req(`/api/live/${ci.id}/mission`,{token:tr.token,method:'POST',json:{module_id:'interactive-start',mission_id:'reflection-mission'}});await req(`/api/submissions/${ci.id}`,{token:testStudent.token,method:'POST',json:{value:'I learned the workflow.'},headers:{'X-Submission-Kind':'text','X-Module-Id':'interactive-start','X-Mission-Id':'reflection-mission'}});await req(`/api/missions/${ci.id}/progress`,{token:testStudent.token,method:'POST',json:{module_id:'interactive-start',mission_id:'reflection-mission',status:'completed',progress:{submitted:true}}});const testId=(await req('/api/students',{token:tr.token})).students.find(x=>x.username==='TEST01').id;const detail=await req(`/api/classes/${ci.id}/student/${testId}`,{token:tr.token});assert.equal(detail.missions[0].status,'completed');assert.ok(detail.achievements.some(a=>a.achievement_key==='first-mission'));line('mission completion + achievement');

  const classesBefore=(await req('/api/classes',{token:tr.token})).classes.length;await req('/api/system/demo/remove',{token:tr.token,method:'POST'});const afterCourses=(await req('/api/courses',{token:tr.token})).courses;assert.ok(afterCourses.some(c=>c.slug==='engine-demo-course'));assert.ok(!afterCourses.some(c=>c.is_demo));const classesAfter=(await req('/api/classes',{token:tr.token})).classes.length;assert.ok(classesAfter<classesBefore);line('safe demo removal preserves real data');

  const csv=await fetch(`${base}/api/reports/export?kind=class_students&class_id=${ci.id}&token=${encodeURIComponent(tr.token)}`);assert.equal(csv.status,200);assert.match(await csv.text(),/TEST01/);line('CSV export');

  console.log('\nSMOKE_TEST_PASS');
}finally{
  child.kill('SIGTERM');
  await new Promise(r=>setTimeout(r,200));
  fs.rmSync(tmp,{recursive:true,force:true});
}
