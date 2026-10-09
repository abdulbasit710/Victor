import React from 'react';
import {Navigation,Accordion,Testimonials,ProgressBar,ContactForm} from './components.jsx';
import {hasClass,routeForLabel,textOf} from './site.js';

const names={class:'className',for:'htmlFor',tabindex:'tabIndex',maxlength:'maxLength',minlength:'minLength',colspan:'colSpan',rowspan:'rowSpan',autocomplete:'autoComplete',autofocus:'autoFocus',readonly:'readOnly',viewbox:'viewBox',preserveaspectratio:'preserveAspectRatio',frameborder:'frameBorder',allowfullscreen:'allowFullScreen',srcset:'srcSet',fetchpriority:'fetchPriority','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','fill-rule':'fillRule','clip-rule':'clipRule','xlink:href':'xlinkHref'};
const booleans=new Set(['required','disabled','checked','selected','multiple','hidden','readOnly','autoFocus','allowFullScreen']);
export function attributes(attrs={}){
 const props={};
 for(const [key,value] of Object.entries(attrs)){
  if(/^on/i.test(key)||key==='action'||key==='method'||key==='data-e-action-hash')continue;
  const name=names[key]||key;
  if(name==='style'){
   props.style={};for(const item of value.split(';')){const colon=item.indexOf(':');if(colon<0)continue;const k=item.slice(0,colon).trim();const v=item.slice(colon+1).trim().replace(/\s*!important$/,'');if(k&&v)props.style[k.startsWith('--')?k:k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;}
  }else if(booleans.has(name))props[name]=value!=='false';else props[name]=value;
 }
 return props;
}
const voidTags=new Set(['img','input','br','hr','area','base','col','embed','link','meta','param','source','track','wbr']);
export function Nodes({nodes,parentTag}){return (nodes||[]).map((node,index)=><Node key={node?.attrs?.['data-id']||index} node={node} parentTag={parentTag}/>);}
export default function Node({node,plain=false,parentTag}){
 if(node==null)return null;if(typeof node==='string')return node;
 const {tag,attrs={},children=[]}=node;
 if(['script','style','link','noscript'].includes(tag))return null;
 if(!plain){
  if(tag==='nav'&&hasClass(node,'ekit-wid-con'))return <Navigation node={node}/>;
  if(hasClass(node,'elementskit-accordion'))return <Accordion node={node}/>;
  if(hasClass(node,'elementskit-testimonial-slider'))return <Testimonials node={node}/>;
  if(hasClass(node,'skillbar-group'))return <ProgressBar node={node}/>;
  if(tag==='form')return <ContactForm node={node}/>;
 }
 const props=attributes(attrs);
 if(tag==='a'){
  if(!props.href)props.tabIndex=-1;
  if(props.href?.startsWith('/terra/'))props.href=props.href.replace('/terra/','/');
  if(props.href?.includes('tykit.rometheme.pro/terra')&&!props.href.includes('wp-content'))props.href=props.href.replace(/^https?:\/\/tykit\.rometheme\.pro\/terra\/?/,'/');
  if(props.href==='/'||props.href==='/template-kit/homepage/')props.href='/';
  if(props.href==='#'){
   const label=textOf(node).trim().toLowerCase();
   if(/get.*quot/.test(label))props.href='/template-kit/contact/';
   else if(/explore/.test(label))props.href='/template-kit/classes/';
   else if(label==='read more')props.href='/template-kit/about-us/';
   else if(routeForLabel[label])props.href=routeForLabel[label];
  }
 }
 if(tag==='a'&&props.href){props.href='/';delete props.target;delete props.download;}
 if(tag==='span'&&hasClass(node,'elementor-icon-list-text')){
  const label=textOf(node).trim();const href=routeForLabel[label.toLowerCase()];
  if(href)return <a {...props} href="/"><Nodes nodes={children}/></a>;
  if(label==='Privacy Policy')return <a {...props} href="/"><Nodes nodes={children}/></a>;
  if(label.includes('@'))return <a {...props} href="/"><Nodes nodes={children}/></a>;
 }
 if(tag==='img'){
  props.alt=props.alt||'';
  props.decoding='sync';
  if(props.src?.includes('victor-uzoma-farm-friends')&&parentTag!=='a'){return <a href="/" className="terra-logo-link" aria-label="Victor Uzoma Farm Friends home"><img {...props}/></a>;}
 }
 if(tag==='input'){
  if(props.type==='checkbox'){props.defaultChecked=props.checked;delete props.checked;}
  else if(props.type!=='submit'&&props.type!=='hidden'){props.defaultValue=props.value;delete props.value;}
  if(!['checkbox','submit','hidden','url','tel'].includes(props.type)&&props.name)props.required=true;
  if(props.type==='email')props.autoComplete='email';
  if(props.type==='text'&&/name|author|text/.test(props.name||''))props.autoComplete='name';
 }
 if(tag==='textarea'){props.defaultValue=textOf(node);props.required=true;props.maxLength=6000;return <textarea {...props}/>;}
 if(tag==='iframe'){props.title=props.title||'Our location';props.loading='lazy';}
 if(voidTags.has(tag))return React.createElement(tag,props);
 return React.createElement(tag==='main'?'article':tag,props,<Nodes nodes={children} parentTag={tag}/>);
}
