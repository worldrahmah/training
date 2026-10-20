import fs from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url),target=process.argv[2]||'node';
const commands=JSON.parse(fs.readFileSync(new URL('../validation/commands.json',import.meta.url)))[target];
if(!commands)throw new Error('Unknown check target');
// Node certification programs intentionally run in order: four update reports.
// Browser programs use independent servers/data/evidence and can run concurrently.
const requested=Number(process.env.ONE_BROWSER_TEST_CONCURRENCY||1);
if(!Number.isInteger(requested)||requested<1||requested>4)throw new Error('Browser test concurrency must be between 1 and 4.');
const concurrency=target==='browser'?requested:1,env={...process.env,HOST:'127.0.0.1',TRAINING_ENGINE_TEST_ACCOUNTS:'1'};
if(concurrency===1){
 for(const command of commands){const [program,...args]=command.split(' ');const result=spawnSync(program==='node'?process.execPath:program,args,{cwd:root,stdio:'inherit',env});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1)}
}else{
 let cursor=0;const results=new Array(commands.length),running=new Set();
 const stop=signal=>{for(const child of running)child.kill(signal)};process.once('SIGTERM',()=>stop('SIGTERM'));process.once('SIGINT',()=>stop('SIGINT'));
 async function worker(){for(;;){const index=cursor++;if(index>=commands.length)return;const command=commands[index],[program,...args]=command.split(' '),result=await new Promise(resolve=>{const child=spawn(program==='node'?process.execPath:program,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});running.add(child);let output='';child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);child.once('error',error=>{output+=String(error);resolve({status:1,output})});child.once('close',(code,signal)=>{running.delete(child);resolve({status:code??1,signal,output})})});results[index]=result;process.stdout.write(`\n[${index+1}/${commands.length}] ${command} — ${result.status===0?'PASS':'FAIL'}\n${result.output}`)}}
 await Promise.all(Array.from({length:concurrency},worker));
 const failed=results.map((r,i)=>({r,command:commands[i]})).filter(x=>x.r.status!==0);if(failed.length){console.error('CHECKS_FAIL',target,failed.map(x=>x.command).join('; '));process.exit(failed[0].r.status||1)}
}
console.log(`CHECKS_PASS ${target}: ${commands.length} commands`);
