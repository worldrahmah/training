import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const liveSource=fs.readFileSync(path.join(ROOT,'app/public/live.js'),'utf8');
const presentSource=fs.readFileSync(path.join(ROOT,'app/public/present.js'),'utf8');
const serverSource=fs.readFileSync(path.join(ROOT,'app/server.mjs'),'utf8');
assert.match(liveSource,/window\.open\('about:blank','training-engine-projector','popup'\)/,'Projector should open from the direct trainer gesture before async pairing');
assert.doesNotMatch(liveSource,/if\(!w\)await navigator\.clipboard/,'Projector opening must not use clipboard permission as popup fallback');
assert.match(liveSource,/Projector window was blocked\. Allow pop-ups/,'blocked popup needs a truthful action message');
assert.match(presentSource,/pagehide/,'Projector must signal a normal close/navigation');
assert.match(presentSource,/projector-disconnect/,'Projector normal close must clear live presence');
assert.match(serverSource,/PROJECTOR_HEARTBEAT_STALE_SECONDS=40/,'abrupt-loss fallback must be bounded well below the old 120-second stale window');

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-projector-presence-'));
const port=4920+Math.floor(Math.random()*200);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'});
async function wait(){for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,70))}throw Error('server start timeout')}
async function raw(p,{token,method='GET',json,body,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const d=(r.headers.get('content-type')||'').includes('application/json')?await r.json():await r.text();return {status:r.status,data:d}}
async function req(p,o={}){const r=await raw(p,o);if(!r.status||r.status<200||r.status>=300)throw Error(`${o.method||'GET'} ${p} -> ${r.status}: ${JSON.stringify(r.data)}`);return r.data}
const course={format:'training-engine-course',schema_version:'2.0',course:{id:'presence-course',version:'1.0',title:'Presence Course',language:'en',direction:'ltr',modules:[{id:'m1',title:'M1',activities:[{id:'a1',type:'presentation',title:'Welcome',content:{blocks:[{type:'hero',title:'Welcome'}]}}],missions:[],paths:[]}]}};
try{
  await wait();
  const tr=await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}});
  const ir=await fetch(base+'/api/courses/import',{method:'POST',headers:{'X-Session-Token':tr.token,'X-File-Name':'presence-course.json'},body:Buffer.from(JSON.stringify(course))});
  const imp=await ir.json();assert.equal(ir.status,201,JSON.stringify(imp));
  const cl=await req('/api/classes',{token:tr.token,method:'POST',json:{course_version_id:imp.version_id,title:'Presence Class',status:'planned'}});
  await req(`/api/classes/${cl.id}/activate`,{token:tr.token,method:'POST'});
  const pair=await req(`/api/live/${cl.id}/projector-pair`,{token:tr.token,method:'POST',json:{label:'Presence Projector'}});
  await req(`/api/live?class_id=${cl.id}&pair=${encodeURIComponent(pair.pair_token)}`);
  let health=await req(`/api/live/${cl.id}/health`,{token:tr.token});assert.equal(health.projectors_connected,1);
  await req(`/api/live/${cl.id}/projector-disconnect?pair=${encodeURIComponent(pair.pair_token)}`,{method:'POST'});
  health=await req(`/api/live/${cl.id}/health`,{token:tr.token});assert.equal(health.projectors_connected,0,'normal Projector close signal must remove it immediately from live health');
  await req(`/api/live?class_id=${cl.id}&pair=${encodeURIComponent(pair.pair_token)}`);
  health=await req(`/api/live/${cl.id}/health`,{token:tr.token});assert.equal(health.projectors_connected,1,'same paired URL must reconnect after a reload');
  console.log('PROJECTOR_PRESENCE_LIFECYCLE_PASS');
}finally{child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));fs.rmSync(tmp,{recursive:true,force:true})}
