const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
// Shared, declarative graph analysis for Creator, server validation and portable kit.
export function simulateRoutes(module,{maxRoutes=4096,maxDepth=512}={}) {
 const wf=module.workflow;if(!wf)return {module_id:module.id,explicit:false,routes:[],errors:[]};
 const nodes=new Map((wf.nodes||[]).map(n=>[String(n.id),n])),edges=wf.edges||[],start=String(wf.start_node_id||''),routes=[],errors=[],reachable=new Set(),badNodes=new Set();
 const fail=(id,message)=>{badNodes.add(id);if(!errors.includes(message))errors.push(message)};
 if(!nodes.has(start))fail(start,'Choose an existing start section.');
 let operations=0;const visit=(id,trail,conditions)=>{if(++operations>262144){fail(id,'The simulation exceeds the processing safety limit.');return}
  if(routes.length>=maxRoutes){fail(id,'The route count exceeds the simulation safety limit.');return}
  if(trail.includes(id)||trail.length>=maxDepth){fail(id,'A route repeats without deterministic completion.');return}
  const n=nodes.get(id);if(!n){fail(id,'A route points to a missing section.');return}reachable.add(id);
  const next=edges.filter(e=>String(e.from)===id),path=[...trail,id];
  if(n.terminal===true||n.type==='closing'||n.type==='convergence'&&!next.length){if(next.length)fail(id,'A terminal section has outgoing connections.');routes.push({nodes:path,conditions,terminal:id,status:next.length?'blocked':'complete'});return}
  if(!next.length){fail(id,'A route ends before a closing or terminal section.');routes.push({nodes:path,conditions,terminal:null,status:'blocked'});return}
  const predicates=new Set();
  for(const edge of next){const target=nodes.get(String(edge.to)),inferred=edge.scope==='participant'&&target?.type==='participant_path'?{path_id:target.path_id}:null,condition=edge.condition||inferred;if(edge.scope==='participant'&&target?.type==='participant_path'&&(!edge.condition||edge.condition.path_id!==target.path_id))fail(id,'Each participant choice needs an explicit matching path condition.');
   if(next.length>1&&condition){const key=JSON.stringify(canonical(condition));if(predicates.has(key))fail(id,'Two branches have the same condition.');predicates.add(key)}
   visit(String(edge.to),path,condition?[...conditions,condition]:conditions);
  }
 };
 if(nodes.has(start))visit(start,[],[]);
 const unreachable=[...nodes.keys()].filter(id=>!reachable.has(id));for(const id of unreachable)fail(id,'Some sections cannot be reached from the start.');
 return {module_id:module.id,explicit:true,start_node_id:start,node_count:nodes.size,reachable_count:reachable.size,unreachable,terminal_nodes:[...new Set(routes.map(r=>r.terminal).filter(Boolean))],edges,routes,errors,invalid_nodes:[...badNodes],complete:errors.length===0&&routes.length>0&&routes.every(r=>r.status==='complete')};
}

export function repairMechanicalIds(course,newId){
 const result=structuredClone(course),changes=[],seen=new Set();
 for(const module of result.course.modules||[])for(const path of module.paths||[])for(const step of path.steps||[]){
  if(!step.id||seen.has(step.id)){const before=step.id;step.id=newId();changes.push({kind:'step',before,after:step.id})}seen.add(step.id);
  const blocks=new Set();for(const block of step.content?.blocks||step.blocks||[]){if(block.id&&blocks.has(block.id)){const before=block.id;block.id=newId();changes.push({kind:'block',before,after:block.id})}if(block.id)blocks.add(block.id)}
 }
 return {course:result,changes};
}

// An explicit author action builds only selected branches and preserves authored questions.
export function connectParticipantBranches(module,pathIds,newId,{entryActivityId=null,closingActivityId=null}={}){
 const chosen=pathIds.map(id=>(module.paths||[]).find(p=>p.id===id));
 if(chosen.length<1||chosen.some(p=>!p)||new Set(pathIds).size!==pathIds.length)throw new Error('Choose distinct existing paths.');
 if(entryActivityId&&!(module.activities||[]).some(a=>a.id===entryActivityId))throw new Error('Choose an existing introduction.');
 if(closingActivityId&&!(module.activities||[]).some(a=>a.id===closingActivityId))throw new Error('Choose an existing closing activity.');
 const practice={id:newId(),type:'practice_start',title:'Choose your learning path'},join={id:newId(),type:'convergence',title:'Continue together'},close={id:newId(),type:'closing',title:'Closing',...(closingActivityId?{activity_id:closingActivityId}:{})},nodes=[],edges=[];
 if(entryActivityId){const intro={id:newId(),type:'activity',activity_id:entryActivityId,title:module.activities.find(a=>a.id===entryActivityId).title};nodes.push(intro);edges.push({from:intro.id,to:practice.id,scope:'class'})}
 nodes.push(practice);
 for(const path of chosen){const node={id:newId(),type:'participant_path',path_id:path.id,title:path.title};nodes.push(node);edges.push({from:practice.id,to:node.id,scope:'participant',condition:{path_id:path.id}},{from:node.id,to:join.id,scope:'participant'})}
 nodes.push(join,close);edges.push({from:join.id,to:close.id,scope:'class'});
 return {start_node_id:nodes[0].id,nodes,edges};
}

export function readinessCategories(errors=[],warnings=[]){
 const categories=[['Structure',/schema|format|module.*title|duplicate|requires an id|stable.*id/i],['Workflow',/workflow|branch|converg|terminal|route|transition|unreachable/i],['Assets',/asset|manifest|checksum|packag.*file/i],['Participant runtime',/guided|participant|step|prompt|variable|template|condition|interaction/i],['Projector',/projector|result.*display/i],['Accessibility',/alternative text|alt text|label|contrast/i],['Languages',/language|direction|arabic|english/i],['Responsive',/layout|responsive|width/i]];
 return categories.map(([name,pattern])=>({name,status:errors.some(x=>pattern.test(x)||name==='Structure'&&!categories.some(([,p])=>p.test(x)))?'FAIL':warnings.some(x=>pattern.test(x))?'WARN':name==='Languages'||name==='Responsive'?'REVIEW':'PASS',errors:errors.filter(x=>pattern.test(x)),warnings:warnings.filter(x=>pattern.test(x))}));
}
