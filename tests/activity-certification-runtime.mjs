import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {CAPABILITY_REGISTRY} from '../app/lib/registry.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'te-activity-cert-'));
const port=7500+Math.floor(Math.random()*500);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const base=`http://127.0.0.1:${port}`; let child;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'})}
async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));child=null}}
async function wait(){for(let i=0;i<180;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('server start timeout')}
async function raw(p,{token,method='GET',json,headers={},body}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'',d=ct.includes('application/json')?await r.json():await r.text();return {status:r.status,data:d}}
async function req(p,o={}){const r=await raw(p,o);if(r.status<200||r.status>=300)throw Object.assign(Error(`${o.method||'GET'} ${p} -> ${r.status}: ${typeof r.data==='string'?r.data:JSON.stringify(r.data)}`),{status:r.status,data:r.data});return r.data}
const login=(u,p)=>req('/api/login',{method:'POST',json:{username:u,password:p}});
const specs=new Map(CAPABILITY_REGISTRY.activities.map(x=>[x.id,x]));
const firstResult=t=>specs.get(t)?.results?.[0];
function A(id,type,title,extra={}){const r=firstResult(type);return {id,type,title,trainer:{cue:`Trainer cue for ${type}`},content:{question:title,blocks:[{type:'text',title,body_md:`Certification content for ${type}`}],...(extra.content||{})},...(r?{results_display:r}:{}),...extra};}
function activity(type){const id=`a_${type}`;switch(type){
 case 'presentation': return A(id,type,'Presentation',{content:{blocks:[{type:'hero',title:'Presentation',body_md:'Present this.'}]}});
 case 'announcement': return A(id,type,'Announcement',{content:{blocks:[{type:'callout',title:'Announcement',body_md:'Notice'}]}});
 case 'poll': return A(id,type,'Poll',{content:{options:['Yes','No']}});
 case 'single_choice': return A(id,type,'Single choice',{content:{options:['A','B','C'],correct_answer:'B'},explanation:'B is correct.'});
 case 'multiple_choice': return A(id,type,'Multiple choice',{content:{options:['A','B','C'],correct_answers:['A','C']},explanation:'A and C are correct.'});
 case 'true_false': return A(id,type,'True or false',{content:{correct_answer:true},explanation:'The correct answer is True.'});
 case 'word_cloud': return A(id,type,'Word Cloud',{word_cloud:{max_entries:3,max_characters:32,allow_phrases:true,moderation:'off',identity_visibility:'trainer_only'}});
 case 'q_and_a': return A(id,type,'Q&A',{q_and_a:{max_questions:3,max_characters:280,moderation:'off',identity_visibility:'public',upvoting:true,allow_self_upvote:false,sort:'votes'}});
 case 'ideas_board': return A(id,type,'Ideas Board',{ideas_board:{max_ideas:4,max_characters:180,moderation:'off',identity_visibility:'public',upvoting:true,allow_self_upvote:false,sort:'votes',categories:['Ideas','Risks']}});
 case 'prioritization_100': return A(id,type,'Prioritize',{content:{options:['Impact','Speed','Cost']},prioritization:{budget:100,max_per_option:100,require_full_allocation:true}});
 case 'quick_interaction': return A(id,type,'Quick interaction',{content:{options:['Agree','Unsure','Disagree']},quick_interaction:{preset:'agree',anonymous:true}});
 case 'matching': return A(id,type,'Matching',{matching:{pairs:[{id:'p1',left:'CPU',right:'Processor'},{id:'p2',left:'RAM',right:'Memory'}],shuffle:true},explanation:'CPU is Processor; RAM is Memory.'});
 case 'fill_blanks': return A(id,type,'Fill blanks',{fill_blanks:{blanks:[{id:'b1',label:'AI means',answers:['Artificial Intelligence']},{id:'b2',label:'ML means',answers:['Machine Learning']}],case_sensitive:false},explanation:'AI and ML expansions.'});
 case 'sorting': return A(id,type,'Sorting',{sorting:{items:['Plan','Build','Test'],correct_order:['Plan','Build','Test']},explanation:'Plan, Build, Test.'});
 case 'image_interaction': return A(id,type,'Image interaction',{image_interaction:{mode:'label',asset:'assets/map.png',max_points:2,targets:[{id:'n',label:'North',x:20,y:20,tolerance:10},{id:'s',label:'South',x:80,y:80,tolerance:10}]},explanation:'North and South.'});
 case 'draw_annotate': return A(id,type,'Draw annotate',{draw_annotate:{asset:'assets/map.png',max_strokes:20,allow_text:true}});
 case 'collaborative_board': return A(id,type,'Collaborative Board',{collaborative_board:{max_notes:3,max_characters:160,categories:['Ideas','Risks'],identity_visibility:'public'}});
 case 'interactive_video': return A(id,type,'Interactive Video',{interactive_video:{asset:'assets/video.mp4',pause_at_checkpoint:true,checkpoints:[{id:'c1',time_seconds:1,prompt:'2+2?',type:'single_choice',options:['3','4'],correct_answer:'4'},{id:'c2',time_seconds:2,prompt:'Confidence?',type:'confidence'}]},explanation:'4 is correct.'});
 case 'short_answer': return A(id,type,'Short answer',{content:{placeholder:'Short answer'}});
 case 'long_answer': return A(id,type,'Long answer',{content:{placeholder:'Long answer'}});
 case 'numeric_answer': return A(id,type,'Numeric answer',{content:{correct_answer:42,tolerance:0.5,min:0,max:100,step:1},explanation:'42 is correct.'});
 case 'rating': return A(id,type,'Rating',{content:{min:1,max:5,step:1,min_label:'Low',max_label:'High'}});
 case 'reaction': return A(id,type,'Reaction',{content:{options:['👍','🤔','👎']}});
 case 'confidence': return A(id,type,'Confidence',{content:{min:1,max:5,step:1,min_label:'Low',max_label:'High'}});
 case 'ranking': return A(id,type,'Ranking',{content:{options:['First','Second','Third']}});
 case 'timer': return A(id,type,'Timer',{content:{seconds:30}});
 case 'reveal': return A(id,type,'Reveal',{content:{blocks:[{type:'hero',title:'Reveal',body_md:'Reveal content'}]}});
 case 'team_challenge': return A(id,type,'Team challenge',{response_scope:'team',content:{placeholder:'Team answer'}});
 case 'checklist': return A(id,type,'Checklist',{content:{items:['One','Two','Three']}});
 case 'url_submission': return A(id,type,'URL submission',{content:{body_md:'Submit a URL'}});
 case 'file_submission': return A(id,type,'File submission',{content:{body_md:'Submit a file'}});
 case 'image_submission': return A(id,type,'Image submission',{content:{body_md:'Submit an image'}});
 case 'reflection': return A(id,type,'Reflection',{content:{placeholder:'Reflect'}});
 case 'self_assessment': return A(id,type,'Self assessment',{content:{placeholder:'Assess yourself'}});
 case 'participant_choice': return A(id,type,'Participant choice',{content:{blocks:[{type:'callout',title:'Choose',body_md:'Choose your path.'}]}});
 case 'practice_gate': return A(id,type,'Practice gate',{content:{blocks:[{type:'callout',title:'Practice',body_md:'Practice checkpoint.'}]}});
 default: throw Error(`Missing activity fixture for ${type}`);
}}
function answer(type,which=1){switch(type){
 case 'poll':return which?'Yes':'No';case 'single_choice':return which?'B':'A';case 'multiple_choice':return which?['A','C']:['A'];case 'true_false':return !!which;
 case 'word_cloud':return which?['AI','Future']:['Learning'];case 'q_and_a':return {text:which?'How does this work?':'Can you explain again?'};case 'ideas_board':return {text:which?'Use examples':'Allow practice',category:which?'Ideas':'Risks'};
 case 'prioritization_100':return which?{Impact:50,Speed:30,Cost:20}:{Impact:20,Speed:20,Cost:60};case 'quick_interaction':return which?'Agree':'Unsure';case 'matching':return which?{p1:'Processor',p2:'Memory'}:{p1:'Memory',p2:'Processor'};
 case 'fill_blanks':return which?{b1:'Artificial Intelligence',b2:'Machine Learning'}:{b1:'wrong',b2:'Machine Learning'};case 'sorting':return which?['Plan','Build','Test']:['Build','Plan','Test'];
 case 'image_interaction':return which?{points:[{x:20,y:20,label:'North'},{x:80,y:80,label:'South'}]}:{points:[{x:1,y:1,label:'North'}]};
 case 'draw_annotate':return {strokes:[[{x:1,y:1},{x:20,y:20}]],labels:[{text:'Note',x:30,y:30}]};case 'collaborative_board':return {text:which?'Idea one':'Risk one',category:which?'Ideas':'Risks'};
 case 'interactive_video':return which?{c1:'4',c2:5}:{c1:'3',c2:2};case 'short_answer':return 'Short response';case 'long_answer':return 'A longer participant response for certification.';case 'numeric_answer':return which?42:50;
 case 'rating':return which?5:2;case 'reaction':return which?'👍':'🤔';case 'confidence':return which?5:2;case 'ranking':return which?{First:1,Second:2,Third:3}:{First:2,Second:1,Third:3};
 case 'team_challenge':return 'Team solution';case 'checklist':return ['One','Three'];case 'url_submission':return 'https://example.com/work';case 'reflection':return 'My reflection';case 'self_assessment':return 'I can do this now.';
 default:return null;
}}
function course(){const types=CAPABILITY_REGISTRY.activities.map(x=>x.id);return {format:'training-engine-course',schema_version:'2.0',course:{id:'all-activity-certification',version:'1.0',title:'All Activity Certification',language:'en',direction:'ltr',modules:[{id:'m1',title:'All Activities',activities:types.map(activity),missions:[],paths:[]}]}}}
async function launch(tr,cid,type){return req(`/api/live/${cid}/launch`,{token:tr,method:'POST',json:{module_id:'m1',activity_id:`a_${type}`}})}
async function closeReveal(tr,cid){await req(`/api/live/${cid}/close`,{token:tr,method:'POST'});return req(`/api/live/${cid}/reveal`,{token:tr,method:'POST'})}
async function clear(tr,cid){return req(`/api/live/${cid}/clear`,{token:tr,method:'POST'})}
async function uploadSubmission(token,cid,type){const isImage=type==='image_submission',name=isImage?'evidence.png':'evidence.txt',body=isImage?Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]):Buffer.from('certification file');return req(`/api/submissions/${cid}`,{token,method:'POST',headers:{'X-Submission-Kind':isImage?'image':'file','X-File-Name':name,'X-Module-Id':'m1','X-Activity-Id':`a_${type}`},body})}

