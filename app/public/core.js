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
export function setTheme(theme){const x=['light','dark','system'].includes(theme)?theme:'system';document.documentElement.dataset.theme=x;localStorage.setItem('training_engine_theme',x);return x}
export function initTheme(){return setTheme(localStorage.getItem('training_engine_theme')||'system')}
export function cycleTheme(){const cur=document.documentElement.dataset.theme||'system';return setTheme(cur==='system'?'light':cur==='light'?'dark':'system')}
export function themeIcon(){return document.documentElement.dataset.theme==='dark'?'☾':document.documentElement.dataset.theme==='light'?'☀':'◐'}

export function applyTypography(config={},surface='ui'){
  // Training Engine ONE has one canonical product typography contract:
  // Montserrat for English/LTR and Cairo for Arabic/RTL. Historical/course
  // typography metadata is preserved in data for compatibility but cannot
  // fragment the professional product UI.
  const ar=getLocale()==='ar'||document.documentElement.dir==='rtl';
  const family=ar?'\"Cairo\", Tahoma, Arial, sans-serif':'\"Montserrat\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif';
  for(const name of ['--font-ui','--font-title','--font-body','--font-presentation'])document.documentElement.style.setProperty(name,family);
  document.documentElement.dataset.surface=surface;
  return {ui:family,title:family,body:family,presentation:family};
}
export function toast(message,type=''){let w=document.querySelector('.toast-wrap');if(!w){w=document.createElement('div');w.className='toast-wrap';document.body.appendChild(w)}const el=document.createElement('div');el.className=`toast ${type}`;el.setAttribute('role',type==='error'?'alert':'status');el.setAttribute('aria-live',type==='error'?'assertive':'polite');el.textContent=userMessage(message);w.appendChild(el);setTimeout(()=>el.remove(),3200)}
let dialogSequence=0;
export function modal(title,bodyHtml,{confirmText=t('Save'),cancelText=t('Cancel'),onConfirm=null,wide=false}={}){
  const id=`one-dialog-${++dialogSequence}`,opener=document.activeElement,wrap=document.createElement('div');
  wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal${wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="${id}" tabindex="-1"><div class="drawer-head"><h2 id="${id}">${esc(title)}</h2><button class="btn icon" data-close aria-label="${esc(t('Close'))}">×</button></div><div data-body>${bodyHtml}</div><div class="form-actions"><button class="btn" data-close>${esc(cancelText)}</button>${onConfirm?`<button class="btn primary" data-confirm>${esc(confirmText)}</button>`:''}</div></div>`;
  const background=[...document.body.children].map(el=>({el,inert:el.inert}));for(const {el} of background)el.inert=true;
  document.body.appendChild(wrap);let closed=false,busy=false;const nativeRemove=wrap.remove.bind(wrap);
  const focusables=()=>[...wrap.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);
  const close=()=>{if(closed)return;closed=true;document.removeEventListener('keydown',key,true);nativeRemove();for(const {el,inert} of background)el.inert=inert;if(opener?.isConnected)opener.focus()};
  const key=e=>{if(closed||wrap.inert)return;if(e.key==='Escape'&&!busy){e.preventDefault();e.stopPropagation();close()}else if(e.key==='Tab'){const list=focusables(),first=list[0],last=list.at(-1);if(!first){e.preventDefault();wrap.querySelector('[role="dialog"]').focus()}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  wrap.remove=close;document.addEventListener('keydown',key,true);
  wrap.querySelectorAll('.field').forEach((field,i)=>{const label=field.querySelector('label'),input=field.querySelector('input,textarea,select');if(label&&input&&!label.htmlFor){input.id||=`${id}-field-${i}`;label.htmlFor=input.id}});
  wrap.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!busy)close()}));wrap.addEventListener('click',e=>{if(e.target===wrap&&!busy)close()});
  if(onConfirm)wrap.querySelector('[data-confirm]').addEventListener('click',async()=>{const btn=wrap.querySelector('[data-confirm]');busy=true;btn.disabled=true;wrap.querySelector('[role="dialog"]').setAttribute('aria-busy','true');try{const keep=await onConfirm(wrap);if(keep!==false)close()}catch(e){toast(e.message,'error')}finally{busy=false;btn.disabled=false;wrap.querySelector('[role="dialog"]').removeAttribute('aria-busy')}});
  (wrap.querySelector('[data-body] input,[data-body] select,[data-body] textarea')||focusables()[0]||wrap.querySelector('[role="dialog"]')).focus();return wrap;
}
export function loginView({role='trainer',title=t('Welcome back'),subtitle=t('Sign in to continue'),demoHint=''}={}){
  return `<div class="login-page"><div class="login-card"><div class="brand"><span class="brand-mark">T</span><span>${esc('Training Engine ONE')}</span></div><div class="login-tools"><button class="btn" id="loginLang" type="button" aria-label="${esc(t('Change language'))}">${esc(langButton())}</button><button class="btn icon" id="loginTheme" type="button" aria-label="${esc(t('Change appearance'))}">${themeIcon()}</button></div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p><form id="loginForm"><div class="field"><label>${esc(t('Username'))}</label><input class="input" name="username" autocomplete="username" required></div><div class="field"><label>${esc(t('Password'))}</label><input class="input" name="password" type="password" autocomplete="current-password" required></div><button class="btn primary" type="submit">${esc(t('Sign in'))}</button></form>${demoHint?`<p class="small muted" style="margin-top:16px">${esc(demoHint)}</p>`:''}</div></div>`;
}
export async function bindLogin(root,{requiredRole,onSuccess,onLocaleChange=null}){
  const form=root.querySelector('#loginForm');root.querySelector('#loginTheme')?.addEventListener('click',e=>{cycleTheme();e.currentTarget.textContent=themeIcon()});root.querySelector('#loginLang')?.addEventListener('click',()=>{cycleLocale();if(onLocaleChange)onLocaleChange();else location.reload()});
  form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form);const btn=form.querySelector('button[type=submit]');btn.disabled=true;try{const data=await api('/api/login',{method:'POST',json:{username:fd.get('username'),password:fd.get('password')}});if(requiredRole&&data.user.role!==requiredRole){setToken('');throw new Error(requiredRole==='trainer'?t('Use a trainer account for this page.'):t('Use a participant account for this page.'))}setToken(data.token);await onSuccess(data.user)}catch(err){toast(err.message,'error')}finally{btn.disabled=false}})
}
export function eventSource(onRefresh){let es=null;const connect=()=>{const token=getToken();es=new EventSource(`/api/events${token?`?token=${encodeURIComponent(token)}`:''}`);es.addEventListener('refresh',e=>{try{onRefresh(JSON.parse(e.data))}catch{onRefresh({})}});es.onerror=()=>{};};connect();return()=>es?.close()}
export function humanEvent(type=''){const m={signed_in:'Signed in',course_created:'Course created',course_imported:'Course imported',class_created:'Class created',class_imported:'Class imported',class_activated:'Class started',teams_created:'Teams created',attendance_saved:'Attendance saved',student_note_added:'Trainer note added',roster_imported:'Roster imported',activity_opened:'Activity opened',activity_closed:'Activity closed',results_revealed:'Results shown',classroom_cleared:'Classroom returned to waiting',response_submitted:'Response submitted',team_response_submitted:'Team response submitted',mission_opened:'Mission opened',mission_updated:'Mission progress updated',mission_completed:'Mission completed',submission_added:'Submission added',backup_created:'Backup created',demo_removed:'Demo content removed',demo_reset:'Demo workspace restored',classroom_updated:'Classroom updated',password_changed:'Password changed',staff_created:'Trainer added',staff_updated:'Trainer updated',password_reset:'Password reset',participant_activated:'Participant account activated',participant_deactivated:'Participant account deactivated',class_trainers_updated:'Class trainers updated',class_status_changed:'Class status updated',participant_enrolled:'Participant enrolled',profile_updated:'Profile updated',notification_sent:'Notification sent',help_requested:'Help requested',help_request_updated:'Help request updated',participant_progress_updated:'Participant progress updated',course_draft_created:'Course draft created',course_draft_saved:'Course draft saved',course_version_published:'Course version published',projector_navigated:'Projector navigated',permissions_updated:'Permissions updated',course_updated:'Course updated',course_archived:'Course archived',class_updated:'Class updated',class_archived:'Class archived',workflow_node_started:'Section started',workflow_node_completed:'Section completed',workflow_node_skipped:'Section skipped'};return t(m[type]||String(type).replaceAll('_',' '))}
export function downloadUrl(path){const token=getToken();return `${path}${path.includes('?')?'&':'?'}token=${encodeURIComponent(token)}`}
export function uiStatus(v=''){const map={draft:'Draft',planned:'Scheduled',active:'Active',scheduled:'Scheduled',completed:'Completed',cancelled:'Cancelled',published:'Published',ready:'Ready'};return t(map[String(v).toLowerCase()]||String(v))}
