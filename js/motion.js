// Motion layer: header shrink, scroll reveal (also for Firestore-rendered cards), count-up numbers, ticker loop, seal parallax
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hdr = document.querySelector('header');
  let scrolled = false;
  const onScroll = () => { if (!hdr) return; const y = scrollY;
    if (!scrolled && y > 60) scrolled = true; else if (scrolled && y < 10) scrolled = false;
    hdr.classList.toggle('scrolled', scrolled); };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();

  document.querySelectorAll('.ticker .track').forEach(t =>
    t.insertAdjacentHTML('beforeend', t.innerHTML.replace(/<span/g, '<span aria-hidden="true"')));

  const seal = document.querySelector('.seal');
  if (seal && !reduce && matchMedia('(pointer:fine)').matches)
    addEventListener('pointermove', e => {
      seal.style.setProperty('--mx', ((e.clientX / innerWidth - .5) * 18) + 'px');
      seal.style.setProperty('--my', ((e.clientY / innerHeight - .5) * 18) + 'px');
    }, {passive: true});

  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = +el.dataset.end, pre = el.dataset.pre, post = el.dataset.post, t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / 1200, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + post; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold: .4});

  const revealIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; revealIO.unobserve(el); el.classList.add('in');
    setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('in'); el.style.removeProperty('--d'); },
      1000 + (+el.style.getPropertyValue('--d') || 0) * 70);
  }), {threshold: .12});

  const SEL = '.card,.links a,.act-card,.ach,.facility-list li,.news-item,.gallery figure,.facts div,.principal,.band .sub,section h2';
  const scan = root => {
    if (root.nodeType !== 1) return;
    const all = (sel) => [...(root.matches(sel) ? [root] : []), ...root.querySelectorAll(sel)];
    if (!reduce) all(SEL).forEach(el => {
      if (el.dataset.rv) return; el.dataset.rv = 1;
      el.style.setProperty('--d', Math.min([...el.parentElement.children].indexOf(el), 8));
      el.setAttribute('data-reveal', ''); revealIO.observe(el);
    });
    all('.facts strong').forEach(el => {
      const m = el.textContent.match(/\d+/); if (!m || el.dataset.end || reduce) return;
      const [pre, post] = el.textContent.split(m[0]);
      Object.assign(el.dataset, {end: m[0], pre, post}); el.textContent = pre + '0' + post; countIO.observe(el);
    });
  };
  scan(document.body);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(scan))).observe(document.body, {childList: true, subtree: true});
})();

// Card spotlight: feeds the pointer position to the glow on cards
document.addEventListener('pointermove', e => {
  const c = e.target.closest && e.target.closest('.card,.act-card,.ach,.facts div,.about-section .links a');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--px', (e.clientX - r.left) + 'px');
  c.style.setProperty('--py', (e.clientY - r.top) + 'px');
}, {passive: true});
