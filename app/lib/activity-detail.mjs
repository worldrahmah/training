const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
export async function handleActivityDetail(req,res,url,c){
 const match=url.pathname.match(/^\/api\/account\/activity\/(\d+)$/);if(!match)return false;
 const {db,json,requireUser,isAdminLike,visibleClassIds,sectionPermission}=c,user=requireUser(req,res,url);if(!user)return true;if(req.method!=='GET')fail('Activity details are read only.',405);
 const row=db.prepare('SELECT e.*,u.display_name actor,cl.title class_title FROM activity_events e LEFT JOIN users u ON u.id=e.user_id LEFT JOIN classes cl ON cl.id=e.class_id WHERE e.id=?').get(Number(match[1]));
 const audit=url.searchParams.get('scope')==='audit';let allowed=row?.user_id===user.id;
 if(audit&&user.role==='trainer'&&user.staff_role!=='course_editor'&&sectionPermission(user,5)){allowed=isAdminLike(user)||allowed||(visibleClassIds(user)||[]).includes(row?.class_id)||(row?.entity_type==='group'&&!!db.prepare('SELECT 1 FROM workspace_groups WHERE id=? AND owner_id=?').get(Number(row?.entity_id),user.id))}
 if(!row||!allowed)fail('Activity not found.',404);
 // Never return raw event payloads, answers, private cues, tokens or chat/note text.
 let payload={};try{payload=JSON.parse(row.payload_json||'{}')}catch{}
 const labels={title:'Title',status:'Status',count:'Items',minutes:'Minutes',affected:'Affected items',skipped:'Skipped items',kind:'Type',operation:'Action',language:'Language'};
 const fields=Object.entries(labels).filter(([key])=>Object.hasOwn(payload,key)&&!(key==='title'&&row.event_type.startsWith('staff_task_')&&row.user_id!==user.id)&&['string','number','boolean'].includes(typeof payload[key])).map(([key,label])=>({label,value:String(payload[key]).slice(0,300)}));
 json(res,200,{ok:true,activity:{id:row.id,event_type:row.event_type,created_at:row.created_at,actor:row.actor||'',class_title:row.class_title||'',fields}});return true;
}
