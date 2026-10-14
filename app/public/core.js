import {FONT_CATALOG} from '/font-catalog.js';
import {applyLocale,cycleLocale,direction,getLocale,initLocale,langButton,setLocale,t,userMessage} from '/i18n.js';
export {applyLocale,cycleLocale,direction,getLocale,initLocale,langButton,setLocale,t,userMessage};

export const TOKEN_KEY='training_engine_session';
const ROTATED_KEY='training_engine_session_rotated_at';
let rotating=null;
export function getToken(){return sessionStorage.getItem(TOKEN_KEY)||''}
export function setToken(v){if(v){sessionStorage.setItem(TOKEN_KEY,v);if(!sessionStorage.getItem(ROTATED_KEY))sessionStorage.setItem(ROTATED_KEY,String(Date.now()))}else{sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(ROTATED_KEY)}}
async function maybeRotate(path){const token=getToken();if(!token||path==='/api/login'||path==='/api/account/session/rotate')return;const last=Number(sessionStorage.getItem(ROTATED_KEY)||0);if(last&&Date.now()-last<30*60*1000)return;if(rotating)return rotating;rotating=(async()=>{try{const res=await fetch('/api/account/session/rotate',{method:'POST',headers:{'X-Session-Token':token}});if(!res.ok)return;const data=await res.json();if(data?.token){sessionStorage.setItem(TOKEN_KEY,data.token);sessionStorage.setItem(ROTATED_KEY,String(Date.now()))}}finally{rotating=null}})();return rotating}
export async function api(path,opts={}){
  await maybeRotate(path);
  const headers={...(opts.headers||{})}; const token=getToken(); if(token)headers['X-Session-Token']=token;
  if(opts.json!==undefined){headers['Content-Type']='application/json';opts.body=JSON.stringify(opts.json)}
  const res=await fetch(path,{...opts,headers}); let data=null; const ct=res.headers.get('content-type')||'';
  if(ct.includes('application/json'))data=await res.json();else data=await res.text();
  if(!res.ok){const raw=data?.message||t('Request failed ({status})',{status:res.status});const e=new Error(userMessage(raw));e.status=res.status;e.data=data;throw e}return data;
}
export function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function md(v=''){
  let s=esc(v); s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/^###\s+(.+)$/gm,'<h3>$1</h3>').replace(/^##\s+(.+)$/gm,'<h2>$1</h2>').replace(/^#\s+(.+)$/gm,'<h1>$1</h1>');
  const lines=s.split(/\n/);let out='',inList=false;for(const line of lines){if(/^[-*]\s+/.test(line)){if(!inList){out+='<ul>';inList=true}out+=`<li>${line.replace(/^[-*]\s+/,'')}</li>`}else{if(inList){out+='</ul>';inList=false}if(line.trim())out+=`<p>${line}</p>`}}if(inList)out+='</ul>';return out;
}
export function fmtDate(v){if(!v)return '—';try{return new Intl.DateTimeFormat(getLocale()==='ar'?'ar-IQ':'en-US',{year:'numeric',month:'short',day:'numeric'}).format(new Date(`${v}T12:00:00`))}catch{return v}}
export function fmtDateTime(v){if(!v)return '—';try{return new Intl.DateTimeFormat(getLocale()==='ar'?'ar-IQ':'en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(v.endsWith?.('Z')?v:v+'Z'))}catch{return v}}
export function initials(name=''){const p=String(name).trim().split(/\s+/).filter(Boolean);return (p[0]?.[0]||'?')+(p[1]?.[0]||'')}
export function setTheme(theme){const x=['light','dark','system'].includes(theme)?theme:'system';document.documentElement.dataset.theme=x;document.documentElement.dataset.effectiveTheme=x==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):x;localStorage.setItem('training_engine_theme',x);return x}
export function initTheme(){return setTheme(localStorage.getItem('training_engine_theme')||'system')}
export function cycleTheme(){const cur=document.documentElement.dataset.theme||'system';return setTheme(cur==='system'?'light':cur==='light'?'dark':'system')}
export function themeIcon(){return document.documentElement.dataset.theme==='dark'?'☾':document.documentElement.dataset.theme==='light'?'☀':'◐'}

// Shared disclosure controls. Native popovers keep actions above scrolling cards,
// provide light-dismiss/Escape, and never masquerade as unsupported product tools.
let menuSequence=0;
export function uiIcon(name='menu'){
  const paths={menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',chevron:'<path d="m6 9 6 6 6-6"/>',tools:'<path d="m14 6 4-3 3 3-3 4-4-4ZM12 8 3 17v4h4l9-9"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',add:'<path d="M12 4v16M4 12h16"/>',language:'<path d="M3 5h12M9 3v2M5 5c0 6 5 10 8 11M12 5c0 6-5 10-8 11M14 21l4-10 4 10M16 17h4"/>',theme:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'};
  return `<svg class="one-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.menu}</svg>`;
}
export function actionMenu(label,body,{icon='menu',compact=false}={}){
  const id=`one-menu-${++menuSequence}`;
  return `<div class="one-menu"><button type="button" class="btn one-menu-trigger${compact?' icon':''}" popovertarget="${id}" aria-controls="${id}" aria-expanded="false" aria-label="${esc(label)}">${uiIcon(icon)}${compact?'':`<span class="one-menu-caption">${esc(label)}</span>${uiIcon('chevron')}`}</button><div id="${id}" class="one-menu-panel" popover="auto"><div class="one-menu-heading">${esc(label)}</div><nav aria-label="${esc(label)}">${body}</nav></div></div>`;
}
export function appearanceActions(attribute='data-action'){
  return `<button class="one-menu-item" ${attribute}="language">${uiIcon('language')}<span>${esc(t('Change language'))}</span><small>${esc(langButton())}</small></button><button class="one-menu-item" ${attribute}="theme">${uiIcon('theme')}<span>${esc(t('Appearance'))}</span><small>${esc(t(({light:'Light',dark:'Dark',system:'System'})[document.documentElement.dataset.theme]||'System'))}</small></button>`;
}
function menuTrigger(panel){return document.querySelector(`[popovertarget="${panel.id}"]`)}
function placeMenu(panel){
  const trigger=menuTrigger(panel);if(!trigger)return;
  const r=trigger.getBoundingClientRect(),width=Math.min(300,innerWidth-24);
  panel.style.width=`${width}px`;panel.style.maxHeight=`${innerHeight-24}px`;
  const height=panel.getBoundingClientRect().height||400;
  panel.style.left=`${Math.max(12,Math.min(document.documentElement.dir==='rtl'?r.left:r.right-width,innerWidth-width-12))}px`;
  const below=Math.max(44,innerHeight-r.bottom-20),above=Math.max(44,r.top-20),up=height>below&&above>below;
  panel.style.maxHeight=`${Math.min(innerHeight-24,up?above:below)}px`;
  const visibleHeight=panel.getBoundingClientRect().height||Math.min(height,up?above:below);
  panel.style.top=`${Math.max(12,Math.min(innerHeight-visibleHeight-12,up?r.top-visibleHeight-8:r.bottom+8))}px`;
}
document.addEventListener('beforetoggle',e=>{if(!e.target.matches?.('.one-menu-panel'))return;const open=e.newState==='open';menuTrigger(e.target)?.setAttribute('aria-expanded',String(open));if(open){const panel=e.target;panel.style.visibility='hidden';placeMenu(panel);requestAnimationFrame(()=>{if(panel.matches(':popover-open'))placeMenu(panel);panel.style.visibility=''})}},true);
document.addEventListener('click',e=>{const item=e.target.closest?.('.one-menu-panel button,.one-menu-panel a');if(!item)return;const panel=item.closest('.one-menu-panel'),trigger=menuTrigger(panel);panel.hidePopover();trigger?.focus()},true);
document.addEventListener('keydown',e=>{
  const trigger=e.target.closest?.('.one-menu-trigger'),panel=trigger?document.getElementById(trigger.getAttribute('popovertarget')):e.target.closest?.('.one-menu-panel');if(!panel)return;
  const items=[...panel.querySelectorAll('button,a[href],select,input')].filter(x=>!x.disabled&&!x.hidden);
  if(trigger&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();panel.showPopover();requestAnimationFrame(()=>{if(panel.matches(':popover-open'))(e.key==='ArrowUp'?items.at(-1):items[0])?.focus()});return}
  if(!panel.matches(':popover-open'))return;
  if(e.key==='Escape'){e.preventDefault();panel.hidePopover();menuTrigger(panel)?.focus();return}
  if(e.target.matches('input,select,textarea'))return;
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const i=items.indexOf(document.activeElement),n=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[n]?.focus()}
});
addEventListener('resize',()=>document.querySelectorAll('.one-menu-panel:popover-open').forEach(placeMenu));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(document.documentElement.dataset.theme==='system')setTheme('system')});

