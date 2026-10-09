import React,{useState,useEffect,useRef,useContext} from 'react';
import Node,{Nodes,attributes} from './Node.jsx';
import {SiteContext,findNode,findAll,hasClass,textOf} from './site.js';

export function Navigation({node}){
 const [open,setOpen]=useState(false),[expanded,setExpanded]=useState(false);
 const {navigate}=useContext(SiteContext);const nav=useRef(null),toggle=useRef(null);
 const menu=findNode(node,n=>hasClass(n,'elementskit-navbar-nav'));
 const logo=findNode(node,n=>hasClass(n,'elementskit-nav-logo'));
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const handle=e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus();}if(e.key==='Tab'){const items=[...nav.current.querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  document.addEventListener('keydown',handle);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',handle);};
 },[open]);
 function linkClick(e){const a=e.target.closest('a');if(a&&!a.classList.contains('ekit-menu-dropdown-toggle')){setOpen(false);setExpanded(false);}}
 return <nav {...attributes(node.attrs)} ref={nav} onClick={linkClick}>
  <button ref={toggle} className="elementskit-menu-hamburger elementskit-menu-toggler" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="terra-main-menu" onClick={()=>setOpen(!open)}><span className="elementskit-menu-hamburger-icon"/><span className="elementskit-menu-hamburger-icon"/><span className="elementskit-menu-hamburger-icon"/></button>
  <div id="terra-main-menu" className={`elementskit-menu-container elementskit-menu-offcanvas-elements elementskit-navbar-nav-default ekit-nav-dropdown-hover ${open?'active terra-menu-open':''}`}>
   <ul {...attributes(menu.attrs)}>{menu.children.filter(n=>typeof n!=='string').map((item,i)=>{
    if(!hasClass(item,'menu-item-has-children'))return <Node key={i} node={item}/>;
    const submenu=findNode(item,n=>n.tag==='ul');
    return <li key={i} {...attributes(item.attrs)} className={`${item.attrs.class} ${expanded?'terra-submenu-open':''}`}>
     <a href="/" className="ekit-menu-nav-link ekit-menu-dropdown-toggle" aria-expanded={expanded} aria-controls="terra-pages" onClick={e=>{e.preventDefault();setExpanded(!expanded);}} onKeyDown={e=>{if(e.key===' '||e.key==='ArrowDown'){e.preventDefault();setExpanded(true);setTimeout(()=>nav.current.querySelector('#terra-pages a')?.focus(),0);}}}>Page<i aria-hidden="true" className="icon icon-down-arrow1 elementskit-submenu-indicator"/></a>
     <ul {...attributes(submenu.attrs)} id="terra-pages"><Nodes nodes={submenu.children}/></ul>
    </li>;
   })}</ul>
   <div className="elementskit-nav-identity-panel"><Node node={logo}/><button className="elementskit-menu-close elementskit-menu-toggler" type="button" aria-label="Close menu" onClick={()=>{setOpen(false);toggle.current?.focus();}}>×</button></div>
  </div>
  <div className={`elementskit-menu-overlay elementskit-menu-offcanvas-elements ekit-nav-menu--overlay ${open?'active':''}`} onClick={()=>setOpen(false)}/>
 </nav>;
}

export function Accordion({node}){
 const [active,setActive]=useState(0);
 const cards=node.children.filter(n=>hasClass(n,'elementskit-card'));
 return <div {...attributes(node.attrs)}>{cards.map((card,i)=>{
  const title=findNode(card,n=>hasClass(n,'ekit-accordion-title'));
  const body=findNode(card,n=>hasClass(n,'elementskit-card-body'));
  const id=`${node.attrs.id}-${i}`;const isOpen=active===i;
  return <div className={`elementskit-card ${isOpen?'active':''}`} key={i}>
   <div className="elementskit-card-header" role="heading" aria-level="3"><a id={`${id}-title`} href={`#${id}`} role="button" className={`ekit-accordion--toggler elementskit-btn-link ${isOpen?'':'collapsed'}`} aria-expanded={isOpen} aria-controls={id} onClick={e=>{e.preventDefault();setActive(isOpen?-1:i);}} onKeyDown={e=>{if(e.key===' '){e.preventDefault();setActive(isOpen?-1:i);}}}>
    <div className="ekit_accordion_icon_left_group"><div className="ekit_accordion_normal_icon"><i className="fas fa-plus"/></div><div className="ekit_accordion_active_icon"><i className="fas fa-minus"/></div></div><Node node={title}/>
   </a></div>
   <div id={id} role="region" aria-labelledby={`${id}-title`} aria-hidden={!isOpen} className={`terra-accordion-panel ${isOpen?'is-open':''}`}><div><Node node={body}/></div></div>
  </div>;
 })}</div>;
}

