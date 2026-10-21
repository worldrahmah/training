import {api,esc,fmtDateTime,humanEvent,t,toast,modal} from '/core.js';
const controllers=new WeakMap(),views=new Map();
const day=value=>{const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d)};
export function activityDateRange(period,from='',to='',now=new Date()){
 if(period==='all')return {};
 let start,end;
 if(period==='custom'){
  if(from)start=day(from);
  if(to){end=day(to);end.setDate(end.getDate()+1)}
 }else{
  start=new Date(now.getFullYear(),now.getMonth(),now.getDate());end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  if(period==='week')start.setDate(start.getDate()-6);
  if(period==='month')start.setDate(start.getDate()-29);
 }
 return {...(start?{from:start.toISOString()}:{}),...(end?{to:end.toISOString()}:{})};
}

export function mountActivityHistory(root,{userId,mode='mine',onRecord}={}){
 if(!root)return;
 if(controllers.has(root)){const current=controllers.get(root);if(Date.now()-current.fetched>10000)current.load();return current}
 const key=mode+':'+Number(userId),state=views.get(key)||{page:1,page_size:10,type:'',period:'all',from:'',to:''};views.set(key,state);
 const endpoint=mode==='audit'?'/api/workspace/audit':'/api/account/activity';let sequence=0,disposed=false,searchTimer;
 root.dataset.activityHistory=mode;
 root.innerHTML=`<div class="section-title-row"><div><div class="eyebrow">${esc(t(mode==='audit'?'Audit & history':'My activity'))}</div><h2>${esc(t(mode==='audit'?'Workspace activity':'Activity history'))}</h2></div><button class="btn" data-history-refresh>${esc(t('Refresh'))}</button></div><div class="activity-history-filters"><label class="field"><span>${esc(t('Search activity'))}</span><input class="input" type="search" data-history-search maxlength="160" value="${esc(state.q||'')}"></label><label class="field"><span>${esc(t('Show per page'))}</span><select class="select" data-history-size>${[10,25,50].map(n=>`<option value="${n}" ${state.page_size===n?'selected':''}>${n}</option>`).join('')}</select></label><label class="field"><span>${esc(t('Time range'))}</span><select class="select" data-history-period>${[['all','All time'],['today','Today'],['week','Last 7 days'],['month','Last 30 days'],['custom','Custom dates']].map(([value,label])=>`<option value="${value}" ${state.period===value?'selected':''}>${esc(t(label))}</option>`).join('')}</select></label><label class="field"><span>${esc(t('Activity type'))}</span><select class="select" data-history-type><option value="">${esc(t('All activity types'))}</option></select></label><div class="activity-history-dates" ${state.period==='custom'?'':'hidden'}><label class="field"><span>${esc(t('From date'))}</span><input class="input" type="date" data-history-from value="${esc(state.from)}"></label><label class="field"><span>${esc(t('Through date'))}</span><input class="input" type="date" data-history-to value="${esc(state.to)}"></label></div></div><p class="small muted" data-history-count role="status" aria-live="polite"></p><div class="activity-timeline" data-history-results></div><nav class="activity-history-pagination" aria-label="${esc(t('Activity history pages'))}"><button class="btn" data-history-prev>${esc(t('Previous'))}</button><span data-history-page></span><button class="btn" data-history-next>${esc(t('Next'))}</button></nav>`;
 const results=root.querySelector('[data-history-results]'),count=root.querySelector('[data-history-count]'),prev=root.querySelector('[data-history-prev]'),next=root.querySelector('[data-history-next]'),page=root.querySelector('[data-history-page]');
 const controller={fetched:0,async load(){
  const request=++sequence,params=new URLSearchParams({page:String(state.page),page_size:String(state.page_size),...(state.type?{type:state.type}:{}),...(state.q?{q:state.q}:{}),...activityDateRange(state.period,state.from,state.to)});
  root.setAttribute('aria-busy','true');prev.disabled=next.disabled=true;count.textContent=t('Loading…');
  try{
   const data=await api(endpoint+'?'+params);if(disposed||request!==sequence||!root.isConnected)return;
   controller.fetched=Date.now();state.page=data.page;
   const select=root.querySelector('[data-history-type]');select.innerHTML=`<option value="">${esc(t('All activity types'))}</option>`+data.types.map(type=>`<option value="${esc(type)}" ${state.type===type?'selected':''}>${esc(humanEvent(type))}</option>`).join('');
   const first=data.total?(data.page-1)*data.page_size+1:0,last=Math.min(data.page*data.page_size,data.total);
   count.textContent=t('Showing {first}–{last} of {total}',{first,last,total:data.total});page.textContent=t('Page {page} of {pages}',{page:data.page,pages:data.pages});prev.disabled=data.page<=1;next.disabled=data.page>=data.pages;
   results.innerHTML=data.events.length?data.events.map(event=>`<article class="timeline-item" data-history-event="${event.id}"><span class="timeline-dot" aria-hidden="true"></span><div><button type="button" class="activity-detail-link" data-activity-detail="${event.id}" data-activity-scope="${mode}">${esc(humanEvent(event.event_type))}</button><div class="small muted" dir="auto">${esc([event.class_title,mode==='audit'?event.actor:''].filter(Boolean).join(' · '))}</div></div><time datetime="${esc(event.created_at)}">${esc(fmtDateTime(event.created_at))}</time>${mode==='audit'&&event.class_id?`<button class="btn" data-audit-class="${event.class_id}">${esc(t('Open class'))}</button>`:''}</article>`).join(''):`<div class="empty">${esc(t('No activity matches these filters.'))}</div>`;
  }catch(error){if(request===sequence&&root.isConnected){count.textContent=error.message;results.innerHTML=`<div class="empty">${esc(t('Activity could not be loaded. Adjust the filters or try Refresh.'))}</div>`;page.textContent='';toast(error.message,'error')}}
  finally{if(request===sequence)root.removeAttribute('aria-busy')}
 },dispose(){disposed=true;sequence++;clearTimeout(searchTimer)}};
 controllers.set(root,controller);
 const filter=()=>{state.page=1;controller.load()};
 root.querySelector('[data-history-search]').oninput=event=>{state.q=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(filter,220)};
 results.onclick=event=>{const button=event.target.closest('[data-audit-class]');if(button)onRecord?.({type:'class',id:Number(button.dataset.auditClass)})};
 root.querySelector('[data-history-size]').onchange=event=>{state.page_size=Number(event.target.value);filter()};
 root.querySelector('[data-history-period]').onchange=event=>{state.period=event.target.value;root.querySelector('.activity-history-dates').hidden=state.period!=='custom';filter()};
 root.querySelector('[data-history-type]').onchange=event=>{state.type=event.target.value;filter()};
 for(const field of ['from','to'])root.querySelector('[data-history-'+field+']').onchange=event=>{state[field]=event.target.value;filter()};
 root.querySelector('[data-history-refresh]').onclick=()=>controller.load();prev.onclick=()=>{state.page--;controller.load()};next.onclick=()=>{state.page++;controller.load()};controller.load();return controller;
}

export async function showActivityDetail(id,scope='mine'){
 const data=await api('/api/account/activity/'+Number(id)+(scope==='audit'?'?scope=audit':'')),a=data.activity;
 return modal(t('Activity details'),`<h3>${esc(humanEvent(a.event_type))}</h3><dl class="activity-detail-fields"><dt>${esc(t('When'))}</dt><dd>${esc(fmtDateTime(a.created_at))}</dd><dt>${esc(t('By'))}</dt><dd dir="auto">${esc(a.actor)}</dd>${a.class_title?`<dt>${esc(t('Class'))}</dt><dd dir="auto">${esc(a.class_title)}</dd>`:''}${a.fields.map(f=>`<dt>${esc(t(f.label))}</dt><dd dir="auto">${esc(f.label==='Title'?f.value:t(f.value))}</dd>`).join('')}</dl>`,{onConfirm:null,cancelText:t('Close')});
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-activity-detail]');if(el)showActivityDetail(el.dataset.activityDetail,el.dataset.activityScope).catch(e=>toast(e.message,'error'))});
