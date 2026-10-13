import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('../app/public/live.js',import.meta.url),'utf8');
assert.match(src,/const HEALTH_REFRESH_MS=3000/,'trainer health must poll at a bounded live cadence');
assert.match(src,/setInterval\(refreshHealth,HEALTH_REFRESH_MS\)/,'trainer must auto-refresh classroom health');
assert.match(src,/data-projector-count/,'projector metric needs a live-update target');
assert.match(src,/projector\.textContent=String\(Number\(health\.projectors_connected\|\|0\)\)/,'projector metric must update without a full page reload');
assert.match(src,/window\.addEventListener\('focus',refreshHealth\)/,'returning to Trainer must refresh health immediately');
assert.match(src,/visibilitychange/,'returning to a visible Trainer tab must refresh health');
assert.match(src,/setTimeout\(refreshHealth,800\)/,'pairing must trigger a near-immediate health refresh');
assert.match(src,/setTimeout\(refreshHealth,2200\)/,'pairing must retry after Projector startup latency');
console.log('LIVE_HEALTH_AUTO_REFRESH_PASS');
