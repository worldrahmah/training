import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {ACTIVITY_TYPES,CONTENT_BLOCK_TYPES,RESULT_TYPES,WORKFLOW_NODE_TYPES,PROJECTOR_THEMES,activitySpec} from '../app/public/capability-registry.js';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const file=path.join(ROOT,'app/public/builder.js');
const original=fs.readFileSync(file,'utf8');
assert.match(original,/function snapshot\(\)/,'Builder must define snapshot()');
assert.match(original,/function remember\(\)/,'Builder must define remember()');
assert.match(original,/#actType'\)\?\.addEventListener\('change',changeActivityType\)/,'Activity type select must re-render through changeActivityType');
assert.match(original,/initializeActivityType\(a,type,spec\)/,'Activity type transition must initialize the target editor model');

const source=original.replace(/^import .*$/gm,'').replace(/\nboot\(\);\s*$/,'\n');
const noop=()=>{};
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||'',setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const controls=new Map(),appEl={innerHTML:'',onclickCaptureBound:true,addEventListener:noop};
const ctx={
  actionMenu:()=>'',appearanceActions:()=>'',uiIcon:()=>'',
  console,structuredClone,setTimeout,clearTimeout,URLSearchParams,FormData,Blob,Date,Math,JSON,Number,String,Boolean,Array,Object,Map,Set,Promise,Error,
  window:{addEventListener:noop},location:{search:'',href:''},sessionStorage:storage(),localStorage:storage(),confirm:()=>true,fetch:async()=>({json:async()=>({}),ok:true}),
  document:{querySelector:(sel)=>sel==='#app'?appEl:(controls.get(sel)||null),querySelectorAll:()=>[],body:{contains:()=>true},createElement:()=>({})},
  initTheme:noop,initLocale:noop,applyTypography:noop,bindLogin:noop,cycleLocale:noop,cycleTheme:noop,langButton:()=>'',loginView:()=>'',modal:noop,setToken:noop,themeIcon:()=>'',toast:noop,
  api:async()=>({}),t:(x,vars={})=>String(x).replace(/\{(\w+)\}/g,(_,k)=>vars[k]??`{${k}}`),esc:(x)=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),renderContent:()=>'',projectorContrastCheck:()=>({}),projectorPhaseForItem:()=>'',renderProjectorFrame:()=>'',
  activityTypes:ACTIVITY_TYPES,blockTypes:CONTENT_BLOCK_TYPES,resultTypes:RESULT_TYPES,workflowTypes:WORKFLOW_NODE_TYPES,PROJECTOR_THEMES,activitySpec
};
ctx.activityLabel=id=>activitySpec(id)?.label||'Activity';ctx.systemLogo=()=>'<img class="system-logo">';
ctx.componentLabel=(id,kind)=>id;
vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'builder.js'});

const advanced=new Set(['prioritization_100','quick_interaction','matching','fill_blanks','sorting','image_interaction','draw_annotate','collaborative_board','interactive_video']);
const special=new Map([['word_cloud','word-cloud-builder'],['q_and_a','qa-builder'],['ideas_board','ideas-builder']]);
function htmlFor(type){
  const activity={id:'a1',type,title:'Test activity',trainer:{cue:''},content:{blocks:[]},results_display:activitySpec(type)?.results?.[0]||'cards'};
  ctx.__activity=activity;
  vm.runInContext(`state.content={course:{modules:[{id:'m1',activities:[__activity],missions:[],paths:[]}]}};state.selection={kind:'activity',mi:0,ii:0};`,ctx);
  return vm.runInContext('editActivity(__activity)',ctx);
}
for(const type of ACTIVITY_TYPES){
  const html=htmlFor(type);
  assert.match(html,/id="actType"/,`${type}: activity type control missing`);
  assert.ok(html.includes(`value="${type}" selected`),`${type}: selected type not reflected in editor`);
  if(special.has(type))assert.ok(html.includes(special.get(type)),`${type}: specialized settings panel missing`);
  else if(advanced.has(type))assert.ok(html.includes('advanced-activity-builder'),`${type}: advanced settings panel missing`);
  else assert.ok(html.includes('activity-type-settings'),`${type}: generic settings panel missing`);
}

ctx.__activity={id:'a1',type:'interactive_video',title:'Switch test',trainer:{cue:''},content:{blocks:[],video_asset:'old.mp4'},interactive_video:{asset:'old.mp4',checkpoints:[]},results_display:'video_checkpoints'};
vm.runInContext(`state.content={course:{modules:[{id:'m1',activities:[__activity],missions:[],paths:[]}]}};state.selection={kind:'activity',mi:0,ii:0};initializeActivityType(__activity,'matching',activitySpec('matching'));`,ctx);
assert.equal(ctx.__activity.type,'matching');assert.equal(JSON.stringify(ctx.__activity.matching),JSON.stringify({pairs:[],shuffle:true}));assert.equal('interactive_video' in ctx.__activity,false);assert.equal('video_asset' in ctx.__activity.content,false);
let html=vm.runInContext('editActivity(__activity)',ctx);assert.ok(html.includes('Matching Settings'));assert.ok(!html.includes('Interactive Video Settings'));
vm.runInContext(`initializeActivityType(__activity,'prioritization_100',activitySpec('prioritization_100'));`,ctx);html=vm.runInContext('editActivity(__activity)',ctx);assert.ok(html.includes('100 Points / Prioritization Settings'));assert.equal('matching' in ctx.__activity,false);
vm.runInContext(`initializeActivityType(__activity,'interactive_video',activitySpec('interactive_video'));`,ctx);html=vm.runInContext('editActivity(__activity)',ctx);assert.ok(html.includes('Interactive Video Settings'));assert.ok(!html.includes('Matching Settings'));


// Exercise the real type-change handler with a minimal browser-like DOM. This catches
// missing helper references and proves the editor HTML is replaced immediately.
ctx.__activity={id:'a1',type:'presentation',title:'Live switch',trainer:{cue:''},content:{blocks:[]},results_display:'cards'};
vm.runInContext(`state.content={course:{modules:[{id:'m1',activities:[__activity],missions:[],paths:[]}]}};state.selection={kind:'activity',mi:0,ii:0};state.tab='edit';state.undo=[];state.redo=[];`,ctx);
const ctl=(value='')=>({value,addEventListener:noop});controls.set('#actTitle',ctl('Live switch'));controls.set('#actCue',ctl(''));controls.set('#actType',ctl('matching'));controls.set('#actResults',ctl('cards'));
vm.runInContext('changeActivityType()',ctx);assert.equal(ctx.__activity.type,'matching');assert.ok(appEl.innerHTML.includes('Matching Settings'),'changeActivityType must immediately replace settings with Matching Settings');
controls.set('#actType',ctl('interactive_video'));controls.set('#actResults',ctl('assessment'));vm.runInContext('changeActivityType()',ctx);assert.equal(ctx.__activity.type,'interactive_video');assert.ok(appEl.innerHTML.includes('Interactive Video Settings'),'second type change must immediately replace settings again');assert.ok(!appEl.innerHTML.includes('Matching Settings'),'stale settings must disappear after type change');

vm.runInContext(`state.undo=[];state.redo=[];remember();`,ctx);assert.equal(vm.runInContext('state.undo.length',ctx),1,'remember() must create an undo snapshot');
console.log(`BUILDER_ACTIVITY_EDITOR_PASS ${ACTIVITY_TYPES.length}/${ACTIVITY_TYPES.length} activity types render a type-appropriate settings panel`);
