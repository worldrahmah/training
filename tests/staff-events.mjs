import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {openStaffStream,emitStaffUpdate,closeStaffStreams} from '../app/lib/staff-events.mjs';
let checks=0;
function connection(userId,authorized=()=>true){const req=new EventEmitter(),res=new EventEmitter();res.writableLength=0;res.chunks=[];res.writeHead=(status,headers)=>{res.status=status;res.headers=headers};res.write=text=>res.chunks.push(text);res.end=text=>{res.ended=true;if(text)res.chunks.push(text)};openStaffStream(req,res,{userId,authorized});return {req,res}}
const a=connection(1),b=connection(2);assert.equal(a.res.status,200);assert.match(a.res.headers['Cache-Control'],/no-store/);checks+=2;
const count=a.res.chunks.length;emitStaffUpdate([2]);assert.equal(a.res.chunks.length,count);assert.match(b.res.chunks.at(-1),/"topic":"inbox"/);checks+=2;
emitStaffUpdate([1],'call');assert.match(a.res.chunks.at(-1),/"topic":"call"/);assert.ok(a.res.chunks.every(row=>!row.includes('token')&&!row.includes('message_id')));checks+=2;
let valid=true;const revoked=connection(3,()=>valid);valid=false;emitStaffUpdate([3]);assert.equal(revoked.res.ended,true);checks++;
a.res.writableLength=65537;emitStaffUpdate([1]);assert.equal(a.res.ended,true);checks++;
const limited=Array.from({length:13},()=>connection(7));assert.equal(limited[11].res.status,200);assert.equal(limited[12].res.status,429);checks+=2;
b.req.emit('aborted');assert.equal(b.res.ended,true);checks++;
closeStaffStreams();assert.ok(limited.every(c=>c.res.ended));checks++;console.log('STAFF_EVENTS_PASS',checks,'private targeting, revocation, bounded buffers/connections and lifecycle cleanup');
