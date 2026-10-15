import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url),target=process.argv[2]||'node';
const commands=JSON.parse(fs.readFileSync(new URL('../validation/commands.json',import.meta.url)))[target];
if(!commands)throw new Error('Unknown check target');
for(const command of commands){const [program,...args]=command.split(' ');const result=spawnSync(program==='node'?process.execPath:program,args,{cwd:root,stdio:'inherit',env:{...process.env,HOST:'127.0.0.1',TRAINING_ENGINE_TEST_ACCOUNTS:'1'}});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1)}
console.log(`CHECKS_PASS ${target}: ${commands.length} commands`);
