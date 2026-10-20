import {connectParticipantBranches} from './authoring-model.js';

// A complete ordinary canonical lesson, not a special runtime course type.
export function createStarterLesson({title,body,task,question,duration=20},newId,t=x=>x){
 if(!String(title||'').trim()||!String(body||'').trim())throw new Error('Enter a lesson name and its teaching content.');
 const id=prefix=>prefix+'_'+newId(),intro=id('intro'),reflection=id('reflection'),closing=id('closing'),path=id('path');
 const module={id:id('lesson'),title:String(title).trim(),duration_minutes:Math.max(1,Math.min(480,Number(duration)||20)),objectives:[],missions:[],activities:[
  {id:intro,type:'presentation',title:String(title).trim(),content:{blocks:[{id:id('content'),type:'text',body_md:String(body)}]}},
  {id:reflection,type:'short_answer',title:t('Your reflection'),content:{question:String(question||t('What is the most useful thing you learned?'))}},
  {id:closing,type:'announcement',title:t('Lesson complete'),content:{blocks:[{id:id('content'),type:'text',body_md:t('Share your learning and discuss the next step with your trainer.')}]}},
 ],paths:[{id:path,guided:true,title:t('Your practice'),goal:String(task||t('Apply what you learned.')),steps:[
  {id:id('step'),title:t('Try it yourself'),content:{blocks:[{id:id('content'),type:'text',body_md:String(task||t('Apply what you learned.'))}]},completion:{type:'acknowledge'}},
  {id:id('step'),title:t('Your reflection'),interaction:{activity_id:reflection},completion:{type:'none'}}
 ]}]};
 module.workflow=connectParticipantBranches(module,[path],()=>id('node'),{entryActivityId:intro,closingActivityId:closing});return module;
}
