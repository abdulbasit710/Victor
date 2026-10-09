import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, appendFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// The local preview has a small real endpoint: submissions are saved on this computer.
function enquiries() {
  const middleware = async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/enquiries') return next();
    res.setHeader('Content-Type', 'application/json');
    if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({error:'Use POST.'})); }
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) {res.statusCode=403;return res.end(JSON.stringify({error:'Origin not allowed.'}));}
    try {
      let body = '';
      for await (const chunk of req) {body += chunk;if (body.length > 16384) {res.statusCode=413;return res.end(JSON.stringify({error:'Message is too long.'}));}}
      const input = JSON.parse(body);
      if (!['enquiry','subscription','comment'].includes(input.type)) throw Error('Invalid submission type.');
      const fields = Object.fromEntries(Object.entries(input.fields || {}).filter(([k,v])=>typeof v==='string'&&k.length<100&&v.length<=6000));
      const email = Object.entries(fields).find(([k])=>/email/i.test(k))?.[1];
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Please enter a valid email address.');
      if (input.type !== 'subscription' && !Object.entries(fields).some(([k,v])=>/name|author|mf-text/i.test(k)&&v.trim())) throw Error('Please enter your name.');
      if (input.type==='comment'&&!fields.comment?.trim())throw Error('Please write a comment.');
      const record={id:randomUUID(),createdAt:new Date().toISOString(),type:input.type,page:String(input.page||'/').slice(0,300),fields};
      await mkdir('data',{recursive:true});
      await appendFile('data/enquiries.jsonl',JSON.stringify(record)+'\n','utf8');
      res.statusCode=201;res.end(JSON.stringify({id:record.id}));
    }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message||'Unable to save your message.'}));}
  };
  return {name:'terra-local-enquiries',configureServer(server){server.middlewares.use(middleware);},configurePreviewServer(server){server.middlewares.use(middleware);}};
}
export default defineConfig({plugins:[react(),enquiries()],server:{host:'127.0.0.1',port:5173,strictPort:false},preview:{host:'127.0.0.1',port:4173,strictPort:true}});
