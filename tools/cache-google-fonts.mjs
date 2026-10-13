import fs from 'node:fs/promises';
import path from 'node:path';
const optional=process.argv.includes('--optional');
const outDir=path.resolve('app/public/fonts');
const cssOut=path.resolve('app/public/fonts-local.css');
const cssUrl='https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap';
async function main(){
  try{
    const existing=await fs.readFile(cssOut,'utf8').catch(()=>null);
    if(optional&&existing?.includes('@font-face')&&existing.includes('/fonts/')){console.log('FONT_CACHE_READY');return;}
    await fs.mkdir(outDir,{recursive:true});
    const res=await fetch(cssUrl,{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/155 Safari/537.36'},signal:AbortSignal.timeout(6000)});
    if(!res.ok)throw new Error(`Google Fonts CSS download failed: ${res.status}`);
    let css=await res.text();
    const urls=[...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map(m=>m[1]))];
    if(!urls.length)throw new Error('Google Fonts returned no downloadable font assets.');
    for(let i=0;i<urls.length;i++){
      const url=urls[i];const u=new URL(url);const ext=path.extname(u.pathname)||'.woff2';const name=`gf-${i+1}${ext}`;
      const r=await fetch(url,{signal:AbortSignal.timeout(6000)});if(!r.ok)throw new Error(`Font download failed: ${r.status}`);
      await fs.writeFile(path.join(outDir,name),Buffer.from(await r.arrayBuffer()));
      css=css.split(url).join(`/fonts/${name}`);
    }
    await fs.writeFile(cssOut,`/* Locally cached official Google Fonts: Montserrat + Cairo. */\n${css}\n`);
    console.log(`FONT_CACHE_PASS ${urls.length} font assets cached locally.`);
  }catch(err){
    if(optional){console.warn(`FONT_CACHE_SKIPPED ${err.message}`);return;}
    throw err;
  }
}
await main();
