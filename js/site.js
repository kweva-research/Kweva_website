// Original Portuguese remains in HTML; normalise formatting before dictionary lookup.
const normalise = value => value.replace(/\s+/g, ' ').trim();
const isEnglishNow = () => document.documentElement.lang === 'en';
const translate = value => {
 const key = normalise(value);
 return Object.prototype.hasOwnProperty.call(kwevaEnglish, key) ? kwevaEnglish[key] : value;
};
const textRecords = new Map();
const attributeRecords = new WeakMap();
const statuses = new Map();
const originalPageTitle = document.title.split(' | ')[0];
const attrNames = ['alt', 'aria-label', 'placeholder', 'title'];
function translateAttrString(value) {
 const translated = translate(value);
 if (translated !== value) return translated;
 for (const [pt, en] of [[' — perfil pessoal provisório', ' — temporary personal profile'], [' — em breve', ' — coming soon']]) {
  if (value.endsWith(pt)) return value.slice(0, -pt.length) + en;
 }
 return value;
}
function translateAttributes(root, lang) {
 const selector = attrNames.map(name => '[' + name + ']').join(',');
 const elements = [...(root.querySelectorAll?.(selector) || [])];
 if (root.matches?.(selector)) elements.unshift(root);
 elements.forEach(element => {
  let originals = attributeRecords.get(element);
  if (!originals) { originals = {}; attributeRecords.set(element, originals); }
  attrNames.forEach(name => {
   if (!element.hasAttribute(name)) return;
   if (!(name in originals)) originals[name] = element.getAttribute(name);
   element.setAttribute(name, lang === 'en' ? translateAttrString(originals[name]) : originals[name]);
  });
 });
}
function collectText(root) {
 const visit = node => {
  if (node.parentElement?.closest('script,style,[data-localized-status]') || textRecords.has(node)) return;
  const key = normalise(node.nodeValue);
  if (Object.prototype.hasOwnProperty.call(kwevaEnglish, key)) textRecords.set(node, node.nodeValue);
 };
 if (root.nodeType === Node.TEXT_NODE) visit(root);
 const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
 while (walker.nextNode()) visit(walker.currentNode);
}
function renderTexts() {
 textRecords.forEach((original, node) => {
  if (!node.isConnected) { textRecords.delete(node); return; }
  const next = isEnglishNow() ? original.replace(original.trim(), translate(original)) : original;
  if (node.nodeValue !== next) node.nodeValue = next;
 });
}
function setStatus(element, pt, en) {
 element.dataset.localizedStatus = '';
 statuses.set(element, {pt, en});
 element.textContent = isEnglishNow() ? en : pt;
}
async function copyText(text) {
 try { await navigator.clipboard.writeText(text); return true; } catch (error) { /* Try local fallback. */ }
 const previous = document.activeElement;
 const field = document.createElement('textarea');
 field.value = text;
 field.style.cssText = 'position:fixed;left:-9999px;top:0';
 document.body.appendChild(field);
 field.select();
 try { return document.execCommand('copy') === true; }
 catch (error) { return false; }
 finally { field.remove(); previous?.focus(); }
}
window.Kweva = {translate, setStatus, copyText, isEnglish: isEnglishNow};
const metaRecords = [...document.querySelectorAll('meta[name="description"],meta[property="og:description"]')].map(element => [element, element.content]);
const languageFlagSources = {pt: 'assets/flags/mz.svg', en: 'assets/flags/gb.svg'};
function createLanguageFlag(lang) {
 const image = document.createElement('img');
 image.className = 'language-flag';
 image.src = languageFlagSources[lang];
 image.alt = '';
 image.setAttribute('aria-hidden', 'true');
 return image;
}
function renderLanguageFlags(lang) {
 document.querySelectorAll('[data-language] .language-flag').forEach(element => {
  element.replaceWith(createLanguageFlag(element.closest('[data-language]').dataset.language));
 });
}
function setLanguage(lang) {
 lang = lang === 'en' ? 'en' : 'pt';
 collectText(document.body);
 document.documentElement.lang = lang === 'en' ? 'en' : 'pt-MZ';
 renderTexts();
 translateAttributes(document, lang);
 metaRecords.forEach(([element, original]) => { element.content = lang === 'en' ? translate(original) : original; });
 const pageNames = { 'Início':'Home', 'Sobre':'About Us', 'Sobre nós':'About Us', 'Serviços':'Services', 'Projectos':'Projects', 'Contacto':'Contact', 'Equipa':'Team', 'Team':'Team', 'Kweva Academy':'Kweva Academy', 'Inscrição':'Enrolment', 'FAQ':'Frequently asked questions', 'Página não encontrada':'Page not found', 'Carreiras':'Careers', 'Trabalhar na Kweva':'Working at Kweva', 'Vagas':'Vacancies', 'Candidatura espontânea':'Spontaneous application', 'Privacidade e dados pessoais':'Privacy and personal data', 'O que os censos mostram sobre Moçambique?':'What do the censuses tell us about Mozambique?', 'Estudos e inquéritos':'Studies and surveys', 'Estatística e dados':'Statistics and data', 'Monitoria e avaliação':'Monitoring and evaluation', 'Formação e apoio técnico':'Training and technical support' };
 document.title = (lang === 'en' ? (pageNames[originalPageTitle] || originalPageTitle) : originalPageTitle) + ' | Kweva Research & Consulting';
 const ogTitle = document.querySelector('meta[property="og:title"]');
 if (ogTitle) ogTitle.content = document.title;
 const ogLocale = document.querySelector('meta[property="og:locale"]');
 if (ogLocale) ogLocale.content = lang === 'en' ? 'en_GB' : 'pt_MZ';
 const label = document.querySelector('.lang-label');
 if (label) {
  label.replaceChildren(createLanguageFlag(lang), document.createTextNode(lang === 'en' ? ' English' : ' Português'));
 }
 renderLanguageFlags(lang);
 document.querySelectorAll('[data-language]').forEach(button => {
  const active = button.dataset.language === lang;
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
 });
 statuses.forEach((messages, element) => {
  if (!element.isConnected) statuses.delete(element);
  else element.textContent = messages[lang];
 });
 try { localStorage.setItem('kweva-language', lang); } catch (error) { /* Storage is optional. */ }
 document.dispatchEvent(new CustomEvent('kweva:languagechange', {detail: {language: lang}}));
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
let initialLanguage = 'pt';
try { if (localStorage.getItem('kweva-language') === 'en') initialLanguage = 'en'; } catch (error) {}
setLanguage(initialLanguage);
new MutationObserver(mutations => {
 mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
  collectText(node);
  if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node, isEnglishNow() ? 'en' : 'pt');
 }));
 renderTexts();
}).observe(document.body, {childList: true, subtree: true});
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
function closeNavigation() { nav?.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); }
menuButton?.addEventListener('click', () => menuButton.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
const dropdown = document.querySelector('.lang-dd');
const currentLanguage = dropdown?.querySelector('.lang-current');
function closeLanguages() { dropdown?.classList.remove('open'); currentLanguage?.setAttribute('aria-expanded', 'false'); }
currentLanguage?.addEventListener('click', event => {
 event.stopPropagation();
 currentLanguage.setAttribute('aria-expanded', String(dropdown.classList.toggle('open')));
});
dropdown?.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { closeLanguages(); currentLanguage.focus(); }));
document.addEventListener('click', event => { if (!dropdown?.contains(event.target)) closeLanguages(); });
document.addEventListener('keydown', event => {
 if (event.key !== 'Escape') return;
 if (dropdown?.classList.contains('open')) currentLanguage.focus();
 else if (nav?.classList.contains('open')) menuButton?.focus();
 closeLanguages();
 closeNavigation();
});
document.addEventListener('click', event => {
 if (nav?.classList.contains('open') && !event.target.closest('.header')) closeNavigation();
});

