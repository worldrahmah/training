import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-v211-legacy-')),port=5050+Math.floor(Math.random()*120);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};const child=spawn(process.execPath,['app/server.mjs'],{cwd:ROOT,env,stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);const base=`http://127.0.0.1:${port}`;
async function wait(){for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,75))}throw new Error(logs)}
async function req(p,{token,method='GET',json,body,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'',d=ct.includes('application/json')?await r.json():await r.text();if(!r.ok){const e=new Error(`${r.status}: ${JSON.stringify(d)}`);e.status=r.status;e.data=d;throw e}return d}
try{
  await wait();
  const admin=await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}});
  const course={format:'training-engine-course',schema_version:'1.0',course:{id:'legacy-linear',version:'1.0',title:'Legacy Linear',language:'en',direction:'ltr',modules:[{id:'m1',title:'Welcome & Interaction',activities:[
    {id:'welcome',type:'presentation',title:'Welcome',content:{heading:'Welcome'}},
    {id:'pulse',type:'poll',title:'Quick pulse',content:{question:'Ready?',options:['Yes','No']}},
    {id:'thought',type:'short_answer',title:'One thought',content:{question:'One thought?'}}
  ],missions:[{id:'mission1',title:'First Practice Mission',steps:[{title:'Do it'}]}]}]}};
  const imp=await req('/api/courses/import',{token:admin.token,method:'POST',body:Buffer.from(JSON.stringify(course)),headers:{'X-File-Name':'legacy.json'}});
  const cl=await req('/api/classes',{token:admin.token,method:'POST',json:{course_version_id:imp.version_id,title:'Legacy Class',capacity:20,trainer_id:admin.user.id,trainers:[{user_id:admin.user.id,assignment_role:'lead'}]}});
  await req(`/api/classes/${cl.id}/activate`,{token:admin.token,method:'POST'});
  let wf=(await req(`/api/live/${cl.id}/workflow`,{token:admin.token})).workflow;
  assert.equal(wf.modules[0].has_workflow,true,'legacy module should receive an implicit workflow');
  assert.equal(wf.modules[0].implicit,true,'workflow should be marked implicit');
  assert.equal(wf.modules[0].nodes.length,4);
  assert.equal(wf.modules[0].nodes[0].title,'Welcome');
  assert.equal(wf.modules[0].nodes[0].status,'next');
  assert.equal(wf.modules[0].nodes[1].status,'upcoming');

  // Simulate the old direct Open action (no workflow_node_id) and prove the new Core still tracks it.
  await req(`/api/live/${cl.id}/launch`,{token:admin.token,method:'POST',json:{module_id:'m1',activity_id:'welcome'}});
  wf=(await req(`/api/live/${cl.id}/workflow`,{token:admin.token})).workflow;
  assert.equal(wf.modules[0].nodes[0].status,'current');
  await req(`/api/live/${cl.id}/clear`,{token:admin.token,method:'POST'});
  wf=(await req(`/api/live/${cl.id}/workflow`,{token:admin.token})).workflow;
  assert.equal(wf.modules[0].nodes[0].status,'completed');
  assert.equal(wf.modules[0].nodes[1].status,'next');

  // Use the strict tracker path for the poll.
  const pollNode=wf.modules[0].nodes[1];
  await req(`/api/live/${cl.id}/launch`,{token:admin.token,method:'POST',json:{module_id:'m1',activity_id:'pulse',workflow_node_id:pollNode.id}});
  wf=(await req(`/api/live/${cl.id}/workflow`,{token:admin.token})).workflow;
  assert.equal(wf.modules[0].nodes[1].status,'current');
  await req(`/api/live/${cl.id}/close`,{token:admin.token,method:'POST',json:{override:true}});
  await req(`/api/live/${cl.id}/reveal`,{token:admin.token,method:'POST'});
  await req(`/api/live/${cl.id}/clear`,{token:admin.token,method:'POST'});
  wf=(await req(`/api/live/${cl.id}/workflow`,{token:admin.token})).workflow;
  assert.equal(wf.modules[0].nodes[1].status,'completed');
  assert.equal(wf.modules[0].nodes[2].status,'next');
  assert.equal(wf.modules[0].nodes[3].status,'upcoming');

  console.log('LEGACY_WORKFLOW_TRACKER_PASS');
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,200));fs.rmSync(tmp,{recursive:true,force:true})}
