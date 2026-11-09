// Achievements grouped per activity. Defaults below belong to the radio activity only;
// extra items come from Firestore ("achievements" collection) with an `activity` field.
const DEFAULT_ACHIEVEMENTS = [
  {activity:'radio', rank:1, name:'مسابقة مجلة الحائط', level:'على مستوى الإدارة', text:'حصلت جماعة الإذاعة المدرسية على المركز الأول في مسابقة مجلة الحائط على مستوى الإدارة، إنجاز يُثبت تميز الفريق في المجالات التحريرية والتصميمية.'},
  {activity:'radio', rank:1, name:'تصميم وبرمجة المواقع الإلكترونية', level:'على مستوى الإدارة', text:'حصل الطالب عبيدة محي مزيد على المركز الأول في مجال تصميم وبرمجة المواقع الإلكترونية على مستوى الإدارة.'},
  {activity:'radio', rank:2, name:'مسابقة النشرة الإخبارية المصورة', level:'على مستوى الجمهورية', text:'حصلت جماعة الإذاعة المدرسية على المركز الثاني على مستوى الجمهورية في مسابقة النشرة الإخبارية المصورة، إنجاز استثنائي يُعلي اسم المدرسة على الخريطة الإعلامية الوطنية.'},
  {activity:'radio', rank:2, name:'مسابقة تقديم الإذاعة المدرسية', level:'على مستوى الإدارة', text:'حصلت جماعة الإذاعة المدرسية على المركز الثاني في مسابقة تقديم الإذاعة المدرسية على مستوى الإدارة، مما يعكس الأداء المتميز والجودة العالية في التقديم والإخراج الإذاعي.'},
  {activity:'radio', rank:2, name:'مسابقة الإعلامي الصغير', level:'', text:'حصل الطالب سيف محمد حسين على المركز الثاني في مسابقة الإعلامي الصغير تقديرًا للمستوى الرفيع في الأداء الإذاعي.'},
  {activity:'radio', rank:2, name:'مسابقة الإعلامي الصغير (مكرر)', level:'', text:'حصل الطالب يحيى أشرف الجزار على المركز الثاني مكررًا في مسابقة الإعلامي الصغير، مما يعكس ثبات مستوى الفريق وتميزه.'},
  {activity:'radio', rank:2, name:'مسابقة اليوم الإذاعي 2025', level:'إدارة المنتزه', text:'الحصول على المركز الثاني على مستوى إدارة المنتزه في مسابقة اليوم الإذاعي 2025.'},
  {activity:'radio', rank:2, name:'مسابقة القرآن الكريم', level:'', text:'حصل الطالب محمد عيد أحمد ناجي على المركز الثاني في مسابقة القرآن الكريم.'},
  {activity:'radio', rank:2, name:'مسابقة الكاريكاتير الصحفي', level:'على مستوى الإدارة', text:'حصل الطالب سيف محمد حسين على المركز الثاني على مستوى الإدارة في مسابقة الكاريكاتير الصحفي.'},
  {activity:'radio', rank:3, name:'مسابقة القرآن الكريم', level:'', text:'حصل الطالب عبد الرحمن كمال محمد على المركز الثالث في مسابقة القرآن الكريم.'},
  {activity:'radio', rank:3, name:'مسابقة اليوم الإذاعي 2026', level:'إدارة المنتزه', text:'الحصول على المركز الثالث على مستوى إدارة المنتزه في مسابقة اليوم الإذاعي 2026.'}
];
const RANK_LABEL = {1:'المركز الأول', 2:'المركز الثاني', 3:'المركز الثالث', 0:'إنجاز'};
const rankOf = t => /الأول/.test(t) ? 1 : /الثاني/.test(t) ? 2 : /الثالث/.test(t) ? 3 : 0;

