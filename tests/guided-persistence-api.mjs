import http from 'node:http';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {DatabaseSync} from 'node:sqlite';
import crypto from 'node:crypto';
import {persistenceExample} from '../tools/guided-persistence-fixture.mjs';
import {GUIDED_INTERACTIONS} from '../app/public/guided-model.js';
import {guidedExample} from '../tools/guided-examples.mjs';import {validateCourseObject} from '../app/lib/course-package.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rc11-')),port=9400+Math.floor(Math.random()*500),base=`http://127.0.0.1:${port}`;let count=0,logs='';const child=spawn(process.execPath,['app/server.mjs'],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),TRAINING_ENGINE_TEST_ACCOUNTS:'1',...Object.fromEntries(['DATA','STORAGE','BACKUP','EXPORT'].map(k=>['TRAINING_ENGINE_'+k+'_DIR',path.join(temp,k.toLowerCase())]))},stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
async function req(url,token,body,method=body===undefined?'GET':'POST',status=200){const r=await fetch(base+url,{method,headers:{...(token?{'X-Session-Token':token}:{}),...(body!==undefined?{'Content-Type':'application/json','X-File-Name':'course.json'}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();assert.equal(r.status,status,`${url}: ${JSON.stringify(data)}`);count++;return data}
const mutation=()=>crypto.randomBytes(16).toString('hex');
try{for(let i=0;i<180;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const admin=await req('/api/login',null,{username:'TRAINER',password:'TRAIN1234'}),one=await req('/api/login',null,{username:'DEMO01',password:'D1001'}),two=await req('/api/login',null,{username:'DEMO02',password:'D1002'}),outsider=await req('/api/login',null,{username:'DEMO03',password:'D1003'}),at=admin.token;
 const fixture=persistenceExample(),m=fixture.course.modules[0],imp=await req('/api/courses/import',at,fixture,'POST',201),cl=await req('/api/classes',at,{title:'Persistence certification',course_version_id:imp.version_id,participant_ids:[one.user.id,two.user.id]},'POST',201),cid=cl.id,rt=`/api/student/runtime/${cid}`,responseRoute=`/api/student/guided/${cid}/response`;
 await req(`/api/classes/${cid}/activate`,at,{});await req(`/api/live/${cid}/practice`,at,{module_id:m.id,workflow_node_id:'practice'});
 const db=new DatabaseSync(path.join(temp,'data/training-engine.sqlite'));
 await req(rt,outsider.token,{},'PUT',403);await req(responseRoute,outsider.token,{},'POST',403);await req(rt,at,{},'PUT',401);await req(responseRoute,at,{},'POST',401);
 const values={single_choice:'One',multiple_choice:['One','Two'],rating:4,confidence:4,reaction:'One',short_answer:'Short evidence',long_answer:'Long evidence',numeric_answer:3,checklist:['Read','Verify'],reflection:'Reflection evidence',self_assessment:'Self assessment evidence',true_false:true};
 const results=[];
 for(const [branch,student] of [[0,one],[1,two]]){
  const p=m.paths[branch],token=student.token;await req(rt,token,{module_id:m.id,path_id:p.id,guided_action:'choose'},'PUT');
  for(const [index,reference] of p.steps.entries()){
   const step=m.step_templates[reference.use_template];let st=(await req(rt,token)).state;assert.equal(st.step_index,index);count++;
   const body=(action,evidence={},extra={})=>({module_id:m.id,path_id:p.id,expected_step_id:reference.id,expected_revision:st.revision,guided_action:action,step_data:{evidence},client_write_id:mutation(),...extra});
   if(index===0){
    const original=body('save',{}),saved=await req(rt,token,original,'PUT');assert.equal(saved.mutation_id,original.client_write_id);count++;
    const retries=await Promise.all([req(rt,token,original,'PUT'),req(rt,token,original,'PUT')]);assert.ok(retries.every(r=>r.replayed&&r.revision===saved.revision));count++;
    await req(rt,token,{...original,step_data:{evidence:{acknowledged:true}}},'PUT',409);
    st=(await req(rt,token)).state;
    const stale=body('save',{}),fresh=body('save',{acknowledged:true});await req(rt,token,fresh,'PUT');await req(rt,token,stale,'PUT',409);st=(await req(rt,token)).state;
    await req(rt,token,body('save',{}, {path_id:m.paths[1-branch].id}),'PUT',409);
    // A queued old mutation must remain replayable after many newer confirmed writes.
    for(let i=0;i<66;i++){const reply=await req(rt,token,body('save',{acknowledged:true}),'PUT');st.revision=reply.revision}
    const old=await req(rt,token,original,'PUT');assert.equal(old.revision,saved.revision);assert.equal((await req(rt,token)).state.revision,st.revision);count+=2;
   }
   let evidence={};const kind=step.completion.type;
   if(['acknowledge','external'].includes(kind))evidence={acknowledged:true};else if(kind==='text')evidence={text:'Saved evidence'};else if(kind==='url')evidence={text:'https://example.com/evidence'};else if(kind==='checklist')evidence={checked:[0,1]};else if(['file','image'].includes(kind)){
    const bytes=kind==='file'?Buffer.from('My canonical file evidence'):fs.readFileSync(new URL('./fixtures/report-logo.png',import.meta.url));
    const upload=await fetch(base+`/api/submissions/${cid}`,{method:'POST',headers:{'X-Session-Token':token,'X-Submission-Kind':kind,'X-File-Name':kind==='file'?'evidence.txt':'evidence.png','X-Module-Id':m.id,'X-Activity-Id':reference.id,'X-Mission-Id':p.id,'X-Guided-Path-Id':p.id},body:bytes});assert.equal(upload.status,201);evidence={submission_id:(await upload.json()).id};count++;
   }
   if(step.interaction){
    const activity=m.activities.find(a=>a.id===step.interaction.activity_id),answerBody={activity_id:activity.id,module_id:m.id,path_id:p.id,expected_step_id:reference.id,expected_revision:st.revision,client_write_id:mutation(),answer:values[activity.type]};
    await req(responseRoute,token,{activity_id:activity.id,answer:values[activity.type]},'POST',409);
    const reply=await req(responseRoute,token,answerBody),again=await req(responseRoute,token,answerBody);assert.equal(again.replayed,true);assert.equal(again.revision,reply.revision);assert.deepEqual(again.value,values[activity.type]);count+=3;st=(await req(rt,token)).state;
    await req(responseRoute,token,{...answerBody,client_write_id:mutation()},'POST',409);
    await req(responseRoute,token,{...answerBody,client_write_id:mutation(),expected_revision:st.revision,path_id:m.paths[1-branch].id},'POST',409);
    const changed=activity.type==='true_false'?false:activity.type==='multiple_choice'?['Two']:activity.type==='checklist'?['Read']:['rating','confidence','numeric_answer'].includes(activity.type)?2:activity.type==='single_choice'||activity.type==='reaction'?'Two':'Changed evidence';
    const edit={...answerBody,expected_revision:st.revision,client_write_id:mutation(),answer:changed};await req(responseRoute,token,edit);const oldReplay=await req(responseRoute,token,answerBody);assert.deepEqual(oldReplay.value,values[activity.type]);count++;
    const dash=await req('/api/student/dashboard?focused=1&class_id='+cid,token);assert.deepEqual(dash.active.guided_responses[activity.id].value,changed);count++;
    const rows=db.prepare('SELECT COUNT(*) n FROM responses r JOIN activity_instances ai ON ai.id=r.instance_id WHERE r.student_id=? AND ai.class_id=? AND ai.activity_id=?').get(student.user.id,cid,activity.id);assert.equal(rows.n,1);count++;
    st=(await req(rt,token)).state;
   }
   const saved=await req(rt,token,body('save',evidence),'PUT');st.revision=saved.revision;
   const restored=(await req(rt,token)).state;assert.deepEqual(restored.progress.steps[reference.id].evidence,{acknowledged:false,text:'',checked:[],...evidence,...(evidence.submission_id?{name:kind==='file'?'evidence.txt':'evidence.png'}:{})});count++;
   if(index<p.steps.length-1)await req(rt,token,body('finish',evidence),'PUT',409);
   await req(rt,token,body(index===p.steps.length-1?'finish':'next',evidence),'PUT');results.push({path:p.id,step:reference.id,evidence:kind,interaction:step.interaction?.activity_id||null,status:'PASS'});
  }
  const final=(await req(rt,token)).state;assert.equal(final.status,'finished');assert.equal(Object.values(final.progress.steps).filter(s=>s.completed_at).length,p.steps.length);count+=2;
 }
 assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);assert.equal(Object.values(db.prepare('PRAGMA integrity_check').get())[0],'ok');assert.equal(db.prepare('SELECT COUNT(*) n FROM responses r LEFT JOIN activity_instances ai ON ai.id=r.instance_id WHERE ai.id IS NULL').get().n,0);count+=3;
 const duplicates=db.prepare("SELECT class_id,module_id,activity_id,json_extract(definition_json,'$.guided_path_id') p,json_extract(definition_json,'$.guided_step_id') s,COUNT(*) n FROM activity_instances WHERE class_id=? GROUP BY 1,2,3,4,5 HAVING COUNT(*)>1").all(cid);assert.deepEqual(duplicates,[]);count++;
 const report=await req('/api/reports/guided',at);assert.equal(report.evaluations.filter(q=>q.class_title==='Persistence certification').length,12);count++;
 const out=path.resolve('.test-evidence/guided-persistence');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'api-result.json'),JSON.stringify({status:'PASS',assertions:count,routes:results,integrity:'PASS',receipt_count:db.prepare('SELECT COUNT(*) n FROM guided_mutation_receipts').get().n},null,2));db.close();
 console.log('GUIDED_PERSISTENCE_API_PASS',count,'assertions; both paths, all evidence/12 interactions, persistent receipts beyond 64 edits, duplicate/lost/stale replies, authorization, database integrity and analytics');
}catch(error){console.error(logs);throw error}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,200));fs.rmSync(temp,{recursive:true,force:true})}
