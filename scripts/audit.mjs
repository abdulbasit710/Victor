import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:5173';
const audit=JSON.parse(await fs.readFile('reference/site-audit.json','utf8'));
await fs.mkdir('reference/local',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];const errors=[];const failures=[];const saved=[];
const check=(name,ok,details)=>{results.push({name,ok,details});console.log(ok?'PASS':'FAIL',name,details||'');if(!ok)failures.push(name);};
for(const [device,width,height] of (process.argv.includes('--interactions-only')?[]:[['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]])){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/maps.google|youtube|net::ERR|Permissions policy/.test(m.text()))errors.push(m.text());});
 await page.route(/https:\/\/(maps\.google|www\.youtube)/,r=>r.fulfill({status:200,body:'<!doctype html><title>External embed</title>'}));
 for(const entry of audit){
  const response=await page.goto(base+'/'+entry.path,{waitUntil:'networkidle',timeout:30000});
  await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=1000){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,35));}scrollTo({top:0,behavior:'instant'});await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  await page.waitForTimeout(250);
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>e.textContent.trim()),forms:document.querySelectorAll('form').length,fonts:document.fonts.status}));
  check(`${entry.key} ${device}: renders`,response.ok()&&metrics.headings.length>0);
  check(`${entry.key} ${device}: fits viewport`,metrics.scroll<=width+1,`${metrics.scroll}/${width}`);
  check(`${entry.key} ${device}: images`,metrics.broken.length===0,metrics.broken.length?metrics.broken.join(', '):undefined);
  check(`${entry.key} ${device}: reference headings`,JSON.stringify(metrics.headings)===JSON.stringify(entry.headings));
  await page.screenshot({path:`reference/local/${entry.key}-${device}.png`,fullPage:true});
  if(entry.key==='home')await page.screenshot({path:`reference/local/home-${device}-viewport.png`});
 }
 await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
await page.route(/https:\/\/(maps\.google|www\.youtube)/,r=>r.fulfill({status:200,body:'<!doctype html><title>External embed</title>'}));
await page.goto(base,{waitUntil:'networkidle'});
await page.getByRole('link',{name:'Page',exact:true}).hover();
check('Desktop dropdown opens on hover',await page.locator('#terra-pages').isVisible());
await page.locator('#terra-pages').getByRole('link',{name:'Gallery',exact:true}).click();
await page.waitForURL('**/template-kit/gallery/');
check('SPA navigation reaches Gallery',(await page.title()).includes('Gallery'));
await page.locator('main .elementor-image-gallery a').first().click();
check('Gallery lightbox opens',await page.getByRole('dialog').isVisible());
const first=await page.locator('.terra-lightbox-stage img').getAttribute('src');
await page.keyboard.press('ArrowRight');check('Gallery keyboard next',(await page.locator('.terra-lightbox-stage img').getAttribute('src'))!==first);
await page.getByRole('button',{name:'Zoom in',exact:true}).click();check('Gallery zoom',await page.locator('.terra-lightbox-stage.is-zoomed').count()===1);
await page.keyboard.press('Escape');check('Gallery Escape closes',await page.getByRole('dialog').count()===0);
await page.goto(base+'/template-kit/faq/',{waitUntil:'networkidle'});
const accordion=page.locator('.elementskit-accordion').first();
await accordion.locator('.ekit-accordion--toggler').nth(1).click();
check('FAQ opens second question',await accordion.locator('.ekit-accordion--toggler').nth(1).getAttribute('aria-expanded')==='true');
check('FAQ closes first question',await accordion.locator('.ekit-accordion--toggler').first().getAttribute('aria-expanded')==='false');
await page.goto(base,{waitUntil:'networkidle'});
await page.locator('.ekit-video-popup-btn').click();check('Video opens',await page.getByRole('dialog').locator('iframe').getAttribute('src')==='https://www.youtube.com/embed/VhBl3dHT5SY?autoplay=1&rel=0');await page.keyboard.press('Escape');
await page.getByRole('link',{name:'learn more',exact:true}).first().click();check('Class detail opens',await page.getByRole('dialog').getByRole('heading').textContent()==='playland & cafe');await page.keyboard.press('Escape');
const carousel=page.locator('.terra-testimonials');await carousel.scrollIntoViewIfNeeded();await carousel.focus();
await page.keyboard.press('ArrowRight');check('Carousel keyboard navigation',(await carousel.locator('.swiper-wrapper').getAttribute('style')).includes('-33.333'));
await page.locator('[role="progressbar"]').first().scrollIntoViewIfNeeded();await page.waitForTimeout(3600);check('Progress animation reaches target',await page.locator('[role="progressbar"]').first().getAttribute('aria-valuenow')==='80');
await page.getByRole('link',{name:'choose plan',exact:true}).first().click();await page.waitForURL('**/template-kit/contact/?plan=*');check('Plan leads to enquiry',new URL(page.url()).searchParams.get('plan')==='child care');
for(const [route,type] of [['/template-kit/contact/','enquiry'],['/template-kit/blog/','subscription'],['/2022/12/12/make-learning-fun-for-your-kids/','comment']]){
 await page.goto(base+route,{waitUntil:'networkidle'});
 const form=page.locator('form').first();
 const fields=form.locator('input:not([type=hidden]):not([type=submit]):not([type=checkbox]),textarea');
 for(let i=0;i<await fields.count();i++){const field=fields.nth(i);const fieldType=await field.getAttribute('type');await field.fill(fieldType==='email'?'terra-qa@example.invalid':fieldType==='url'?'https://example.invalid':'Terra browser verification');}
 const responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/enquiries')&&r.request().method()==='POST');
 await form.locator('button[type=submit],input[type=submit]').first().click();
 const response=await responsePromise;const data=await response.json();if(data.id)saved.push(data.id);
 check(`Form ${type} saves`,response.status()===201);
 await form.locator('[role=status]').waitFor();check(`Form ${type} confirms`,(await form.locator('[role=status]').textContent()).includes('has been saved'));
}
const invalid=await page.request.post(base+'/api/enquiries',{data:{type:'enquiry',fields:{email:'invalid'}}});check('Server rejects invalid enquiry',invalid.status()===400);
await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});
await page.getByRole('button',{name:'Open menu',exact:true}).click();check('Mobile menu opens',await page.locator('.terra-menu-open').count()===1);
await page.getByRole('link',{name:'Page',exact:true}).click();check('Mobile drawer stays above video button',await page.locator('#terra-pages').evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+30,r.y+30)?.closest('nav');}));await page.locator('#terra-pages').getByRole('link',{name:'Pricing',exact:true}).click();await page.waitForURL('**/template-kit/pricing/');check('Mobile dropdown navigates',(await page.title()).includes('Pricing'));check('Mobile menu closes after navigation',await page.locator('.terra-menu-open').count()===0);
await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.keyboard.press('Escape');check('Mobile Escape closes menu',await page.locator('.terra-menu-open').count()===0);
await page.close();await browser.close();
check('No browser runtime errors',errors.length===0,errors);
// Remove only the submissions created by this verification run.
if(saved.length){const file='data/enquiries.jsonl';const lines=(await fs.readFile(file,'utf8')).split('\n').filter(Boolean).filter(line=>!saved.includes(JSON.parse(line).id));await fs.writeFile(file,lines.join('\n')+(lines.length?'\n':''));}
await fs.writeFile('reference/verification.json',JSON.stringify({date:new Date().toISOString(),results,errors,failures},null,2));
console.log('TOTAL',results.length,'checks;',failures.length,'failures');
process.exitCode=failures.length?1:0;
