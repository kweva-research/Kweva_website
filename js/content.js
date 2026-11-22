// Parceiros, testemunhos e notícias da Home, lidos de data/*.json. Cada secção só aparece se tiver conteúdo.
(function(){
 const lang=()=>document.documentElement.lang==='en'?'en':'pt';
 const pick=(v,l)=>v&&typeof v==='object'?(v[l]||v.pt||v.en||''):(v||'');
 const el=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x)n.textContent=x;return n;};
 const load=f=>fetch('data/'+f,{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.json();}).catch(()=>({}));
 const sections=[
  {file:'partners.json',key:'partners',sec:'partners-section',box:'partners-list',card(p){
    const a=el(p.url?'a':'div','partner');if(p.url){a.href=p.url;a.target='_blank';a.rel='noopener';}
    if(p.logo){const i=document.createElement('img');i.src=p.logo;i.alt=p.name;i.loading='lazy';a.appendChild(i);}else a.textContent=p.name;return a;}},
  {file:'testimonials.json',key:'testimonials',sec:'testimonials-section',box:'testimonials-list',card(t,l){
    const c=el('figure','testimonial');c.append(el('blockquote','',pick(t.quote,l)));
    const cap=el('figcaption');cap.append(el('strong','',t.name||''),el('span','',[pick(t.role,l),t.organisation].filter(Boolean).join(', ')));c.appendChild(cap);return c;}},
  {file:'news.json',key:'news',sec:'news-section',box:'news-list',limit:3,sort:(a,b)=>String(b.date).localeCompare(String(a.date)),card(n,l){
    const c=el('article','news-card');if(n.image){const im=document.createElement('img');im.src=n.image;im.alt='';im.loading='lazy';im.className='news-img';c.appendChild(im);}
    if(n.date){const d=new Date(n.date);c.appendChild(el('p','news-date',isNaN(d)?n.date:d.toLocaleDateString(l==='en'?'en-GB':'pt-PT',{day:'numeric',month:'long',year:'numeric'})));}
    if(n.category)c.appendChild(el('p','news-cat',pick(n.category,l)));c.append(el('h3','',pick(n.title,l)),el('p','',pick(n.summary,l)));
    if(n.url){const a=el('a','card-link',l==='en'?'Read more':'Saber mais');a.href=n.url;a.target='_blank';a.rel='noopener';c.appendChild(a);}return c;}}
 ].filter(section => document.getElementById(section.sec));
 Promise.all(sections.map(s=>load(s.file).then(d=>{s.items=Array.isArray(d[s.key])?d[s.key]:[];if(s.sort)s.items.sort(s.sort);if(s.limit)s.items=s.items.slice(0,s.limit);}))).then(()=>{
  const draw=()=>{const l=lang();sections.forEach(s=>{const sec=document.getElementById(s.sec),box=document.getElementById(s.box);if(!sec||!box)return;
   box.replaceChildren();sec.hidden=!s.items.length;s.items.forEach(i=>box.appendChild(s.card(i,l)));});};
  draw();
  document.addEventListener('kweva:languagechange',draw);
 });
})();