// Navigation disclosures retain normal links and native keyboard behaviour.
(() => {
 const groups = [...document.querySelectorAll('.nav-group')];
 const desktop = window.matchMedia('(min-width: 1101px) and (hover: hover)');
 const setOpen = (group, open) => {
  group.querySelector('.nav-trigger').setAttribute('aria-expanded', String(open));
  group.querySelector('.nav-submenu').hidden = !open;
  if (!open) group.dataset.hoverOpened = '';
 };
 const closeAll = except => groups.forEach(group => { if (group !== except) setOpen(group, false); });
 groups.forEach(group => {
  const trigger = group.querySelector('.nav-trigger');
  trigger.addEventListener('click', () => {
   const open = group.dataset.hoverOpened === 'true' || trigger.getAttribute('aria-expanded') !== 'true';
   group.dataset.hoverOpened = '';
   closeAll(group);setOpen(group, open);
  });
  group.addEventListener('pointerenter', event => {
   if (desktop.matches && event.pointerType === 'mouse' && trigger.getAttribute('aria-expanded') !== 'true') { closeAll(group);setOpen(group, true);group.dataset.hoverOpened = 'true'; }
  });
  group.addEventListener('pointerleave', () => {
   if (desktop.matches && !group.contains(document.activeElement)) setOpen(group, false);
  });
  trigger.addEventListener('keydown', event => {
   if (event.key === 'ArrowDown') {
    event.preventDefault();closeAll(group);setOpen(group, true);
    group.querySelector('.nav-submenu a').focus();
   }
  });
  group.addEventListener('focusout', event => { if (!group.contains(event.relatedTarget)) setOpen(group, false); });
  group.addEventListener('keydown', event => {
   if (event.key === 'Escape') { event.preventDefault();event.stopPropagation();setOpen(group, false);trigger.focus(); }
  });
 });
 document.addEventListener('click', event => { if (!event.target.closest('.nav-group')) closeAll(); });
 document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); });
 document.getElementById('main-nav')?.addEventListener('click', event => { if (event.target.closest('a')) closeAll(); });
 document.querySelector('.menu-button')?.addEventListener('click', () => closeAll());
 window.matchMedia('(max-width: 1100px)').addEventListener('change', () => { closeAll();closeNavigation(); });
})();
const digitalSystemsLink = document.querySelector('#nav-services a[href*="sistemas-digitais"]');
if (!digitalSystemsLink) {
 [...document.querySelectorAll('#nav-services')].forEach(menu => {
  const link = document.createElement('a');
  link.href = 'sistemas-digitais.html';
  link.textContent = 'Sistemas Digitais e Automação';
  menu.append(link);
 });
}
