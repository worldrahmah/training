import {esc,t} from '/core.js';

const palette=['#6657e8','#0ea5a5','#a855f7','#f59e0b','#ef4444','#22c55e','#0284c7','#db2777'];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const fmt=v=>Number(v).toLocaleString(document.documentElement.lang||'en',{maximumFractionDigits:1});
function normalizeDataset(ds){return {...ds,rows:Array.isArray(ds.rows)?ds.rows:[],metrics:(ds.metrics||[]).filter(m=>m&&m.key)}}
export function allowedChartTypes(ds,metric,rows=ds.rows){
  const types=['bar','table'];
  if(ds.ordered===true)types.push('line');
  if(ds.partition===true&&metric.additive===true&&ds.allowPie!==false&&rows.every(r=>num(r[metric.key])>=0))types.push('pie');
  return types;
}
function bar(rows,labelKey,metric){
  const values=rows.map(r=>num(r[metric.key])),min=Math.min(0,...values),max=Math.max(0,...values),span=max-min||1,zero=-min/span*100;
  return `<div class="report-bar-list">${rows.map((r,i)=>{const v=values[i],end=(v-min)/span*100;return `<div class="report-bar-row"><span class="report-bar-label">${esc(r[labelKey]??'—')}</span><div class="report-bar-track" aria-hidden="true"><i class="report-bar-zero" style="inset-inline-start:${zero}%"></i><i class="report-bar-fill" style="inset-inline-start:${Math.min(zero,end)}%;width:${Math.abs(end-zero)}%;background:${palette[i%palette.length]}"></i></div><strong>${esc(fmt(v))}${esc(metric.suffix||'')}</strong></div>`}).join('')}</div>`;
}
function line(rows,labelKey,metric){
  const vals=rows.map(r=>num(r[metric.key])),min=Math.min(0,...vals),max=Math.max(1,...vals),span=max-min||1,w=920,h=360,p=60;
  const points=rows.map((r,i)=>({x:p+(rows.length<=1?(w-p*2)/2:i*(w-p*2)/(rows.length-1)),y:h-p-(vals[i]-min)/span*(h-p*2),label:String(r[labelKey]??''),v:vals[i]}));
  return `<svg class="report-chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(t(metric.label))}"><path d="M${points.map(p=>`${p.x},${p.y}`).join(' L')}" fill="none" stroke="${palette[0]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>${points.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="6" fill="${palette[0]}"><title>${esc(p.label)}: ${esc(fmt(p.v))}</title></circle>${i===0||i===points.length-1||points.length<=6?`<text x="${p.x}" y="${h-20}" text-anchor="middle">${esc(p.label)}</text>`:''}`).join('')}</svg>`;
}
function pie(rows,labelKey,metric){
  const vals=rows.map(r=>num(r[metric.key])),total=vals.reduce((a,b)=>a+b,0);let acc=0;
  const slices=rows.map((r,i)=>{const v=vals[i];if(!v||!total)return '';const start=acc/total*Math.PI*2-Math.PI/2;acc+=v;const end=acc/total*Math.PI*2-Math.PI/2,d=v===total?'M160 40 A120 120 0 1 1 160 280 A120 120 0 1 1 160 40 Z':`M160 160 L${160+120*Math.cos(start)} ${160+120*Math.sin(start)} A120 120 0 ${end-start>Math.PI?1:0} 1 ${160+120*Math.cos(end)} ${160+120*Math.sin(end)} Z`;return `<path d="${d}" fill="${palette[i%palette.length]}"><title>${esc(r[labelKey])}: ${esc(fmt(v))}</title></path>`}).join('');
  return `<div class="pie-layout"><svg class="report-pie-svg" viewBox="0 0 320 320" role="img" aria-label="${esc(t(metric.label))}"><circle cx="160" cy="160" r="120" fill="var(--surface-3)"></circle>${slices}<circle cx="160" cy="160" r="76" fill="var(--surface)"></circle><text x="160" y="154" text-anchor="middle" class="pie-total">${esc(fmt(total))}</text><text x="160" y="180" text-anchor="middle">${esc(t('Total'))}</text></svg><div class="chart-legend">${rows.map((r,i)=>`<div><span style="background:${palette[i%palette.length]}"></span><strong>${esc(r[labelKey]??'—')}</strong><em>${esc(fmt(vals[i]))}${esc(metric.suffix||'')}</em></div>`).join('')}</div></div>`;
}
function table(rows,labelKey,metric){return `<div class="table-wrap"><table class="table"><caption class="sr-only">${esc(t(metric.label))}</caption><thead><tr><th scope="col">${esc(t('Dimension'))}</th><th scope="col">${esc(t(metric.label))}</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${esc(r[labelKey]??'—')}</th><td>${esc(fmt(num(r[metric.key])))}${esc(metric.suffix||'')}</td></tr>`).join('')}</tbody></table></div>`}

