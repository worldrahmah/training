import path from 'node:path';
import {FONT_CATALOG} from '../public/font-catalog.js';
export {FONT_CATALOG};
export function resolveTypography(config={}){
  const selected={};for(const language of ['en','ar']){const raw=String(config.ui?.[language]||config[language]||'').split(',')[0].replace(/["']/g,'').trim().toLowerCase();selected[language]=FONT_CATALOG.families.find(font=>font.language===language&&(font.id===raw||font.name.toLowerCase()===raw))||FONT_CATALOG.families.find(font=>font.id===FONT_CATALOG.defaults[language]);}return selected;
}
export function selectedFontPaths(config={}){return Object.fromEntries(Object.entries(resolveTypography(config)).map(([language,font])=>[language,path.resolve(import.meta.dirname,'../public'+font.file)]));}
export function validateFontSelection(body){const selection={};for(const language of ['en','ar']){const font=FONT_CATALOG.families.find(item=>item.language===language&&item.id===body[language]);if(!font)throw Object.assign(new Error('Choose a bundled font for each language.'),{status:400});selection[language]=font.id;}return {version:2,ui:selection};}