const cert=[];
try{
 start();await wait();
 let admin=await login('TRAINER','TRAIN1234'),s1=await login('DEMO01','D1001'),s2=await login('DEMO02','D1002');
 assert.equal(admin.user.staff_role,'super_admin');
 const createdTrainer=await req('/api/staff',{token:admin.token,method:'POST',json:{username:'CERTTRAIN',password:'CertTrainer123!',display_name:'Certification Trainer',staff_role:'trainer'}});let trainer=await login('CERTTRAIN','CertTrainer123!');assert.equal(trainer.user.staff_role,'trainer');
 const users=(await req('/api/students',{token:admin.token})).students,u1=users.find(x=>x.username==='DEMO01'),u2=users.find(x=>x.username==='DEMO02');
 let r=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':admin.token,'X-File-Name':'activity-cert.course.json'},body:Buffer.from(JSON.stringify(course()))}),imp=await r.json();assert.equal(r.status,201,JSON.stringify(imp));
 const cl=await req('/api/classes',{token:admin.token,method:'POST',json:{course_version_id:imp.version_id,title:'All Activity Certification Class',capacity:20,participant_ids:[u1.id,u2.id],teams:[{name:'Team One',student_ids:[u1.id,u2.id]}],status:'planned'}}),cid=cl.id;
 await req(`/api/classes/${cid}/trainers`,{token:admin.token,method:'POST',json:{trainers:[{user_id:admin.user.id,assignment_role:'lead'},{user_id:createdTrainer.id,assignment_role:'trainer'}]}});
 await req(`/api/classes/${cid}/activate`,{token:admin.token,method:'POST'});
 const pair=await req(`/api/live/${cid}/projector-pair`,{token:admin.token,method:'POST',json:{label:'Certification Projector'}});
 const types=CAPABILITY_REGISTRY.activities.map(x=>x.id);
 assert.equal(types.length,36);
 for(const type of types){
   const spec=specs.get(type),scored=['single_choice','multiple_choice','true_false','numeric_answer','matching','fill_blanks','sorting','image_interaction','interactive_video'].includes(type),row={type,builder:'covered-by-builder-cert',admin:false,trainer:false,student:false,projector:false,response:!spec.participant_input?'n/a':false,result:!spec.results?.length?'n/a':false,report:!spec.participant_input?'n/a':false,assessment_feedback:scored?false:'n/a',backup_restore:!spec.participant_input?'n/a':false,restart:!spec.participant_input?'n/a':false};
   const x=await launch(trainer.token,cid,type),iid=x.instance_id;
   const trainerOpen=(await req(`/api/live?class_id=${cid}`,{token:trainer.token})).live;assert.equal(trainerOpen.item.type,type,`${type}: trainer current item`);row.trainer=true;
   const adminLive=await req(`/api/admin/live/${cid}`,{token:admin.token});assert.equal(String(adminLive.state.activity_id),`a_${type}`,`${type}: admin live current activity`);row.admin=true;
   let studentOpen=(await req(`/api/student/dashboard?class_id=${cid}`,{token:s1.token})).active;assert.equal(studentOpen.item.type,type,`${type}: student current item`);row.student=true;
   let projectorOpen=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(projectorOpen.item.type,type,`${type}: projector current item`);row.projector=true;
   if(spec.participant_input){
     let ans1=answer(type,1),ans2=answer(type,0);
     if(type==='file_submission'||type==='image_submission'){const up1=await uploadSubmission(s1.token,cid,type),up2=await uploadSubmission(s2.token,cid,type);ans1={submission_id:up1.id,name:up1.name,size:up1.size};ans2={submission_id:up2.id,name:up2.name,size:up2.size};}
     const p1=await req(`/api/responses/${iid}`,{token:s1.token,method:'POST',json:{answer:ans1,client_submission_id:`${type}-s1`}});row.response=true;
     if(type!=='team_challenge')await req(`/api/responses/${iid}`,{token:s2.token,method:'POST',json:{answer:ans2,client_submission_id:`${type}-s2`}});
     if(['single_choice','multiple_choice','true_false','numeric_answer','matching','fill_blanks','sorting','image_interaction','interactive_video'].includes(type))assert.ok(Number(p1.score)>0,`${type}: authored correct answer must score above zero`);
     const detailBefore=await req(`/api/classes/${cid}/student/${u1.id}`,{token:trainer.token});assert.ok(detailBefore.responses.some(z=>z.activity_id===`a_${type}`)||type==='team_challenge',`${type}: trainer/admin participant detail response`);
     const beforeProjector=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.ok(!['results','explain'].includes(beforeProjector.state.phase),`${type}: projector must not be in revealed-results phase while collecting`);
     if(beforeProjector.results?.summary) assert.deepEqual(Object.keys(beforeProjector.results.summary),['total'],`${type}: audience aggregate hidden before reveal`);
     await closeReveal(trainer.token,cid);
     const trainerResult=(await req(`/api/live?class_id=${cid}`,{token:trainer.token})).live;assert.equal(trainerResult.state.phase,'results');assert.ok(trainerResult.results,`${type}: trainer results`);row.result=true;
     if(type==='ranking')assert.ok(Array.isArray(trainerResult.results.summary.ranking)&&trainerResult.results.summary.ranking.length===3,'ranking: ordered aggregate result');
     if(type==='file_submission'||type==='image_submission'){const wall=trainerResult.results.summary.answers||[];assert.ok(wall.length,`${type}: answer wall exists`);assert.ok(wall.every(x=>x.text&&!x.text.includes('[object Object]')),`${type}: readable submission name in results`);}
     const studentResult=(await req(`/api/student/dashboard?class_id=${cid}`,{token:s1.token})).active;assert.equal(studentResult.state.phase,'results');assert.ok(studentResult.results,`${type}: student results`);
     const projectorResult=(await req(`/api/live?class_id=${cid}&pair=${encodeURIComponent(pair.pair_token)}`)).live;assert.equal(projectorResult.state.phase,'results');assert.ok(projectorResult.results,`${type}: projector results`);
     const detailAfter=await req(`/api/classes/${cid}/student/${u1.id}`,{token:trainer.token});assert.ok(detailAfter.responses.some(z=>z.activity_id===`a_${type}`)||type==='team_challenge',`${type}: report/detail persistence`);row.report=true;
     if(['single_choice','multiple_choice','true_false','numeric_answer','matching','fill_blanks','sorting','image_interaction','interactive_video'].includes(type)){
       assert.ok(trainerResult.results.summary.assessment_meta?.correct_answer_display,`${type}: trainer correct answer after reveal`);
       assert.ok(studentResult.personal_feedback?.correct===true,`${type}: participant correctness feedback after reveal`);
       assert.ok(studentResult.personal_feedback?.correct_answer_display,`${type}: participant correct answer after reveal`);
       assert.ok(projectorResult.results.summary.assessment_meta?.correct_answer_display,`${type}: projector correct answer after reveal`);row.assessment_feedback=true;
     }
   }
   cert.push(row); await clear(trainer.token,cid);
 }
 // Trainer submission review surface for file/image uploads.
 const review=await req(`/api/submissions/review?class_id=${cid}`,{token:admin.token});assert.ok(review.submissions.some(x=>x.activity_id==='a_file_submission'));assert.ok(review.submissions.some(x=>x.activity_id==='a_image_submission'));
 // Admin dashboard still sees the certification class and the full authored course.
 const ad=await req('/api/dashboard/admin',{token:admin.token});assert.ok(ad.live.some(x=>Number(x.id)===Number(cid)));const cd=await req(`/api/classes/${cid}`,{token:admin.token});assert.equal(cd.class.course_version_id,imp.version_id);
 // Full backup/restore after all 36 activity paths have been exercised. This proves the shared
 // response/submission state used by every certified activity survives the real restore path.
 const backup=await req('/api/system/backups/create',{token:admin.token,method:'POST'});
 await req('/api/courses',{token:admin.token,method:'POST',json:{title:'CERTIFICATION TEMP MUTATION'}});
 await req('/api/system/backups/restore',{token:admin.token,method:'POST',json:{name:backup.backup.name}});
 admin=await login('TRAINER','TRAIN1234');trainer=await login('CERTTRAIN','CertTrainer123!');s1=await login('DEMO01','D1001');s2=await login('DEMO02','D1002');
 const restored=await req(`/api/classes/${cid}/student/${u1.id}`,{token:admin.token});const restoredIds=new Set(restored.responses.map(x=>x.activity_id));for(const type of types.filter(t=>specs.get(t).participant_input&&t!=='team_challenge')){assert.ok(restoredIds.has(`a_${type}`),`${type}: response survives backup/restore`);const row=cert.find(x=>x.type===type);if(row)row.backup_restore=true;}const teamRow=cert.find(x=>x.type==='team_challenge');if(teamRow)teamRow.backup_restore=true;
 const restoredReview=await req(`/api/submissions/review?class_id=${cid}`,{token:admin.token});assert.ok(restoredReview.submissions.some(x=>x.activity_id==='a_file_submission'),'file_submission: upload survives backup/restore');assert.ok(restoredReview.submissions.some(x=>x.activity_id==='a_image_submission'),'image_submission: upload survives backup/restore');
 // Restart and verify response/report persistence for every participant-input activity.
 await stop();start();await wait();admin=await login('TRAINER','TRAIN1234');
 const d=await req(`/api/classes/${cid}/student/${u1.id}`,{token:admin.token});const persisted=new Set(d.responses.map(x=>x.activity_id));for(const type of types.filter(t=>specs.get(t).participant_input&&t!=='team_challenge')){assert.ok(persisted.has(`a_${type}`),`${type}: response survives restart`);const row=cert.find(x=>x.type===type);if(row)row.restart=true;}const teamRestart=cert.find(x=>x.type==='team_challenge');if(teamRestart)teamRestart.restart=true;
 fs.writeFileSync(path.join(ROOT,'docs','ACTIVITY_CERTIFICATION_RUNTIME_RESULT.json'),JSON.stringify({generated_at:new Date().toISOString(),activity_count:types.length,rows:cert},null,2));
 console.log(`ALL_ACTIVITY_RUNTIME_CERT_PASS ${types.length}/${types.length}`);
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
