/* Entrada suave, sem ocultar conteúdo quando JavaScript não está disponível. */
(() => {
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (reducedMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
 const seen = new WeakSet();
 const selector = 'main .section-heading, main .home-hero-panel, main .home-pillars h2, main .home-pillars-grid article, main .who-copy, main .who-backdrop, main .card, main .person-card, main .news-card, main .home-sector-card, main .services-list, main .process-list li, main .why-kweva-reasons article';
 const aboutSelector = [
  '.about-intro-copy',
  '.about-intro-visual',
  '.about-vision-mission-grid',
  '.about-principles h2',
  '.about-principle-grid article',
  '.about-team h2',
  '#partners-section > .container',
  '.about-contact-cta > .container'
 ].map(part => '.about-page main ' + part).join(', ');
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   observer.unobserve(entry.target);
   if (reducedMotion.matches) continue;
   entry.target.animate([
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
   ], { duration: 600, easing: 'cubic-bezier(.2,.65,.3,1)' });
  }
 }, { threshold: 0.08 });
 function register() {
  document.querySelectorAll(selector + ', ' + aboutSelector).forEach(element => {
   if (seen.has(element)) return;
   seen.add(element);
   observer.observe(element);
  });
 }
 register();
 const main = document.querySelector('main');
 if (main) new MutationObserver(register).observe(main, { childList: true, subtree: true });
})();
