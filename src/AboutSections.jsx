import React from 'react';
import {ArrowRight, Heart, Sparkles, Check, ChevronDown} from 'lucide-react';

const questions = [
 ['Who is Victor Uzoma?', 'Victor Uzoma is the author of The Magical Fruit Island, a children\'s story about kindness, honesty, faith, and generosity.'],
 ['What makes this story special?', 'Jeff and Sarah\'s island adventure connects a world of wonder with everyday choices: helping others, being honest, and sharing what we have.'],
 ['Can we read the book together as a family?', 'Yes. The adventure offers opportunities to pause, talk about the characters\' choices, and explore kindness together during storytime.'],
 ['How can teachers use the story?', 'Read it aloud and invite children to talk about sharing and gratitude. Ask them to draw a kind act or imagine how they could help someone in their own community.'],
 ['Where can I find the book?', 'The Magical Fruit Island is coming soon and is not available for purchase yet. Visit the Bookshelf page to explore the story and check for release updates.'],
 ['How can I contact Victor?', 'Visit Contact Us to send a question or share a storytime moment. Messages currently save on the local website server; email delivery is not connected.'],
];

export default function AboutSections() {
 return <>
  <section className="section about-values" aria-labelledby="about-values-title">
   <div className="section-heading centered"><p className="eyebrow">AT THE HEART OF EVERY PAGE</p><h2 id="about-values-title">Small lessons.<br/><em>Beautiful possibilities.</em></h2><p>Discover the values woven through Victor's island adventure.</p></div>
   <div className="about-values-grid">{[[Heart,'01','Kindness','A helping hand can make a world of difference. Jeff and Sarah show that generosity begins with caring.'],[Check,'02','Honesty','The choices we make matter. The story gives little readers a gentle way to talk about doing what is right.'],[Sparkles,'03','Faith & gratitude','Even in difficult moments, there is room for hope, thankfulness, and sharing the blessings that come our way.']].map(([Icon,n,title,copy])=><article className="about-value-card" key={n}><div className="about-value-top"><span className="feature-icon"><Icon size={25}/></span><span>{n}</span></div><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>
  <section className="section about-storytelling" aria-labelledby="about-storytelling-title">
   <figure className="about-world-art"><div className="about-world-circle"/><img src="/assets/fruit-island-world.png" alt="Jeff and Sarah holding the world together" loading="lazy"/><figcaption><Heart size={17}/> A little story. A wider world.</figcaption></figure>
   <div className="about-storytelling-copy"><p className="eyebrow">WONDER WITH A PURPOSE</p><h2 id="about-storytelling-title">Stories open doors.<br/><em>Kindness opens hearts.</em></h2><p>A sparkling sea, an unexpected friendship, and a magical fruit: Victor's tale gives young imaginations somewhere wonderful to go.</p><p>At its heart is a lesson close to home. When Jeff and Sarah share their good fortune, their adventure becomes a reminder that caring for others is something everyone can do.</p><a className="inline-link" href="/bookshelf">Discover the story <ArrowRight size={16}/></a></div>
  </section>
  <section className="section about-storytime" aria-labelledby="about-storytime-title"><div className="section-heading"><p className="eyebrow">MAKE THE STORY YOUR OWN</p><h2 id="about-storytime-title">Read. Wonder.<br/><em>Grow together.</em></h2><p>A few little ideas to turn the last page into the start of a conversation.</p></div><div className="about-storytime-grid">{[['01','Share a chapter','Get comfortable, read aloud, and let children notice the little details in the adventure.'],['02','Ask a little question','What would you share with your village? How could you help a friend like Jeff and Sarah?'],['03','Carry kindness home','Choose one kind thing to do together. Draw it, talk about it, or share it with someone you love.']].map(([n,title,copy])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section id="about-faqs" className="section faq-section about-faqs" aria-labelledby="about-faq-title"><div className="faq-intro"><p className="eyebrow">A LITTLE MORE TO DISCOVER</p><h2 id="about-faq-title">Questions?<br/><em>Let's turn the page.</em></h2><p>A few answers about Victor, his book, and sharing the story.</p><a className="inline-link" href="/contact">Ask another question <ArrowRight size={16}/></a></div><div className="faq-list">{questions.map(([q,a],i)=><details className="about-faq-item" key={q}><summary><span>{q}</span><ChevronDown size={18}/></summary><div className="about-faq-answer"><p>{a}</p>{i===4&&<a href="/bookshelf" className="inline-link">Visit the bookshelf <ArrowRight size={15}/></a>}{i===5&&<a href="/contact" className="inline-link">Contact Us <ArrowRight size={15}/></a>}</div></details>)}</div></section>
 </>;
}
