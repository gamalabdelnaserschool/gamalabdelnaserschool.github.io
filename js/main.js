// Shared: mobile menu + latest news from Firestore ("news" collection)
// Reading progress indicator for the sticky header
function updateScrollProgress() {
  const root = document.documentElement;
  const scrollable = root.scrollHeight - root.clientHeight;
  const progress = scrollable > 0 ? (root.scrollTop / scrollable) * 100 : 0;
  root.style.setProperty('--scroll-progress', progress + '%');
}
window.addEventListener('scroll', updateScrollProgress, {passive:true});
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

document.querySelector('.menu-btn')?.addEventListener('click', e => {
  const open = document.body.classList.toggle('nav-open');
  e.currentTarget.setAttribute('aria-expanded', open);
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sampleNews = [
  {category:'الأنشطة المدرسية', title:'يوم مليء بالأنشطة والمشاركة الطلابية', summary:'لقطات من تفاعل الطلاب ومشاركتهم في الأنشطة المدرسية المتنوعة.', details:'هذا محتوى تجريبي لتوضيح شكل عرض الأخبار على الموقع. يمكن استبداله بخبر حقيقي من لوحة التحكم عند نشر أخبار المدرسة.', dateLabel:'نموذج تجريبي'},
  {category:'الفعاليات', title:'فعاليات ولقاءات داخل المدرسة', summary:'مساحة لعرض أبرز الفعاليات واللقاءات والأنشطة التي تقام داخل المدرسة.', details:'هذه بطاقة تجريبية توضح شكل تفاصيل الخبر عند الضغط عليها. لإضافة خبر حقيقي، استخدم لوحة تحكم الموقع واكتب العنوان والملخص والتفاصيل.', dateLabel:'نموذج تجريبي'},
  {category:'إنجازات الطلاب', title:'طلابنا يصنعون لحظات تستحق المشاركة', summary:'نموذج لخبر مدرسي يسلط الضوء على جهود الطلاب ومشاركاتهم المميزة.', details:'يمكن للإدارة استبدال هذا النص بمحتوى الخبر الفعلي، وإضافة صورة وتاريخ النشر من لوحة التحكم.', dateLabel:'نموذج تجريبي'}
];

function openNewsDetails(item) {
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  const image = document.getElementById('news-modal-image');
  image.hidden = !item.image;
  image.style.backgroundImage = item.image ? 'url("' + item.image.replace(/["\\\\]/g, '') + '")' : '';
  document.getElementById('news-modal-category').textContent = item.category || 'أخبار المدرسة';
  document.getElementById('news-modal-date').textContent = item.dateLabel || '';
  document.getElementById('news-modal-title').textContent = item.title || '';
  document.getElementById('news-modal-summary').textContent = item.summary || '';
  document.getElementById('news-modal-details').textContent = item.details || item.summary || '';
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('news-modal-open');
  modal.querySelector('.news-modal__close')?.focus();
}
function closeNewsDetails() {
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('news-modal-open');
}

document.addEventListener('click', e => {
  const card = e.target.closest('[data-news-card]');
  if (card) {
    const item = window.homeNewsItems?.[Number(card.dataset.newsCard)];
    if (item) openNewsDetails(item);
  }
  if (e.target.closest('[data-close-news]')) closeNewsDetails();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNewsDetails();
  const card = e.target.closest?.('[data-news-card]');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); card.click(); }
});

function renderNews(items, isDemo = false) {
  const box = document.getElementById('news-list');
  if (!box) return;
  window.homeNewsItems = items;
  box.innerHTML = items.map((n, i) => {
    const cover = n.image
      ? '<img class="news-card__photo" src="' + esc(n.image) + '" alt="" loading="lazy">'
      : '<div class="news-card__cover" aria-hidden="true"><span>✦</span><small>' + esc(n.category || 'أخبار المدرسة') + '</small></div>';
    return '<article class="news-item" data-news-card="' + i + '" tabindex="0" role="button" aria-label="اقرأ تفاصيل: ' + esc(n.title) + '">' +
      '<div class="news-card__media">' + cover + '<span class="news-card__tag">' + (isDemo ? 'نموذج تجريبي' : esc(n.category || 'أخبار المدرسة')) + '</span></div>' +
      '<div class="news-card__body"><time>' + esc(n.dateLabel || '') + '</time><h3>' + esc(n.title) + '</h3><p>' + esc(n.summary || '') + '</p>' +
      '<span class="news-card__more">اقرأ التفاصيل <b aria-hidden="true">←</b></span></div></article>';
  }).join('');
}

async function loadLatestNews() {
  const box = document.getElementById('news-list');
  if (!box) return;
  try {
    const snap = await db.collection('news').orderBy('date', 'desc').limit(3).get();
    if (snap.empty) { renderNews(sampleNews, true); return; }
    const items = snap.docs.map(d => {
      const n = d.data();
      const dateLabel = n.date?.toDate ? n.date.toDate().toLocaleDateString('ar-EG', {day:'numeric', month:'long', year:'numeric'}) : '';
      return {...n, dateLabel, category:'أخبار المدرسة'};
    });
    renderNews(items, false);
  } catch (err) {
    console.error(err);
    renderNews(sampleNews, true);
  }
}
loadLatestNews();