export function mountReportChartWorkspace(container,catalog,{title='Chart builder',subtitle='Choose what you want to compare.'}={}){
  if(!container)return;
  const datasets=catalog.map(normalizeDataset).filter(d=>d.rows.length&&d.metrics.length);
  if(!datasets.length){container.innerHTML=`<div class="empty">${esc(t('No chart data.'))}</div>`;return}
  container.innerHTML=`<div class="chart-workspace-head"><div><div class="eyebrow">${esc(t('Reports'))}</div><h2>${esc(t(title))}</h2><p class="muted">${esc(t(subtitle))}</p></div><div class="chart-controls"><label><span>${esc(t('Data set'))}</span><select class="select" data-chart-dataset aria-label="${esc(t('Data set'))}">${datasets.map((d,i)=>`<option value="${i}">${esc(t(d.label))}</option>`).join('')}</select></label><label><span>${esc(t('Metric'))}</span><select class="select" data-chart-metric aria-label="${esc(t('Metric'))}"></select></label><label><span>${esc(t('Chart type'))}</span><select class="select" data-chart-type aria-label="${esc(t('Chart type'))}"><option value="bar">${esc(t('Bar chart'))}</option><option value="line">${esc(t('Line chart'))}</option><option value="pie">${esc(t('Pie chart'))}</option><option value="table">${esc(t('Table'))}</option></select></label></div></div><div class="report-chart-filter"><label><span class="sr-only">${esc(t('Filter chart rows'))}</span><input type="search" class="input" data-chart-filter placeholder="${esc(t('Filter chart rows'))}"></label><span class="small muted" data-chart-count role="status" aria-live="polite"></span></div><p class="small muted chart-compatibility">${esc(t('Line charts require ordered data. Pie charts require additive groups.'))}</p><div class="report-chart-stage" data-chart-stage></div>`;
  const dsSel=container.querySelector('[data-chart-dataset]'),metricSel=container.querySelector('[data-chart-metric]'),typeSel=container.querySelector('[data-chart-type]'),filter=container.querySelector('[data-chart-filter]'),stage=container.querySelector('[data-chart-stage]'),count=container.querySelector('[data-chart-count]');
  function render(){
    const ds=datasets[Number(dsSel.value)||0],metric=ds.metrics.find(m=>m.key===metricSel.value)||ds.metrics[0],q=filter.value.trim().toLocaleLowerCase(),rows=ds.rows.filter(r=>!q||String(r[ds.labelKey]??'').toLocaleLowerCase().includes(q)),types=allowedChartTypes(ds,metric,rows);
    for(const option of typeSel.options)option.disabled=!types.includes(option.value);if(!types.includes(typeSel.value))typeSel.value='bar';
    count.textContent=t('{shown} of {total} rows',{shown:rows.length,total:ds.rows.length});
    if(!rows.length){stage.innerHTML=`<div class="empty">${esc(t('No results match your search.'))}</div>`;return}
    const data=table(rows,ds.labelKey,metric);let visual='';
    if(typeSel.value==='pie')visual=pie(rows,ds.labelKey,metric);else if(typeSel.value==='line')visual=line(rows,ds.labelKey,metric);else if(typeSel.value==='table'){stage.innerHTML=data;return}else visual=bar(rows,ds.labelKey,metric);
    stage.innerHTML=`${visual}<details class="report-data-details"><summary>${esc(t('View data table'))}</summary>${data}</details>`;
  }
  function syncMetrics(){const ds=datasets[Number(dsSel.value)||0];metricSel.innerHTML=ds.metrics.map(m=>`<option value="${esc(m.key)}">${esc(t(m.label))}</option>`).join('');filter.value='';render()}
  dsSel.addEventListener('change',syncMetrics);metricSel.addEventListener('change',render);typeSel.addEventListener('change',render);filter.addEventListener('input',render);syncMetrics();
}
