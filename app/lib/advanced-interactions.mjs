import crypto from 'node:crypto';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const text=v=>String(v??'').trim();
const norm=v=>text(v).normalize('NFKC').replace(/\s+/g,' ').trim();
const id=(prefix='x')=>`${prefix}_${crypto.randomBytes(8).toString('hex')}`;
const uniq=a=>[...new Set((a||[]).map(x=>String(x)))];

export function prioritizationConfig(activity={}){
  const raw=activity.prioritization&&typeof activity.prioritization==='object'?activity.prioritization:{};
  const options=(Array.isArray(activity?.content?.options)?activity.content.options:[]).map(x=>typeof x==='string'?x:x?.label||x?.title||'').map(text).filter(Boolean).slice(0,20);
  return {budget:clamp(raw.budget??100,1,1000),require_full_allocation:raw.require_full_allocation!==false,max_per_option:clamp(raw.max_per_option??raw.budget??100,1,1000),options};
}
export function preparePrioritizationEnvelope(activity,answer,{client_submission_id=null}={}){
  const cfg=prioritizationConfig(activity),src=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{};const allocation={};let total=0;
  for(const opt of cfg.options){const raw=Number(src[opt]??0);if(!Number.isFinite(raw)||raw<0||raw>cfg.max_per_option||Math.round(raw)!==raw)throw Object.assign(new Error(`Allocation for ${opt} must be a whole number from 0 to ${cfg.max_per_option}.`),{status:400});const v=Math.round(raw);allocation[opt]=v;total+=v;}
  if(cfg.require_full_allocation&&total!==cfg.budget)throw Object.assign(new Error(`Allocate exactly ${cfg.budget} points before submitting.`),{status:400});
  if(total>cfg.budget)throw Object.assign(new Error(`Allocation cannot exceed ${cfg.budget} points.`),{status:400});
  return {value:allocation,prioritization:{allocation,total,budget:cfg.budget,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
}
export function aggregatePrioritization(activity,answers=[]){
  const cfg=prioritizationConfig(activity),totals=Object.fromEntries(cfg.options.map(x=>[x,0]));let responders=0;
  for(const r of answers){const a=r?.answer?.prioritization?.allocation??r?.answer?.value??r?.answer;if(!a||typeof a!=='object'||Array.isArray(a))continue;responders++;for(const o of cfg.options)totals[o]+=Math.max(0,Number(a[o]||0));}
  const totalPoints=Object.values(totals).reduce((a,b)=>a+b,0),ranking=Object.entries(totals).map(([label,points])=>({label,points,percent:totalPoints?points/totalPoints*100:0})).sort((a,b)=>b.points-a.points||a.label.localeCompare(b.label));
  return {responding_participants:responders,total_points:totalPoints,budget:cfg.budget,prioritization:ranking};
}

export function quickInteractionConfig(activity={}){
  const raw=activity.quick_interaction&&typeof activity.quick_interaction==='object'?activity.quick_interaction:{};
  const preset=['agree','understand','help','yes_no','custom'].includes(raw.preset)?raw.preset:'custom';
  const presets={agree:['Agree','Not sure','Disagree'],understand:['Got it','Almost','Need help'],help:['All good','Need help'],yes_no:['Yes','No']};
  let options=(Array.isArray(activity?.content?.options)?activity.content.options:[]).map(x=>typeof x==='string'?x:x?.label||'').map(text).filter(Boolean);
  if(!options.length&&presets[preset])options=presets[preset];if(!options.length)options=['Yes','No'];
  return {preset,options:options.slice(0,8),anonymous:raw.anonymous!==false};
}

export function matchingConfig(activity={}){
  const pairs=Array.isArray(activity?.matching?.pairs)?activity.matching.pairs:Array.isArray(activity?.content?.pairs)?activity.content.pairs:[];
  return {pairs:pairs.map((p,i)=>({id:text(p?.id)||`p${i+1}`,left:text(p?.left??p?.prompt),right:text(p?.right??p?.answer)})).filter(p=>p.left&&p.right).slice(0,20),shuffle:activity?.matching?.shuffle!==false};
}
export function fillBlanksConfig(activity={}){
  const blanks=Array.isArray(activity?.fill_blanks?.blanks)?activity.fill_blanks.blanks:Array.isArray(activity?.content?.blanks)?activity.content.blanks:[];
  return {case_sensitive:activity?.fill_blanks?.case_sensitive===true,blanks:blanks.map((b,i)=>({id:text(b?.id)||`b${i+1}`,label:text(b?.label||b?.prompt||`Blank ${i+1}`),answers:(Array.isArray(b?.answers)?b.answers:[b?.answer]).map(text).filter(Boolean)})).filter(b=>b.answers.length).slice(0,20)};
}
export function sortingConfig(activity={}){
  const items=(Array.isArray(activity?.sorting?.items)?activity.sorting.items:Array.isArray(activity?.content?.items)?activity.content.items:[]).map(text).filter(Boolean).slice(0,20);
  const order=(Array.isArray(activity?.sorting?.correct_order)?activity.sorting.correct_order:items).map(text).filter(Boolean);
  return {items,correct_order:order.length?order:items};
}
export function imageInteractionConfig(activity={}){
  const raw=activity.image_interaction&&typeof activity.image_interaction==='object'?activity.image_interaction:{};
  const mode=['pin','find','label','drag'].includes(raw.mode)?raw.mode:'pin';
  const targets=(Array.isArray(raw.targets)?raw.targets:[]).map((t,i)=>({id:text(t?.id)||`t${i+1}`,label:text(t?.label||`Target ${i+1}`),x:clamp(t?.x,0,100),y:clamp(t?.y,0,100),tolerance:clamp(t?.tolerance??8,1,30)})).slice(0,20);
  return {mode,asset:text(raw.asset||activity?.content?.image_asset||''),targets,max_points:clamp(raw.max_points??(targets.length||1),1,20)};
}
export function drawingConfig(activity={}){
  const raw=activity.draw_annotate&&typeof activity.draw_annotate==='object'?activity.draw_annotate:{};
  return {asset:text(raw.asset||activity?.content?.image_asset||''),max_strokes:clamp(raw.max_strokes??120,1,500),allow_text:raw.allow_text!==false};
}
export function collaborativeBoardConfig(activity={}){
  const raw=activity.collaborative_board&&typeof activity.collaborative_board==='object'?activity.collaborative_board:{};
  const categories=(Array.isArray(raw.categories)?raw.categories:['Board']).map(text).filter(Boolean).slice(0,8);return {max_notes:clamp(raw.max_notes??5,1,12),max_characters:clamp(raw.max_characters??240,20,500),categories:categories.length?categories:['Board'],identity_visibility:['public','trainer_only','anonymous'].includes(raw.identity_visibility)?raw.identity_visibility:'trainer_only'};
}
export function interactiveVideoConfig(activity={}){
  const raw=activity.interactive_video&&typeof activity.interactive_video==='object'?activity.interactive_video:{};
  const checkpoints=(Array.isArray(raw.checkpoints)?raw.checkpoints:[]).map((c,i)=>({id:text(c?.id)||`cp${i+1}`,time_seconds:Math.max(0,Number(c?.time_seconds)||0),prompt:text(c?.prompt||`Checkpoint ${i+1}`),type:['single_choice','short_answer','confidence'].includes(c?.type)?c.type:'single_choice',options:(Array.isArray(c?.options)?c.options:[]).map(text).filter(Boolean),correct_answer:c?.correct_answer??null})).filter(c=>c.prompt).slice(0,30);
  return {asset:text(raw.asset||activity?.content?.video_asset||''),checkpoints,pause_at_checkpoint:raw.pause_at_checkpoint!==false};
}

export function prepareAdvancedEnvelope(activity,answer,{client_submission_id=null,previous=null}={}){
  const type=String(activity?.type||'');
  if(type==='prioritization_100')return preparePrioritizationEnvelope(activity,answer,{client_submission_id});
  if(type==='collaborative_board'){
    const cfg=collaborativeBoardConfig(activity),input=answer&&typeof answer==='object'?answer:{text:answer};
    const prevNotes=Array.isArray(previous?.collaborative_board?.notes)?previous.collaborative_board.notes:[];
    const old=prevNotes.map(n=>({id:text(n?.id)||id('note'),text:norm(n?.text),category:cfg.categories.includes(text(n?.category))?text(n.category):cfg.categories[0],created_at:text(n?.created_at)||new Date().toISOString()})).filter(n=>n.text).slice(0,cfg.max_notes);
    const noteText=norm(input.text);if(!noteText)throw Object.assign(new Error('Enter an idea before submitting.'),{status:400});if(noteText.length>cfg.max_characters)throw Object.assign(new Error(`Keep the note within ${cfg.max_characters} characters.`),{status:400});
    const cat=cfg.categories.includes(text(input.category))?text(input.category):cfg.categories[0];
    const dupe=old.some(n=>norm(n.text).toLocaleLowerCase()===noteText.toLocaleLowerCase()&&n.category===cat);
    if(!dupe){if(old.length>=cfg.max_notes)throw Object.assign(new Error(`You can submit up to ${cfg.max_notes} notes.`),{status:409});old.push({id:id('note'),text:noteText,category:cat,created_at:new Date().toISOString()});}
    return {value:old.map(x=>x.text),collaborative_board:{notes:old,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='image_interaction'){
    const cfg=imageInteractionConfig(activity),src=answer&&typeof answer==='object'?answer:{points:[]},raw=Array.isArray(src.points)?src.points:[],points=raw.slice(0,cfg.max_points).map(p=>({x:clamp(p?.x,0,100),y:clamp(p?.y,0,100),label:text(p?.label).slice(0,120)}));
    if(!points.length)throw Object.assign(new Error('Place at least one answer on the image.'),{status:400});
    if(['label','drag'].includes(cfg.mode)&&cfg.targets.length){for(const p of points)if(!cfg.targets.some(t=>t.label===p.label))throw Object.assign(new Error('Choose one of the configured image labels.'),{status:400});}
    return {value:{points},advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='matching'){
    const cfg=matchingConfig(activity),src=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{},rights=cfg.pairs.map(p=>p.right),value={};if(!cfg.pairs.length)throw Object.assign(new Error('Matching activity is not configured.'),{status:409});for(const p of cfg.pairs){const v=text(src[p.id]);if(!v)throw Object.assign(new Error('Complete every matching pair before submitting.'),{status:400});if(!rights.includes(v))throw Object.assign(new Error('Choose only configured matching answers.'),{status:400});value[p.id]=v;}return {value,advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='fill_blanks'){
    const cfg=fillBlanksConfig(activity),src=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{},value={};if(!cfg.blanks.length)throw Object.assign(new Error('Fill-in-the-Blanks activity is not configured.'),{status:409});for(const b of cfg.blanks){const v=text(src[b.id]);if(!v)throw Object.assign(new Error('Complete every blank before submitting.'),{status:400});value[b.id]=v;}return {value,advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='sorting'){
    const cfg=sortingConfig(activity),arr=Array.isArray(answer)?answer.map(text):[];if(cfg.items.length<2)throw Object.assign(new Error('Sorting activity is not configured.'),{status:409});if(arr.length!==cfg.items.length||new Set(arr).size!==cfg.items.length||arr.some(x=>!cfg.items.includes(x)))throw Object.assign(new Error('Order every sorting item exactly once.'),{status:400});return {value:arr,advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='interactive_video'){
    const cfg=interactiveVideoConfig(activity),src=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{},value={};if(!cfg.asset)throw Object.assign(new Error('Interactive Video has no video asset.'),{status:409});for(const cp of cfg.checkpoints){const raw=src[cp.id];if(cp.type==='single_choice'){const v=text(raw);if(!v||!cp.options.includes(v))throw Object.assign(new Error('Answer every video choice checkpoint.'),{status:400});value[cp.id]=v;}else if(cp.type==='confidence'){const v=Number(raw);if(!Number.isFinite(v)||v<1||v>5)throw Object.assign(new Error('Confidence checkpoint must be from 1 to 5.'),{status:400});value[cp.id]=v;}else{const v=text(raw);if(!v)throw Object.assign(new Error('Answer every video checkpoint.'),{status:400});value[cp.id]=v;}}return {value,advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  if(type==='draw_annotate'){
    const cfg=drawingConfig(activity),src=answer&&typeof answer==='object'?answer:{},strokes=(Array.isArray(src.strokes)?src.strokes:[]).slice(0,cfg.max_strokes).map(st=>(Array.isArray(st)?st:[]).slice(0,1000).map(p=>({x:clamp(p?.x,0,100),y:clamp(p?.y,0,100)}))).filter(st=>st.length),labels=cfg.allow_text?(Array.isArray(src.labels)?src.labels:[]).slice(0,30).map(l=>({text:text(l?.text).slice(0,120),x:clamp(l?.x,0,100),y:clamp(l?.y,0,100)})).filter(l=>l.text):[];
    if(!strokes.length&&!labels.length)throw Object.assign(new Error('Add an annotation before submitting.'),{status:400});
    return {value:{strokes,labels},advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
  }
  const value=answer;
  return {value,advanced:{client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
}

export function aggregateAssessment(activity,answers=[]){
  const type=String(activity?.type||''),rows=[];let totalScore=0,maxScore=0;
  for(const r of answers){const a=r?.answer?.value??r?.answer;let correct=0,max=0,detail=[];
    if(type==='matching'){const cfg=matchingConfig(activity);max=cfg.pairs.length;for(const p of cfg.pairs){const ok=String(a?.[p.id]??'')===p.right;if(ok)correct++;detail.push({id:p.id,label:p.left,correct:ok});}}
    else if(type==='fill_blanks'){const cfg=fillBlanksConfig(activity);max=cfg.blanks.length;for(const b of cfg.blanks){const v=text(a?.[b.id]),normv=cfg.case_sensitive?v:v.toLocaleLowerCase(),ok=b.answers.some(x=>(cfg.case_sensitive?x:x.toLocaleLowerCase())===normv);if(ok)correct++;detail.push({id:b.id,label:b.label,correct:ok});}}
    else if(type==='sorting'){const cfg=sortingConfig(activity),arr=Array.isArray(a)?a:Object.entries(a||{}).sort((x,y)=>Number(x[1])-Number(y[1])).map(x=>x[0]);max=cfg.correct_order.length;for(let i=0;i<max;i++){const ok=String(arr[i]??'')===String(cfg.correct_order[i]);if(ok)correct++;detail.push({id:String(i),label:cfg.correct_order[i],correct:ok});}}
    else if(type==='interactive_video'){const cfg=interactiveVideoConfig(activity);for(const cp of cfg.checkpoints){if(cp.type==='short_answer'||cp.correct_answer==null)continue;max++;const ok=String(a?.[cp.id]??'')===String(cp.correct_answer);if(ok)correct++;detail.push({id:cp.id,label:cp.prompt,correct:ok});}}
    const percent=max?correct/max*100:0;totalScore+=correct;maxScore+=max;rows.push({name:r.name||r.display_name||r.username||'',student_id:r.student_id||null,correct,max,percent,detail});
  }
  return {assessment:rows,average_percent:rows.length?rows.reduce((s,x)=>s+x.percent,0)/rows.length:0,total_correct:totalScore,total_possible:maxScore};
}
function imagePointCorrect(cfg,p){if(!cfg.targets.length)return null;const candidates=['label','drag'].includes(cfg.mode)&&text(p?.label)?cfg.targets.filter(t=>t.label===text(p.label)):cfg.targets;return candidates.some(t=>Math.hypot(clamp(p?.x,0,100)-t.x,clamp(p?.y,0,100)-t.y)<=t.tolerance);}
export function aggregateImageInteraction(activity,answers=[]){
  const cfg=imageInteractionConfig(activity),points=[];let correct=0,scored=0;for(const r of answers){const val=r?.answer?.value??r?.answer;const xs=Array.isArray(val?.points)?val.points:Array.isArray(val)?val:[];for(const p of xs){const ok=imagePointCorrect(cfg,p);if(ok!==null){scored++;if(ok)correct++;}points.push({x:clamp(p?.x,0,100),y:clamp(p?.y,0,100),label:text(p?.label),name:r.name||'',correct:ok});}}
  return {image_points:points,responding_participants:answers.filter(r=>{const v=r?.answer?.value??r?.answer;return Array.isArray(v?.points)?v.points.length:Array.isArray(v)?v.length:0}).length,mode:cfg.mode,asset:cfg.asset,correct_points:correct,scored_points:scored,accuracy_percent:scored?correct/scored*100:null};
}
export function aggregateDrawing(activity,answers=[]){
  const cfg=drawingConfig(activity);return {drawings:answers.map(r=>({name:r.name||'',student_id:r.student_id||null,drawing:r?.answer?.value??r?.answer})).filter(x=>x.drawing),asset:cfg.asset};
}
export function aggregateCollaborativeBoard(activity,answers=[]){
  const cfg=collaborativeBoardConfig(activity),notes=[];const responders=new Set();for(const r of answers){const ns=r?.answer?.collaborative_board?.notes||[];if(ns.length)responders.add(String(r.student_id??r.name??notes.length));for(const n of ns){const row={id:n.id||id('note'),text:n.text,category:n.category||cfg.categories[0]};if(cfg.identity_visibility!=='anonymous')row.name=r.name||'';notes.push(row)}}return {collaborative_board:notes,categories:cfg.categories,responding_participants:responders.size};
}

export function scoreAdvanced(activity,answer){
  const type=String(activity?.type||'');
  if(type==='image_interaction'){const cfg=imageInteractionConfig(activity),xs=Array.isArray(answer?.points)?answer.points:[];if(!cfg.targets.length)return Number(activity?.score?.participation??0);const hits=xs.filter(p=>imagePointCorrect(cfg,p)===true).length,max=Math.max(1,['label','drag'].includes(cfg.mode)?cfg.targets.length:Math.min(cfg.targets.length,cfg.max_points)),points=Number(activity?.score?.correct??activity?.score?.points??100);return Number((Math.min(1,hits/max)*points).toFixed(4));}
  if(!['matching','fill_blanks','sorting','interactive_video'].includes(type))return null;
  const agg=aggregateAssessment(activity,[{answer:{value:answer}}]),row=agg.assessment[0];const maxPoints=Number(activity?.score?.correct??activity?.score?.points??100);return row?.max?Number((row.correct/row.max*maxPoints).toFixed(4)):Number(activity?.score?.participation??0);
}
