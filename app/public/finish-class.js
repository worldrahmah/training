import {api,esc,modal,t,toast} from '/core.js';

export function finishClass({id,title,revision,onFinished}){
 return modal(t('Finish class'),`<p><strong dir="auto">${esc(title)}</strong></p><p>${esc(t('Finish this class for everyone? This ends the live session and closes the current activity.'))}</p><p class="muted">${esc(t('Saved responses and progress are kept. Unfinished learner tasks are not marked complete. You can move this class to Trash afterwards.'))}</p>`,{confirmText:t('Finish class'),onConfirm:async()=>{
  await api(`/api/classes/${Number(id)}/finish`,{method:'POST',json:revision==null?{}:{expected_revision:Number(revision)}});
  toast(t('Class finished. Your records are saved.'),'success');await onFinished?.();
 }});
}
document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-finish-class]');if(!button||button.disabled)return;
 finishClass({id:button.dataset.finishClass,title:button.dataset.finishTitle||'',revision:button.dataset.finishRevision,onFinished:()=>{if(button.dataset.finishReturn)location.href=button.dataset.finishReturn}});
});
