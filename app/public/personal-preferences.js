// Account identity is tab-local; preference values/pending changes are namespaced.
// No token or other credential is written to persistent storage.
export const PANEL_COLORS=['default','teal','blue','indigo','violet','rose','amber'];
const identityKey='training_engine_preference_account';
let account=Number(globalThis.sessionStorage?.getItem('training_engine_session')?globalThis.sessionStorage.getItem(identityKey):0)||0;
const key=id=>'training_engine_preferences_v2:'+id;
export function preferenceAccount(){return account}
function record(id=account){try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}}
function save(value,id=account){localStorage.setItem(key(id),JSON.stringify(value))}
export function readPreference(name,fallback){
 const cached=account?record()[name]:null;
 if(cached!=null)return cached;
 if(name==='language')return localStorage.getItem('training_engine_locale')||fallback;
 if(name==='theme')return account?fallback:(localStorage.getItem('training_engine_theme')||fallback);
 return fallback;
}
export function writePreference(name,value){
 if(account){const current=record();save({...current,[name]:value,pending:{...current.pending,[name]:value}})}
 else if(name==='language')localStorage.setItem('training_engine_locale',value);
 else if(name==='theme')localStorage.setItem('training_engine_theme',value);
 if(typeof CustomEvent!=='undefined')document.dispatchEvent?.(new CustomEvent('one-personal-preference',{detail:{account,name,value}}));
}
export function bindPreferenceAccount(user){
 account=Number(user?.id)||0;
 if(account)sessionStorage.setItem(identityKey,String(account));else sessionStorage.removeItem(identityKey);
 if(!account)return;
 const current=record(),remote=user.ui_preferences||{},pending=current.pending||{};
 const language=remote.language||current.language||localStorage.getItem('training_engine_locale')||'en';
 save({language,theme:remote.theme||current.theme||localStorage.getItem('training_engine_theme')||'system',accent:remote.accent||current.accent||'default',...pending,pending});
}
export function pendingPreferences(){return account?{...(record().pending||{})}:{}}
export function acknowledgePreferences(id,sent){
 const current=record(id),pending={...current.pending};
 for(const [name,value] of Object.entries(sent))if(pending[name]===value)delete pending[name];
 save({...current,pending},id);
}
