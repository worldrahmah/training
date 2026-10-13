import {esc,t} from '/core.js';

export function discoveryToolbar(scope,{placeholder='Search',filters=[],sorts=[],countLabel='results'}={}){
  const filterHtml=filters.map(f=>`<label class="discovery-control"><span>${esc(t(f.label||'Status'))}</span><select class="select" data-discovery-filter="${esc(f.key)}"><option value="">${esc(t(f.allLabel||'All'))}</option>${(f.options||[]).map(o=>`<option value="${esc(o.value)}">${esc(t(o.label||o.value))}</option>`).join('')}</select></label>`).join('');
  const sortHtml=sorts.length?`<label class="discovery-control"><span>${esc(t('Sort'))}</span><select class="select" data-discovery-sort>${sorts.map(o=>`<option value="${esc(o.value)}">${esc(t(o.label||o.value))}</option>`).join('')}</select></label>`:'';
  return `<div class="collection-discovery" data-discovery-toolbar="${esc(scope)}"><label class="discovery-search"><span class="sr-only">${esc(t('Search'))}</span><span class="discovery-search-icon">⌕</span><input class="input" type="search" data-discovery-search placeholder="${esc(t(placeholder))}" autocomplete="off"></label>${filterHtml}${sortHtml}<button class="btn discovery-reset" type="button" data-discovery-reset>${esc(t('Reset'))}</button><div class="discovery-count"><strong data-discovery-count>0</strong><span>${esc(t(countLabel))}</span></div></div>`;
}

function valueFor(item,key){return String(item.dataset[`filter${key.charAt(0).toUpperCase()}${key.slice(1)}`]??'')}
function sortValue(item,key){const raw=item.dataset[`sort${key.charAt(0).toUpperCase()}${key.slice(1)}`]??'';const n=Number(raw);return raw!==''&&Number.isFinite(n)?n:String(raw).toLocaleLowerCase()}
function cmp(a,b){if(typeof a==='number'&&typeof b==='number')return a-b;return String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'})}

export function updateDiscovery(root,scope){
  const toolbar=root.querySelector(`[data-discovery-toolbar="${CSS.escape(scope)}"]`),wrap=root.querySelector(`[data-discovery-scope="${CSS.escape(scope)}"]`);if(!toolbar||!wrap)return;
  const q=(toolbar.querySelector('[data-discovery-search]')?.value||'').trim().toLocaleLowerCase();
  const filters=[...toolbar.querySelectorAll('[data-discovery-filter]')].map(el=>({key:el.dataset.discoveryFilter,value:el.value}));
  const sort=(toolbar.querySelector('[data-discovery-sort]')?.value||'').split(':');
  const items=[...wrap.querySelectorAll(':scope > [data-discovery-item]')];let visible=[];
  for(const item of items){const search=String(item.dataset.search||item.textContent||'').toLocaleLowerCase();const ok=(!q||search.includes(q))&&filters.every(f=>!f.value||valueFor(item,f.key)===f.value);item.hidden=!ok;if(ok)visible.push(item)}
  if(sort[0]){const dir=sort[1]==='desc'?-1:1;visible.sort((a,b)=>cmp(sortValue(a,sort[0]),sortValue(b,sort[0]))*dir);for(const item of visible)wrap.appendChild(item)}
  const count=toolbar.querySelector('[data-discovery-count]');if(count)count.textContent=String(visible.length);
  let empty=wrap.querySelector(':scope > [data-discovery-empty]')||wrap.parentElement?.querySelector(':scope > [data-discovery-empty]');if(!empty&&items.length){if(wrap.tagName==='TBODY'){empty=document.createElement('tr');empty.dataset.discoveryEmpty='';empty.innerHTML=`<td colspan="99"><div class="empty discovery-empty">${esc(t('No results match your search.'))}</div></td>`;wrap.appendChild(empty)}else{empty=document.createElement('div');empty.className='empty discovery-empty';empty.dataset.discoveryEmpty='';empty.textContent=t('No results match your search.');wrap.parentElement?.appendChild(empty)}}if(empty)empty.hidden=visible.length>0;
}

export function refreshDiscoveries(root=document){root.querySelectorAll('[data-discovery-toolbar]').forEach(x=>updateDiscovery(root,x.dataset.discoveryToolbar))}

export function bindDiscovery(root=document){
  if(root.dataset?.discoveryBound==='1')return; if(root.dataset)root.dataset.discoveryBound='1';
  const run=el=>{const toolbar=el.closest('[data-discovery-toolbar]');if(toolbar)updateDiscovery(root,toolbar.dataset.discoveryToolbar)};
  root.addEventListener('input',e=>{if(e.target.matches('[data-discovery-search]'))run(e.target)});
  root.addEventListener('change',e=>{if(e.target.matches('[data-discovery-filter],[data-discovery-sort]'))run(e.target)});
  root.addEventListener('click',e=>{const b=e.target.closest('[data-discovery-reset]');if(!b)return;const toolbar=b.closest('[data-discovery-toolbar]');toolbar.querySelectorAll('input').forEach(x=>x.value='');toolbar.querySelectorAll('select').forEach(x=>x.selectedIndex=0);updateDiscovery(root,toolbar.dataset.discoveryToolbar)});
  refreshDiscoveries(root);
}
