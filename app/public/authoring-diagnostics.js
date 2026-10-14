// Shared, declarative authoring diagnostics. No execution is accepted from courses.
export function milestoneDependencies(content,index){
  const course=content.course||content,modules=course.modules||[],target=modules[index];if(!target)return [];
  const ids=new Set([target.id,...['activities','missions','paths'].flatMap(k=>(target[k]||[]).map(x=>x.id))].map(String)),found=[];
  function walk(value,path,mi){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){
    if(['module_id','next_module_id','activity_id','next_activity_id','mission_id','path_id'].includes(key)&&ids.has(String(item)))found.push({mi,title:modules[mi]?.title||course.title||'Course',reference:String(item),field:key});
    else if(typeof item==='object')walk(item,`${path}.${key}`,mi);
  }}
  modules.forEach((module,mi)=>{if(mi!==index)walk(module,'module',mi)});
  for(const [key,value] of Object.entries(course))if(key!=='modules')walk(value,key,null);
  return found;
}
export function describeCourseIssues(content,errors=[],warnings=[]){
  const modules=(content?.course||content||{}).modules||[];
  return [...errors.map(message=>({message,severity:'blocker'})),...warnings.map(message=>({message,severity:'warning'}))].map(({message,severity})=>{
    message=String(message);let selection=null,location=(content?.course||content||{}).title||'Course';
    for(let mi=0;mi<modules.length;mi++){
      const module=modules[mi];if(message.startsWith(`Module ${module.id}:`)||message.includes(`Module ${module.id} `)){selection={kind:/workflow|node|transition|terminal|branch|convergence/i.test(message)?'workflow':'module',mi};location=module.title||'Milestone';}
      for(const [collection,kind] of [['activities','activity'],['missions','mission'],['paths','path']])for(let ii=0;ii<(module[collection]||[]).length;ii++){
        const item=module[collection][ii];if(new RegExp(`^(Activity|Mission|Path) ${String(item.id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(:|\\s)`).test(message)){selection={kind,mi,ii};location=`${module.title||'Milestone'} / ${item.title||kind}`;}
      }
    }
    const rules=[
      [/objective/i,'Learning objective evidence is missing or inconsistent.','Open milestone learning objectives, then assign valid objective references to the relevant activities and missions.','أدلة أهداف التعلم مفقودة أو غير متسقة.','افتح أهداف تعلم المحطة ثم اربط الأنشطة والمهام ذات الصلة بأهداف موجودة وصالحة.'],
      [/at least one node|exactly one start|start[_ ]node/i,'The explicit workflow has no valid starting point.','Add workflow nodes and choose one existing start node. For a linear milestone, remove its empty explicit workflow.','المسار الصريح لا يحتوي على نقطة بداية صالحة.','أضف عناصر المسار وحدد نقطة بداية واحدة موجودة. للمحطة الخطية احذف المسار الصريح الفارغ.'],
      [/missing activity|missing mission|missing participant path|requires (activity_id|mission_id|path_id)/i,'A workflow node has no valid content destination.','Open Workflow and select an existing activity, mission or participant path for this node.','عنصر المسار لا يشير إلى محتوى موجود.','افتح المسار واختر نشاطًا أو مهمة أو مسار مشارك موجودًا لهذا العنصر.'],
      [/terminal|dead end|converge/i,'The workflow does not finish or converge correctly.','Give each unfinished node a valid transition; use a closing/terminal node with no outgoing transitions and ensure every path reaches it.','المسار لا ينتهي أو يتقارب بشكل صحيح.','أضف انتقالًا صالحًا لكل عنصر غير منتهٍ وحدد نهاية دون انتقالات خارجة وتأكد من وصول جميع المسارات إليها.'],
      [/orphan|unreachable/i,'A workflow node cannot be reached from the start.','Connect this node to the executable route or remove it, then validate again.','يوجد عنصر لا يمكن الوصول إليه من بداية المسار.','اربط العنصر بالمسار القابل للتنفيذ أو احذفه ثم تحقق مرة أخرى.'],
      [/condition|branch|transition/i,'A workflow transition or branch is incomplete or invalid.','Check its source, destination and condition. Every branch needs a valid destination and an explicit supported condition.','انتقال أو تفرع في المسار غير مكتمل أو غير صالح.','تحقق من المصدر والوجهة والشرط. يحتاج كل تفرع إلى وجهة صالحة وشرط مدعوم وصريح.'],
      [/correct|accepted|answer|option|pair|blank|sorting/i,'The activity response or assessment settings need correction.','Open the activity settings and complete the required choices, accepted answers or matching/sorting configuration indicated below.','إعدادات الاستجابة أو التقييم تحتاج إلى تصحيح.','افتح إعدادات النشاط وأكمل الخيارات والإجابات المقبولة أو إعدادات المطابقة والترتيب الموضحة أدناه.'],
      [/asset|file|image|media/i,'A required resource or media reference is missing or invalid.','Upload the resource into this draft’s asset library and select its supported asset reference.','مورد أو مرجع وسائط مطلوب مفقود أو غير صالح.','ارفع المورد إلى مكتبة أصول المسودة واختر مرجعه المدعوم.'],
      [/id|duplicate/i,'A required stable identifier is missing or duplicated.','Use the visual editor to create a distinct item; preserve accepted identifiers and remove duplicate references.','معرّف ثابت مطلوب مفقود أو مكرر.','أنشئ عنصرًا مميزًا عبر المحرر مع الحفاظ على المعرّفات المعتمدة وإزالة التكرار.'],
      [/title|module|course|schema|type/i,'Required course content or a supported configuration is incomplete.','Open the indicated item, complete its required fields and choose a supported type, then validate again.','محتوى مطلوب أو إعداد مدعوم غير مكتمل.','افتح العنصر المحدد وأكمل الحقول المطلوبة واختر نوعًا مدعومًا ثم تحقق مرة أخرى.']
    ];
    const rule=rules.find(([pattern])=>pattern.test(message));
    let detail=message;for(const module of modules){detail=detail.replaceAll(`Module ${module.id}`,`Milestone “${module.title||'Untitled'}”`);for(const k of ['activities','missions','paths'])for(const item of module[k]||[]){const escaped=String(item.id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');detail=detail.replace(new RegExp(`(Activity|activity|Mission|mission|participant path|Path|path) ${escaped}(?=[\\s:.,]|$)`,'g'),(_,label)=>`${label} “${item.title||k}”`)}}
    for(const [key,label] of Object.entries({start_node_id:'start node',activity_id:'activity',mission_id:'mission',path_id:'participant path',terminal:'terminal',results_display:'result view'}))detail=detail.replaceAll(key,label);
    return {severity,location,selection,detail,cause:rule?.[1]||'Validation found an incompatible configuration.',fix:rule?.[2]||'Review the detailed validation message, correct the indicated configuration and validate again.',cause_ar:rule?.[3]||'وجد التحقق إعدادًا غير متوافق.',fix_ar:rule?.[4]||'راجع تفاصيل التحقق وصحح الإعداد المشار إليه ثم تحقق مرة أخرى.'};
  });
}
