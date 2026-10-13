import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'one-operations-')),port=18000+Math.floor(Math.random()*1000),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),...Object.fromEntries(['DATA','STORAGE','BACKUP','EXPORT'].map(k=>[`TRAINING_ENGINE_${k}_DIR`,path.join(temp,k.toLowerCase())]))},stdio:'ignore'});
let assertions=0;
async function request(url,token,body,method=body===undefined?'GET':'POST',expected=200){
  const r=await fetch(base+url,{method,headers:{...(token?{'X-Session-Token':token}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();
  assert.equal(r.status,expected,`${method} ${url}: ${JSON.stringify(data)}`);assertions++;return data;
}
const login=(name)=>request('/api/login',null,{username:name,password:'OperationsTest123!'});
try{
  let ready=false;for(let i=0;i<150;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,70))}assert.ok(ready);
  const superUser=await request('/api/login',null,{username:'TRAINER',password:'TRAIN1234'}),superToken=superUser.token;
  async function staff(name,role,actor=superToken){return request('/api/staff',actor,{username:name,password:'OperationsTest123!',display_name:name,staff_role:role},'POST',201)}
  const admin=await staff('OPSADMIN','administrator'),trainer=await staff('OPSTRAINER','trainer'),assistant=await staff('OPSASSIST','assistant');
  const at=(await login('OPSADMIN')).token,tt=(await login('OPSTRAINER')).token,ast=(await login('OPSASSIST')).token;
  const student=(await request('/api/login',null,{username:'DEMO01',password:'D1001'})).token;
  await staff('ADMINCREATED','trainer',at);
  await request('/api/dashboard/admin',at);await request('/api/dashboard/admin',tt,undefined,'GET',403);
  for(const actor of [tt,ast])await request('/api/staff',actor,{username:'FORBIDDEN',password:'OperationsTest123!',display_name:'Forbidden'},'POST',403);
  await request('/api/staff',student,{username:'FORBIDDEN',password:'OperationsTest123!',display_name:'Forbidden'},'POST',401);
  const before=(await request('/api/staff',superToken)).staff.find(x=>x.id===trainer.id);
  await request(`/api/staff/${trainer.id}`,at,{display_name:'SHOULD NOT CHANGE',email:'should-not-change@example.test',active:false,staff_role:'super_admin'},'PATCH',403);
  const after=(await request('/api/staff',superToken)).staff.find(x=>x.id===trainer.id);assert.deepEqual(after,before,'Denied role elevation must make zero partial writes');assertions++;
  await request(`/api/staff/${superUser.user.id}`,at,{display_name:'Forbidden'},'PATCH',403);
  await request(`/api/staff/${superUser.user.id}/reset-password`,at,{password:'OperationsTest123!'},'POST',403);
  await request(`/api/staff/${superUser.user.id}/permissions`,at,{permissions:[]},'PUT',403);
  await request(`/api/staff/${superUser.user.id}`,superToken,{staff_role:'trainer'},'PATCH',409);
  await request(`/api/staff/${superUser.user.id}`,superToken,{active:false},'PATCH',409);
  await request('/api/staff',superToken,{username:'BADROLE',password:'OperationsTest123!',display_name:'Bad',staff_role:'unexpected'},'POST',400);
  await request(`/api/staff/${trainer.id}`,at,{staff_role:'unexpected',display_name:'Bad'},'PATCH',400);
  const detail=(await request('/api/staff',superToken)).staff.find(x=>x.id===trainer.id);assert.deepEqual(detail,before);assertions++;
  const course=(id,rtl=false)=>({format:'training-engine-course',schema_version:'2.0',course:{id,version:'1',title:id,language:rtl?'ar':'en',direction:rtl?'rtl':'ltr',modules:[{id:'m',title:'Module',activities:[{id:'a',type:'single_choice',title:'Question',content:{question:'Question',options:['A','B'],correct_answer:'B'}}]}]}});
  async function imp(id,rtl=false){const r=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':superToken,'X-File-Name':'ops.course.json'},body:JSON.stringify(course(id,rtl))});assert.equal(r.status,201);return r.json()}
  const own=await imp('Assigned operations course'),other=await imp('Private operations course',true);
  const cl=await request('/api/classes',superToken,{course_version_id:own.version_id,title:'Assigned class'},'POST',201);
  await request(`/api/classes/${cl.id}/trainers`,superToken,{trainers:[{user_id:trainer.id,assignment_role:'lead'}]});
  const reader=await staff('OPSREADER','trainer'),rt=(await login('OPSREADER')).token;
  await request(`/api/staff/${reader.id}/permissions`,superToken,{permissions:[{resource_type:'class',resource_id:String(cl.id),action:'view'}]},'PUT');
  await request(`/api/live/${cl.id}/health`,rt);
  await request(`/api/live/${cl.id}/clear`,rt,{},'POST',403);
  await request(`/api/live/${cl.id}/navigate`,rt,{direction:'next'},'POST',403);
  await request(`/api/staff/${reader.id}/permissions`,superToken,{permissions:[{resource_type:'unsupported',resource_id:'*',action:'invented'}]},'PUT',400);
  assert.equal((await request(`/api/staff/${reader.id}/permissions`,superToken)).permissions.length,1,'Invalid grants must not delete accepted grants');assertions++;
  const courses=(await request('/api/courses',tt)).courses;assert.ok(courses.some(x=>x.id===own.course_id));assert.ok(courses.every(x=>x.id!==other.course_id));assertions+=2;
  await request(`/api/course-versions/${own.version_id}/content`,tt);
  for(const url of [`/api/courses/${other.course_id}`,`/api/course-versions/${other.version_id}/content`,`/api/courses/${other.course_id}/prerequisites`,`/api/courses/${other.course_id}/question-banks`,`/api/authoring/templates?course_id=${other.course_id}`])await request(url,tt,undefined,'GET',403);
  const search=await request('/api/search?q=operations',tt);assert.ok(!search.results.some(x=>x.id===other.course_id&&x.type==='course'));assertions++;
  const bank=await request(`/api/courses/${other.course_id}/question-banks`,superToken,{title:'Private answer bank'},'POST',201);
  await request(`/api/question-banks/${bank.id}/items`,superToken,{prompt:'Private',answer:{value:'Private answer'}},'POST',201);
  await request(`/api/question-banks/${bank.id}/items`,tt,undefined,'GET',403);
  await request(`/api/classes/${cl.id}/quizzes`,tt,{bank_id:bank.id,title:'Wrong course'},'POST',409);
  await request('/api/classes',superToken,{title:'Other delivery of same course',course_version_id:own.version_id},'POST',201);
  const scopedImpact=await request(`/api/reports/version-impact?course_id=${own.course_id}`,tt),globalImpact=await request(`/api/reports/version-impact?course_id=${own.course_id}`,superToken);
  assert.equal(scopedImpact.versions.find(v=>v.id===own.version_id).classes,1);assert.equal(globalImpact.versions.find(v=>v.id===own.version_id).classes,2);assertions+=2;
  await request('/api/account/password',tt,{current_password:'OperationsTest123!',new_password:'OperationsTest123!'},'POST',400);
  await request(`/api/courses/${other.course_id}`,superToken,{title:'Edited Arabic course'},'PATCH');assert.equal((await request(`/api/courses/${other.course_id}`,superToken)).course.direction,'rtl');assertions++;
  const draft=await request('/api/courses',superToken,{title:'Incomplete draft'},'POST',201);
  await request('/api/admin/bulk',at,{resource:'course',action:'invented',ids:[draft.id]},'POST',400);
  const archived=await request('/api/admin/bulk',at,{resource:'course',action:'archive',ids:[draft.id]});assert.equal(archived.changed,1);assertions++;
  await request('/api/admin/bulk',at,{resource:'course',action:'restore',ids:[draft.id]});
  await request('/api/classes',superToken,{title:'Must not deliver draft',course_version_id:draft.version_id},'POST',409);
  const count=(await request('/api/classes',superToken)).classes.length;
  await request('/api/classes',superToken,{title:'Malformed setup',course_version_id:own.version_id,sessions:[null]},'POST',400);
  assert.equal((await request('/api/classes',superToken)).classes.length,count,'Rejected setup must not leave a partial class');assertions++;
  // A genuine role change revokes old sessions; the account and its history remain.
  await request(`/api/staff/${assistant.id}`,superToken,{staff_role:'trainer'},'PATCH');assert.equal((await request('/api/me',ast)).user,null);assertions++;
  const self=await staff('OPSSELF','administrator'),selfToken=(await login('OPSSELF')).token;
  const changed=await request(`/api/staff/${self.id}`,selfToken,{staff_role:'trainer'},'PATCH');assert.equal(changed.requires_sign_in,true);assert.equal((await request('/api/me',selfToken)).user,null);assertions+=2;
  console.log(`OPERATIONAL_AUTHORIZATION_PASS ${assertions} assertions: staff ownership/atomic rejection, active super-admin, session revocation, scoped courses/tools/search, quiz ownership, published-only classes and RTL preservation`);
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));fs.rmSync(temp,{recursive:true,force:true})}