// A localized paragraph can live inside a course of the other language. Determine
// the paragraph's own base direction, without changing the authored course/model.
function normalizeProse(root){
  if(root.nodeType!==1)return;
  const nodes=[...(root.matches('p,h1,h2,h3,h4,h5,h6')?[root]:[]),...root.querySelectorAll('p,h1,h2,h3,h4,h5,h6')];
  for(const node of nodes)if(!node.hasAttribute('dir'))node.setAttribute('dir','auto');
  root.querySelectorAll('input:not([type]),input[type="text"],input[type="search"],textarea').forEach(input=>{if(!input.hasAttribute('dir')&&!/username|password|code|email|url/i.test(input.name||input.id))input.setAttribute('dir','auto')});
  root.querySelectorAll('.field').forEach(field=>{const label=field.querySelector('label'),input=field.querySelector('input,textarea,select');if(label&&input&&!label.htmlFor&&!label.contains(input)){input.id||=`one-field-${++menuSequence}`;label.htmlFor=input.id}});
}
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)normalizeProse(node)}).observe(document.documentElement,{childList:true,subtree:true});

let activeTypography={};
export function applyTypography(config=null,surface='ui'){
 if(config&&config.version===2)activeTypography=config;
 const fonts={};for(const language of ['en','ar']){const selected=String(activeTypography.ui?.[language]||FONT_CATALOG.defaults[language]);fonts[language]=FONT_CATALOG.families.find(font=>font.id===selected&&font.language===language)||FONT_CATALOG.families.find(font=>font.id===FONT_CATALOG.defaults[language]);}
 const latin=`"${fonts.en.name}", ui-sans-serif, system-ui, sans-serif`,arabic=`"${fonts.ar.name}", "Cairo", ${latin}`,family=getLocale()==='ar'?arabic:latin;
 document.documentElement.style.setProperty('--font-latin',latin);document.documentElement.style.setProperty('--font-arabic',arabic);
 for(const name of ['--font-ui','--font-title','--font-body','--font-presentation'])document.documentElement.style.setProperty(name,family);
 document.documentElement.dataset.surface=surface;document.documentElement.dataset.fontEnglish=fonts.en.id;document.documentElement.dataset.fontArabic=fonts.ar.id;
 return {ui:family,title:family,body:family,presentation:family};
}

