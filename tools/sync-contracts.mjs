import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CAPABILITY_REGISTRY} from '../app/lib/registry.mjs';
import {capabilityContract} from '../app/lib/capabilities.mjs';
import {RELEASE_IDENTITY} from '../app/lib/version.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const check=process.argv.includes('--check');
const write=process.argv.includes('--write')||!check;
const out=[];
function text(rel,value){const p=path.join(root,rel);const next=String(value);const old=fs.existsSync(p)?fs.readFileSync(p,'utf8'):null;if(old!==next){out.push(rel);if(write){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,next)}}}
function json(rel,obj){text(rel,JSON.stringify(obj,null,2)+'\n')}
const ids=list=>(list||[]).map(x=>typeof x==='string'?x:x.id);
const activities=ids(CAPABILITY_REGISTRY.activities),blocks=ids(CAPABILITY_REGISTRY.content_blocks),results=ids(CAPABILITY_REGISTRY.results);
const wordCloud=CAPABILITY_REGISTRY.activities.find(x=>x.id==='word_cloud')||null;
const qAndA=CAPABILITY_REGISTRY.activities.find(x=>x.id==='q_and_a')||null;
const ideasBoard=CAPABILITY_REGISTRY.activities.find(x=>x.id==='ideas_board')||null;
const advanced=id=>CAPABILITY_REGISTRY.activities.find(x=>x.id===id)||null;
for(const rel of ['authoring-kit/schemas/activity.schema.json','course-authoring-handoff/schemas/activity.schema.json']){
  const p=path.join(root,rel),j=JSON.parse(fs.readFileSync(p,'utf8'));
  j.properties.type.enum=activities;
  j.properties.content.properties.blocks.items.properties.type.enum=blocks;
  j.properties.results_display.enum=results;
  if(wordCloud){const d=wordCloud.defaults||{};j.properties.word_cloud={type:'object',additionalProperties:false,properties:{max_entries:{type:'integer',minimum:1,maximum:5,default:d.max_entries||3},max_characters:{type:'integer',minimum:8,maximum:60,default:d.max_characters||32},allow_phrases:{type:'boolean',default:d.allow_phrases!==false},moderation:{enum:['off','pre'],default:d.moderation||'off'},identity_visibility:{enum:['trainer_only','anonymous'],default:d.identity_visibility||'trainer_only'}}};}
  if(qAndA){const d=qAndA.defaults||{};j.properties.q_and_a={type:'object',additionalProperties:false,properties:{max_questions:{type:'integer',minimum:1,maximum:5,default:d.max_questions||3},max_characters:{type:'integer',minimum:40,maximum:500,default:d.max_characters||280},moderation:{enum:['off','pre'],default:d.moderation||'pre'},identity_visibility:{enum:['public','trainer_only','anonymous'],default:d.identity_visibility||'trainer_only'},upvoting:{type:'boolean',default:d.upvoting!==false},allow_self_upvote:{type:'boolean',default:d.allow_self_upvote===true},sort:{enum:['votes','newest'],default:d.sort||'votes'}}};}
  if(ideasBoard){const d=ideasBoard.defaults||{};j.properties.ideas_board={type:'object',additionalProperties:false,properties:{max_ideas:{type:'integer',minimum:1,maximum:8,default:d.max_ideas||5},max_characters:{type:'integer',minimum:20,maximum:500,default:d.max_characters||240},moderation:{enum:['off','pre'],default:d.moderation||'pre'},identity_visibility:{enum:['public','trainer_only','anonymous'],default:d.identity_visibility||'trainer_only'},upvoting:{type:'boolean',default:d.upvoting!==false},allow_self_upvote:{type:'boolean',default:d.allow_self_upvote===true},sort:{enum:['votes','newest'],default:d.sort||'votes'},categories:{type:'array',minItems:1,maxItems:6,items:{type:'string',minLength:1,maxLength:40},default:d.categories||['Ideas']}}};}
  j.properties.prioritization={type:'object',additionalProperties:false,properties:{budget:{type:'integer',minimum:1,maximum:1000,default:100},require_full_allocation:{type:'boolean',default:true},max_per_option:{type:'integer',minimum:1,maximum:1000,default:100}}};
  j.properties.quick_interaction={type:'object',additionalProperties:false,properties:{preset:{enum:['agree','understand','help','yes_no','custom'],default:'custom'},anonymous:{type:'boolean',default:true}}};
  j.properties.matching={type:'object',additionalProperties:false,properties:{shuffle:{type:'boolean',default:true},pairs:{type:'array',minItems:2,maxItems:20,items:{type:'object',required:['left','right'],properties:{id:{type:'string'},left:{type:'string'},right:{type:'string'}},additionalProperties:false}}}};
  j.properties.fill_blanks={type:'object',additionalProperties:false,properties:{case_sensitive:{type:'boolean',default:false},blanks:{type:'array',minItems:1,maxItems:20,items:{type:'object',properties:{id:{type:'string'},label:{type:'string'},answers:{type:'array',minItems:1,items:{type:'string'}}},required:['answers'],additionalProperties:false}}}};
  j.properties.sorting={type:'object',additionalProperties:false,properties:{items:{type:'array',minItems:2,maxItems:20,items:{type:'string'}},correct_order:{type:'array',minItems:2,maxItems:20,items:{type:'string'}}}};
  j.properties.image_interaction={type:'object',additionalProperties:false,properties:{mode:{enum:['pin','find','label','drag'],default:'pin'},asset:{type:'string'},max_points:{type:'integer',minimum:1,maximum:20},targets:{type:'array',maxItems:20,items:{type:'object',properties:{id:{type:'string'},label:{type:'string'},x:{type:'number',minimum:0,maximum:100},y:{type:'number',minimum:0,maximum:100},tolerance:{type:'number',minimum:1,maximum:30}},required:['label','x','y'],additionalProperties:false}}}};
  j.properties.draw_annotate={type:'object',additionalProperties:false,properties:{asset:{type:'string'},max_strokes:{type:'integer',minimum:1,maximum:500,default:120},allow_text:{type:'boolean',default:true}}};
  j.properties.collaborative_board={type:'object',additionalProperties:false,properties:{max_notes:{type:'integer',minimum:1,maximum:12,default:5},max_characters:{type:'integer',minimum:20,maximum:500,default:240},categories:{type:'array',minItems:1,maxItems:8,items:{type:'string',minLength:1,maxLength:40}},identity_visibility:{enum:['public','trainer_only','anonymous'],default:'trainer_only'}}};
  j.properties.interactive_video={type:'object',additionalProperties:false,properties:{asset:{type:'string'},pause_at_checkpoint:{type:'boolean',default:true},checkpoints:{type:'array',maxItems:30,items:{type:'object',properties:{id:{type:'string'},time_seconds:{type:'number',minimum:0},prompt:{type:'string'},type:{enum:['single_choice','short_answer','confidence']},options:{type:'array',items:{type:'string'}},correct_answer:{}},required:['time_seconds','prompt'],additionalProperties:false}}}};
  j.properties.challenge={type:'object',additionalProperties:false,properties:{enabled:{type:'boolean'},time_seconds:{type:'number',minimum:0,maximum:3600},points:{type:'number',minimum:0,maximum:100000}}};
  j.properties.explanation={type:'string'};
  json(rel,j);
}
const browser=`// GENERATED by tools/sync-contracts.mjs from registry/activity-component-registry.json. Do not hand edit.\nexport const CAPABILITY_REGISTRY=${JSON.stringify(CAPABILITY_REGISTRY)};\nexport const ACTIVITY_TYPES=Object.freeze(CAPABILITY_REGISTRY.activities.map(x=>x.id));\nexport const CONTENT_BLOCK_TYPES=Object.freeze([...CAPABILITY_REGISTRY.content_blocks]);\nexport const RESULT_TYPES=Object.freeze([...CAPABILITY_REGISTRY.results]);\nexport const WORKFLOW_NODE_TYPES=Object.freeze([...CAPABILITY_REGISTRY.workflow_nodes]);\nexport const PROJECTOR_THEMES=Object.freeze([...CAPABILITY_REGISTRY.projector.themes]);\nexport const activitySpec=type=>CAPABILITY_REGISTRY.activities.find(x=>x.id===String(type||''))||null;\nexport const normalizeProjectorTheme=value=>PROJECTOR_THEMES.includes(String(value||''))?String(value):null;\nexport const resolveProjectorTheme=({course_default=null,class_override=null,live_override=null}={})=>normalizeProjectorTheme(live_override)||normalizeProjectorTheme(class_override)||normalizeProjectorTheme(course_default)||CAPABILITY_REGISTRY.projector.default_theme;\n`;
text('app/public/capability-registry.js',browser);
json('course-authoring-handoff/CORE_CAPABILITIES.json',capabilityContract());
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));pkg.version=RELEASE_IDENTITY.app_version;
pkg.scripts['contracts:sync']='node tools/sync-contracts.mjs --write';pkg.scripts['contracts:check']='node tools/sync-contracts.mjs --check';
json('package.json',pkg);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_MANIFEST.json'),'utf8'));
Object.assign(manifest,{release_name:RELEASE_IDENTITY.release_name,release_status:RELEASE_IDENTITY.release_status,app_version:RELEASE_IDENTITY.app_version,core_schema_version:RELEASE_IDENTITY.core_schema_version,course_authoring_schema_version:RELEASE_IDENTITY.course_authoring_schema_version,canonical_registry:'registry/activity-component-registry.json',development_authoring_contract:'course-authoring-handoff',published_rc4_authoring_handoff:'packaged-handoffs/TRAINING_ENGINE_ONE_COURSE_AUTHORING_HANDOFF_v1.3.zip'});
json('RELEASE_MANIFEST.json',manifest);
const hm=JSON.parse(fs.readFileSync(path.join(root,'course-authoring-handoff/HANDOFF_MANIFEST.json'),'utf8'));
Object.assign(hm,{version:'professional-closure-development',bound_core:`Training Engine ONE v${RELEASE_IDENTITY.app_version} Professional Interaction & Presentation Closure`,publication_status:'DEVELOPMENT_ONLY_NOT_FINAL_EXTERNAL_HANDOFF',registry:'../registry/activity-component-registry.json'});
json('course-authoring-handoff/HANDOFF_MANIFEST.json',hm);
if(check&&out.length){console.error('CONTRACT_DRIFT_DETECTED');for(const f of out)console.error(` - ${f}`);process.exit(1)}
console.log(out.length?`CONTRACT_SYNC_${write?'UPDATED':'DRIFT'} ${out.length}`:'CONTRACT_SYNC_PASS');
