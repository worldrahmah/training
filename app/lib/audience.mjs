import {matchingConfig,sortingConfig,imageInteractionConfig} from './advanced-interactions.mjs';

const solutions=new Set(['correct_answer','correct_answers','correct_order','accepted_answers','expected_answer','answer','answers','explanation']);
function project(value,revealed){
  if(Array.isArray(value))return value.map(x=>project(x,revealed));
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).filter(([k])=>k!=='trainer'&&(revealed||!solutions.has(k))).map(([k,v])=>[k,project(v,revealed)]));
}
export function audienceItem(definition,{revealed=false}={}){
  if(!definition)return definition;
  const item=project(definition,revealed);
  if(!revealed){
    delete item.flow;delete item.score;
    if(item.type==='matching'){
      const cfg=matchingConfig(definition);
      item.matching={...(item.matching||{}),pairs:cfg.pairs.map(p=>({id:p.id,left:p.left})),choices:[...new Set(cfg.pairs.map(p=>p.right))].sort((a,b)=>a.localeCompare(b))};
      if(item.content)delete item.content.pairs;
    }
    if(item.type==='sorting'){item.sorting={...(item.sorting||{}),items:[...sortingConfig(definition).items].sort((a,b)=>a.localeCompare(b))};if(item.content){delete item.content.items;delete item.content.options}}
    if(item.type==='image_interaction'){
      const cfg=imageInteractionConfig(definition);item.image_interaction={...(item.image_interaction||{}),targets:cfg.targets.map(t=>({id:t.id,label:t.label}))};
      if(item.content)delete item.content.targets;
    }
  }
  return item;
}
export function audienceLive(live){
  if(!live)return live;
  const revealed=['results','explain'].includes(live.state?.phase);
  const safe={...live,item:audienceItem(live.item,{revealed})};
  if(live.personal_path)safe.personal_path=audienceItem(live.personal_path,{revealed:false});
  if(live.projector_recall)safe.projector_recall={...live.projector_recall,item:audienceItem(live.projector_recall.item,{revealed:true})};
  return safe;
}
