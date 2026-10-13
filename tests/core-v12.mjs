import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {validateCourseObject} from '../app/lib/course-package.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-v12-'));
const port=3950+Math.floor(Math.random()*150);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);const base=`http://127.0.0.1:${port}`;
async function wait(){for(let i=0;i<70;i++){try{const r=await fetch(base+'/api/health');if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error('server timeout\n'+logs)}
async function req(p,{token,method='GET',json,body,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'';const d=ct.includes('application/json')?await r.json():await r.text();if(!r.ok){const e=new Error(`${r.status}: ${JSON.stringify(d)}`);e.status=r.status;e.data=d;throw e}return d}
const pass=x=>console.log('PASS',x);
try{
  await wait();
  const admin=await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}});assert.ok(['administrator','super_admin'].includes(admin.user.staff_role));pass('legacy administrator capabilities preserved by admin-like role');
  const staff=await req('/api/staff',{token:admin.token,method:'POST',json:{display_name:'Second Trainer',username:'TRAINER2',password:'Trainer234!',staff_role:'trainer'}});assert.ok(staff.id);pass('create trainer from administration API');
  const allStaff=await req('/api/staff',{token:admin.token});assert.ok(allStaff.staff.some(x=>x.username==='TRAINER2'));pass('staff directory');
  const classes=await req('/api/classes',{token:admin.token});const cid=classes.classes[0].id;
  await req(`/api/classes/${cid}/trainers`,{token:admin.token,method:'POST',json:{trainers:[{user_id:admin.user.id,assignment_role:'lead'},{user_id:staff.id,assignment_role:'trainer'}]}});pass('assign multiple class trainers');
  const second=await req('/api/login',{method:'POST',json:{username:'TRAINER2',password:'Trainer234!'}});const secondClasses=await req('/api/classes',{token:second.token});assert.ok(secondClasses.classes.some(x=>x.id===cid));pass('trainer sees assigned class');
  const created=await req('/api/classes',{token:admin.token,method:'POST',json:{course_version_id:classes.classes[0].course_version_id,title:'Admin Only Class',capacity:5,lifecycle_status:'draft'}});const secondClasses2=await req('/api/classes',{token:second.token});assert.ok(!secondClasses2.classes.some(x=>x.id===created.id));pass('trainer cannot browse unassigned class');
  let denied=false;try{await req(`/api/classes/${created.id}`,{token:second.token})}catch(e){denied=e.status===403}assert.equal(denied,true);pass('unassigned class access denied');
  let lifecycleDenied=false;try{await req(`/api/classes/${created.id}/lifecycle`,{token:second.token,method:'POST',json:{status:'active'}})}catch(e){lifecycleDenied=e.status===403}assert.equal(lifecycleDenied,true);pass('unassigned class mutation denied');
  let rosterDenied=false;try{await req(`/api/classes/${cid}/roster/preview`,{token:second.token,method:'POST',body:Buffer.from('username,full_name\nX1,Person One\n')})}catch(e){rosterDenied=e.status===403}assert.equal(rosterDenied,true);pass('non-lead trainer cannot alter roster');
  let backupDenied=false;try{await req('/api/system/backups',{token:second.token})}catch(e){backupDenied=e.status===403}assert.equal(backupDenied,true);pass('non-admin trainer cannot access system backups');
  const secondReports=await req('/api/reports/center',{token:second.token});assert.ok(secondReports.classes.every(x=>x.id===cid));assert.equal(secondReports.trainers.length,1);assert.equal(secondReports.trainers[0].id,second.user.id);pass('trainer reports are limited to assigned scope');
  const secondClassCsv=await fetch(`${base}/api/reports/export?kind=class_summary&token=${encodeURIComponent(second.token)}`);const secondCsvText=await secondClassCsv.text();assert.equal(secondClassCsv.status,200);assert.ok(!secondCsvText.includes('Admin Only Class'));pass('trainer report export is limited to assigned scope');
  const secondHistory=await req('/api/history',{token:second.token});assert.ok(secondHistory.events.every(x=>x.class_id===cid));pass('trainer history is limited to assigned scope');
  await req(`/api/classes/${cid}/lifecycle`,{token:admin.token,method:'POST',json:{status:'scheduled'}});const cl=await req(`/api/classes/${cid}`,{token:admin.token});assert.equal(cl.class.lifecycle_status,'scheduled');pass('class lifecycle');
  const roster=Buffer.from('username,full_name,password\nTRAINER2,Wrong Role,X1234\n');const preview=await req(`/api/classes/${cid}/roster/preview`,{token:admin.token,method:'POST',body:roster});assert.equal(preview.invalid,1);pass('roster preview rejects staff username');
  const ready=await req(`/api/readiness?class_id=${cid}`,{token:admin.token});assert.equal(ready.database_ok,true);assert.ok(ready.links.participant.includes('/student'));pass('classroom readiness');
  const reports=await req('/api/reports/center',{token:admin.token});assert.ok(Array.isArray(reports.courses)&&Array.isArray(reports.classes)&&Array.isArray(reports.students)&&Array.isArray(reports.trainers));pass('reports center');
  const studentId=reports.students[0]?.id;assert.ok(studentId);const sr=await req(`/api/reports/student/${studentId}`,{token:admin.token});assert.ok(sr.student);assert.ok(Array.isArray(sr.classes));pass('individual learning report');
  for(const kind of ['course_summary','class_summary','student_summary','trainer_summary']){const r=await fetch(`${base}/api/reports/export?kind=${kind}&token=${encodeURIComponent(admin.token)}`);assert.equal(r.status,200);assert.match(r.headers.get('content-type')||'',/text\/csv/);}pass('report CSV exports');
  const valid=validateCourseObject({format:'training-engine-course',schema_version:'1.1',course:{id:'component-test',version:'1.0',title:'Component Test',language:'en',direction:'ltr',objectives:[{id:'o1',title:'One'}],modules:[{id:'m1',title:'Module',activities:[{id:'a1',type:'presentation',title:'Scene',content:{blocks:[{type:'hero',title:'Hello'},{type:'chart',chart_type:'donut',data:[{label:'A',value:1}]}]},flow:{next_activity_id:'a2'}},{id:'a2',type:'numeric_answer',title:'Number',objective_ids:['o1'],content:{question:'Number?',min:0,max:10}}],missions:[{id:'ms1',title:'Mission',steps:[{title:'Do'}],submission:{type:'none'}}]}]}});assert.equal(valid.ok,true);pass('universal content schema validation');
  const bad=validateCourseObject({format:'training-engine-course',schema_version:'1.1',course:{id:'bad',version:'1',title:'Bad',language:'en',direction:'ltr',modules:[{id:'m',title:'M',activities:[{id:'x',type:'made_up_activity',title:'X'}]}]}});assert.equal(bad.ok,false);assert.ok(bad.errors.some(x=>x.includes('unsupported type')));pass('unsupported activity fails closed');
  console.log('\nCORE_V12_PASS');
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));fs.rmSync(tmp,{recursive:true,force:true})}
