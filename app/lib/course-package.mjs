import {simulateRoutes} from '../public/authoring-model.js';
import {expandPath} from '../public/guided-model.js';
import {validateGuidedPaths,validateContentShape} from './guided-validation.mjs';
export const SAFE_COURSE_ASSET_EXTENSIONS=Object.freeze(['.png','.jpg','.jpeg','.webp','.svg','.pdf','.txt','.csv','.docx','.xlsx','.pptx','.mp4','.webm','.mp3','.wav','.m4a','.ogg']);
import {readZipEntries} from './zip.mjs';
import path from 'node:path';
import { sha256, safeRelativePath, safeJsonParse, mimeFromName } from './utils.mjs';
import { ACTIVITY_TYPES, CONTENT_BLOCK_TYPES, RESULT_TYPES, CHART_TYPES, WORKFLOW_NODE_TYPES, COMPLETION_TYPES } from './capabilities.mjs';
import { activitySpec } from './registry.mjs';


function validateExplicitWorkflow(moduleId, workflow, {activities=[],missions=[],paths=[]}={}, errors, warnings){
  const nodes=Array.isArray(workflow?.nodes)?workflow.nodes:[];
  const edges=Array.isArray(workflow?.edges)?workflow.edges:[];
  if(!nodes.length){ errors.push(`Module ${moduleId}: explicit workflow requires at least one node.`); return; }

  const nodeMap=new Map();
  for(const n of nodes){ const id=String(n?.id||'').trim(); if(id&&!nodeMap.has(id)) nodeMap.set(id,n); }
  const activityIds=new Set(activities.map(x=>String(x?.id||'')).filter(Boolean));
  const missionIds=new Set(missions.map(x=>String(x?.id||'')).filter(Boolean));
  const pathIds=new Set(paths.map(x=>String(x?.id||'')).filter(Boolean));
  const start=String(workflow?.start_node_id||'').trim();
  if(!start) errors.push(`Module ${moduleId}: explicit workflow requires exactly one start_node_id.`);
  else if(!nodeMap.has(start)) errors.push(`Module ${moduleId}: workflow start node ${start} does not exist.`);

  const outgoing=new Map([...nodeMap.keys()].map(id=>[id,[]]));
  const incoming=new Map([...nodeMap.keys()].map(id=>[id,[]]));
  const edgeKeys=new Set();
  for(const e of edges){
    const from=String(e?.from||'').trim(),to=String(e?.to||'').trim();
    if(!nodeMap.has(from)||!nodeMap.has(to)) continue;
    const key=`${from}\u0000${to}\u0000${String(e?.scope||'class')}\u0000${JSON.stringify(e?.condition||null)}`;
    if(edgeKeys.has(key)) errors.push(`Module ${moduleId}: duplicate workflow transition ${from} -> ${to}.`); else edgeKeys.add(key);
    outgoing.get(from).push(e); incoming.get(to).push(e);
  }

  const terminalIds=new Set();
  for(const [id,n] of nodeMap){
    if(n?.activity_id&&!activityIds.has(String(n.activity_id))) errors.push(`Module ${moduleId}: workflow node ${id} points to missing activity ${n.activity_id}.`);
    if(n?.mission_id&&!missionIds.has(String(n.mission_id))) errors.push(`Module ${moduleId}: workflow node ${id} points to missing mission ${n.mission_id}.`);
    if(n?.path_id&&!pathIds.has(String(n.path_id))) errors.push(`Module ${moduleId}: workflow node ${id} points to missing participant path ${n.path_id}.`);
    if(n?.type==='activity'&&!n?.activity_id) errors.push(`Module ${moduleId}: workflow activity node ${id} requires activity_id.`);
    if(n?.type==='mission'&&!n?.mission_id) errors.push(`Module ${moduleId}: workflow mission node ${id} requires mission_id.`);
    if(n?.type==='participant_path'&&!n?.path_id) errors.push(`Module ${moduleId}: participant-path workflow node ${id} requires path_id.`);

    // `closing` is intrinsically terminal. `terminal:true` supports an explicit
    // terminal participant/convergence node. A final convergence is retained as
    // a compatibility terminal for accepted v2.0 packages that predate terminal.
    const outs=outgoing.get(id)||[];
    const terminal=n?.terminal===true||n?.type==='closing'||(n?.type==='convergence'&&outs.length===0);
    if(terminal) terminalIds.add(id);
    if(!terminal&&outs.length===0) errors.push(`Module ${moduleId}: workflow node ${id} is a non-terminal dead end and requires an outgoing transition.`);
    if(terminal&&outs.length) errors.push(`Module ${moduleId}: terminal workflow node ${id} must not have outgoing transitions.`);

    if(n?.type==='participant_path'&&!terminal){
      const hasConvergence=outs.some(e=>['convergence','closing'].includes(String(nodeMap.get(String(e.to))?.type||'')));
      if(!hasConvergence) errors.push(`Module ${moduleId}: participant path node ${id} must converge or declare terminal:true.`);
    }
  }
  if(!terminalIds.size) errors.push(`Module ${moduleId}: explicit workflow requires at least one recognizable terminal node.`);

  // Multiple outgoing transitions are branches. Participant branches can be
  // identified by destination path_id; other branches require either edge
  // conditions or an activity flow definition that selects the destination.
  for(const [id,outs] of outgoing){
    if(outs.length<=1) continue;
    const n=nodeMap.get(id);
    const participantBranch=outs.every(e=>String(e?.scope||'class')==='participant'&&nodeMap.get(String(e.to))?.type==='participant_path'&&nodeMap.get(String(e.to))?.path_id);
    if(participantBranch){
      const targets=outs.map(e=>String(nodeMap.get(String(e.to)).path_id));
      if(new Set(targets).size!==targets.length) errors.push(`Module ${moduleId}: participant branch ${id} contains duplicate path destinations.`);
      continue;
    }
    const act=n?.activity_id?activities.find(a=>String(a?.id)===String(n.activity_id)):null;
    const flowTargets=new Set([
      ...(Array.isArray(act?.flow?.branches)?act.flow.branches:[]).map(b=>String(b?.next_activity_id||'')).filter(Boolean),
      String(act?.flow?.default_next_activity_id||'').trim()
    ].filter(Boolean));
    for(const e of outs){
      if(e?.condition&&typeof e.condition==='object'&&Object.keys(e.condition).length) continue;
      const dest=nodeMap.get(String(e.to));
      if(dest?.activity_id&&flowTargets.has(String(dest.activity_id))) continue;
      errors.push(`Module ${moduleId}: branch ${id} -> ${e.to} requires an explicit condition or a matching activity-flow destination.`);
    }
  }

  if(start&&nodeMap.has(start)){
    const reachable=new Set(),stack=[start];
    while(stack.length){ const id=stack.pop(); if(reachable.has(id))continue; reachable.add(id); for(const e of outgoing.get(id)||[]) stack.push(String(e.to)); }
    for(const id of nodeMap.keys()) if(!reachable.has(id)) errors.push(`Module ${moduleId}: workflow node ${id} is orphaned/unreachable from start node ${start}.`);

    // Every reachable node must have at least one route to a terminal. This
    // catches cycles and impossible convergence without trying to guess a path.
    const canReachTerminal=new Set(terminalIds),queue=[...terminalIds];
    while(queue.length){ const id=queue.shift(); for(const e of incoming.get(id)||[]){ const from=String(e.from); if(!canReachTerminal.has(from)){canReachTerminal.add(from);queue.push(from);} } }
    for(const id of reachable) if(!canReachTerminal.has(id)) errors.push(`Module ${moduleId}: workflow node ${id} cannot reach a terminal node.`);
  }

  // Warn about nodes with multiple incoming scopes because authors often intend
  // an explicit convergence node at that boundary.
  for(const [id,ins] of incoming){
    const scopes=new Set(ins.map(e=>String(e?.scope||'class')));
    if(ins.length>1&&scopes.size>1&&nodeMap.get(id)?.type!=='convergence') warnings.push(`Module ${moduleId}: workflow node ${id} merges class and participant transitions without a convergence node.`);
  }
}

