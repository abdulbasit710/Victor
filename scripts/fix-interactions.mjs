import fs from 'node:fs/promises';
let app=await fs.readFile('src/App.jsx','utf8');
app=app.replace("let card=col?.closest('.elementor-top-column')||col;","let card=a.closest('.elementor-top-column')||col;");
await fs.writeFile('src/App.jsx',app);
let components=await fs.readFile('src/components.jsx','utf8');
components=components.replace('},4500)','},4000)').replace("?0:1600","?0:Number(valueNode?.attrs?.['data-animation-duration']||3500)").replace('target*(1-Math.pow(1-p,3))','target*(0.5-Math.cos(p*Math.PI)/2)');
await fs.writeFile('src/components.jsx',components);
await fs.appendFile('src/styles.css',`\n/* Keep the expanded mobile list in normal flow so every item stays clickable. */\n@media(max-width:1024px) {\n .elementskit-menu-container .terra-submenu-open > .elementskit-dropdown { position: static !important; height: auto !important; max-height: none !important; width: 100% !important; transform: none !important; margin: 0 !important; box-shadow: none !important; overflow: visible !important; }\n .elementskit-menu-container .elementskit-dropdown > li { display: block; position: relative; }\n .elementskit-menu-container .elementskit-dropdown > li > a { padding-left: 30px !important; }\n}\n/* The demo's empty article pages still need a readable title and comment form. */\n.single-post header { background: #a1dbe6; }\n.single-post .elementor-359 .elementor-element.elementor-element-5858f3d { margin-bottom: 0; }\n.single-post #main-content { padding: 64px 24px 0; }\n.single-post h1.entry-title { display: block; margin-bottom: 40px; }\n.single-post .comment-notes > span + span { margin-left: .3em; }\n.single-post .comment-form-cookies-consent input { margin-right: .4em; }\n.single-post .comment-form input[type=submit] { border: 0; }\n@media(max-width:767px) { .single-post #main-content { padding: 32px 20px 0; } }\n`);
let audit=await fs.readFile('scripts/audit.mjs','utf8');
audit=audit.replace("for(const [device,width,height] of [['desktop',1440,1000]", "for(const [device,width,height] of (process.argv.includes('--interactions-only')?[]:[['desktop',1440,1000]");
audit=audit.replace("['mobile',390,844]]){", "['mobile',390,844]])){");
audit=audit.replace('scrollTo(0,y);','scrollTo({top:y,behavior:\'instant\'});').replace('scrollTo(0,0);','scrollTo({top:0,behavior:\'instant\'});await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));');
audit=audit.replace('await page.waitForTimeout(1800);check(\'Progress','await page.waitForTimeout(3600);check(\'Progress');
audit=audit.replace("console.log('TOTAL',results.length", "console.log('TOTAL',results.length");
await fs.writeFile('scripts/audit.mjs',audit);
// The interrupted test left three records. Remove only its recognizable test data.
try{const file='data/enquiries.jsonl';const rows=(await fs.readFile(file,'utf8')).split('\n').filter(Boolean).filter(row=>!Object.values(JSON.parse(row).fields).includes('terra-qa@example.invalid'));await fs.writeFile(file,rows.join('\n')+(rows.length?'\n':''));}catch(e){if(e.code!=='ENOENT')throw e;}
