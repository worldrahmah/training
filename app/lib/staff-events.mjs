// Private invalidation only. Never publish message bodies, record IDs or media.
const clients=new Set();
export function emitStaffUpdate(users,topic='inbox'){
 const targets=users?new Set(users.map(Number)):null;
 for(const client of clients)if(!targets||targets.has(client.userId))client.push(topic);
}
export function openStaffStream(req,res,{userId,authorized}){
 // Auth is checked before headers and before every event/heartbeat. Bounded output.
 if([...clients].filter(c=>c.userId===userId).length>=12){res.writeHead(429,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,message:'Too many messaging windows. Close an unused window.'}));return}
 res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'private, no-store','Connection':'keep-alive','X-Accel-Buffering':'no','X-Content-Type-Options':'nosniff'});
 let closed=false;const close=()=>{if(closed)return;closed=true;clearInterval(timer);clients.delete(client);res.end()};
 const client={userId,close,push(topic){if(closed)return;try{if(!authorized()||res.writableLength>65536){close();return}res.write(`event: update\ndata: ${JSON.stringify({topic})}\n\n`)}catch{close()}}};
 const timer=setInterval(()=>client.push('heartbeat'),10000);timer.unref();clients.add(client);res.on('close',close);req.on('aborted',close);client.push('ready');
}
export function closeStaffStreams(){for(const client of [...clients])client.close()}
