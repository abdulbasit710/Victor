import fs from 'node:fs/promises';
await fs.copyFile('C:/Users/Nayna Production/Downloads/Victor Uzoma Farm Friends.png','public/assets/victor-uzoma-farm-friends.png');
const image=await fs.readFile('public/assets/victor-uzoma-farm-friends.png');
const width=image.readUInt32BE(16),height=image.readUInt32BE(20);
const shared=JSON.parse(await fs.readFile('src/data/shared.json','utf8'));
function update(node){if(!node||typeof node==='string')return;if(node.tag==='img'&&node.attrs.src?.includes('logo1.')){Object.assign(node.attrs,{src:'/assets/victor-uzoma-farm-friends.png',alt:'Victor Uzoma Farm Friends',width:String(width),height:String(height),class:(node.attrs.class||'')+' terra-brand-logo'});delete node.attrs.title;}for(const child of node.children||[])update(child);}
update(shared.header);update(shared.footer);await fs.writeFile('src/data/shared.json',JSON.stringify(shared));
let renderer=await fs.readFile('src/Node.jsx','utf8');
renderer=renderer.replace(" if(tag==='span'&&hasClass(node,'elementor-icon-list-text')){", " if(tag==='a'&&props.href){props.href='/';delete props.target;delete props.download;}\n if(tag==='span'&&hasClass(node,'elementor-icon-list-text')){");
renderer=renderer.replace('href={href}><Nodes nodes={children}/></a>', 'href="/"><Nodes nodes={children}/></a>').replace('href="#privacy"','href="/"').replace('href={`mailto:${label}`}','href="/"');
renderer=renderer.replace("if(props.src?.includes('logo1.')&&parentTag!=='a'){props.alt='Terra';return <a href=\"/\" className=\"terra-logo-link\" aria-label=\"Terra home\"><img {...props}/></a>;}", "if(props.src?.includes('victor-uzoma-farm-friends')&&parentTag!=='a'){return <a href=\"/\" className=\"terra-logo-link\" aria-label=\"Victor Uzoma Farm Friends home\"><img {...props}/></a>;}");
await fs.writeFile('src/Node.jsx',renderer);
let components=await fs.readFile('src/components.jsx','utf8');components=components.replace('href="#pages"','href="/"');await fs.writeFile('src/components.jsx',components);
await fs.appendFile('src/styles.css',`\n/* Supplied brand artwork keeps its original proportions and transparency. */\n.elementor img.terra-brand-logo { width: 100%; height: auto; max-width: 210px; object-fit: contain; }\n.elementskit-nav-identity-panel img.terra-brand-logo { width: 150px; max-height: none; }\nfooter .elementor-widget-image { text-align: left; }\n`);
console.log('Logo copied at original dimensions:',width,height);
