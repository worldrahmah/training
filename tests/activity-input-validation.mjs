import {storedScore} from './score-evidence.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'te-input-validation-')),port=8450+Math.floor(Math.random()*300),env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')},base=`http://127.0.0.1:${port}`;let child;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'})}async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));child=null}}async function wait(){for(let i=0;i<200;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('server start timeout')}
async function raw(p,{token,method='GET',json,headers={},body}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'',d=ct.includes('application/json')?await r.json():await r.text();return {status:r.status,data:d}}
async function req(p,o={}){const r=await raw(p,o);if(r.status<200||r.status>=300)throw Object.assign(Error(`${o.method||'GET'} ${p} -> ${r.status}: ${typeof r.data==='string'?r.data:JSON.stringify(r.data)}`),{status:r.status,data:r.data});return r.data}const login=(u,p)=>req('/api/login',{method:'POST',json:{username:u,password:p}});
const A=(id,type,extra={})=>({id,type,title:id,content:{question:id,blocks:[],...(extra.content||{})},...extra});
const acts=[
 A('present','presentation'),
 A('poll','poll',{content:{options:['A','B']}}),
 A('single','single_choice',{content:{options:['A','B'],correct_answer:'A'}}),
 A('multi','multiple_choice',{content:{options:['A','B','C'],correct_answers:['A','C']}}),
 A('tf','true_false',{content:{options:['صحيح','خطأ'],correct_answer:true}}),
 A('num','numeric_answer',{content:{correct_answer:10,tolerance:.5,min:0,max:20,step:.1}}),
 A('rating','rating',{content:{min:1,max:5,step:.5}}),
 A('rank','ranking',{content:{options:['A','B','C']}}),
 A('check','checklist',{content:{items:['One','Two']}}),
 A('url','url_submission'),
 A('file','file_submission'),
 A('image','image_submission'),
 A('match','matching',{matching:{pairs:[{id:'p1',left:'One',right:'1'},{id:'p2',left:'Two',right:'2'}]}}),
 A('fill','fill_blanks',{fill_blanks:{blanks:[{id:'b1',label:'First',answers:['alpha']},{id:'b2',label:'Second',answers:['beta']}]}}),
 A('sort','sorting',{sorting:{items:['A','B','C'],correct_order:['A','B','C']}}),
 A('prio','prioritization_100',{content:{options:['A','B','C']},prioritization:{budget:100,max_per_option:100,require_full_allocation:true}}),
 A('imgint','image_interaction',{image_interaction:{mode:'label',asset:'assets/map.png',max_points:2,targets:[{id:'n',label:'North',x:20,y:20,tolerance:10},{id:'s',label:'South',x:80,y:80,tolerance:10}]}}),
 A('video','interactive_video',{interactive_video:{asset:'assets/video.mp4',checkpoints:[{id:'q1',time_seconds:1,prompt:'Pick',type:'single_choice',options:['A','B'],correct_answer:'A'},{id:'q2',time_seconds:2,prompt:'Explain',type:'short_answer'},{id:'q3',time_seconds:3,prompt:'Confidence',type:'confidence'}]}})
];
function course(){return {format:'training-engine-course',schema_version:'2.0',course:{id:'input-validation',version:'1.0',title:'Input Validation',language:'en',direction:'ltr',modules:[{id:'m1',title:'M1',activities:acts,missions:[],paths:[]}]}}}
async function launch(t,c,id){return req(`/api/live/${c}/launch`,{token:t,method:'POST',json:{module_id:'m1',activity_id:id}})}async function clear(t,c){return req(`/api/live/${c}/clear`,{token:t,method:'POST'})}
async function expect(t,i,answer,status,message){const r=await raw(`/api/responses/${i}`,{token:t,method:'POST',json:{answer}});assert.equal(r.status,status,message||JSON.stringify(r.data));return r}
try{
 start();await wait();const tr=await login('TRAINER','TRAIN1234'),st=await login('DEMO01','D1001'),students=(await req('/api/students',{token:tr.token})).students,u=students.find(x=>x.username==='DEMO01');
 const r=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'input.course.json'},body:Buffer.from(JSON.stringify(course()))}),imp=await r.json();assert.equal(r.status,201,JSON.stringify(imp));const cl=await req('/api/classes',{token:tr.token,method:'POST',json:{course_version_id:imp.version_id,title:'Input Validation',capacity:10,participant_ids:[u.id],status:'planned'}}),cid=cl.id;await req(`/api/classes/${cid}/activate`,{token:tr.token,method:'POST'});
 let x=await launch(tr.token,cid,'present');await expect(st.token,x.instance_id,'anything',409,'no-input activity must reject participant response');await clear(tr.token,cid);
 x=await launch(tr.token,cid,'poll');await expect(st.token,x.instance_id,'Z',400);await expect(st.token,x.instance_id,'A',200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'multi');await expect(st.token,x.instance_id,[],400);await expect(st.token,x.instance_id,['A','Z'],400);await expect(st.token,x.instance_id,['A','C'],200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'tf');let ok=await expect(st.token,x.instance_id,'صحيح',200);assert.ok(Number(storedScore(tmp,x.instance_id,st.user.id))>0,'Arabic semantic True must score as authored True');await req(`/api/live/${cid}/close`,{token:tr.token,method:'POST'});await req(`/api/live/${cid}/reveal`,{token:tr.token,method:'POST'});let tfLive=(await req(`/api/live?class_id=${cid}`,{token:tr.token})).live;assert.equal(tfLive.results.summary.counts['صحيح'],1,'Arabic True label must aggregate under authored display label');assert.equal(tfLive.results.summary.assessment_meta.correct_answer_display,'صحيح','Arabic authored True label must be revealed as correct answer');await clear(tr.token,cid);
 x=await launch(tr.token,cid,'num');await expect(st.token,x.instance_id,25,400);await expect(st.token,x.instance_id,10.5,200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'rating');await expect(st.token,x.instance_id,1.25,400);await expect(st.token,x.instance_id,1.5,200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'rank');await expect(st.token,x.instance_id,{A:1,B:1,C:3},400);await expect(st.token,x.instance_id,{A:2,B:1,C:3},200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'check');await expect(st.token,x.instance_id,['Unknown'],400);await expect(st.token,x.instance_id,['One'],200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'url');await expect(st.token,x.instance_id,'javascript:alert(1)',400);await expect(st.token,x.instance_id,'https://example.com/path',200);await clear(tr.token,cid);
 for(const id of ['file','image']){x=await launch(tr.token,cid,id);await expect(st.token,x.instance_id,{submission_id:999999,name:'fake'},400,`${id}: fake upload id must fail`);await clear(tr.token,cid)}
 x=await launch(tr.token,cid,'match');await expect(st.token,x.instance_id,{p1:'1'},400);await expect(st.token,x.instance_id,{p1:'1',p2:'2'},200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'fill');await expect(st.token,x.instance_id,{b1:'alpha'},400);await expect(st.token,x.instance_id,{b1:'alpha',b2:'beta'},200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'sort');await expect(st.token,x.instance_id,['A','A','C'],400);await expect(st.token,x.instance_id,['A','B','C'],200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'prio');await expect(st.token,x.instance_id,{A:101,B:0,C:0},400);await expect(st.token,x.instance_id,{A:30,B:30,C:40},200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'imgint');await expect(st.token,x.instance_id,{points:[{x:20,y:20,label:'Unknown'}]},400);await expect(st.token,x.instance_id,{points:[{x:20,y:20,label:'North'}]},200);await clear(tr.token,cid);
 x=await launch(tr.token,cid,'video');await expect(st.token,x.instance_id,{q1:'Z',q2:'why',q3:3},400);await expect(st.token,x.instance_id,{q1:'A',q2:'why',q3:3},200);await clear(tr.token,cid);
 console.log('ACTIVITY_INPUT_VALIDATION_PASS');
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
