import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const css=fs.readFileSync(path.join(root,'app/public/one-ui.css'),'utf8');
const core=fs.readFileSync(path.join(root,'app/public/core.js'),'utf8');
const live=fs.readFileSync(path.join(root,'app/public/live.js'),'utf8');
for(const token of ['Montserrat','Cairo','oneRise','oneGlow','oneShimmer','repeat(auto-fit','--live-canvas','[data-theme="dark"]'])assert.ok(css.includes(token),`missing deep UI token ${token}`);
assert.ok(core.includes('Montserrat')&&core.includes('Cairo'),'runtime typography must enforce Montserrat/Cairo');
assert.ok(live.includes("cycleTheme();render()"),'live classroom theme control must rerender after theme change');
assert.doesNotMatch(css,/https?:\/\//,'runtime UI CSS must stay local-first');
for(const file of ['admin.html','trainer.html','student.html','builder.html','live.html','present.html','preview.html','certificate.html']){
 const html=fs.readFileSync(path.join(root,'app/public',file),'utf8');
 assert.match(html,/href="\/fonts-local\.css"/,`${file} must load locally cached font layer`);
}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.equal(pkg.scripts['fonts:cache'],'node tools/cache-google-fonts.mjs');
assert.ok(pkg.scripts.prestart?.includes('--optional'),'startup should opportunistically cache official fonts without breaking offline operation');
console.log('DEEP_PRODUCT_UI_PASS');
