import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import net from 'node:net';import http from 'node:http';
import {spawn} from 'node:child_process';import {once} from 'node:events';
import {DatabaseSync} from 'node:sqlite';
import {csvEscape} from '../app/lib/utils.mjs';
import {validateCourseObject} from '../app/lib/course-package.mjs';
const root=path.resolve(import.meta.dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'one-rc9-security-'));let child,base,runDir;let checks=0;
function eq(a,b,n){assert.equal(a,b,n);checks++}
async function stop(){if(!child)return;const proc=child;child=null;const end=once(proc,'exit');proc.kill('SIGTERM');await end;}
async function start(name,qa=false){runDir=path.join(temp,name);fs.mkdirSync(runDir,{recursive:true});const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));base=`http://127.0.0.1:${port}`;child=spawn(process.execPath,['app/server.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:String(port),TRAINING_ENGINE_TEST_ACCOUNTS:qa?'1':'',...Object.fromEntries(['DATA','STORAGE','BACKUP','EXPORT'].map(k=>[`TRAINING_ENGINE_${k}_DIR`,path.join(runDir,k.toLowerCase())]))},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);for(let i=0;i<200;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}if(child.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,50))}throw Error('startup timeout: '+logs)}
async function req(p,{token,method='GET',json,body,headers={}}={}){if(token)headers['X-Session-Token']=token;if(json!==undefined){headers['Content-Type']='application/json';body=JSON.stringify(json)}const response=await fetch(base+p,{method,headers,body});let data;try{data=await response.clone().json()}catch{data=await response.clone().text()}return {status:response.status,data,response};}
async function ok(p,o={}){const r=await req(p,o);assert.ok(r.status>=200&&r.status<300,`${p}: ${r.status}`);checks++;return r.data}
const login=(username,password)=>ok('/api/login',{method:'POST',json:{username,password}});
const course={format:'training-engine-course',schema_version:'2.0',course:{id:'rc9-safe',version:'1',title:'Authored Title stays unchanged',modules:[{id:'m',title:'Milestone',activities:[{id:'a',type:'single_choice',title:'Authored sentence case',trainer:{cue:'PRIVATE-CUE'},content:{question:'Choose',options:['A','B'],correct_answer:'B'},results_display:'bar'}]}]}};
try{
 await start('production');
 eq((await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}})).status,401,'fresh production has no known password');
 const file=path.join(runDir,'data/INITIAL_ADMIN_PASSWORD.txt');assert.ok(fs.existsSync(file));checks++;eq(fs.statSync(file).mode&0o777,0o600,'bootstrap file private');
 const password=/Password: (.+)/.exec(fs.readFileSync(file,'utf8'))[1];const admin=await login('TRAINER',password);eq(admin.user.must_change_password,true,'must change bootstrap');
 eq((await req('/api/courses',{token:admin.token})).status,428,'temporary session gated');
 eq((await req('/api/account/password',{method:'POST',token:admin.token,json:{current_password:password,new_password:password}})).status,400,'same password rejected');
 await ok('/api/account/password',{method:'POST',token:admin.token,json:{current_password:password,new_password:'OwnerPersonal-RC9-Password!'}});
 const state=await ok('/api/courses',{token:admin.token});eq(state.courses.length,0,'production never seeds sample courses');eq((await req('/api/login',{method:'POST',json:{username:'DEMO01',password:'D1001'}})).status,401,'production never creates demo students');
 const database=path.join(runDir,'data/training-engine.sqlite');const connection=new DatabaseSync(database);const before=connection.prepare('SELECT id,password_hash FROM users').all();connection.close();await stop();await start('production');
 const second=new DatabaseSync(database);assert.deepEqual(second.prepare('SELECT id,password_hash FROM users').all(),before);second.close();checks++;await login('TRAINER','OwnerPersonal-RC9-Password!');await stop();
 // Upgrading populated QA/legacy data preserves users/password hashes but retires defaults.
 await start('legacy',true);const old=await login('TRAINER','TRAIN1234');const dataPath=path.join(runDir,'data/training-engine.sqlite');let db=new DatabaseSync(dataPath);const oldUsers=db.prepare('SELECT id,username,password_hash FROM users ORDER BY id').all();db.close();await stop();await start('legacy',false);
 eq((await req('/api/me',{token:old.token})).data.user,null,'default legacy sessions revoked');const legacy=await login('TRAINER','TRAIN1234');eq(legacy.user.must_change_password,true,'legacy default gated');eq((await req('/api/courses',{token:legacy.token})).status,428);
 db=new DatabaseSync(dataPath);assert.deepEqual(db.prepare('SELECT id,username,password_hash FROM users ORDER BY id').all(),oldUsers);db.close();checks++;
 const nonlocal=await new Promise((resolve,reject)=>{const url=new URL(base+'/api/login'),r=http.request(url,{method:'POST',localAddress:'127.0.0.2',headers:{'Content-Type':'application/json'}},response=>{response.resume();response.on('end',()=>resolve(response.statusCode))});r.on('error',reject);r.end(JSON.stringify({username:'TRAINER',password:'TRAIN1234'}))});eq(nonlocal,403,'network default sign in denied');
 await ok('/api/account/password',{method:'POST',token:legacy.token,json:{current_password:'TRAIN1234',new_password:'LegacyOwnerPersonal123!'}});await stop();
 await start('functional',true);const a=await login('TRAINER','TRAIN1234'),s=await login('DEMO01','D1001'),other=await login('DEMO02','D1002');
 for(const p of ['/api/staff','/api/system/backups','/api/dashboard/admin','/api/workspace/audit']){eq((await req(p)).status,401,`anonymous ${p}`);const denied=await req(p,{token:s.token});assert.ok([401,403].includes(denied.status),p);checks++}
 const staff=await ok('/api/staff',{token:a.token,method:'POST',json:{username:'UNASSIGNEDRC9',password:'UnassignedRC9!',display_name:'Unassigned',staff_role:'trainer'}});const stranger=await login('UNASSIGNEDRC9','UnassignedRC9!');eq((await req('/api/live',{token:stranger.token})).status,403,'implicit active class cannot leak private Trainer content');
 const imp=await ok('/api/courses/import',{token:a.token,method:'POST',body:Buffer.from(JSON.stringify(course)),headers:{'X-File-Name':'rc9.json'}});
 const draft=await ok(`/api/courses/${imp.course_id}/drafts`,{token:a.token,method:'POST',json:{source_version_id:imp.version_id,version:'1.1'}});
 await ok(`/api/course-versions/${draft.version_id}/assets`,{token:a.token,method:'POST',body:Buffer.from('<script>document.body.textContent="BAD"</script>'),headers:{'X-Asset-Key':'assets/inert.txt','Content-Type':'text/html'}});
 eq((await req(`/api/course-versions/${draft.version_id}/assets`,{token:a.token,method:'POST',body:Buffer.from('alert(1)'),headers:{'X-Asset-Key':'assets/executable.js'}})).status,400,'executable course assets rejected');
 const resource=`/api/assets/${draft.version_id}/assets/inert.txt`;
 eq((await req(resource)).status,401,'anonymous draft asset denied');eq((await req(resource,{token:s.token})).status,403,'unassigned student asset denied');
 const attachment=await req(resource,{token:a.token});eq(attachment.status,200);assert.match(attachment.response.headers.get('content-disposition'),/^attachment/);assert.match(attachment.response.headers.get('content-security-policy'),/sandbox/);checks+=2;
 const ck=(await req('/api/me',{token:a.token})).response.headers.get('set-cookie');assert.match(ck,/HttpOnly/);assert.match(ck,/SameSite=Strict/);checks+=2;
 eq((await req(resource,{headers:{Cookie:ck.split(';')[0]}})).status,200,'native asset cookie works');
 eq((await req('/api/staff',{headers:{Cookie:ck.split(';')[0]}})).status,401,'resource cookie cannot authorize APIs');
 const rotated=await ok('/api/account/session/rotate',{token:a.token,method:'POST'});eq((await req(resource,{headers:{Cookie:ck.split(';')[0]}})).status,401,'rotated resource session rejected');
 eq((await req('/api/courses',{token:a.token})).status,401,'old token revoked');a.token=rotated.token;
 const foreign=await req('/api/courses',{method:'POST',token:a.token,json:{title:'Cross-site write'},headers:{Origin:'https://attacker.example'}});eq(foreign.status,403,'cross-site write denied');
 const listed=await ok('/api/courses',{token:a.token});assert.ok(!listed.courses.some(c=>c.title==='Cross-site write'));checks++;
 eq((await req('/api/login',{method:'POST',body:'null',headers:{'Content-Type':'application/json'}})).status,400,'JSON scalar rejected');
 eq((await req('/api/login',{method:'POST',json:{username:'x'.repeat(121),password:'password'}})).status,400,'bounded username');
 for(let i=0;i<5;i++)eq((await req('/api/login',{method:'POST',json:{username:i%2?'LOCKME':'lockme',password:'WrongPassword!'}})).status,401);
 eq((await req('/api/login',{method:'POST',json:{username:'LockMe',password:'WrongPassword!'}})).status,429,'mixed case lockout');
 for(const key of ['html','css','javascript','sql','credentials','api_key']){const bad=structuredClone(course);bad.course[key]='untrusted';eq(validateCourseObject(bad).ok,false,'reject '+key)}
 eq(csvEscape('=HYPERLINK("https://bad")').startsWith('"\''),true,'CSV formula escaped');eq(csvEscape(-12),'-12','numeric negative preserved');
 const svg=await req('/api/system-logo');eq(svg.status,200);assert.match(svg.response.headers.get('content-type'),/svg/);checks++;
 eq((await req('/api/workspace/branding/logo',{token:s.token,method:'PUT',body:fs.readFileSync(path.join(root,'tests/fixtures/report-logo.png'))})).status,403,'student cannot replace logo');
 await ok('/api/workspace/branding/logo',{token:a.token,method:'PUT',body:fs.readFileSync(path.join(root,'tests/fixtures/report-logo.png'))});eq((await req('/api/system-logo')).response.headers.get('content-type'),'image/png','owner logo public but no account data');
 eq((await req('/api/workspace/branding/logo',{token:a.token,method:'PUT',body:Buffer.from('<svg onload="alert(1)"/>')})).status,400,'active logo content rejected');
 const result={status:'PASS',checks,production_bootstrap:'random private file + mandatory password change',legacy:'users and hashes preserved; known defaults local-only and sessions revoked',boundaries:['authorization','resource cookies','session rotation','cross-origin writes','login lockout','bounded JSON','declarative course data','inert attachment downloads','CSV formula escaping','validated shared logo']};
 if(process.env.ONE_SECURITY_EVIDENCE){fs.mkdirSync(path.dirname(process.env.ONE_SECURITY_EVIDENCE),{recursive:true});fs.writeFileSync(process.env.ONE_SECURITY_EVIDENCE,JSON.stringify(result,null,2)+'\n')}
 console.log(`RC1R9_SECURITY_PASS ${checks} assertions; production bootstrap, populated upgrade, default lockout, resources, roles, sessions, request/file boundaries`);
}finally{await stop();fs.rmSync(temp,{recursive:true,force:true})}