function normalizeModule(module, errors, warnings, seenIds){
  if(!module || typeof module!=='object'){ errors.push('A module is not a valid object.'); return null; }
  const id=String(module.id||'').trim(); const title=String(module.title||'').trim();
  if(!id) errors.push('Every module requires an id.');
  if(!title) errors.push(`Module ${id||'(unknown)'} requires a title.`);
  if(id && seenIds.has(`module:${id}`)) errors.push(`Duplicate module id: ${id}`); else if(id) seenIds.add(`module:${id}`);
  const activities=Array.isArray(module.activities)?module.activities:[];
  const missions=Array.isArray(module.missions)?module.missions:[];
  const allowed=new Set(ACTIVITY_TYPES);
  for(const a of activities){
    const aid=String(a?.id||'').trim(); const type=String(a?.type||'').trim();
    if(!aid) errors.push(`Module ${id}: every activity requires an id.`);
    if(aid && seenIds.has(`activity:${aid}`)) errors.push(`Duplicate activity id: ${aid}`); else if(aid) seenIds.add(`activity:${aid}`);
    if(!allowed.has(type)) errors.push(`Activity ${aid||'(unknown)'} uses unsupported type: ${type||'(missing)'}.`);
    if(!String(a?.title||'').trim()) warnings.push(`Activity ${aid||'(unknown)'} has no title.`);
    const blocks=Array.isArray(a?.content?.blocks)?a.content.blocks:[];
    const blockTypes=new Set(CONTENT_BLOCK_TYPES);
    for(const [bi,block] of blocks.entries()){
      const bt=String(block?.type||'');validateContentShape(block,`Activity ${aid} → Block ${bi+1}`,errors);
      if(!blockTypes.has(bt)) errors.push(`Activity ${aid}: content block ${bi+1} uses unsupported type: ${bt||'(missing)'}.`);
      if(['image','image_text','asset','video','audio','document','slide_deck','interactive_video'].includes(bt) && !String(block?.asset||block?.src||'').trim() && !(bt==='slide_deck'&&Array.isArray(block.slides)&&block.slides.length)) errors.push(`Activity ${aid}: ${bt} block ${bi+1} requires an asset or src.`);
      if(bt==='chart'){
        const ct=String(block?.chart_type||'bar');
        if(!CHART_TYPES.includes(ct)) errors.push(`Activity ${aid}: chart block ${bi+1} uses unsupported chart type: ${ct}.`);
        if(!Array.isArray(block?.data)) errors.push(`Activity ${aid}: chart block ${bi+1} requires a data array.`);
      }
    }
    if(['poll','single_choice','multiple_choice'].includes(type)){
      const opts=a?.content?.options;
      if(!Array.isArray(opts)||opts.length<2) errors.push(`Activity ${aid}: at least two options are required.`);
    }
    if(type==='true_false' && a?.content?.correct_answer!=null && ![true,false,'true','false'].includes(a.content.correct_answer)) errors.push(`Activity ${aid}: invalid true/false correct_answer.`);
    if(type==='rating'){
      const min=Number(a?.content?.min??1), max=Number(a?.content?.max??5);
      if(!(max>min)) errors.push(`Activity ${aid}: rating max must be greater than min.`);
    }
    if(type==='numeric_answer'){
      const min=a?.content?.min, max=a?.content?.max;
      if(min!=null&&max!=null&&Number(max)<Number(min)) errors.push(`Activity ${aid}: numeric answer max must be greater than or equal to min.`);
    }
    if(type==='word_cloud'){
      const q=String(a?.content?.question||a?.content?.heading||'').trim();
      if(!q) errors.push(`Activity ${aid}: Word Cloud requires a question or heading.`);
      const wc=a?.word_cloud&&typeof a.word_cloud==='object'?a.word_cloud:{};
      const maxEntries=Number(wc.max_entries??3),maxChars=Number(wc.max_characters??32);
      if(!Number.isInteger(maxEntries)||maxEntries<1||maxEntries>5) errors.push(`Activity ${aid}: Word Cloud max_entries must be an integer from 1 to 5.`);
      if(!Number.isInteger(maxChars)||maxChars<8||maxChars>60) errors.push(`Activity ${aid}: Word Cloud max_characters must be an integer from 8 to 60.`);
      if(wc.moderation!=null&&!['off','pre'].includes(String(wc.moderation))) errors.push(`Activity ${aid}: Word Cloud moderation must be off or pre.`);
      if(wc.identity_visibility!=null&&!['trainer_only','anonymous'].includes(String(wc.identity_visibility))) errors.push(`Activity ${aid}: Word Cloud identity_visibility must be trainer_only or anonymous.`);
      if(a.results_display&&a.results_display!=='word_cloud') warnings.push(`Activity ${aid}: Word Cloud results should use the word_cloud display.`);
    }
    if(type==='q_and_a'){
      const q=String(a?.content?.question||a?.content?.heading||'').trim();
      if(!q) errors.push(`Activity ${aid}: Q&A requires a prompt or heading.`);
      const qa=a?.q_and_a&&typeof a.q_and_a==='object'?a.q_and_a:{};
      const maxQuestions=Number(qa.max_questions??3),maxChars=Number(qa.max_characters??280);
      if(!Number.isInteger(maxQuestions)||maxQuestions<1||maxQuestions>5) errors.push(`Activity ${aid}: Q&A max_questions must be an integer from 1 to 5.`);
      if(!Number.isInteger(maxChars)||maxChars<40||maxChars>500) errors.push(`Activity ${aid}: Q&A max_characters must be an integer from 40 to 500.`);
      if(qa.moderation!=null&&!['off','pre'].includes(String(qa.moderation))) errors.push(`Activity ${aid}: Q&A moderation must be off or pre.`);
      if(qa.identity_visibility!=null&&!['public','trainer_only','anonymous'].includes(String(qa.identity_visibility))) errors.push(`Activity ${aid}: Q&A identity_visibility must be public, trainer_only or anonymous.`);
      if(qa.sort!=null&&!['votes','newest'].includes(String(qa.sort))) errors.push(`Activity ${aid}: Q&A sort must be votes or newest.`);
      if(String(a.response_scope||'individual')==='team') errors.push(`Activity ${aid}: Q&A currently requires individual response_scope; team voting semantics are not supported.`);
      if(a.results_display&&a.results_display!=='qa_board') warnings.push(`Activity ${aid}: Q&A results should use the qa_board display.`);
    }
    if(type==='ideas_board'){
      const q=String(a?.content?.question||a?.content?.heading||'').trim();
      if(!q) errors.push(`Activity ${aid}: Ideas Board requires a prompt or heading.`);
      const ib=a?.ideas_board&&typeof a.ideas_board==='object'?a.ideas_board:{};
      const maxIdeas=Number(ib.max_ideas??5),maxChars=Number(ib.max_characters??240),categories=Array.isArray(ib.categories)?ib.categories:['Ideas'];
      if(!Number.isInteger(maxIdeas)||maxIdeas<1||maxIdeas>8) errors.push(`Activity ${aid}: Ideas Board max_ideas must be an integer from 1 to 8.`);
      if(!Number.isInteger(maxChars)||maxChars<20||maxChars>500) errors.push(`Activity ${aid}: Ideas Board max_characters must be an integer from 20 to 500.`);
      if(ib.moderation!=null&&!['off','pre'].includes(String(ib.moderation))) errors.push(`Activity ${aid}: Ideas Board moderation must be off or pre.`);
      if(ib.identity_visibility!=null&&!['public','trainer_only','anonymous'].includes(String(ib.identity_visibility))) errors.push(`Activity ${aid}: Ideas Board identity_visibility must be public, trainer_only or anonymous.`);
      if(ib.sort!=null&&!['votes','newest'].includes(String(ib.sort))) errors.push(`Activity ${aid}: Ideas Board sort must be votes or newest.`);
      if(!categories.length||categories.length>6||categories.some(x=>!String(x||'').trim()||String(x).trim().length>40)) errors.push(`Activity ${aid}: Ideas Board categories must contain 1 to 6 labels of 1 to 40 characters.`);
      if(new Set(categories.map(x=>String(x).trim().toLocaleLowerCase())).size!==categories.length) errors.push(`Activity ${aid}: Ideas Board categories must be unique.`);
      if(String(a.response_scope||'individual')==='team') errors.push(`Activity ${aid}: Ideas Board currently requires individual response_scope; team voting semantics are not supported.`);
      if(a.results_display&&a.results_display!=='ideas_board') warnings.push(`Activity ${aid}: Ideas Board results should use the ideas_board display.`);
    }
    if(type==='prioritization_100'){
      const cfg=a?.prioritization&&typeof a.prioritization==='object'?a.prioritization:{};const opts=Array.isArray(a?.content?.options)?a.content.options:[];
      if(opts.length<2||opts.length>20) errors.push(`Activity ${aid}: 100 Points requires 2 to 20 options.`);
      const budget=Number(cfg.budget??100),max=Number(cfg.max_per_option??budget);if(!Number.isInteger(budget)||budget<1||budget>1000) errors.push(`Activity ${aid}: prioritization budget must be an integer from 1 to 1000.`);if(!Number.isInteger(max)||max<1||max>1000) errors.push(`Activity ${aid}: prioritization max_per_option must be an integer from 1 to 1000.`);
    }
    if(type==='quick_interaction'){
      const preset=String(a?.quick_interaction?.preset||'custom'),presetOptions={agree:['Agree','Not sure','Disagree'],understand:['Got it','Almost','Need help'],help:['All good','Need help'],yes_no:['Yes','No']};
      const explicit=Array.isArray(a?.content?.options)?a.content.options:[],opts=explicit.length?explicit:(presetOptions[preset]||[]);if(opts.length<2||opts.length>8) errors.push(`Activity ${aid}: Quick Interaction requires 2 to 8 options or a supported preset.`);
    }
    if(type==='matching'){
      const pairs=Array.isArray(a?.matching?.pairs)?a.matching.pairs:[];if(pairs.length<2||pairs.length>20||pairs.some(p=>!String(p?.left||'').trim()||!String(p?.right||'').trim())) errors.push(`Activity ${aid}: Matching requires 2 to 20 complete left/right pairs.`);
    }
    if(type==='fill_blanks'){
      const blanks=Array.isArray(a?.fill_blanks?.blanks)?a.fill_blanks.blanks:[];if(!blanks.length||blanks.length>20||blanks.some(b=>!(Array.isArray(b?.answers)?b.answers:[b?.answer]).some(x=>String(x||'').trim()))) errors.push(`Activity ${aid}: Fill in the Blanks requires 1 to 20 blanks with accepted answers.`);
    }
    if(type==='sorting'){
      const items=Array.isArray(a?.sorting?.items)?a.sorting.items:[];if(items.length<2||items.length>20) errors.push(`Activity ${aid}: Sorting requires 2 to 20 items.`);
    }
    if(type==='image_interaction'){
      const cfg=a?.image_interaction&&typeof a.image_interaction==='object'?a.image_interaction:{};if(!['pin','find','label','drag'].includes(String(cfg.mode||'pin'))) errors.push(`Activity ${aid}: image interaction mode must be pin, find, label or drag.`);if(!String(cfg.asset||a?.content?.image_asset||'').trim()) errors.push(`Activity ${aid}: image interaction requires an image asset.`);
    }
    if(type==='draw_annotate'&&!String(a?.draw_annotate?.asset||a?.content?.image_asset||'').trim()) warnings.push(`Activity ${aid}: Draw/Annotate has no background asset; a blank canvas will be used.`);
    if(type==='collaborative_board'){
      const cfg=a?.collaborative_board&&typeof a.collaborative_board==='object'?a.collaborative_board:{};const cats=Array.isArray(cfg.categories)?cfg.categories:[];if(!cats.length||cats.length>8) errors.push(`Activity ${aid}: Collaborative Board requires 1 to 8 categories.`);if(String(a.response_scope||'individual')==='team') errors.push(`Activity ${aid}: Collaborative Board currently requires individual response_scope.`);
      if(cfg.identity_visibility!=null&&!['public','trainer_only','anonymous'].includes(String(cfg.identity_visibility))) errors.push(`Activity ${aid}: Collaborative Board identity_visibility must be public, trainer_only or anonymous.`);
    }
    if(type==='interactive_video'){
      const cfg=a?.interactive_video&&typeof a.interactive_video==='object'?a.interactive_video:{};if(!String(cfg.asset||a?.content?.video_asset||'').trim()) errors.push(`Activity ${aid}: Interactive Video requires a local video asset.`);const cps=Array.isArray(cfg.checkpoints)?cfg.checkpoints:[];if(!cps.length) warnings.push(`Activity ${aid}: Interactive Video has no checkpoints.`);if(cps.some(c=>Number(c?.time_seconds)<0||!String(c?.prompt||'').trim())) errors.push(`Activity ${aid}: Interactive Video checkpoints require non-negative time and prompt.`);
    }
    if(a?.challenge?.enabled){const secs=Number(a.challenge.time_seconds||0),pts=Number(a.challenge.points||0);if(secs<0||secs>3600||pts<0||pts>100000) errors.push(`Activity ${aid}: Challenge mode time/points are outside supported bounds.`);}
    const chart=a?.results_display,spec=activitySpec(type);
    if(chart && !RESULT_TYPES.includes(String(chart))) warnings.push(`Activity ${aid}: results display '${chart}' will fall back to cards.`);
    else if(chart&&spec?.results?.length&&!spec.results.includes(String(chart))) warnings.push(`Activity ${aid}: results display '${chart}' is not canonical for ${type}; use one of ${spec.results.join(', ')}.`);
  }
  for(const m of missions){
    const mid=String(m?.id||'').trim();
    if(!mid) errors.push(`Module ${id}: every mission requires an id.`);
    if(mid && seenIds.has(`mission:${mid}`)) errors.push(`Duplicate mission id: ${mid}`); else if(mid) seenIds.add(`mission:${mid}`);
    if(!String(m?.title||'').trim()) errors.push(`Mission ${mid||'(unknown)'} requires a title.`);
    if(!Array.isArray(m?.steps)||!m.steps.length) warnings.push(`Mission ${mid||'(unknown)'} has no guided steps.`);
  }
  const paths=(Array.isArray(module.paths)?module.paths:[]).map(path=>{if(!Array.isArray(path.steps))errors.push(`Module ${id}: participant path ${path.id} steps must be an array.`);for(const step of Array.isArray(path.steps)?path.steps:[])if(step?.use_template&&(!module.step_templates||!Object.hasOwn(module.step_templates,step.use_template)))errors.push(`Module ${id}: missing shared step template ${step.use_template}.`);return expandPath(module,path)});
  for(const pathDef of paths){
    const pid=String(pathDef?.id||'').trim();
    if(!pid) errors.push(`Module ${id}: every participant path requires an id.`);
    if(pid && seenIds.has(`path:${pid}`)) errors.push(`Duplicate participant path id: ${pid}`); else if(pid) seenIds.add(`path:${pid}`);
    if(!String(pathDef?.title||'').trim()) errors.push(`Participant path ${pid||'(unknown)'} requires a title.`);
    if(!Array.isArray(pathDef?.steps)||!pathDef.steps.length) errors.push(`Participant path ${pid||'(unknown)'} requires at least one guided step.`);
    for(const [si,step] of (pathDef.steps||[]).entries()){
      if(!String(step?.title||'').trim()) warnings.push(`Participant path ${pid}: step ${si+1} has no title.`);
      if(step?.completion?.type && !COMPLETION_TYPES.includes(String(step.completion.type))) errors.push(`Participant path ${pid}: step ${si+1} uses unsupported completion type ${step.completion.type}.`);
    }
  }
  validateGuidedPaths({...module,id,activities,paths},seenIds,errors,warnings);
  const workflow=module.workflow&&typeof module.workflow==='object'?module.workflow:null;
  if(workflow){
    const nodes=Array.isArray(workflow.nodes)?workflow.nodes:[],edges=Array.isArray(workflow.edges)?workflow.edges:[];
    const nodeIds=new Set(); const nodeTypes=new Set(WORKFLOW_NODE_TYPES);
    for(const n of nodes){const nid=String(n?.id||'').trim();if(!nid)errors.push(`Module ${id}: every workflow node requires an id.`);else if(nodeIds.has(nid))errors.push(`Module ${id}: duplicate workflow node ${nid}.`);else nodeIds.add(nid);if(n?.type&&!nodeTypes.has(String(n.type)))errors.push(`Module ${id}: workflow node ${nid||'(unknown)'} uses unsupported type ${n.type}.`);}
    for(const e of edges){if(!nodeIds.has(String(e?.from||'')))errors.push(`Module ${id}: workflow edge has missing source ${e?.from}.`);if(!nodeIds.has(String(e?.to||'')))errors.push(`Module ${id}: workflow edge has missing destination ${e?.to}.`);if(e?.scope&&!['class','participant'].includes(String(e.scope)))errors.push(`Module ${id}: workflow edge scope must be class or participant.`);if(e?.condition!=null&&(typeof e.condition!=='object'||Array.isArray(e.condition)))errors.push(`Module ${id}: workflow edge ${e?.from||'?'} -> ${e?.to||'?'} condition must be an object.`);}
    validateExplicitWorkflow(id,workflow,{activities,missions,paths},errors,warnings);if(paths.some(p=>p.guided===true)){const simulation=simulateRoutes({...module,workflow});for(const message of simulation.errors)errors.push(`Module ${id} → Workflow: ${message}`);}
  }
  return {...module,id,title,activities,missions,paths,workflow};
}


