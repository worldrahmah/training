import crypto from 'node:crypto';

const DEFAULTS=Object.freeze({
  max_entries:3,
  max_characters:32,
  allow_phrases:true,
  moderation:'off',
  identity_visibility:'trainer_only'
});

export function wordCloudConfig(activity={}){
  const raw=activity?.word_cloud&&typeof activity.word_cloud==='object'?activity.word_cloud:{};
  return {
    max_entries:Math.max(1,Math.min(5,Number(raw.max_entries??DEFAULTS.max_entries)||DEFAULTS.max_entries)),
    max_characters:Math.max(8,Math.min(60,Number(raw.max_characters??DEFAULTS.max_characters)||DEFAULTS.max_characters)),
    allow_phrases:raw.allow_phrases!==false,
    moderation:['off','pre'].includes(String(raw.moderation||''))?String(raw.moderation):DEFAULTS.moderation,
    identity_visibility:['trainer_only','anonymous'].includes(String(raw.identity_visibility||''))?String(raw.identity_visibility):DEFAULTS.identity_visibility
  };
}

export function normalizeWordCloudTerm(value,{case_sensitive=false}={}){
  let text=String(value??'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\u0640/g,'').replace(/[\u064B-\u065F\u0670]/g,'').trim().replace(/\s+/g,' ');
  text=text.replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu,'').trim();
  if(!case_sensitive) text=text.toLocaleLowerCase('und');
  return text;
}

function entryId(ownerKey,normalized){return `wc_${crypto.createHash('sha256').update(`${ownerKey}:${normalized}`).digest('hex').slice(0,16)}`;}

export function prepareWordCloudEnvelope(activity,answer,{owner_key='participant',previous=null,client_submission_id=null}={}){
  const cfg=wordCloudConfig(activity);
  const values=Array.isArray(answer)?answer:String(answer??'').split(/\r?\n/);
  const priorEntries=Array.isArray(previous?.word_cloud?.entries)?previous.word_cloud.entries:[];
  const priorByNormalized=new Map(priorEntries.map(x=>[String(x.normalized||''),x]));
  const seen=new Set(),entries=[];
  for(const raw of values){
    const display=String(raw??'').normalize('NFKC').trim().replace(/\s+/g,' ');
    if(!display)continue;
    if(display.length>cfg.max_characters)throw Object.assign(new Error(`Each Word Cloud entry must be ${cfg.max_characters} characters or fewer.`),{status:400,code:'WORD_CLOUD_ENTRY_TOO_LONG'});
    if(!cfg.allow_phrases&&/\s/.test(display))throw Object.assign(new Error('This Word Cloud accepts single words only.'),{status:400,code:'WORD_CLOUD_SINGLE_WORD_ONLY'});
    const normalized=normalizeWordCloudTerm(display);
    if(!normalized)continue;
    if(seen.has(normalized))continue;
    seen.add(normalized);
    if(entries.length>=cfg.max_entries)throw Object.assign(new Error(`Submit no more than ${cfg.max_entries} Word Cloud entries.`),{status:400,code:'WORD_CLOUD_TOO_MANY_ENTRIES'});
    const prev=priorByNormalized.get(normalized);
    const status=cfg.moderation==='pre'?(prev?.status&&['approved','rejected'].includes(prev.status)?prev.status:'pending'):'approved';
    entries.push({id:entryId(owner_key,normalized),text:display,normalized,status});
  }
  if(!entries.length)throw Object.assign(new Error('Enter at least one Word Cloud response.'),{status:400,code:'WORD_CLOUD_EMPTY'});
  return {value:entries.map(x=>x.text),word_cloud:{entries,client_submission_id:client_submission_id?String(client_submission_id).slice(0,120):null}};
}

export function aggregateWordCloud(activity,answers=[]){
  const cfg=wordCloudConfig(activity),counts=new Map(),moderation_entries=[];
  let pending=0,rejected=0,approved=0,totalEntries=0;
  for(const row of answers){
    const envelope=row?.answer&&typeof row.answer==='object'?row.answer:{};
    let entries=Array.isArray(envelope?.word_cloud?.entries)?envelope.word_cloud.entries:[];
    if(!entries.length){
      const vals=Array.isArray(envelope?.value)?envelope.value:Array.isArray(row?.answer)?row.answer:[];
      entries=vals.map(text=>({id:entryId(row?.student_id||row?.team_id||'legacy',normalizeWordCloudTerm(text)),text:String(text),normalized:normalizeWordCloudTerm(text),status:'approved'}));
    }
    for(const entry of entries){
      const normalized=String(entry.normalized||normalizeWordCloudTerm(entry.text));if(!normalized)continue;
      totalEntries++;
      const status=['approved','rejected','pending'].includes(entry.status)?entry.status:'approved';
      if(status==='pending')pending++;else if(status==='rejected')rejected++;else approved++;
      const moderationEntry={entry_id:String(entry.id||entryId(row?.student_id||row?.team_id||'legacy',normalized)),text:String(entry.text||normalized),normalized,status};
      if(cfg.identity_visibility!=='anonymous')Object.assign(moderationEntry,{name:String(row?.name||row?.display_name||row?.username||row?.team_name||''),student_id:row?.student_id||null,team_id:row?.team_id||null});
      moderation_entries.push(moderationEntry);
      if(status!=='approved')continue;
      const current=counts.get(normalized)||{normalized,text:String(entry.text||normalized),count:0};current.count++;counts.set(normalized,current);
    }
  }
  const words=[...counts.values()].sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text));
  const max=words[0]?.count||1,min=words.at(-1)?.count||1;
  for(const w of words)w.weight=max===min?1:Number(((w.count-min)/(max-min)).toFixed(4));
  return {words,moderation_entries,pending,rejected,approved,total_entries:totalEntries};
}

export function updateWordCloudModeration(envelope,entryId,status){
  if(!['approved','rejected','pending'].includes(String(status)))throw Object.assign(new Error('Invalid moderation status.'),{status:400});
  const next=structuredClone(envelope&&typeof envelope==='object'?envelope:{}),entries=next?.word_cloud?.entries;
  if(!Array.isArray(entries))return {changed:false,envelope:next};
  const target=entries.find(x=>String(x.id)===String(entryId));if(!target)return {changed:false,envelope:next};
  target.status=String(status);return {changed:true,envelope:next};
}
