import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import { chromium } from 'playwright';
const origin = 'https://tykit.rometheme.pro/terra/';
const routes = [['home',''], ...['about-us','classes','services','pricing','gallery','faq','contact','blog'].map(x=>[x,`template-kit/${x}/`]), ...['make-learning-fun-for-your-kids','activities-using-the-five-senses','painting-classes-at-our-center'].map(x=>[x,`2022/12/12/${x}/`])];
await fs.mkdir('reference/screenshots',{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const reports=[];
for(let i=0;i<routes.length;i+=3){
 await Promise.all(routes.slice(i,i+3).map(async ([key,path])=>{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  try {
   let html;
   try {const r=await fetch(origin+path,{signal:AbortSignal.timeout(35000)});html=await r.text();} catch {html=execFileSync('curl.exe',['-L','--max-time','45','-s',origin+path],{encoding:'utf8',maxBuffer:10e6});}
   await fs.writeFile(`reference/${key}.html`,html);
   await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:45000}).catch(e=>console.log('Navigation',key,e.message.split('\n')[0]));
   await page.waitForTimeout(2500);
   await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=850){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);});
   await page.waitForTimeout(1200);
   await page.screenshot({path:`reference/screenshots/${key}-desktop.png`,fullPage:true});
   const detail=await page.evaluate(()=>({title:document.title,bodyClass:document.body.className,roots:[...document.querySelectorAll('[data-elementor-type]')].map(e=>({type:e.getAttribute('data-elementor-type'),id:e.getAttribute('data-elementor-id')})),headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent.trim()),widgets:[...new Set([...document.querySelectorAll('[data-widget_type]')].map(e=>e.getAttribute('data-widget_type')))],links:[...new Set([...document.querySelectorAll('a[href]')].map(e=>e.getAttribute('href')))],fonts:[...new Set([...document.querySelectorAll('h1,h2,h3,p,a')].map(e=>getComputedStyle(e).fontFamily))],animations:[...document.querySelectorAll('[data-settings]')].map(e=>e.getAttribute('data-settings')).filter(x=>/anim|motion|effect/.test(x))}));
   await fs.writeFile(`reference/${key}-rendered.html`,await page.content());
   await page.setViewportSize({width:390,height:844});
   await page.waitForTimeout(700);
   await page.screenshot({path:`reference/screenshots/${key}-mobile.png`,fullPage:true});
   reports.push({key,path,...detail});
   console.log('INSPECTED',key,detail.title,detail.headings.slice(0,6));
  }catch(e){console.log('FAILED',key,e.message);}finally{await page.close();}
 }));
}
await fs.writeFile('reference/site-audit.json',JSON.stringify(reports,null,2));
await browser.close();
console.log('DONE',reports.length);