function collectAssetRefs(value,out=new Set()){
  if(value==null) return out;
  if(typeof value==='string'){
    const v=value.trim();
    if(v.startsWith('asset://')) out.add(v.slice('asset://'.length));
    else if(v.startsWith('assets/')) out.add(v);
    return out;
  }
  if(Array.isArray(value)){ for(const v of value) collectAssetRefs(v,out); return out; }
  if(typeof value==='object'){ for(const [k,v] of Object.entries(value)){ if(k==='url'&&typeof v==='string'&&/^https?:\/\//i.test(v)) continue; collectAssetRefs(v,out); } }
  return out;
}
function objectiveIdSet(course){
  const set=new Set();
  for(const o of Array.isArray(course.objectives)?course.objectives:[]){ const id=typeof o==='string'?o:o?.id; if(id)set.add(String(id)); }
  return set;
}
// Course data is declarative. Text examples remain inert; executable fields are invalid.
function validateDeclarative(value,errors,depth=0){
 if(depth>64){errors.push('Course nesting exceeds the supported depth.');return;}
 if(!value||typeof value!=='object')return;
 for(const [key,child] of Object.entries(value)){
  if(/^(script|javascript|html|css|sql|server_code|credentials|api_key|password|access_token|private_key|onclick|onload|onerror)$/i.test(key)){errors.push('Executable code and credential fields are not permitted in courses.');continue;}
  validateDeclarative(child,errors,depth+1);
 }
}
export function validateCourseObject(input){
  const errors=[],warnings=[],seenIds=new Set();
  if(!input || typeof input!=='object') return {ok:false,errors:['Course file is not valid JSON object.'],warnings,course:null,summary:null};
  validateDeclarative(input,errors);
  if(input.format!=='training-engine-course') errors.push("format must be 'training-engine-course'.");
  if(!['1.0','1.1','2.0'].includes(String(input.schema_version||''))) errors.push("schema_version must be '1.0', '1.1' or '2.0'.");
  const c=input.course;
  if(!c||typeof c!=='object') errors.push('course object is required.');
  if(errors.length) return {ok:false,errors,warnings,course:null,summary:null};
  const id=String(c.id||'').trim(); const title=String(c.title||'').trim();
  if(!id) errors.push('course.id is required.');
  if(!title) errors.push('course.title is required.');
  const language=String(c.language||'en');
  const direction=String(c.direction||'ltr');
  if(!['ltr','rtl'].includes(direction)) errors.push("course.direction must be 'ltr' or 'rtl'.");
  if(c.branding?.projector_theme!=null && !['dark','light','high_contrast'].includes(String(c.branding.projector_theme))) errors.push("course.branding.projector_theme must be 'dark', 'light' or 'high_contrast'.");
  if(c.branding?.typography!=null){
    if(typeof c.branding.typography!=='object'||Array.isArray(c.branding.typography)) errors.push('course.branding.typography must be an object.');
    else for(const slot of ['ui','presentation','title','body']){
      const spec=c.branding.typography[slot]; if(spec==null)continue;
      if(typeof spec!=='object'||Array.isArray(spec)) errors.push(`course.branding.typography.${slot} must be an object.`);
      else for(const langKey of ['ar','en']) if(spec[langKey]!=null && (typeof spec[langKey]!=='string'||/[;{}<>]/.test(spec[langKey])||spec[langKey].length>180)) errors.push(`course.branding.typography.${slot}.${langKey} is not a safe font-family value.`);
    }
  }
  const modules=Array.isArray(c.modules)?c.modules:[];
  if(!modules.length) warnings.push('Course has no modules yet.');
  const normalized=[];
  for(const m of modules){ const nm=normalizeModule(m,errors,warnings,seenIds); if(nm) normalized.push(nm); }
  const knownObjectives=objectiveIdSet(c);
  for(const m of normalized){
    const activityIds=new Set((m.activities||[]).map(a=>String(a.id)));
    for(const a of m.activities||[]){
      if(a.response_scope && !['individual','team'].includes(String(a.response_scope))) errors.push(`Activity ${a.id}: response_scope must be individual or team.`);
      if(a.type==='team_challenge' && a.response_scope!=='team') warnings.push(`Activity ${a.id}: team_challenge should normally use response_scope 'team'.`);
      if(a.completion_gate?.minimum_response_rate!=null){const r=Number(a.completion_gate.minimum_response_rate);if(!(r>0&&r<=1))errors.push(`Activity ${a.id}: minimum_response_rate must be greater than 0 and at most 1.`);}
      if(a.completion_gate?.minimum_responses!=null&&Number(a.completion_gate.minimum_responses)<1)errors.push(`Activity ${a.id}: minimum_responses must be at least 1.`);
      for(const oid of Array.isArray(a.objective_ids)?a.objective_ids:[]) if(knownObjectives.size&&!knownObjectives.has(String(oid))) errors.push(`Activity ${a.id}: unknown objective id ${oid}.`);
      const next=a?.flow?.next_activity_id; if(next&&!activityIds.has(String(next))) errors.push(`Activity ${a.id}: flow.next_activity_id points to missing activity ${next}.`);
      for(const br of Array.isArray(a?.flow?.branches)?a.flow.branches:[]){ if(br?.next_activity_id&&!activityIds.has(String(br.next_activity_id))) errors.push(`Activity ${a.id}: branch points to missing activity ${br.next_activity_id}.`); }
    }
    for(const mi of m.missions||[]){
      for(const oid of Array.isArray(mi.objective_ids)?mi.objective_ids:[]) if(knownObjectives.size&&!knownObjectives.has(String(oid))) errors.push(`Mission ${mi.id}: unknown objective id ${oid}.`);
      const st=mi?.submission?.type; if(st&&!['text','url','file','image','none'].includes(String(st))) errors.push(`Mission ${mi.id}: unsupported submission type ${st}.`);
    }
    for(const pa of m.paths||[]){
      for(const oid of Array.isArray(pa.objective_ids)?pa.objective_ids:[]) if(knownObjectives.size&&!knownObjectives.has(String(oid))) errors.push(`Participant path ${pa.id}: unknown objective id ${oid}.`);
    }
  }
  const totalActivities=normalized.reduce((n,m)=>n+m.activities.length,0);
  const totalMissions=normalized.reduce((n,m)=>n+m.missions.length,0);
  const totalPaths=normalized.reduce((n,m)=>n+(m.paths?.length||0),0);
  const totalMinutes=Number(c.duration_minutes||normalized.reduce((n,m)=>n+Number(m.duration_minutes||0),0)||0);
  const course={...input,course:{...c,id,title,language,direction,modules:normalized,duration_minutes:totalMinutes}};
  return {ok:errors.length===0,errors,warnings,course,summary:{title,modules:normalized.length,activities:totalActivities,missions:totalMissions,paths:totalPaths,duration_minutes:totalMinutes,language,direction}};
}

function resolveFileRefs(courseObj, entries, errors){
  const c=courseObj.course;
  if(!Array.isArray(c.modules)) return;
  const resolved=[];
  for(const m of c.modules){
    if(m && typeof m==='object' && m.file){
      const rel=safeRelativePath(m.file);
      if(!rel || !entries.has(rel)){ errors.push(`Referenced module file not found: ${m.file}`); continue; }
      const parsed=safeJsonParse(entries.get(rel).toString('utf8'));
      if(!parsed){ errors.push(`Referenced module file is invalid JSON: ${rel}`); continue; }
      resolved.push(parsed.module||parsed);
    }else resolved.push(m);
  }
  c.modules=resolved;
}

export function parseCoursePackage(buffer, filename='course.json'){
  const name=String(filename||'').toLowerCase();
  const errors=[],warnings=[];
  let entries=new Map(), manifest={}; let courseObj=null;
  try{
    if(name.endsWith('.zip')||name.endsWith('.course.zip')){
      entries=readZipEntries(buffer);
      const manifestBuf=entries.get('manifest.json');
      if(!manifestBuf) throw new Error('PACKAGE_MANIFEST_MISSING');
      manifest=safeJsonParse(manifestBuf.toString('utf8'));
      if(!manifest) throw new Error('PACKAGE_MANIFEST_INVALID');
      if(manifest.format!=='training-engine-course-package') errors.push("manifest.format must be 'training-engine-course-package'.");
      if(!['1.0','1.1','2.0'].includes(String(manifest.schema_version||''))) errors.push("manifest.schema_version must be '1.0', '1.1' or '2.0'.");
      const courseFile=safeRelativePath(manifest.course_file||'course.json');
      if(!courseFile||!entries.has(courseFile)) errors.push(`Course file not found: ${manifest.course_file||'course.json'}`);
      else courseObj=safeJsonParse(entries.get(courseFile).toString('utf8'));
      if(!courseObj) errors.push('Course JSON is invalid.');
      if(Array.isArray(manifest.files)){
        for(const row of manifest.files){
          const rel=safeRelativePath(row?.path);
          if(!rel||!entries.has(rel)){ errors.push(`Manifest file missing: ${row?.path}`); continue; }
          if(row.sha256 && sha256(entries.get(rel))!==String(row.sha256).toLowerCase()) errors.push(`Checksum mismatch: ${rel}`);
        }
      }
      if(courseObj) resolveFileRefs(courseObj,entries,errors);
    }else{
      courseObj=safeJsonParse(Buffer.from(buffer).toString('utf8'));
      if(!courseObj) errors.push('Uploaded JSON is invalid.');
      manifest={format:'training-engine-course-package',schema_version:String(courseObj?.schema_version||'1.1'),course_file:filename};
    }
  }catch(e){ errors.push(String(e.message||e)); }
  if(errors.length) return {ok:false,errors,warnings,manifest,course:null,summary:null,assets:[]};
  const validation=validateCourseObject(courseObj);
  errors.push(...validation.errors); warnings.push(...validation.warnings);
  if(validation.course){
    const refs=[...collectAssetRefs(validation.course)];
    for(const ref0 of refs){ const ref=safeRelativePath(ref0); if(!ref){ errors.push(`Unsafe asset reference: ${ref0}`); continue; } if(entries.size&&!entries.has(ref)) errors.push(`Referenced asset not found: ${ref}`); else if(!entries.size) warnings.push(`Asset reference could not be verified in a JSON-only import: ${ref}`); }
  }
  const assets=[];
  if(entries.size){
    const safeAssetExt=new Set(SAFE_COURSE_ASSET_EXTENSIONS);
    for(const [p,b] of entries){
      if(p==='manifest.json'||p===manifest.course_file||p.endsWith('.json')||p.endsWith('.md')) continue;
      const ext=path.extname(p).toLowerCase();
      if(!safeAssetExt.has(ext)){ errors.push(`Unsupported or unsafe package asset type: ${p}`); continue; }
      if(ext==='.svg'){const txt=b.toString('utf8');if(/<script|\son\w+\s*=|javascript:|<foreignObject/i.test(txt)){errors.push(`Unsafe SVG content: ${p}`);continue;}}
      assets.push({key:p,data:b,mime:mimeFromName(p),size:b.length,sha256:sha256(b)});
    }
  }
  return {ok:errors.length===0,errors,warnings,manifest,course:validation.course,summary:validation.summary,assets};
}

export function findModule(courseContent,moduleId){ return courseContent?.course?.modules?.find(m=>String(m.id)===String(moduleId))||null; }
export function findActivity(courseContent,moduleId,activityId){ return findModule(courseContent,moduleId)?.activities?.find(a=>String(a.id)===String(activityId))||null; }
export function findMission(courseContent,moduleId,missionId){ return findModule(courseContent,moduleId)?.missions?.find(m=>String(m.id)===String(missionId))||null; }

export function findPath(courseContent,moduleId,pathId){ return findModule(courseContent,moduleId)?.paths?.find(p=>String(p.id)===String(pathId))||null; }
