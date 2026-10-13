import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {ACTIVITY_TYPES} from '../app/lib/capabilities.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-builder-draft-'));
const port=5900+Math.floor(Math.random()*300);
const env={...process.env,PORT:String(port),TRAINING_ENGINE_DATA_DIR:path.join(tmp,'data'),TRAINING_ENGINE_STORAGE_DIR:path.join(tmp,'storage'),TRAINING_ENGINE_BACKUP_DIR:path.join(tmp,'backups'),TRAINING_ENGINE_EXPORT_DIR:path.join(tmp,'exports')};
const child=spawn(process.execPath,['app/server.mjs'],{cwd:ROOT,env,stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
const base=`http://127.0.0.1:${port}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(){for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await sleep(50)}throw new Error(logs)}
async function raw(p,{token,method='GET',json,body,headers={}}={}){const h={...headers};if(token)h['X-Session-Token']=token;if(json!==undefined){h['Content-Type']='application/json';body=JSON.stringify(json)}const r=await fetch(base+p,{method,headers:h,body});const ct=r.headers.get('content-type')||'';const data=ct.includes('application/json')?await r.json():await r.text();return {status:r.status,data}}
async function req(p,o={}){const r=await raw(p,o);if(r.status<200||r.status>=300){const e=new Error(`${r.status} ${JSON.stringify(r.data)}`);e.status=r.status;e.data=r.data;throw e}return r.data}

const seed={format:'training-engine-course',schema_version:'2.0',course:{id:'builder-transition-course',version:'1.0',title:'Builder Type Transition Course',language:'en',direction:'ltr',modules:[{id:'m1',title:'Milestone',duration_minutes:30,activities:[{id:'a1',type:'presentation',title:'Editable activity',trainer:{cue:''},content:{blocks:[{type:'text',title:'',body_md:'Draft-safe authoring'}]},results_display:'cards'}],missions:[],paths:[]}]}};

const builderSource=fs.readFileSync(path.join(ROOT,'app/public/builder.js'),'utf8');
assert.match(builderSource,/actType'\)\?\.addEventListener\('change',changeActivityType\)/,'Activity Type must use the dedicated transition handler');
assert.match(builderSource,/function changeActivityType\(\)/,'Builder must define a dedicated activity-type transition handler');
assert.match(builderSource,/markDirtyWithoutAutosave\(\)/,'Type transition must not schedule the old 1.2s autosave while the new settings editor is being filled');
assert.match(builderSource,/data-a=\"back-trainer\"/,'Builder Back control must use the persistence-aware navigation action');
assert.match(builderSource,/a==='back-trainer'\)\{if\(state\.dirty\)await save\(\{quiet:true\}\);location\.href='\/trainer'\}/,'Builder Back must persist a dirty draft before leaving');
assert.match(builderSource,/if\(state\.dirty\)await save\(\{quiet:true\}\);state\.courseId=nextCourseId/,'Course switching must persist a dirty draft before opening another course');
assert.match(builderSource,/beforeunload.*state\.dirty/,'Browser navigation must warn when unsaved Builder state exists');
console.log('PASS Builder Activity Type transition defers disruptive autosave but persists dirty draft on Builder navigation');
const typeSpecificKeys=['word_cloud','q_and_a','ideas_board','prioritization','quick_interaction','matching','fill_blanks','sorting','image_interaction','draw_annotate','collaborative_board','interactive_video'];
function builderStyleTypeChange(baseContent,type){
  const content=structuredClone(baseContent),a=content.course.modules[0].activities[0];
  a.type=type;
  for(const k of typeSpecificKeys)delete a[k];
  a.content={blocks:Array.isArray(a.content?.blocks)?a.content.blocks:[]};
  a.results_display='cards';
  delete a.response_scope;
  return content;
}

try{
  await wait();
  const login=await req('/api/login',{method:'POST',json:{username:'TRAINER',password:'TRAIN1234'}}),token=login.token;
  const imported=await req('/api/courses/import',{token,method:'POST',body:Buffer.from(JSON.stringify(seed)),headers:{'X-File-Name':'builder-transition-course.json','Content-Type':'application/json'}});
  const draft=await req(`/api/courses/${imported.course_id}/drafts`,{token,method:'POST',json:{source_version_id:imported.version_id,version:'1.1-draft'}});
  let loaded=await req(`/api/course-versions/${draft.version_id}/draft`,{token});
  const canonicalBase=structuredClone(loaded.content);
  let revision=Number(loaded.version.revision||0);

  for(const type of ACTIVITY_TYPES){
    const content=builderStyleTypeChange(canonicalBase,type);
    const saved=await raw(`/api/course-versions/${draft.version_id}/draft`,{token,method:'PUT',json:{content,expected_revision:revision}});
    assert.equal(saved.status,200,`draft autosave must accept incomplete canonical type ${type}: ${JSON.stringify(saved.data)}`);
    assert.equal(saved.data.ok,true,type);
    assert.ok(saved.data.readiness&&typeof saved.data.readiness.ready==='boolean',`readiness returned for ${type}`);
    assert.ok(Array.isArray(saved.data.readiness.errors),`readiness errors returned for ${type}`);
    revision=Number(saved.data.revision);
    const check=await req(`/api/course-versions/${draft.version_id}/draft`,{token});
    assert.equal(check.content.course.modules[0].activities[0].type,type,`draft persisted selected type ${type}`);
  }
  console.log(`PASS draft autosave persists all ${ACTIVITY_TYPES.length} canonical activity types without 422`);

  const incomplete=builderStyleTypeChange(canonicalBase,'matching');
  let saved=await req(`/api/course-versions/${draft.version_id}/draft`,{token,method:'PUT',json:{content:incomplete,expected_revision:revision}});
  revision=Number(saved.revision);
  assert.equal(saved.readiness.ready,false);
  assert.ok(saved.readiness.errors.some(x=>String(x).includes('Matching requires')));
  let r=await raw(`/api/course-versions/${draft.version_id}/publish`,{token,method:'POST'});
  assert.equal(r.status,422,'publish must remain strict for incomplete matching');
  assert.ok(r.data.errors.some(x=>String(x).includes('Matching requires')));
  console.log('PASS incomplete draft is persisted but publish remains validation-gated');

  r=await raw(`/api/course-versions/${draft.version_id}/draft`,{token,method:'PUT',json:{content:{not_a_course:true},expected_revision:revision}});
  assert.equal(r.status,422,'malformed/non-course draft payload must still fail closed');
  assert.equal(r.data.code,'DRAFT_STRUCTURE_INVALID');
  const afterBad=await req(`/api/course-versions/${draft.version_id}/draft`,{token});
  assert.equal(Number(afterBad.version.revision),revision,'rejected malformed draft must not advance revision');
  console.log('PASS malformed draft structure still fails closed');

  console.log('\nBUILDER_DRAFT_TRANSITIONS_PASS');
}finally{
  child.kill('SIGTERM');await sleep(250);fs.rmSync(tmp,{recursive:true,force:true});
}
