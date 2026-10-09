import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
const base='https://tykit.rometheme.pro/terra/';
const assets=new Map(), pending=new Map(), failed=[];
await fs.mkdir('public/assets',{recursive:true}); await fs.mkdir('src/data',{recursive:true});
const normalize=u=>u.replace(/^http:/,'https:').replace(/&amp;/g,'&');
async function get(url){
 try{const r=await fetch(url,{signal:AbortSignal.timeout(22000)}); if(!r.ok)throw Error(r.status);return Buffer.from(await r.arrayBuffer());}
 catch { return execFileSync('curl.exe',['-f','-L','--retry','1','--max-time','30','-s',url],{maxBuffer:25e6}); }
}
async function asset(input){
 if(!input||/^(data:|#|mailto:|tel:)/.test(input))return input;
 const url=normalize(new URL(input,base).href);
 if(pending.has(url))return pending.get(url);
 const task=(async()=>{
  const basename=decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/[^a-zA-Z0-9._-]/g,'-');
  const filename=crypto.createHash('sha1').update(url.split('?')[0]).digest('hex').slice(0,8)+'-'+basename;
  const dest='public/assets/'+filename;const local='/assets/'+filename;
  try{
   if(!existsSync(dest)){
    let data=await get(url);
    if(/\.css(?:\?|$)/.test(url)){
     let css=data.toString(); const matches=[...css.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g)];
     for(const m of matches){if(!m[2].startsWith('data:')){const replacement=await asset(new URL(m[2],url).href);css=css.replaceAll(m[0],`url("${replacement}")`);}}
     data=Buffer.from(css);
    }
    await fs.writeFile(dest,data);
   }
   assets.set(url,local);return local;
  }catch(e){failed.push({url,error:e.message.slice(0,140)});console.log('MISSING',url);return url;}
 })(); pending.set(url,task);return task;
}
const files=(await fs.readdir('reference')).filter(x=>x.endsWith('.html')&&!x.includes('-rendered'));
const pages=[]; const cssURLs=new Set();
for(const file of files){
 const key=file.replace('.html','');const html=await fs.readFile('reference/'+file,'utf8');const $=load(html);
 const rendered=load(await fs.readFile('reference/'+key+'-rendered.html','utf8'));
 $('link[rel=stylesheet]').each((i,e)=>cssURLs.add(normalize($(e).attr('href'))));
 rendered('link[rel=stylesheet]').each((i,e)=>cssURLs.add(normalize(rendered(e).attr('href'))));
 $('.elementor-widget-metform').each((i,e)=>{const form=rendered('.elementor-widget-metform').eq(i).find('form').first();if(form.length)$(e).html('<div class="elementor-widget-container">'+rendered.html(form)+'</div>');});
 $('script, link, noscript').remove();
 const candidates=[];
 $('img[src], [style], a[data-elementor-open-lightbox]').each((i,e)=>{
  const el=$(e); if(e.tagName==='img') candidates.push({el,attr:'src',url:el.attr('src')});
  if(el.attr('data-elementor-open-lightbox'))candidates.push({el,attr:'href',url:el.attr('href')});
  const style=el.attr('style');if(style)for(const m of style.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))candidates.push({el,attr:'style',url:m[1],match:m[0]});
 });
 for(let i=0;i<candidates.length;i+=8)await Promise.all(candidates.slice(i,i+8).map(async ({el,attr,url,match})=>{if(!url)return;const local=await asset(url);el.attr(attr,match?el.attr(attr).replace(match,`url(${local})`):local);}));
 $('img').removeAttr('srcset sizes loading decoding');
 $('[data-e-action-hash]').removeAttr('data-e-action-hash');
 $('[style]').each((i,e)=>{if(!$(e).attr('style').trim())$(e).removeAttr('style');});
 const body=$('body');
 const header=body.children('.ekit-template-content-header').first();
 const footer=body.children('.ekit-template-content-footer').first();
 const content=body.children().filter((i,e)=>!['script','style','link'].includes(e.tagName)&&!$(e).hasClass('ekit-template-content-header')&&!$(e).hasClass('ekit-template-content-footer')&&!$(e).hasClass('skip-link'));
 function node(e){
  if(e.type==='text')return e.data.trim()?e.data:null;
  if(e.type!=='tag'||['script','link','noscript'].includes(e.tagName))return null;
  const attrs={...e.attribs};for(const k of Object.keys(attrs))if(/^on/i.test(k)||/nonce|data-action|data-form-nonce|data-wp-nonce/.test(k))delete attrs[k];
  if(attrs.tabindex==='-1'&&e.tagName==='a')delete attrs.tabindex;
  if(attrs.href?.startsWith(base)||attrs.href?.startsWith(base.replace('https:','http:'))){const u=new URL(attrs.href);if(!/wp-content/.test(u.pathname))attrs.href=u.pathname.replace(/^\/terra/,'')||'/';}
  if(attrs.href==='/template-kit/homepage/')attrs.href='/';
  if(attrs.href?.startsWith('javascript:'))attrs.href='#';
  if(e.tagName==='iframe'){attrs.loading='lazy';attrs.title=attrs.title||'Location map';}
  return {tag:e.tagName,attrs,children:(e.children||[]).map(node).filter(x=>x!==null)};
 }
 const page={key,title:$('title').text().replace(/ – Terra$/, ''),bodyClass:body.attr('class'),header:node(header[0]),footer:node(footer[0]),content:content.toArray().map(node).filter(Boolean)};
 pages.push(page);console.log('EXTRACTED',key);
}
console.log('STYLES',cssURLs.size);
const cssList=[...cssURLs];for(let i=0;i<cssList.length;i+=6)await Promise.all(cssList.slice(i,i+6).map(asset));
const common=pages.find(p=>p.key==='home');await fs.writeFile('src/data/shared.json',JSON.stringify({header:common.header,footer:common.footer}));
for(const p of pages){delete p.header;delete p.footer;await fs.writeFile(`src/data/${p.key}.json`,JSON.stringify(p));}
await fs.writeFile('src/reference.css',cssList.map(u=>`@import url("${assets.get(u)||u}");`).join('\n'));
await fs.writeFile('reference/asset-manifest.json',JSON.stringify({assets:Object.fromEntries(assets),failed},null,2));
console.log('FINISHED',pages.length,'pages',assets.size,'assets',failed.length,'missing');
