import {api,applyTypography,esc,eventSource,initLocale,initTheme,t} from '/core.js';
import {formatProjectorTime,renderProjectorFrame} from '/projector.js';
initTheme();initLocale();
const app=document.querySelector('#app'),params=new URLSearchParams(location.search),classId=Number(params.get('class_id')||0),pair=params.get('pair')||'',legacyControl=params.get('control_key')||'';
let live=null,settings={},timerId=null;
const mergeTypography=(base={},override={})=>{if(base?.version===2)return base;const out=structuredClone(base||{});for(const k of ['ui','presentation','title','body'])out[k]={...(out[k]||{}),...(override?.[k]||{})};return out};
async function refresh(){try{const livePath=classId?`/api/live?class_id=${classId}${pair?`&pair=${encodeURIComponent(pair)}`:''}`:'/api/live';const [d,s]=await Promise.all([api(livePath),api('/api/public-settings')]);live=d.live;settings=s||{};applyTypography(mergeTypography(s?.typography||{},live?.course?.branding?.typography||{}),'presentation');render()}catch(e){app.innerHTML=renderProjectorFrame({live:null,theme:'dark'}).replace(t('Ready when you are'),t('Projector pairing expired')).replace(t('Waiting for the trainer to begin this class.'),t('Ask the trainer to pair this projector again from the live classroom.'))}}
function render(){clearInterval(timerId);timerId=null;document.title=`Training Engine ONE — ${t('Projector')}`;app.innerHTML=renderProjectorFrame({live,theme:live?.projector?.theme||null,safeArea:true});bindTimer()}
function bindTimer(){const timer=document.querySelector('[data-timer]');if(timer){let s=Number(timer.dataset.timer);timerId=setInterval(()=>{s=Math.max(0,s-1);timer.textContent=formatProjectorTime(s);if(s<=0){clearInterval(timerId);timerId=null}},1000)}}
// Legacy keyboard control is kept only for old paired URLs; ONE's normal projector is display-only.
async function legacyNavigate(direction){if(!legacyControl||!live?.class?.id)return;await api(`/api/live/${live.class.id}/navigate?control_key=${encodeURIComponent(legacyControl)}`,{method:'POST',json:{direction}}).catch(()=>{})}
window.addEventListener('keydown',e=>{if(!legacyControl)return;if(['ArrowRight','PageDown'].includes(e.key))legacyNavigate('next');if(['ArrowLeft','PageUp'].includes(e.key))legacyNavigate('previous')});
window.addEventListener('pagehide',()=>{if(classId&&pair)navigator.sendBeacon?.(`/api/live/${classId}/projector-disconnect?pair=${encodeURIComponent(pair)}`)});eventSource(e=>{if(!e.class_id||!classId||Number(e.class_id)===classId)refresh()});setInterval(refresh,15000);refresh();
