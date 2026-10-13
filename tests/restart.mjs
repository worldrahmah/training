import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-restart-'));
const port=3701+Math.floor(Math.random()*200);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
let child;
const base=`http://127.0.0.1:${port}`;
function start(){child=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:ROOT,env,stdio:'ignore'});}
async function wait(){for(let i=0;i<60;i++){try{const r=await fetch(base+'/api/health');if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error('server start timeout')}
async function stop(){if(child){child.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));}}
async function req(p,{token,method='GET',json}={}){const h={};if(token)h['X-Session-Token']=token;let body;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const d=await r.json();if(!r.ok)throw new Error(JSON.stringify(d));return d}
try{
 start();await wait();
 const tr=await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}});
 const st=await req('/api/login',{method:'POST',json:{username:'DEMO01',password:'D1001'}});
 const sd=await req('/api/student/dashboard',{token:st.token});const cid=sd.active.class.id;
 const la=await req(`/api/live/${cid}/launch`,{token:tr.token,method:'POST',json:{module_id:'welcome',activity_id:'quick-poll'}});
 await req(`/api/responses/${la.instance_id}`,{token:st.token,method:'POST',json:{answer:'Curious'}});
 await stop();
 start();await wait();
 const meT=await req('/api/me',{token:tr.token});const meS=await req('/api/me',{token:st.token});assert.equal(meT.user.role,'trainer');assert.equal(meS.user.role,'student');
 const live=await req(`/api/live?class_id=${cid}`,{token:tr.token});assert.equal(live.live.state.phase,'activity');assert.equal(live.live.results.summary.counts.Curious,1);
 console.log('RESTART_PERSISTENCE_PASS');
}finally{await stop();fs.rmSync(tmp,{recursive:true,force:true})}
