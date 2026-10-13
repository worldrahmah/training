import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'te-assessment-feedback-')),port=7000+Math.floor(Math.random()*500),env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')},base=`http://127.0.0.1:${port}`;let child;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'})}async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));child=null}}async function wait(){for(let i=0;i<150;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('server start timeout')}
async function req(p,{token,method='GET',json,headers={},body}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'',d=ct.includes('application/json')?await r.json():await r.text();if(!r.ok)throw Object.assign(Error(`${method} ${p} -> ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`),{status:r.status,data:d});return d}const login=(u,p)=>req('/api/login',{method:'POST',json:{username:u,password:p}});
const A=(id,type,title,extra={})=>({id,type,title,content:{question:title,blocks:[],...(extra.content||{})},results_display:extra.results_display||undefined,...extra});
function course(){return {format:'training-engine-course',schema_version:'2.0',course:{id:'assessment-feedback-cert',version:'1.0',title:'Assessment Feedback Certification',language:'en',direction:'ltr',modules:[{id:'m1',title:'Assessment',activities:[
 A('tf','true_false','The sky is blue',{content:{correct_answer:true},results_display:'horizontal_bar'}),
 A('sc','single_choice','2+2?',{content:{options:['3','4','5'],correct_answer:'4'},results_display:'bar'}),
 A('mc','multiple_choice','Select vowels',{content:{options:['A','B','E'],correct_answers:['A','E']},results_display:'bar'}),
 A('num','numeric_answer','Pi approx',{content:{correct_answer:3.14,tolerance:.01,min:0,max:10,step:.01},results_display:'bar'}),
 A('match','matching','Match',{matching:{pairs:[{id:'p1',left:'CPU',right:'Processor'},{id:'p2',left:'RAM',right:'Memory'}],shuffle:true},results_display:'assessment'}),
 A('fill','fill_blanks','Fill',{fill_blanks:{blanks:[{id:'b1',label:'AI',answers:['Artificial Intelligence','artificial intelligence']}],case_sensitive:false},results_display:'assessment'}),
 A('sort','sorting','Order',{sorting:{items:['Plan','Build','Test'],correct_order:['Plan','Build','Test']},results_display:'assessment'}),
 A('img','image_interaction','Pin',{image_interaction:{mode:'pin',asset:'assets/map.png',max_points:1,targets:[{id:'t1',label:'Target',x:50,y:50,tolerance:10}]},results_display:'image_heatmap'}),
 A('video','interactive_video','Video',{interactive_video:{asset:'assets/video.mp4',pause_at_checkpoint:true,checkpoints:[{id:'cp1',time_seconds:1,prompt:'2+2?',type:'single_choice',options:['3','4'],correct_answer:'4'}]},results_display:'assessment'})
 ],missions:[],paths:[]}]}}}
const answers={tf:[false,true],sc:['3','4'],mc:[['A'],['A','E']],num:[3.2,3.14],match:[{p1:'Memory',p2:'Processor'},{p1:'Processor',p2:'Memory'}],fill:[{b1:'wrong'},{b1:'artificial intelligence'}],sort:[['Build','Plan','Test'],['Plan','Build','Test']],img:[{points:[{x:1,y:1}]},{points:[{x:50,y:50}]}],video:[{cp1:'3'},{cp1:'4'}]};
try{
 start();await wait();let tr=await login('TRAINER','TRAIN1234'),s1=await login('DEMO01','D1001'),s2=await login('DEMO02','D1002');const users=(await req('/api/students',{token:tr.token})).students,u1=users.find(x=>x.username==='DEMO01'),u2=users.find(x=>x.username==='DEMO02');
 let r=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'assessment.course.json'},body:Buffer.from(JSON.stringify(course()))}),imp=await r.json();assert.equal(r.status,201,JSON.stringify(imp));const cl=await req('/api/classes',{token:tr.token,method:'POST',json:{course_version_id:imp.version_id,title:'Assessment Class',capacity:20,participant_ids:[u1.id,u2.id],status:'planned'}}),cid=cl.id;await req(`/api/classes/${cid}/activate`,{token:tr.token,method:'POST'});const pair=await req(`/api/live/${cid}/projector-pair`,{token:tr.token,method:'POST',json:{label:'Assessment projector'}});
 for(const id of Object.keys(answers)){
   const launch=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'m1',activity_id:id}}),iid=launch.instance_id;
   const a1=await req(`/api/responses/${iid}`,{token:s1.token,method:'POST',json:{answer:answers[id][0]}}),a2=await req(`/api/responses/${iid}`,{token:s2.token,method:'POST',json:{answer:answers[id][1]}});assert.ok(Number(a2.score)>Number(a1.score||0),`${id}: correct answer must score higher than the deliberately wrong/partial answer`);
   const before=(await req(`/api/student/dashboard?class_id=${cid}`,{token:s1.token})).active;assert.equal(before.personal_feedback,undefined,`${id}: personal correctness must be hidden before reveal`);assert.deepEqual(Object.keys(before.results?.summary||{}),['total'],`${id}: audience results must be hidden before reveal`);
   await req(`/api/live/${cid}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${cid}/reveal`,{token:tr.token,method:'POST'});
   const trainer=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(trainer.results.summary.assessment_meta.responses,2,`${id}: trainer assessment response count`);assert.ok(trainer.results.summary.assessment_meta.correct_answer_display,`${id}: correct answer display required`);assert.equal(trainer.results.summary.assessment_meta.correct_responses,1,`${id}: one fully correct response expected`);
   const wrong=(await req(`/api/student/dashboard?class_id=${cid}`,{token:s1.token})).active,correct=(await req(`/api/student/dashboard?class_id=${cid}`,{token:s2.token})).active;assert.equal(wrong.personal_feedback.correct,false,`${id}: wrong/partial participant feedback`);assert.equal(correct.personal_feedback.correct,true,`${id}: correct participant feedback`);assert.ok(wrong.personal_feedback.correct_answer_display,`${id}: participant sees correct answer after reveal`);
   const proj=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.ok(proj.results.summary.assessment_meta.correct_answer_display,`${id}: projector payload receives correct answer after reveal`);assert.equal(proj.results.summary.assessment_meta.correct_responses,1,`${id}: projector aggregate correctness`);
   await req(`/api/live/${cid}/clear`,{token:tr.token,method:'POST'});
 }
 console.log('ASSESSMENT_FEEDBACK_RUNTIME_PASS');
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
