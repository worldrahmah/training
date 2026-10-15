import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import net from 'node:net';import {once} from 'node:events';import {spawn,execFileSync} from 'node:child_process';
import {CAPABILITY_REGISTRY as registry} from '../app/lib/registry.mjs';import {parseCoursePackage} from '../app/lib/course-package.mjs';
const root=path.resolve(import.meta.dirname,'..'),kit=path.join(root,'course-creator-kit'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'one-kit-'));let child;let assertions=0;
const eq=(a,b)=>{assert.equal(a,b);assertions++};
try{
 execFileSync(process.execPath,['tools/build-course-creator-kit.mjs','--check'],{cwd:root,stdio:'pipe'});assertions++;
 for(const line of fs.readFileSync(path.join(kit,'SHA256SUMS.txt'),'utf8').trim().split('\n')){const [sha,name]=line.split('  ');eq(crypto.createHash('sha256').update(fs.readFileSync(path.join(kit,name))).digest('hex'),sha)}
 globalThis.localStorage={getItem:()=>null,setItem:()=>{}};globalThis.document={documentElement:{dataset:{}}};
 const labels=await import('../app/public/activity-labels.js'),i18n=await import('../app/public/i18n.js');
 for(const locale of ['en','ar']){i18n.setLocale(locale);for(const s of registry.activities){eq(labels.activityLabel(s.id),locale==='ar'?s.label_ar:s.label);assert.ok(locale==='en'?/^[A-Z0-9]/.test(s.label):/[\u0600-\u06ff]/.test(s.label_ar));assertions++}}
 for(const file of fs.readdirSync(path.join(root,'app/public')).filter(n=>/\.(js|html)$/.test(n))){assert.doesNotMatch(fs.readFileSync(path.join(root,'app/public',file),'utf8'),/TRAIN1234|D1001|Default trainer account:|Demo account:/);assertions++}
 const answers={title:'Course',language:'en',audience:'Registered learners',objectives:'Demonstrate a skill',timing:'60 minutes',delivery:'trainer-paced',assessment:'Formative; reveal after close',assets:'Owned local PNG',privacy:'Private cues only in trainer',milestones:'One\nTwo',first_milestone:'One'};const intake=path.join(tmp,'answers.json');fs.writeFileSync(intake,JSON.stringify(answers));execFileSync(process.execPath,[path.join(kit,'tools/intake-wizard.mjs'),path.join(tmp,'intake'),'--answers',intake],{stdio:'pipe'});eq(JSON.parse(fs.readFileSync(path.join(tmp,'intake/intake.json'))).scope,'ONE_MILESTONE_ONLY');
 const rebuilt=path.join(tmp,'repack.course.zip');execFileSync(process.execPath,[path.join(kit,'tools/package-course.mjs'),path.join(kit,'examples/catalog-en'),rebuilt],{stdio:'pipe'});eq(parseCoursePackage(fs.readFileSync(rebuilt),'repack.zip').ok,true);execFileSync(process.execPath,[path.join(kit,'tools/validate-course.mjs'),rebuilt],{stdio:'pipe'});assertions++;
 const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));const base=`http://127.0.0.1:${port}`;
 child=spawn(process.execPath,['app/server.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),TRAINING_ENGINE_TEST_ACCOUNTS:'1',...Object.fromEntries(['DATA','STORAGE','BACKUP','EXPORT'].map(k=>[`TRAINING_ENGINE_${k}_DIR`,path.join(tmp,k.toLowerCase())]))},stdio:['ignore','pipe','pipe']});let logs='';child.stderr.on('data',d=>logs+=d);child.stdout.on('data',()=>{});
 for(let i=0;i<200;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}if(child.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,50))}
 let token;async function req(p,{json,body,method='GET',headers={}}={}){if(token)headers['X-Session-Token']=token;if(json!==undefined){headers['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers,body}),data=await r.json();assert.ok(r.ok,`${p}: ${r.status} ${data.message||''}`);assertions++;return data}
 token=(await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}})).token;
 const results=[];
 for(const name of ['catalog-en','catalog-ar','workflow-paths']){
  const bytes=fs.readFileSync(path.join(kit,`examples/${name}.course.zip`)),parsed=parseCoursePackage(bytes,name+'.zip');eq(parsed.ok,true);const types=new Set(parsed.course.course.modules.flatMap(m=>(m.activities||[]).map(a=>a.type)));if(name.startsWith('catalog'))eq(types.size,36);
  const imported=await req('/api/courses/import',{method:'POST',body:bytes,headers:{'X-File-Name':name+'.course.zip'}});
  const draft=await req(`/api/courses/${imported.course_id}/drafts`,{method:'POST',json:{source_version_id:imported.version_id,version:'1.1-review'}});
  const check=await req('/api/courses/validate',{method:'POST',body:Buffer.from(JSON.stringify((await req(`/api/course-versions/${draft.version_id}/draft`)).content)),headers:{'X-File-Name':'course.json'}});eq(check.ok,true);await req(`/api/course-versions/${draft.version_id}/simulate`);
  await req(`/api/course-versions/${draft.version_id}/publish`,{method:'POST'});
  const cl=await req('/api/classes',{method:'POST',json:{course_version_id:draft.version_id,title:'Kit sample rehearsal '+name,capacity:5}});await req(`/api/classes/${cl.id}/activate`,{method:'POST'});
  const module=parsed.course.course.modules.find(m=>m.activities?.length),activity=module.activities[0];await req(`/api/live/${cl.id}/launch`,{method:'POST',json:{module_id:module.id,activity_id:activity.id}});const live=await req(`/api/live?class_id=${cl.id}`);eq(live.live.item.id,activity.id);
  const pair=await req(`/api/live/${cl.id}/projector-pair`,{method:'POST',json:{}}),publicView=await (await fetch(`${base}/api/live?class_id=${cl.id}&pair=${encodeURIComponent(pair.pair_token)}`)).json();assert.ok(!publicView.live.item.trainer);assertions++;
  if(name.startsWith('catalog')){const asset=await fetch(`${base}/api/assets/${draft.version_id}/assets/map.png`,{headers:{'X-Projector-Pair':pair.pair_token}});eq(asset.status,200);eq(crypto.createHash('sha256').update(Buffer.from(await asset.arrayBuffer())).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync(path.join(kit,`examples/${name}/assets/map.png`))).digest('hex'));}
  if(name==='catalog-en'){
   const isolation=await req(`/api/courses/${imported.course_id}/drafts`,{method:'POST',json:{source_version_id:imported.version_id,version:'1.2-isolation'}});
   await req(`/api/course-versions/${isolation.version_id}/assets`,{method:'POST',body:Buffer.from('draft-only-replacement'),headers:{'X-Asset-Key':'assets/map.png','Content-Type':'application/octet-stream'}});
   const original=await fetch(`${base}/api/assets/${imported.version_id}/assets/map.png`,{headers:{'X-Session-Token':token}});eq(crypto.createHash('sha256').update(Buffer.from(await original.arrayBuffer())).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync(path.join(kit,'examples/catalog-en/assets/map.png'))).digest('hex'));
  }
  results.push({sample:name,activities:types.size,import:'PASS',draft_validation:'PASS',simulation:'PASS',publication:'PASS',class_launch:'PASS',paired_projector_privacy:'PASS'});
 }
 if(process.env.ONE_KIT_EVIDENCE){fs.mkdirSync(path.dirname(process.env.ONE_KIT_EVIDENCE),{recursive:true});fs.writeFileSync(process.env.ONE_KIT_EVIDENCE,JSON.stringify({status:'PASS',assertions,samples:results},null,2)+'\n')}
 console.log(`RC1R9_CONTRACT_PASS ${assertions} assertions; 36 bilingual labels, no public demo credentials, portable intake/packaging, three real import/Draft/publication/launch paths`);
}finally{if(child){const end=once(child,'exit');child.kill('SIGTERM');await end}fs.rmSync(tmp,{recursive:true,force:true})}
