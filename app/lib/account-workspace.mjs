const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
export const PANEL_COLORS=['default','teal','blue','indigo','violet','rose','amber'];
export function accountPreferences(db,user){
 const row=db.prepare('SELECT theme,accent FROM user_ui_preferences WHERE user_id=?').get(user.id);
 return {language:['en','ar'].includes(user.preferred_language)?user.preferred_language:null,theme:row?.theme||null,accent:row?.accent||'default'};
}

// Query the complete authorized history; never paginate a capped in-memory list.
export function activityPage(db,params,scope,bindings=[]){
 const number=(name,fallback)=>{const value=params.get(name);if(value===null)return fallback;if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))fail('Choose a valid activity page.');return Number(value)};
 const size=number('page_size',10),requested=number('page',1);
 if(![10,25,50].includes(size)||requested<1)fail('Choose 10, 25 or 50 activities per page.');
 const where=['('+scope+')'],args=[...bindings];
 for(const [key,operator] of [['from','>='],['to','<']]){
  const value=params.get(key);if(!value)continue;
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value.slice(0,10))fail('Choose a valid activity date range.');
  where.push(`datetime(e.created_at) ${operator} datetime(?)`);args.push(value);
 }
 if(params.get('from')&&params.get('to')&&Date.parse(params.get('from'))>=Date.parse(params.get('to')))fail('The end date must be after the start date.');
 const type=params.get('type');if(type){if(!/^[a-z][a-z0-9_]{0,79}$/.test(type))fail('Choose a valid activity type.');where.push('e.event_type=?');args.push(type)}
 const query=params.get('q')?.trim()||'';if(query.length>160)fail('Keep the activity search under 160 characters.');if(query){where.push("(instr(lower(e.event_type),lower(?))>0 OR EXISTS(SELECT 1 FROM classes cl WHERE cl.id=e.class_id AND instr(lower(cl.title),lower(?))>0) OR EXISTS(SELECT 1 FROM users u WHERE u.id=e.user_id AND instr(lower(u.display_name),lower(?))>0))");args.push(query.replace(/\s+/g,'_'),query,query)}
 const clause=where.join(' AND '),total=Number(db.prepare(`SELECT COUNT(*) n FROM activity_events e WHERE ${clause}`).get(...args).n),pages=Math.max(1,Math.ceil(total/size)),page=Math.min(requested,pages);
 const events=db.prepare(`SELECT e.id,e.event_type,e.created_at,e.class_id,cl.title class_title,u.display_name actor FROM activity_events e LEFT JOIN classes cl ON cl.id=e.class_id LEFT JOIN users u ON u.id=e.user_id WHERE ${clause} ORDER BY e.id DESC LIMIT ? OFFSET ?`).all(...args,size,(page-1)*size);
 const types=db.prepare(`SELECT DISTINCT e.event_type FROM activity_events e WHERE ${scope} ORDER BY e.event_type`).all(...bindings).map(r=>r.event_type);
 return {events,types,page,page_size:size,total,pages};
}

export async function handleAccountWorkspace(req,res,url,c){
 const p=url.pathname;if(!['/api/account/preferences','/api/account/activity'].includes(p))return false;
 const {db,engine,requireUser,readJson,json}=c,user=requireUser(req,res,url);if(!user)return true;
 if(p==='/api/account/activity'){
  if(req.method!=='GET')fail('This activity view is read only.',405);
  // Other account identifiers are not a supported way to change this scope.
  if([...url.searchParams.keys()].some(k=>!['page','page_size','from','to','type','q'].includes(k)))fail('Choose supported activity filters.');
  json(res,200,{ok:true,...activityPage(db,url.searchParams,'e.user_id=?',[user.id])});return true;
 }
 if(req.method==='GET'){json(res,200,{ok:true,preferences:accountPreferences(db,user)});return true}
 if(req.method!=='PATCH')fail('Choose a supported preference action.',405);
 const body=await readJson(req),keys=Object.keys(body);
 if(!keys.length||keys.some(k=>!['language','theme','accent'].includes(k))||('language' in body&&!['en','ar'].includes(body.language))||('theme' in body&&!['light','dark','system'].includes(body.theme))||('accent' in body&&!PANEL_COLORS.includes(body.accent)))fail('Choose a supported language, appearance and panel color.');
 engine.transaction(()=>{
  // Read after body arrival and merge only specified fields to retain another
  // tab's independent color/theme change without permitting another account ID.
  const current=db.prepare('SELECT theme,accent FROM user_ui_preferences WHERE user_id=?').get(user.id)||{theme:'system',accent:'default'};
  db.prepare('INSERT INTO user_ui_preferences(user_id,theme,accent) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET theme=excluded.theme,accent=excluded.accent,updated_at=CURRENT_TIMESTAMP').run(user.id,body.theme??current.theme,body.accent??current.accent);
  if('language' in body)db.prepare('UPDATE users SET preferred_language=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(body.language,user.id);
  engine.log(null,user.id,'personal_preferences_updated','user',user.id,{fields:keys});
 });
 const updated=db.prepare('SELECT id,preferred_language FROM users WHERE id=?').get(user.id);json(res,200,{ok:true,preferences:accountPreferences(db,updated)});return true;
}
