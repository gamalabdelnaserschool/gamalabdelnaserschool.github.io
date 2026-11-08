// Shared: mobile menu + latest news from Firestore ("news" collection)
document.querySelector('.menu-btn')?.addEventListener('click', e => {
  const open = document.body.classList.toggle('nav-open');
  e.currentTarget.setAttribute('aria-expanded', open);
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function loadLatestNews() {
  const box = document.getElementById('news-list');
  if (!box) return;
  try {
    const snap = await db.collection('news').orderBy('date', 'desc').limit(3).get();
    if (snap.empty) { box.innerHTML = '<p class="empty">لا توجد أخبار منشورة بعد. أضف أول خبر من لوحة التحكم.</p>'; return; }
    box.innerHTML = snap.docs.map(d => {
      const n = d.data();
      const date = n.date?.toDate ? n.date.toDate().toLocaleDateString('ar-EG', {day:'numeric', month:'long', year:'numeric'}) : '';
      return `<article class="news-item">
        ${n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy">` : ''}
        <time>${date}</time><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p></article>`;
    }).join('');
  } catch (err) {
    console.error(err);
    box.innerHTML = '<p class="empty">تعذر تحميل الأخبار. تأكد من قواعد Firestore واتصال الإنترنت.</p>';
  }
}
loadLatestNews();
