// Activities: built-in defaults + optional overrides/additions from Firestore ("activities" collection)
const PLACEHOLDER = '/assets/activities/placeholder.svg';
const DEFAULT_ACTIVITIES = [
  {id:'radio', title:'الإذاعة والصحافة المدرسية', summary:'إعداد وتقديم الإذاعة المدرسية وإصدار الصحافة المدرسية.',
    image:'/assets/activities/radio-presenters.jpg',
    gallery:[
      {src:'/assets/activities/radio-day-1.jpg', caption:'مسابقة اليوم الإذاعي'},
      {src:'/assets/activities/radio-presenters.jpg', caption:'مسابقة اليوم الإذاعي'},
      {src:'/assets/activities/radio-organization.jpg', caption:'تنظيم ومتابعات'},
      {src:'/assets/activities/radio-supervisors.jpg', caption:'زيارات الموجهين'},
      {src:'/assets/activities/radio-standing.jpg', caption:'وقوف بحماس'}
    ]},
  {id:'library', title:'النشاط المكتبي وعلوم اللغة', summary:'القراءة والمكتبة وأنشطة اللغة العربية واللغات.'},
  {id:'industrial', title:'النشاط الصناعي والحرفي', summary:'أعمال صناعية وحرفية يدوية يشارك فيها الطلاب.'},
  {id:'art', title:'النشاط الفني الإبداعي', summary:'الرسم والفنون والأعمال الإبداعية.'},
  {id:'sports', title:'النشاط الرياضي', summary:'الألعاب والفرق والبطولات الرياضية في ملعب المدرسة.'},
  {id:'military', title:'النشاط العسكري القيادي', summary:'تدريبات الانضباط والقيادة والعمل الجماعي.'}
];
const actImg = a => `<img src="${esc(a.image || '/assets/activities/' + a.id + '.jpg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;

const galleryHtml = a => !a.gallery ? '' : '<h2 style="margin-top:2rem">صور النشاط</h2><div class="gallery">' +
  a.gallery.map(g => `<figure><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('') + '</div>';

async function getActivities() {
  const list = DEFAULT_ACTIVITIES.map(a => ({...a}));
  try {
    const snap = await db.collection('activities').orderBy('date', 'desc').get();
    snap.docs.forEach(d => {
      if (d.data().status === 'draft') return;
      const x = Object.fromEntries(Object.entries({id: d.id, ...d.data()}).filter(([, v]) => v));
      const i = list.findIndex(a => a.title === x.title);
      if (i >= 0) list[i] = {...list[i], ...x}; else list.push(x);
    });
  } catch (e) { console.warn('Using default activities only:', e.message); }
  return list;
}

(async () => {
  const grid = document.getElementById('act-grid');
  const view = document.getElementById('act-view');
  if (!grid && !view) return;
  const list = await getActivities();
  if (grid) {
    grid.innerHTML = list.map(a => `<a class="act-card" href="/activity?id=${encodeURIComponent(a.id)}">
      ${actImg(a)}<div><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><span class="more">تفاصيل النشاط</span></div></a>`).join('');
  } else {
    const a = list.find(x => x.id === new URLSearchParams(location.search).get('id'));
    if (!a) { view.innerHTML = '<p class="todo">لم نجد هذا النشاط. <a href="/activities"><u>العودة إلى الأنشطة</u></a></p>'; return; }
    document.title = a.title + ' — الثانوية العسكرية بنين';
    document.getElementById('act-title').textContent = a.title;
    view.innerHTML = `<div class="act-cover">${actImg(a)}</div><p style="margin-top:1.2rem">${esc(a.summary)}</p>` +
      (a.details ? `<div class="card" style="margin-top:1.2rem"><p>${esc(a.details).replace(/\n/g, '<br>')}</p></div>`
                 : '<p class="todo" style="margin-top:1.2rem">سيُضاف هنا تفاصيل النشاط (المشرفون والمواعيد والفعاليات) بعد جمع البيانات.</p>') +
      galleryHtml(a) +
      `<div class="btns" style="margin-top:1.5rem"><a class="btn gold" href="/activities">كل الأنشطة</a><a class="btn" style="color:var(--navy)" href="/achievements?activity=${encodeURIComponent(a.id)}">إنجازات النشاط</a></div>`;
  }
})();
