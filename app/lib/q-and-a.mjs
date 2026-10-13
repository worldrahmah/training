import crypto from 'node:crypto';

const DEFAULTS={
  max_questions:3,
  max_characters:280,
  moderation:'pre',
  identity_visibility:'trainer_only',
  upvoting:true,
  allow_self_upvote:false,
  sort:'votes'
};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const hid=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,20);
export function qaConfig(activity={}){
  const raw=activity?.q_and_a&&typeof activity.q_and_a==='object'?activity.q_and_a:{};
  return {
    max_questions:Math.max(1,Math.min(5,Number(raw.max_questions??DEFAULTS.max_questions)||DEFAULTS.max_questions)),
    max_characters:Math.max(40,Math.min(500,Number(raw.max_characters??DEFAULTS.max_characters)||DEFAULTS.max_characters)),
    moderation:['off','pre'].includes(String(raw.moderation||''))?String(raw.moderation):DEFAULTS.moderation,
    identity_visibility:['public','trainer_only','anonymous'].includes(String(raw.identity_visibility||''))?String(raw.identity_visibility):DEFAULTS.identity_visibility,
    upvoting:raw.upvoting!==false,
    allow_self_upvote:raw.allow_self_upvote===true,
    sort:['votes','newest'].includes(String(raw.sort||''))?String(raw.sort):DEFAULTS.sort
  };
}
export function prepareQaEnvelope(activity,answer,{owner_key='owner',previous=null,client_submission_id=null}={}){
  const cfg=qaConfig(activity),prev=previous&&typeof previous==='object'?structuredClone(previous):{};
  const old=prev?.q_and_a&&typeof prev.q_and_a==='object'?prev.q_and_a:{};
  const questions=Array.isArray(old.questions)?old.questions.map(x=>({...x})):[];
  const votes=[...new Set(Array.isArray(old.votes)?old.votes.map(String):[])];
  const text=norm(typeof answer==='string'?answer:answer?.question??answer?.text??'').slice(0,cfg.max_characters);
  if(!text)throw Object.assign(new Error('Question is required.'),{status:400});
  const submissionKey=String(client_submission_id||'').trim()||norm(text).toLocaleLowerCase();
  const id=`qa_${hid(`${owner_key}:${submissionKey}`)}`;
  const normalized=norm(text).toLocaleLowerCase();
  const existing=questions.find(q=>String(q.id)===id||String(q.normalized||norm(q.text).toLocaleLowerCase())===normalized);
  if(existing){existing.text=text;existing.normalized=normalized;return {value:questions.map(q=>q.text),q_and_a:{questions,votes,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};}
  if(questions.length>=cfg.max_questions)throw Object.assign(new Error(`Maximum ${cfg.max_questions} questions per participant.`),{status:409});
  questions.push({id,text,normalized,status:cfg.moderation==='pre'?'pending':'approved',pinned:false,answered:false,created_at:new Date().toISOString()});
  return {value:questions.map(q=>q.text),q_and_a:{questions,votes,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
}
export function updateQaQuestion(envelope,questionId,patch={}){
  const next=structuredClone(envelope&&typeof envelope==='object'?envelope:{}),questions=next?.q_and_a?.questions;
  if(!Array.isArray(questions))return {changed:false,envelope:next};
  const q=questions.find(x=>String(x.id)===String(questionId));if(!q)return {changed:false,envelope:next};
  if(patch.status!==undefined){if(!['pending','approved','rejected'].includes(String(patch.status)))throw Object.assign(new Error('Invalid moderation status.'),{status:400});q.status=String(patch.status)}
  if(patch.pinned!==undefined)q.pinned=!!patch.pinned;
  if(patch.answered!==undefined)q.answered=!!patch.answered;
  return {changed:true,envelope:next};
}
export function setQaVote(envelope,questionId,voted=true){
  const next=structuredClone(envelope&&typeof envelope==='object'?envelope:{value:[]});next.q_and_a??={questions:[],votes:[]};
  const set=new Set(Array.isArray(next.q_and_a.votes)?next.q_and_a.votes.map(String):[]),id=String(questionId);
  if(voted)set.add(id);else set.delete(id);next.q_and_a.votes=[...set];return next;
}
export function aggregateQa(activity,answers=[]){
  const cfg=qaConfig(activity),questions=[],voteCounts=new Map(),ownerByQuestion=new Map(),responders=new Set();
  for(const row of answers){const qa=row?.answer?.q_and_a||{},qs=Array.isArray(qa.questions)?qa.questions:[];if(qs.length)responders.add(String(row?.student_id??row?.team_id??row?.name??questions.length));for(const q of qs){const id=String(q.id||'');if(!id)continue;ownerByQuestion.set(id,String(row?.student_id??row?.team_id??''));const x={question_id:id,text:norm(q.text),status:['pending','approved','rejected'].includes(String(q.status))?String(q.status):(cfg.moderation==='pre'?'pending':'approved'),pinned:!!q.pinned,answered:!!q.answered,created_at:q.created_at||row?.submitted_at||null};if(cfg.identity_visibility!=='anonymous'){x.name=String(row?.name||row?.display_name||row?.username||row?.team_name||'');x.student_id=row?.student_id||null;x.team_id=row?.team_id||null;}questions.push(x)}for(const id of Array.isArray(qa.votes)?qa.votes:[])voteCounts.set(String(id),(voteCounts.get(String(id))||0)+1)}
  for(const q of questions)q.votes=Number(voteCounts.get(q.question_id)||0);
  const publicQuestions=questions.filter(q=>q.status==='approved').map(q=>{const x={question_id:q.question_id,text:q.text,votes:q.votes,pinned:q.pinned,answered:q.answered,created_at:q.created_at};if(cfg.identity_visibility==='public'&&q.name)x.name=q.name;return x}).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.answered)-Number(b.answered)||(cfg.sort==='newest'?String(b.created_at||'').localeCompare(String(a.created_at||'')):Number(b.votes)-Number(a.votes)||String(a.created_at||'').localeCompare(String(b.created_at||''))));
  return {questions:publicQuestions,moderation_entries:questions,pending:questions.filter(q=>q.status==='pending').length,rejected:questions.filter(q=>q.status==='rejected').length,approved:questions.filter(q=>q.status==='approved').length,total_questions:questions.length,responding_participants:responders.size,ownerByQuestion};
}
