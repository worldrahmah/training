import crypto from 'node:crypto';

const DEFAULTS={
  max_ideas:5,
  max_characters:240,
  moderation:'pre',
  identity_visibility:'trainer_only',
  upvoting:true,
  allow_self_upvote:false,
  sort:'votes',
  categories:['Ideas']
};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const hid=s=>crypto.createHash('sha256').update(String(s)).digest('hex').slice(0,20);
const cleanCategory=s=>norm(s).slice(0,40);
export function ideasBoardConfig(activity={}){
  const raw=activity?.ideas_board&&typeof activity.ideas_board==='object'?activity.ideas_board:{};
  const cats=Array.isArray(raw.categories)?raw.categories.map(cleanCategory).filter(Boolean).slice(0,6):[];
  return {
    max_ideas:Math.max(1,Math.min(8,Number(raw.max_ideas??DEFAULTS.max_ideas)||DEFAULTS.max_ideas)),
    max_characters:Math.max(20,Math.min(500,Number(raw.max_characters??DEFAULTS.max_characters)||DEFAULTS.max_characters)),
    moderation:['off','pre'].includes(String(raw.moderation||''))?String(raw.moderation):DEFAULTS.moderation,
    identity_visibility:['public','trainer_only','anonymous'].includes(String(raw.identity_visibility||''))?String(raw.identity_visibility):DEFAULTS.identity_visibility,
    upvoting:raw.upvoting!==false,
    allow_self_upvote:raw.allow_self_upvote===true,
    sort:['votes','newest'].includes(String(raw.sort||''))?String(raw.sort):DEFAULTS.sort,
    categories:cats.length?cats:[...DEFAULTS.categories]
  };
}
export function prepareIdeasBoardEnvelope(activity,answer,{owner_key='owner',previous=null,client_submission_id=null}={}){
  const cfg=ideasBoardConfig(activity),prev=previous&&typeof previous==='object'?structuredClone(previous):{};
  const old=prev?.ideas_board&&typeof prev.ideas_board==='object'?prev.ideas_board:{};
  const ideas=Array.isArray(old.ideas)?old.ideas.map(x=>({...x})):[];
  const votes=[...new Set(Array.isArray(old.votes)?old.votes.map(String):[])];
  const text=norm(typeof answer==='string'?answer:answer?.idea??answer?.text??'').slice(0,cfg.max_characters);
  if(!text)throw Object.assign(new Error('Idea is required.'),{status:400});
  const requestedCategory=cleanCategory(typeof answer==='object'?answer?.category:'');
  const category=cfg.categories.includes(requestedCategory)?requestedCategory:cfg.categories[0];
  const normalized=norm(text).toLocaleLowerCase();
  const submissionKey=String(client_submission_id||'').trim()||`${category.toLocaleLowerCase()}:${normalized}`;
  const id=`idea_${hid(`${owner_key}:${submissionKey}`)}`;
  const existing=ideas.find(x=>String(x.id)===id||(`${String(x.category||'').toLocaleLowerCase()}:${String(x.normalized||norm(x.text).toLocaleLowerCase())}`===`${category.toLocaleLowerCase()}:${normalized}`));
  if(existing){existing.text=text;existing.normalized=normalized;existing.category=category;return {value:ideas.map(x=>x.text),ideas_board:{ideas,votes,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};}
  if(ideas.length>=cfg.max_ideas)throw Object.assign(new Error(`Maximum ${cfg.max_ideas} ideas per participant.`),{status:409});
  ideas.push({id,text,normalized,category,status:cfg.moderation==='pre'?'pending':'approved',pinned:false,merged_into:null,created_at:new Date().toISOString()});
  return {value:ideas.map(x=>x.text),ideas_board:{ideas,votes,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
}
export function updateIdea(envelope,ideaId,patch={}){
  const next=structuredClone(envelope&&typeof envelope==='object'?envelope:{}),ideas=next?.ideas_board?.ideas;
  if(!Array.isArray(ideas))return {changed:false,envelope:next};
  const idea=ideas.find(x=>String(x.id)===String(ideaId));if(!idea)return {changed:false,envelope:next};
  if(patch.status!==undefined){if(!['pending','approved','rejected'].includes(String(patch.status)))throw Object.assign(new Error('Invalid moderation status.'),{status:400});idea.status=String(patch.status);if(idea.status!=='approved')idea.merged_into=null;}
  if(patch.pinned!==undefined)idea.pinned=!!patch.pinned;
  if(patch.merged_into!==undefined)idea.merged_into=patch.merged_into?String(patch.merged_into):null;
  return {changed:true,envelope:next};
}
export function setIdeaVote(envelope,ideaId,voted=true){
  const next=structuredClone(envelope&&typeof envelope==='object'?envelope:{value:[]});next.ideas_board??={ideas:[],votes:[]};
  const set=new Set(Array.isArray(next.ideas_board.votes)?next.ideas_board.votes.map(String):[]),id=String(ideaId);
  if(voted)set.add(id);else set.delete(id);next.ideas_board.votes=[...set];return next;
}
function finalRoot(id,byId){
  let cur=String(id||''),seen=new Set();
  while(cur&&byId.has(cur)){if(seen.has(cur))return null;seen.add(cur);const next=String(byId.get(cur)?.merged_into||'');if(!next)return cur;cur=next;}
  return cur||null;
}
export function aggregateIdeasBoard(activity,answers=[]){
  const cfg=ideasBoardConfig(activity),ideas=[],voteCounts=new Map(),responders=new Set();
  for(const row of answers){const ib=row?.answer?.ideas_board||{},xs=Array.isArray(ib.ideas)?ib.ideas:[];if(xs.length)responders.add(String(row?.student_id??row?.team_id??row?.name??ideas.length));for(const idea of xs){const id=String(idea.id||'');if(!id)continue;const x={idea_id:id,text:norm(idea.text),category:cleanCategory(idea.category)||cfg.categories[0],status:['pending','approved','rejected'].includes(String(idea.status))?String(idea.status):(cfg.moderation==='pre'?'pending':'approved'),pinned:!!idea.pinned,merged_into:idea.merged_into?String(idea.merged_into):null,created_at:idea.created_at||row?.submitted_at||null};if(cfg.identity_visibility!=='anonymous'){x.name=String(row?.name||row?.display_name||row?.username||row?.team_name||'');x.student_id=row?.student_id||null;x.team_id=row?.team_id||null;}ideas.push(x)}for(const id of Array.isArray(ib.votes)?ib.votes:[])voteCounts.set(String(id),(voteCounts.get(String(id))||0)+1)}
  const byId=new Map(ideas.map(x=>[x.idea_id,x]));
  const publicIdeas=[];
  for(const idea of ideas){if(idea.status!=='approved'||idea.merged_into)continue;let votes=Number(voteCounts.get(idea.idea_id)||0),merged_count=0;for(const candidate of ideas){if(candidate.status!=='approved'||candidate.idea_id===idea.idea_id)continue;const root=finalRoot(candidate.idea_id,byId);if(root===idea.idea_id){votes+=Number(voteCounts.get(candidate.idea_id)||0);merged_count++;}}
    const x={idea_id:idea.idea_id,text:idea.text,category:idea.category,votes,pinned:idea.pinned,created_at:idea.created_at,merged_count};if(cfg.identity_visibility==='public'&&idea.name)x.name=idea.name;publicIdeas.push(x);
  }
  publicIdeas.sort((a,b)=>String(a.category).localeCompare(String(b.category))||Number(b.pinned)-Number(a.pinned)||(cfg.sort==='newest'?String(b.created_at||'').localeCompare(String(a.created_at||'')):Number(b.votes)-Number(a.votes)||String(a.created_at||'').localeCompare(String(b.created_at||''))));
  return {ideas:publicIdeas,moderation_entries:ideas,pending:ideas.filter(x=>x.status==='pending').length,rejected:ideas.filter(x=>x.status==='rejected').length,approved:ideas.filter(x=>x.status==='approved').length,total_ideas:ideas.length,visible_ideas:publicIdeas.length,responding_participants:responders.size};
}
export function canMergeIdeas(envelopes,sourceId,targetId){
  const all=[];for(const env of envelopes){for(const x of env?.ideas_board?.ideas||[])all.push(x)}const byId=new Map(all.map(x=>[String(x.id),x])),source=byId.get(String(sourceId)),target=byId.get(String(targetId));
  if(!source||!target||source===target)return false;if(String(source.status||'approved')!=='approved'||String(target.status||'approved')!=='approved')return false;
  let cur=String(target.id),seen=new Set([String(source.id)]);while(cur){if(seen.has(cur))return false;seen.add(cur);const x=byId.get(cur);cur=x?.merged_into?String(x.merged_into):'';}return true;
}