async function getAchievements() {
  const list = DEFAULT_ACHIEVEMENTS.map(a => ({...a}));
  try {
    const snap = await db.collection('achievements').orderBy('date', 'desc').get();
    snap.docs.forEach(d => {
      const x = d.data(); if (!x.activity || x.status === 'draft') return;
      const t = String(x.title || '');
      const [h, ...rest] = t.split('—');
      list.push({activity: x.activity, rank: x.rank ?? rankOf(h), name: x.name || (rest.length ? rest.join('—').trim() : t), level: x.level || '', text: x.text || x.summary || x.details || '', image: x.image || ''});
    });
  } catch (e) { console.warn('Using default achievements only:', e.message); }
  return list;
}

const achCard = a => `<article class="ach rank-${a.rank}">
  <div class="rank-bar">${RANK_LABEL[a.rank]}${a.level ? ` <small>· ${esc(a.level)}</small>` : ''}</div>
  ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ''}
  <div class="ach-body"><h3>${esc(a.name)}</h3><p>${esc(a.text)}</p></div></article>`;

(async () => {
  const view = document.getElementById('ach-view');
  if (!view) return;
  const [acts, all] = await Promise.all([getActivities(), getAchievements()]);
  const id = new URLSearchParams(location.search).get('activity');
  const act = acts.find(a => a.id === id);
  const stats = document.getElementById('ach-stats');

  if (!act) {                       // overview: one card per activity
    stats.hidden = true;
    view.innerHTML = '<div class="act-grid">' + acts.map(a => {
      const mine = all.filter(x => x.activity === a.id);
      const c = r => mine.filter(x => x.rank === r).length;
      if (!mine.length) return `<div class="act-card soon">${actImg(a)}<div><h3>${esc(a.title)}</h3><p>سيتم إضافة إنجازات هذا النشاط قريبًا.</p></div></div>`;
      return `<a class="act-card" href="/achievements?activity=${encodeURIComponent(a.id)}">${actImg(a)}<div><h3>${esc(a.title)}</h3>
        <p class="tally"><strong>${mine.length}</strong> إنجاز · أول ${c(1)} · ثاني ${c(2)} · ثالث ${c(3)}</p><span class="more">عرض الإنجازات</span></div></a>`;
    }).join('') + '</div>';
    return;
  }

  document.title = 'إنجازات ' + act.title + ' — الثانوية العسكرية بنين';
  document.getElementById('ach-title').textContent = 'إنجازات ' + act.title;
  document.getElementById('ach-sub').textContent = 'مراكز وجوائز حققها طلاب هذا النشاط';
  const mine = all.filter(x => x.activity === act.id);
  const count = r => mine.filter(x => x.rank === r).length;
  const back = '<div class="btns" style="margin-top:1.5rem"><a class="btn gold" href="/achievements">كل الأنشطة</a></div>';
  if (!mine.length) { stats.hidden = true; view.innerHTML = '<p class="todo">سيتم إضافة إنجازات هذا النشاط قريبًا.</p>' + back; return; }
  stats.innerHTML = `<div><strong>${mine.length}</strong><span>إنجاز</span></div><div><strong>${count(1)}</strong><span>المركز الأول</span></div>` +
    `<div><strong>${count(2)}</strong><span>المركز الثاني</span></div><div><strong>${count(3)}</strong><span>المركز الثالث</span></div>`;
  view.innerHTML = `<div class="filters" role="group" aria-label="تصفية الإنجازات">
    <button data-f="all" aria-pressed="true">الكل</button><button data-f="1" aria-pressed="false">المركز الأول</button>
    <button data-f="2" aria-pressed="false">المركز الثاني</button><button data-f="3" aria-pressed="false">المركز الثالث</button></div>
    <div class="ach-grid" id="ach-grid"></div>` + back;
  const draw = f => { document.getElementById('ach-grid').innerHTML = mine.filter(a => f === 'all' || String(a.rank) === f).map(achCard).join(''); };
  view.querySelectorAll('.filters button').forEach(b => b.onclick = () => {
    view.querySelectorAll('.filters button').forEach(x => x.setAttribute('aria-pressed', x === b));
    draw(b.dataset.f);
  });
  draw('all');
})();
