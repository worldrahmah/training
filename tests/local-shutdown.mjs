import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'one-shutdown-')),port=19000+Math.floor(Math.random()*1000),base=`http://127.0.0.1:${port}`,env={...process.env,HOST:'127.0.0.1',PORT:String(port),...Object.fromEntries(['DATA','STORAGE','BACKUP','EXPORT'].map(k=>[`TRAINING_ENGINE_${k}_DIR`,path.join(dir,k.toLowerCase())]))};
const server=spawn(process.execPath,['--no-warnings','app/server.mjs'],{cwd:root,env,stdio:'ignore'});let foreign;
async function cli(){return new Promise(resolve=>{let output='';const child=spawn(process.execPath,['tools/stop-server.mjs'],{cwd:root,env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.on('close',code=>resolve({code,output}))})}
try{
  let ready=false;for(let i=0;i<150;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,70))}assert.ok(ready);
  const file=path.join(env.TRAINING_ENGINE_DATA_DIR,'server-control.json');assert.ok(fs.existsSync(file));
  const bad=await fetch(base+'/api/system/local-shutdown',{method:'POST',headers:{'X-ONE-Local-Control':'0'.repeat(64)}});assert.equal(bad.status,403);const malformed=await fetch(base+'/api/system/local-shutdown',{method:'POST',headers:{'X-ONE-Local-Control':'é'.repeat(64)}});assert.equal(malformed.status,403);assert.ok((await fetch(base+'/api/health')).ok,'Unauthorized stop must leave ONE running');
  const closed=new Promise(resolve=>server.once('close',resolve)),result=await cli();assert.equal(result.code,0,result.output);await closed;assert.match(result.output,/shutdown confirmed/);assert.ok(!fs.existsSync(file));assert.ok(fs.existsSync(path.join(env.TRAINING_ENGINE_DATA_DIR,'training-engine.sqlite')));
  foreign=http.createServer((req,res)=>{res.writeHead(404,{'Content-Type':'application/json'});res.end('{"ok":false}')});await new Promise(resolve=>foreign.listen(0,'127.0.0.1',resolve));const foreignPort=foreign.address().port;
  fs.writeFileSync(file,JSON.stringify({port:foreignPort,server_id:'a'.repeat(32),nonce:'b'.repeat(64)}));const denied=await cli();assert.notEqual(denied.code,0);assert.equal((await fetch(`http://127.0.0.1:${foreignPort}`)).status,404,'Unrelated service must remain alive');assert.ok(!denied.output.includes('shutdown confirmed'));
  fs.rmSync(file);assert.notEqual((await cli()).code,0,'Missing/stale instance must not report success');
  console.log('LOCAL_SHUTDOWN_PASS authenticated local-instance stop, confirmed exit/data retention, unrelated listener preservation and truthful failure');
}finally{if(server.exitCode===null)server.kill('SIGTERM');if(foreign)await new Promise(resolve=>foreign.close(resolve));fs.rmSync(dir,{recursive:true,force:true})}
