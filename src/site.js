import { createContext } from 'react';
export const SiteContext=createContext({navigate:()=>{},openModal:()=>{}});
export const routeForLabel={homepage:'/',home:'/', 'about us':'/template-kit/about-us/',services:'/template-kit/services/',classes:'/template-kit/classes/',pricing:'/template-kit/pricing/',gallery:'/template-kit/gallery/',faq:'/template-kit/faq/',"faq's":'/template-kit/faq/',"faq’s":'/template-kit/faq/',blog:'/template-kit/blog/',contact:'/template-kit/contact/'};
export const textOf=n=>typeof n==='string'?n:(n?.children||[]).map(textOf).join('');
export const hasClass=(n,c)=>typeof n==='object'&&(n.attrs?.class||'').split(/\s+/).includes(c);
export function findNode(node,test){if(!node||typeof node==='string')return null;if(test(node))return node;for(const child of node.children||[]){const match=findNode(child,test);if(match)return match;}return null;}
export function findAll(node,test){if(!node||typeof node==='string')return [];return [...(test(node)?[node]:[]),...(node.children||[]).flatMap(child=>findAll(child,test))];}