export function Testimonials({node}){
 const slides=findAll(node,n=>hasClass(n,'swiper-slide'));
 const [index,setIndex]=useState(0),[visible,setVisible]=useState(window.innerWidth>=1024?3:1),[paused,setPaused]=useState(false);
 const start=useRef(0),max=Math.max(0,slides.length-visible);
 useEffect(()=>{const resize=()=>{setVisible(window.innerWidth>=1024?3:1);setIndex(0);};window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const id=setInterval(()=>setIndex(i=>i>=max?0:i+1),4500);return()=>clearInterval(id);},[max,paused]);
 const move=dir=>setIndex(i=>Math.max(0,Math.min(max,i+dir)));
 return <div {...attributes(node.attrs)} className={`${node.attrs.class} terra-testimonials`} aria-label="Parent testimonials" aria-roledescription="carousel" tabIndex={0} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}} onTouchStart={e=>{start.current=e.touches[0].clientX;setPaused(true);}} onTouchEnd={e=>{const dx=start.current-e.changedTouches[0].clientX;if(Math.abs(dx)>40)move(dx>0?1:-1);setPaused(false);}}>
  <div className="ekit-main-swiper swiper"><div className="swiper-wrapper" style={{display:'flex',gap:visible===3?15:10,transform:`translateX(calc(-${index*100/visible}% - ${index*(visible===3?15:10)/visible}px))`,transition:'transform 1000ms ease'}}>{slides.map((slide,i)=><div key={i} className="swiper-slide" role="group" aria-label={`${i+1} of ${slides.length}`} style={{flex:`0 0 calc((100% - ${(visible-1)*(visible===3?15:10)}px) / ${visible})`,height:'auto'}}><Nodes nodes={slide.children}/></div>)}</div></div>
 </div>;
}

export function ProgressBar({node}){
 const ref=useRef(null);const [value,setValue]=useState(0);
 const valueNode=findNode(node,n=>hasClass(n,'number-percentage'));
 const title=findNode(node,n=>hasClass(n,'skill-bar-content'));
 const target=Number(valueNode?.attrs?.['data-value']||80);
 useEffect(()=>{
  let frame;const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();const start=performance.now(),duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:Number(valueNode?.attrs?.['data-animation-duration']||3500);const tick=now=>{const p=duration?Math.min(1,(now-start)/duration):1;setValue(Math.round(target*(0.5-Math.cos(p*Math.PI)/2)));if(p<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);},{threshold:0.35});observer.observe(ref.current);return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[target]);
 return <div {...attributes(node.attrs)} ref={ref}><div className="single-skill-bar"><Node node={title}/><div className="skill-bar" role="progressbar" aria-label={textOf(title)} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="skill-track" style={{width:`${value}%`}}><div className="number-percentage-wraper"><span className="number-percentage">{value}</span>%</div></div></div></div></div>;
}

export function ContactForm({node}){
 const [status,setStatus]=useState(null),[busy,setBusy]=useState(false);const formRef=useRef(null);
 const isComment=node.attrs.id==='commentform';
 const fields=findAll(node,n=>['input','textarea'].includes(n.tag)&&n.attrs.type!=='hidden');
 const isSubscription=!isComment&&!fields.some(n=>n.tag==='textarea'||n.attrs.type==='text');
 useEffect(()=>{if(isComment){try{const saved=JSON.parse(localStorage.getItem('terra-comment-details')||'null');if(saved)for(const key of ['author','email','url'])if(formRef.current.elements[key])formRef.current.elements[key].value=saved[key]||'';}catch{}}},[isComment]);
 async function submit(event){
  event.preventDefault();if(busy)return;const form=event.currentTarget;if(!form.reportValidity())return;
  const fields=Object.fromEntries(new FormData(form));
  if(isComment&&fields['wp-comment-cookies-consent'])try{localStorage.setItem('terra-comment-details',JSON.stringify({author:fields.author,email:fields.email,url:fields.url}));}catch{}
  setBusy(true);setStatus(null);
  try{const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:isComment?'comment':isSubscription?'subscription':'enquiry',page:location.pathname+location.search,fields})});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to save your message.');setStatus({ok:true,message:`${isComment?'Your comment':isSubscription?'Your subscription':'Your enquiry'} has been saved. Reference: ${data.id.slice(0,8)}.`});form.reset();}
  catch(error){setStatus({ok:false,message:error.message==='Failed to fetch'?'Unable to connect. Please try again.':error.message});}
  finally{setBusy(false);}
 }
 const props=attributes(node.attrs);delete props.action;delete props.method;
 return <form {...props} ref={formRef} onSubmit={submit} className={`${props.className||''} terra-form`} aria-busy={busy}>
  <fieldset disabled={busy} className="terra-form-fields"><Nodes nodes={node.children}/></fieldset>
  {busy&&<p className="terra-form-status" role="status">Saving…</p>}
  {status&&<p className={`terra-form-status ${status.ok?'success':'error'}`} role={status.ok?'status':'alert'}>{status.message}</p>}
 </form>;
}
