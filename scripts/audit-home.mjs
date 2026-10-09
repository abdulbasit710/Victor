import {createServer} from 'vite';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {load} from 'cheerio';
import {existsSync} from 'node:fs';
const server=await createServer({server:{middlewareMode:true}});
try {
 const {default:App}=await server.ssrLoadModule('/src/App.jsx');
 for(const [path,section] of [['/','home'],['/about','author'],['/bookshelf','books'],['/contact','contact']]){
  globalThis.window={location:{pathname:path}};
  const $=load(renderToStaticMarkup(React.createElement(App)));
  if(!$(`main #${section}`).length)throw Error(`${path}: primary content missing`);
  for(const other of ['home','author','books','contact'].filter(x=>x!==section)){if($(`main #${other}`).length)throw Error(`${path}: unexpected ${other} section`);}
  if($('.nav a[aria-current="page"]').length!==1)throw Error(`${path}: active navigation missing`);
  for(const url of ['/','/about','/bookshelf','/contact'])if(!$(`.nav a[href="${url}"]`).length)throw Error('Navigation link missing: '+url);
  $('img').each((_,img)=>{const src=$(img).attr('src');if(src.startsWith('/assets/')&&!existsSync('public'+src))throw Error('Missing image '+src);});
  if(path==='/'&&$('.feature-card').length!==3)throw Error('Home features missing');
  if(path==='/contact'&&$('.contact-form').length!==1)throw Error('Contact form missing');
  console.log(`${path}: content, navigation, and assets passed`);
 }
}finally{delete globalThis.window;await server.close();}
