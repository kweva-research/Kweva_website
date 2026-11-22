// Carrega os membros de data/team.json e mostra-os na página Team (PT/EN).
(function(){
 const grid=document.getElementById('team-grid');
 if(!grid)return;
 let members=[];
 const expanded=new Set();
 const lang=()=>document.documentElement.lang==='en'?'en':'pt';
 const pick=(v,l)=>v&&typeof v==='object'?(v[l]||v.pt||v.en||''):(v||'');
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
 const initials=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
 function render(){
  const l=lang();grid.replaceChildren();
  members.forEach((m,index)=>{
   const card=el('article','person-card');
   const ph=el('div','person-photo');
   if(m.photo){const img=document.createElement('img');img.src=m.photo;img.alt=m.name;img.loading='lazy';ph.appendChild(img);}
   else ph.textContent=initials(m.name||'');
   const body=el('div','body');
   body.append(el('h3','',m.name||''),el('p','role',pick(m.role,l)));
   const hasProfile=typeof m.profile==='string' && /^[a-z0-9-]+\.html$/.test(m.profile);
   const more=el(hasProfile?'a':'button','person-more',l==='en'?'Read more':'Ver mais');
   if(hasProfile){
    const profileUrl=new URL(m.profile,document.baseURI);
    if(document.querySelector('base'))profileUrl.pathname=profileUrl.pathname.replace(/\.html$/,'/');
    more.href=profileUrl.href;
    body.appendChild(more);
    card.append(ph,body);grid.appendChild(card);
    return;
   }
   more.type='button';
   const content=el('div','person-profile-content');
   content.id='person-biography-'+index;
   more.setAttribute('aria-controls',content.id);
   const updateDisclosure=()=>{
    const open=expanded.has(index);
    content.hidden=!open;
    more.setAttribute('aria-expanded',String(open));
    more.textContent=l==='en'?(open?'Read less':'Read more'):(open?'Ver menos':'Ver mais');
   };
   more.addEventListener('click',()=>{
    if(expanded.has(index))expanded.delete(index);else expanded.add(index);
    updateDisclosure();
    if(more.getBoundingClientRect().bottom<0)more.scrollIntoView({block:'center',behavior:'instant'});
   });
   updateDisclosure();
   const biography=pick(m.bio,l);
   if(biography){
    biography.split(/\n\s*\n/).filter(paragraph=>paragraph.trim()).forEach(paragraph=>{
     content.appendChild(el('p','person-bio-paragraph',paragraph.trim()));
    });
   }
   (m.profileStyle==='narrative'?[]:(m.sections||[])).forEach(section=>{
    content.appendChild(el('h4','',pick(section.title,l)));
    const list=el('ul','person-timeline');
    (section.items||[]).forEach(item=>{
     const row=el('li','');
     if(item.period)row.appendChild(el('span','person-period',pick(item.period,l)));
     row.appendChild(el('strong','',pick(item.title,l)));
     if(item.description)row.appendChild(el('p','',pick(item.description,l)));
     list.appendChild(row);
    });
    content.appendChild(list);
   });
   body.append(content,more);
   card.append(ph,body);grid.appendChild(card);
  });
 }
 fetch('data/team.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(d=>{
  members=Array.isArray(d.members)?d.members:[];
  if(!members.length)return;
  render();
  document.addEventListener('kweva:languagechange',render);
 }).catch(()=>{/* sem JSON (ex.: ficheiro aberto sem servidor): mantém o perfil HTML acessível */});
})();
