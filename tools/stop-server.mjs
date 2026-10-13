import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=process.env.TRAINING_ENGINE_DATA_DIR?path.resolve(process.env.TRAINING_ENGINE_DATA_DIR):path.join(root,'data');
try{
  const file=path.join(data,'server-control.json');if(!fs.existsSync(file))throw new Error('No running ONE instance is registered in this data directory.');
  const control=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!Number.isInteger(control.port)||control.port<1||control.port>65535||!/^\w{64}$/.test(control.nonce)||!/^\w{32}$/.test(control.server_id))throw new Error('The local instance record is invalid.');
  const base=`http://127.0.0.1:${control.port}`;
  const reply=await fetch(base+'/api/system/local-shutdown',{method:'POST',headers:{'X-ONE-Local-Control':control.nonce},signal:AbortSignal.timeout(5000)});
  if(!reply.ok)throw new Error('The running service did not authorize this ONE stop request.');
  const result=await reply.json();if(result.server_id!==control.server_id||result.stopping!==true)throw new Error('The running service did not confirm the registered ONE instance.');
  let stopped=false;
  for(let i=0;i<50;i++){
    await new Promise(resolve=>setTimeout(resolve,100));
    // The instance retires this record only after closing its database. A 503
    // "shutting down" response alone must never be treated as completed shutdown.
    if(fs.existsSync(file)){
      const current=JSON.parse(fs.readFileSync(file,'utf8'));
      if(current.server_id===control.server_id)continue;
    }
    try{const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)});const health=await response.json();if(health.server_id!==control.server_id){stopped=true;break}}
    catch{stopped=true;break}
  }
  if(!stopped)throw new Error('ONE accepted the request, but shutdown has not been confirmed. Check the server window.');
  console.log('Training Engine ONE shutdown confirmed.');
}catch(error){console.error(error.message||'Could not confirm ONE shutdown.');process.exitCode=1}
