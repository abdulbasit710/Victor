import fs from 'node:fs/promises';
let source=await fs.readFile('src/Node.jsx','utf8');
source=source.replace('Nodes({nodes})','Nodes({nodes,parentTag})').replace('node={node}/>);','node={node} parentTag={parentTag}/>);').replace('Node({node,plain=false})','Node({node,plain=false,parentTag})').replace("if(props.src?.includes('logo1.'))","if(props.src?.includes('logo1.')&&parentTag!=='a')").replace('<Nodes nodes={children}/>);','<Nodes nodes={children} parentTag={tag}/>);');
source=source.replace('React.createElement(tag,props,<Nodes','React.createElement(tag===\'main\'?\'article\':tag,props,<Nodes');
await fs.writeFile('src/Node.jsx',source);
for(const name of await fs.readdir('public/assets'))if(name.endsWith('.css')){const path='public/assets/'+name;const css=await fs.readFile(path,'utf8');const fixed=css.replaceAll('strock:','stroke:').replaceAll('}{}','}');if(css!==fixed)await fs.writeFile(path,fixed);}
