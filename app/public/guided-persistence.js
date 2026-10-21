// Transport failures retain their HTTP status. A response parser is never an offline detector.
export const GUIDED_FAILURES=Object.freeze(['OFFLINE','TIMEOUT','UNAUTHORIZED','FORBIDDEN','NOT_FOUND','VALIDATION_ERROR','CONFLICT','SERVER_ERROR','CLIENT_RUNTIME_ERROR','REQUEST_FAILED','QUEUED_PENDING','REPLAY_FAILED','CONFIRMED']);
const messages={OFFLINE:'Saved on this device. Reconnect to continue.',TIMEOUT:'The save timed out. Your change is saved on this device; retry to confirm it.',UNAUTHORIZED:'Sign in to confirm your saved changes.',FORBIDDEN:'You do not have permission to save this change.',NOT_FOUND:'This learning activity is no longer available. Refresh your class.',VALIDATION_ERROR:'This change could not be accepted. Check your response and retry.',CONFLICT:'Your progress changed on another device. Refresh before continuing.',SERVER_ERROR:'The server could not save your change. Retry shortly.',CLIENT_RUNTIME_ERROR:'The save could not be confirmed. Refresh your class and review saved changes.',REQUEST_FAILED:'The server could not be reached. Your change is saved on this device; retry to confirm it.',QUEUED_PENDING:'A saved change needs confirmation. Review saved guided changes to continue.'};
export function guidedFailure(code,details={}){return Object.assign(new Error(messages[code]||messages.CLIENT_RUNTIME_ERROR),details,{code})}
export function classifyGuidedFailure(error){if(GUIDED_FAILURES.includes(error?.code))return error;const status=Number(error?.status);return guidedFailure(status===401?'UNAUTHORIZED':status===403?'FORBIDDEN':status===404?'NOT_FOUND':status===409?'CONFLICT':[400,413,415,422].includes(status)?'VALIDATION_ERROR':status>=500?'SERVER_ERROR':'CLIENT_RUNTIME_ERROR',{status:status||undefined,endpoint:error?.endpoint,method:error?.method})}
async function transport(row,{fetcher=globalThis.fetch,token,online=()=>globalThis.navigator?.onLine!==false,timeout=15000}={}){
 const endpoint=row.kind==='progress'?`/api/student/runtime/${row.class_id}`:`/api/student/guided/${row.class_id}/response`,method=row.kind==='progress'?'PUT':'POST';
 // Serialize before entering the network catch: serialization/runtime defects cannot be offline.
 let body;try{body=JSON.stringify(row.payload)}catch{throw guidedFailure('CLIENT_RUNTIME_ERROR',{endpoint,method})}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);let response;
 try{response=await fetcher(endpoint,{method,headers:{'X-Session-Token':token,'Content-Type':'application/json'},body,signal:controller.signal,cache:'no-store'})}
 catch(error){clearTimeout(timer);throw guidedFailure(controller.signal.aborted?'TIMEOUT':error instanceof TypeError?(online()?'REQUEST_FAILED':'OFFLINE'):'CLIENT_RUNTIME_ERROR',{endpoint,method})}
 let data=null;try{data=await response.json()}catch{/* Preserve response.status even when an intermediary serves HTML. */}finally{clearTimeout(timer)}
 if(controller.signal.aborted&&response.ok)throw guidedFailure('TIMEOUT',{status:response.status,endpoint,method});
 if(!response.ok)throw classifyGuidedFailure({status:response.status,endpoint,method});
 if(data?.ok!==true||!Number.isInteger(data.revision)||data.revision<1||data.mutation_id!==row.id)throw guidedFailure('CLIENT_RUNTIME_ERROR',{status:response.status,endpoint,method,reason:'INVALID_CONFIRMATION'});
 return data;
}

// Opt-in developer diagnostics contain routing/identity/confirmation metadata only.
// Answers, evidence text, session tokens and arbitrary server exception bodies are omitted.
export async function sendGuidedRequest(row,options={}){
 try{const reply=await transport(row,options);diagnose(row,{code:'CONFIRMED',revision:reply.revision});return reply}
 catch(error){diagnose(row,{code:error.code||'CLIENT_RUNTIME_ERROR',status:error.status||null,endpoint:error.endpoint||null,reason:error.reason||null});throw error}
}
function diagnose(row,result){if(globalThis.__ONE_GUIDED_DIAGNOSTICS__!==true||typeof globalThis.dispatchEvent!=='function')return;globalThis.dispatchEvent(new CustomEvent('guided-persistence-diagnostic',{detail:{...result,class_id:row.class_id,module_id:row.payload?.module_id,path_id:row.payload?.path_id,step_id:row.payload?.expected_step_id,activity_id:row.payload?.activity_id,mutation_id:row.id,outbox_id:row.id,retry_count:row.retry_count||0,at:new Date().toISOString()}}))}
