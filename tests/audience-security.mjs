import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const ROOT=path.resolve(import.meta.dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'one-audience-')),port=16000+Math.floor(Math.random()*1000),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')},stdio:'ignore'});
async function raw(p,token,body){const r=await fetch(base+p,{method:body===undefined?'GET':'POST',headers:{...(token?{'X-Session-Token':token}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
async function req(p,token,body){const r=await raw(p,token,body);assert.ok(r.status>=200&&r.status<300,`${p}: ${r.status} ${JSON.stringify(r.data)}`);return r.data}
const note={cue:'PRIVATE-CUE',explanation:'PRIVATE-EXPLANATION',expected_answer:'PRIVATE-EXPECTED',talking_points:['PRIVATE-TALK'],common_mistakes:['PRIVATE-MISTAKE'],transition:'PRIVATE-TRANSITION'};
const a=(id,type,extra)=>({id,type,title:id,trainer:note,content:{question:id},...extra});
const activities=[a('choice','single_choice',{content:{question:'Choose',options:['A','B'],correct_answer:'B'},score:{correct:10}}),a('match','matching',{matching:{pairs:[{id:'p1',left:'CPU',right:'Processor'},{id:'p2',left:'RAM',right:'Memory'}]}}),a('fill','fill_blanks',{fill_blanks:{blanks:[{id:'b1',label:'AI',answers:['Artificial Intelligence']}]}}),a('sort','sorting',{sorting:{items:['Plan','Build','Test'],correct_order:['Plan','Build','Test']}}),a('image','image_interaction',{image_interaction:{mode:'label',asset:'assets/map.png',targets:[{id:'t',label:'Target',x:20,y:80,tolerance:10}]}}),a('video','interactive_video',{interactive_video:{asset:'assets/video.mp4',checkpoints:[{id:'cp',time_seconds:1,type:'single_choice',prompt:'Choose',options:['A','B'],correct_answer:'B'}]}})];
const course={format:'training-engine-course',schema_version:'2.0',course:{id:'audience-security',version:'1',title:'Audience privacy',language:'en',direction:'ltr',modules:[{id:'m',title:'Privacy',activities}]}};
function privateAbsent(value){assert.ok(!JSON.stringify(value).includes('PRIVATE-'),'Trainer fields disclosed')}
function hidden(item){privateAbsent(item);assert.equal(item.content?.correct_answer,undefined);assert.equal(item.matching?.pairs?.[0]?.right,undefined);assert.equal(item.fill_blanks?.blanks?.[0]?.answers,undefined);assert.equal(item.sorting?.correct_order,undefined);assert.equal(item.image_interaction?.targets?.[0]?.x,undefined);assert.equal(item.interactive_video?.checkpoints?.[0]?.correct_answer,undefined);}
try{
  let ready=false;for(let i=0;i<150;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,'server starts');
  const admin=await req('/api/login',null,{username:'TRAINER',password:'TRAIN1234'}),student=await req('/api/login',null,{username:'DEMO01',password:'D1001'}),at=admin.token,st=student.token;
  const staff=await req('/api/staff',at,{username:'SCOPED',password:'ScopedTest123!',display_name:'Scoped Trainer',staff_role:'trainer'}),trainer=await req('/api/login',null,{username:'SCOPED',password:'ScopedTest123!'}),tt=trainer.token;
  const response=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':at,'X-File-Name':'privacy.course.json'},body:JSON.stringify(course)});assert.equal(response.status,201);const imp=await response.json();
  const c=await req('/api/classes',at,{course_version_id:imp.version_id,title:'Assigned',participant_ids:[student.user.id]}),other=await req('/api/classes',at,{course_version_id:imp.version_id,title:'Unassigned'}),cid=c.id;
  await req(`/api/classes/${cid}/trainers`,at,{trainers:[{user_id:staff.id,assignment_role:'lead'}]});await req(`/api/classes/${cid}/activate`,tt,{});
  const pair=(await req(`/api/live/${cid}/projector-pair`,tt,{})).pair_token;
  for(const item of activities){
    await req(`/api/live/${cid}/launch`,tt,{module_id:'m',activity_id:item.id});
    const learner=(await req(`/api/student/dashboard?class_id=${cid}`,st)).active,projector=(await req(`/api/live?class_id=${cid}&pair=${pair}`)).live;
    hidden(learner.item);hidden(projector.item);
    const privileged=(await req(`/api/live?class_id=${cid}`,tt)).live;assert.equal(privileged.item.trainer.cue,note.cue);
    if(item.type==='matching'){assert.equal(learner.item.matching.choices.length,2);assert.equal(learner.item.matching.pairs.length,2)}
    if(item.id==='choice'){
      const submitted=await req(`/api/responses/${learner.instance.id}`,st,{answer:'B'});assert.equal(submitted.submitted,true);assert.equal(submitted.score,undefined);assert.equal(submitted.challenge_bonus,undefined);
      const before=await req(`/api/student/dashboard?class_id=${cid}`,st);assert.equal(before.progress.find(x=>x.class_id===cid).score,0);
      await req(`/api/live/${cid}/close`,tt,{});await req(`/api/live/${cid}/reveal`,tt,{});
      const after=(await req(`/api/student/dashboard?class_id=${cid}`,st)).active;privateAbsent(after);assert.equal(after.personal_feedback.correct,true);assert.equal(after.personal_feedback.correct_answer_display,'B');assert.equal(after.personal_feedback.explanation,'');
      const explain=await raw(`/api/live/${cid}/explain`,tt,{});assert.equal(explain.status,409,'Private notes cannot serve as public explanation');
      await req(`/api/live/${cid}/projector-result`,tt,{instance_id:learner.instance.id}).catch(e=>{throw e});
      privateAbsent((await req(`/api/live?class_id=${cid}&pair=${pair}`)).live);
    }
    await req(`/api/live/${cid}/clear`,tt,{});
  }
  assert.equal((await raw(`/api/live/${other.id}/analytics`,tt)).status,403);
  const scoped=(await req(`/api/live/${cid}/analytics`,tt)).analytics.cohort_comparison;assert.ok(scoped.some(x=>x.class_id===cid));assert.ok(scoped.every(x=>x.class_id!==other.id));
  assert.ok((await req(`/api/live/${cid}/analytics`,at)).analytics.cohort_comparison.some(x=>x.class_id===other.id),'Admin retains authorized full comparison');
  await fetch(base+`/api/live/${cid}/delivery`,{method:'PATCH',headers:{'X-Session-Token':tt,'Content-Type':'application/json'},body:JSON.stringify({delivery_mode:'participant_paced'})}).then(async r=>assert.ok(r.ok,await r.text()));
  hidden((await req(`/api/student/dashboard?class_id=${cid}`,st)).active.item);
  console.log('AUDIENCE_SECURITY_PASS 6 solution families, private guidance, pre-reveal score, recall, scoped cohorts, paced delivery');
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));fs.rmSync(tmp,{recursive:true,force:true})}