document.addEventListener('one-locale-change',()=>applyTypography({},document.documentElement.dataset.surface||'ui'));
export function toast(message,type=''){let w=document.querySelector('.toast-wrap');if(!w){w=document.createElement('div');w.className='toast-wrap';document.body.appendChild(w)}const el=document.createElement('div');el.className=`toast ${type}`;el.setAttribute('role',type==='error'?'alert':'status');el.setAttribute('aria-live',type==='error'?'assertive':'polite');el.textContent=userMessage(message);w.appendChild(el);setTimeout(()=>el.remove(),3200)}
let dialogSequence=0;
const dialogStack=[],originalInert=new Map();
function synchronizeDialogs(){
  for(let i=dialogStack.length-1;i>=0;i--)if(!dialogStack[i].isConnected)dialogStack.splice(i,1);
  const top=dialogStack.at(-1);
  if(top){for(const node of document.body.children){if(!originalInert.has(node))originalInert.set(node,node.inert);node.inert=node!==top;}}
  else{for(const [node,inert] of originalInert)if(node.isConnected)node.inert=inert;originalInert.clear();}
  return top;
}
export function workspaceSearch(openResult){
  const wrap=modal(t('Search your workspace'),`<label class="field"><span>${esc(t('Find a course, class or participant'))}</span><input class="input" type="search" data-workspace-query autocomplete="off" placeholder="${esc(t('Type at least two characters'))}"></label><div class="workspace-search-status" role="status" aria-live="polite"></div><div class="workspace-search-results"></div>`,{cancelText:t('Close'),onConfirm:null,wide:true});
  const input=wrap.querySelector('[data-workspace-query]'),status=wrap.querySelector('[role="status"]'),results=wrap.querySelector('.workspace-search-results');let timer,sequence=0,rows=[];
  input.addEventListener('input',()=>{clearTimeout(timer);const query=input.value.trim(),request=++sequence;results.replaceChildren();status.textContent=query.length<2?t('Type at least two characters'):t('Loading…');if(query.length<2)return;timer=setTimeout(async()=>{
    try{const data=await api(`/api/search?q=${encodeURIComponent(query)}`);if(!wrap.isConnected||request!==sequence)return;rows=data.results||[];status.textContent=rows.length?t('{n} results',{n:rows.length}):t('No results found.');results.innerHTML=rows.map((row,i)=>`<button class="workspace-search-result" data-search-index="${i}"><span class="badge">${esc(t(({course:'Course',class:'Class',participant:'Participant'})[row.type]||row.type))}</span><span><strong dir="auto">${esc(row.title)}</strong><small dir="auto">${esc(row.subtitle||'')}</small></span><span aria-hidden="true">↗</span></button>`).join('')}
    catch(error){if(wrap.isConnected&&request===sequence)status.textContent=error.message}
  },220)});
  results.addEventListener('click',async event=>{const button=event.target.closest('[data-search-index]');if(!button)return;const row=rows[Number(button.dataset.searchIndex)];wrap.remove();try{await openResult(row)}catch(error){toast(error.message,'error')}});return wrap;
}
export function modal(title,bodyHtml,{confirmText=t('Save'),cancelText=t('Cancel'),onConfirm=null,wide=false}={}){
  const id=`one-dialog-${++dialogSequence}`,opener=document.activeElement,wrap=document.createElement('div');
  wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal${wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="${id}" tabindex="-1"><div class="drawer-head"><h2 id="${id}">${esc(title)}</h2><button class="btn icon" data-close aria-label="${esc(t('Close'))}">×</button></div><div data-body>${bodyHtml}</div><div class="form-actions"><button class="btn" data-close>${esc(cancelText)}</button>${onConfirm?`<button class="btn primary" data-confirm>${esc(confirmText)}</button>`:''}</div></div>`;
  document.body.appendChild(wrap);dialogStack.push(wrap);synchronizeDialogs();let closed=false,busy=false;const nativeRemove=wrap.remove.bind(wrap);
  const focusables=()=>[...wrap.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);
  const close=()=>{if(closed)return;closed=true;document.removeEventListener('keydown',key,true);nativeRemove();const top=synchronizeDialogs();if(opener?.isConnected&&(!top||top.contains(opener)))opener.focus();else if(top&&!top.contains(document.activeElement))(top.querySelector('input,select,textarea,button')||top.querySelector('[role="dialog"]')).focus()};
  const key=e=>{if(closed||wrap.inert)return;if(e.key==='Escape'&&!busy){e.preventDefault();e.stopPropagation();close()}else if(e.key==='Tab'){const list=focusables(),first=list[0],last=list.at(-1);if(!first){e.preventDefault();wrap.querySelector('[role="dialog"]').focus()}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  wrap.remove=close;document.addEventListener('keydown',key,true);
  wrap.querySelectorAll('.field').forEach((field,i)=>{const label=field.querySelector('label'),input=field.querySelector('input,textarea,select');if(label&&input&&!label.htmlFor){input.id||=`${id}-field-${i}`;label.htmlFor=input.id}});
  wrap.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!busy)close()}));wrap.addEventListener('click',e=>{if(e.target===wrap&&!busy)close()});
  if(onConfirm)wrap.querySelector('[data-confirm]').addEventListener('click',async()=>{const invalid=[...wrap.querySelectorAll('input,select,textarea')].find(input=>!input.disabled&&!input.checkValidity());if(invalid){invalid.focus();invalid.reportValidity();return}const btn=wrap.querySelector('[data-confirm]');busy=true;btn.disabled=true;wrap.querySelector('[role="dialog"]').setAttribute('aria-busy','true');try{const keep=await onConfirm(wrap);if(keep!==false)close()}catch(e){toast(e.message,'error')}finally{busy=false;btn.disabled=false;wrap.querySelector('[role="dialog"]').removeAttribute('aria-busy')}});
  (wrap.querySelector('[data-body] input,[data-body] select,[data-body] textarea')||focusables()[0]||wrap.querySelector('[role="dialog"]')).focus();return wrap;
}
export function loginView({role='trainer',title=t('Welcome back'),subtitle=t('Sign in to continue'),demoHint='',extra=''}={}){
  return `<main class="login-page"><section class="login-story"><div class="brand"><span class="brand-mark">T</span><span>Training Engine <strong>ONE</strong></span></div><div class="login-story-copy"><div class="eyebrow">${esc(t('Made for the moment of learning'))}</div><h2>${esc(t('Bring every classroom to life.'))}</h2><p>${esc(t('Create with clarity. Teach with confidence. Learn together.'))}</p><div class="login-orbit" aria-hidden="true"><span></span><span></span><span></span><i>ONE</i></div></div><div class="login-story-foot">${esc(t('Your classroom. Your control.'))}</div></section><section class="login-card"><header class="login-card-head"><span class="login-workspace-label">${esc(title)}</span>${actionMenu(t('Menu'),`<button class="one-menu-item" id="loginLang">${uiIcon('language')}<span>${esc(t('Change language'))}</span><small>${esc(langButton())}</small></button><button class="one-menu-item" id="loginTheme">${uiIcon('theme')}<span>${esc(t('Appearance'))}</span></button>`,{compact:true})}</header><h1>${esc(t('Welcome back'))}</h1><p>${esc(subtitle)}</p><form id="loginForm"><div class="field"><label for="loginUsername">${esc(t('Username'))}</label><input id="loginUsername" class="input" name="username" autocomplete="username" required></div><div class="field"><label for="loginPassword">${esc(t('Password'))}</label><input id="loginPassword" class="input" name="password" type="password" autocomplete="current-password" required></div><button class="btn primary" type="submit">${esc(t('Sign in'))}<span aria-hidden="true">→</span></button></form>${demoHint?`<div class="login-demo-note"><span class="badge">${esc(t('Demo'))}</span><p class="small">${esc(demoHint)}</p></div>`:''}${extra}<footer class="login-card-foot">${esc(t('Local-first learning, built around people.'))}</footer></section></main>`;
}
export async function bindLogin(root,{requiredRole,onSuccess,onLocaleChange=null}){
  const form=root.querySelector('#loginForm');root.querySelector('#loginTheme')?.addEventListener('click',()=>{cycleTheme()});root.querySelector('#loginLang')?.addEventListener('click',()=>{cycleLocale();if(onLocaleChange)onLocaleChange();else location.reload()});
  form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form);const btn=form.querySelector('button[type=submit]');btn.disabled=true;try{const data=await api('/api/login',{method:'POST',json:{username:fd.get('username'),password:fd.get('password')}});if(requiredRole&&data.user.role!==requiredRole){setToken('');throw new Error(requiredRole==='trainer'?t('Use a trainer account for this page.'):t('Use a participant account for this page.'))}setToken(data.token);if(data.user.must_change_password)return temporaryPasswordView(root,data.user,onSuccess);await onSuccess(data.user)}catch(err){toast(err.message,'error')}finally{btn.disabled=false}})
}
export function temporaryPasswordView(root,user,onSuccess){
  root.innerHTML=loginView({title:t('Change password'),subtitle:t('Set a personal password before entering your workspace.')});
  const form=root.querySelector('#loginForm');form.innerHTML=`<div class="field"><label for="temporaryCurrent">${esc(t('Current password'))}</label><input id="temporaryCurrent" class="input" name="current" type="password" autocomplete="current-password" required></div><div class="field"><label for="temporaryNew">${esc(t('New password'))}</label><input id="temporaryNew" class="input" name="new" type="password" autocomplete="new-password" minlength="8" required></div><div class="field"><label for="temporaryConfirm">${esc(t('Confirm password'))}</label><input id="temporaryConfirm" class="input" name="confirm" type="password" autocomplete="new-password" required></div><button class="btn primary" type="submit">${esc(t('Save and continue'))}</button><button class="btn" type="button" data-password-logout>${esc(t('Sign out'))}</button>`;
  root.querySelector('.login-card h1').textContent=t('Change password');root.querySelector('#loginTheme').onclick=()=>cycleTheme();root.querySelector('#loginLang').onclick=()=>{cycleLocale();temporaryPasswordView(root,user,onSuccess)};
  form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form);if(fd.get('new')!==fd.get('confirm'))return toast(t('Passwords do not match.'),'error');const btn=form.querySelector('[type="submit"]');btn.disabled=true;try{await api('/api/account/password',{method:'POST',json:{current_password:fd.get('current'),new_password:fd.get('new')}});await onSuccess({...user,must_change_password:false})}catch(err){toast(err.message,'error')}finally{btn.disabled=false}};
  form.querySelector('[data-password-logout]').onclick=async()=>{await api('/api/logout',{method:'POST'}).catch(()=>{});setToken('');location.reload()};
}
export function eventSource(onRefresh){let es=null;const connect=()=>{const token=getToken();es=new EventSource(`/api/events${token?`?token=${encodeURIComponent(token)}`:''}`);es.addEventListener('refresh',e=>{try{onRefresh(JSON.parse(e.data))}catch{onRefresh({})}});es.onerror=()=>{};};connect();return()=>es?.close()}
export function humanEvent(type=''){const m={signed_in:'Signed in',course_created:'Course created',course_imported:'Course imported',class_created:'Class created',class_imported:'Class imported',class_activated:'Class started',teams_created:'Teams created',attendance_saved:'Attendance saved',student_note_added:'Trainer note added',roster_imported:'Roster imported',activity_opened:'Activity opened',activity_closed:'Activity closed',results_revealed:'Results shown',classroom_cleared:'Classroom returned to waiting',response_submitted:'Response submitted',team_response_submitted:'Team response submitted',mission_opened:'Mission opened',mission_updated:'Mission progress updated',mission_completed:'Mission completed',submission_added:'Submission added',backup_created:'Backup created',demo_removed:'Demo content removed',demo_reset:'Demo workspace restored',classroom_updated:'Classroom updated',password_changed:'Password changed',staff_created:'Trainer added',staff_updated:'Trainer updated',password_reset:'Password reset',participant_activated:'Participant account activated',participant_deactivated:'Participant account deactivated',class_trainers_updated:'Class trainers updated',class_status_changed:'Class status updated',participant_enrolled:'Participant enrolled',profile_updated:'Profile updated',notification_sent:'Notification sent',help_requested:'Help requested',help_request_updated:'Help request updated',participant_progress_updated:'Participant progress updated',course_draft_created:'Course draft created',course_draft_saved:'Course draft saved',course_version_published:'Course version published',projector_navigated:'Projector navigated',permissions_updated:'Permissions updated',course_updated:'Course updated',course_archived:'Course archived',class_updated:'Class updated',class_archived:'Class archived',workflow_node_started:'Section started',workflow_node_completed:'Section completed',workflow_node_skipped:'Section skipped'};return t(m[type]||String(type).replaceAll('_',' '))}
export function downloadUrl(path){const token=getToken();return `${path}${path.includes('?')?'&':'?'}token=${encodeURIComponent(token)}`}
export function uiStatus(v=''){const map={draft:'Draft',planned:'Scheduled',active:'Active',scheduled:'Scheduled',completed:'Completed',cancelled:'Cancelled',published:'Published',ready:'Ready'};return t(map[String(v).toLowerCase()]||String(v))}

fetch('/api/public-settings').then(response=>response.ok?response.json():null).then(settings=>{if(settings)applyTypography(settings.typography||{})}).catch(()=>{});

async function syncSystemTypography(){try{const response=await fetch('/api/public-settings');if(response.ok)applyTypography((await response.json()).typography||{})}catch{}}
window.addEventListener('focus',syncSystemTypography);setInterval(()=>{if(document.visibilityState==='visible')syncSystemTypography()},30000);
