// Achievements: built-in list + extra items from Firestore ("achievements" collection)
const DEFAULT_ACHIEVEMENTS = [
  {rank:1, name:'مسابقة مجلة الحائط', level:'على مستوى الإدارة', text:'حصلت جماعة الإذاعة المدرسية على المركز الأول في مسابقة مجلة الحائط على مستوى الإدارة، إنجاز يُثبت تميز الفريق في المجالات التحريرية والتصميمية.'},
  {rank:1, name:'تصميم وبرمجة المواقع الإلكترونية', level:'على مستوى الإدارة', text:'حصل الطالب عبيدة محي مزيد على المركز الأول في مجال تصميم وبرمجة المواقع الإلكترونية على مستوى الإدارة.'},
  {rank:2, name:'مسابقة النشرة الإخبارية المصورة', level:'على مستوى الجمهورية', text:'حصلت جماعة الإذاعة المدرسية على المركز الثاني على مستوى الجمهورية في مسابقة النشرة الإخبارية المصورة، إنجاز استثنائي يُعلي اسم المدرسة على الخريطة الإعلامية الوطنية.'},
  {rank:2, name:'مسابقة تقديم الإذاعة المدرسية', level:'على مستوى الإدارة', text:'حصلت جماعة الإذاعة المدرسية على المركز الثاني في مسابقة تقديم الإذاعة المدرسية على مستوى الإدارة، مما يعكس الأداء المتميز والجودة العالية في التقديم والإخراج الإذاعي.'},
  {rank:2, name:'مسابقة الإعلامي الصغير', level:'', text:'حصل الطالب سيف محمد حسين على المركز الثاني في مسابقة الإعلامي الصغير تقديرًا للمستوى الرفيع في الأداء الإذاعي.'},
  {rank:2, name:'مسابقة الإعلامي الصغير (مكرر)', level:'', text:'حصل الطالب يحيى أشرف الجزار على المركز الثاني مكررًا في مسابقة الإعلامي الصغير، مما يعكس ثبات مستوى الفريق وتميزه.'},
  {rank:2, name:'مسابقة اليوم الإذاعي 2025', level:'إدارة المنتزه', text:'الحصول على المركز الثاني على مستوى إدارة المنتزه في مسابقة اليوم الإذاعي 2025.'},
  {rank:2, name:'مسابقة القرآن الكريم', level:'', text:'حصل الطالب محمد عيد أحمد ناجي على المركز الثاني في مسابقة القرآن الكريم.'},
  {rank:2, name:'مسابقة الكاريكاتير الصحفي', level:'على مستوى الإدارة', text:'حصل الطالب سيف محمد حسين على المركز الثاني على مستوى الإدارة في مسابقة الكاريكاتير الصحفي.'},
  {rank:3, name:'مسابقة القرآن الكريم', level:'', text:'حصل الطالب عبد الرحمن كمال محمد على المركز الثالث في مسابقة القرآن الكريم.'},
  {rank:3, name:'مسابقة اليوم الإذاعي 2026', level:'إدارة المنتزه', text:'الحصول على المركز الثالث على مستوى إدارة المنتزه في مسابقة اليوم الإذاعي 2026.'}
];
const RANK_LABEL = {1:'المركز الأول', 2:'المركز الثاني', 3:'المركز الثالث', 0:'إنجاز'};
const rankOf = t => /الأول/.test(t) ? 1 : /الثاني/.test(t) ? 2 : /الثالث/.test(t) ? 3 : 0;

async function getAchievements() {
  const list = DEFAULT_ACHIEVEMENTS.map(a => ({...a}));
  try {
    const snap = await db.collection('achievements').orderBy('date', 'desc').get();
    snap.docs.forEach(d => {
      const x = d.data(); const t = String(x.title || '');
      const [head, ...rest] = t.split('—');
      const name = rest.length ? rest.join('—').trim() : t;
      list.push({rank: rankOf(head), name, level:'', text: x.summary || x.details || '', image: x.image || ''});
    });
  } catch (e) { console.warn('Using default achievements only:', e.message); }
  return list;
}

(async () => {
  const grid = document.getElementById('ach-grid');
  if (!grid) return;
  const list = await getAchievements();
  const count = r => list.filter(a => a.rank === r).length;
  document.getElementById('ach-stats').innerHTML =
    `<div><strong>${list.length}</strong><span>إنجاز</span></div><div><strong>${count(1)}</strong><span>المركز الأول</span></div>` +
    `<div><strong>${count(2)}</strong><span>المركز الثاني</span></div><div><strong>${count(3)}</strong><span>المركز الثالث</span></div>`;
  const draw = f => {
    const items = list.filter(a => f === 'all' || String(a.rank) === f);
    grid.innerHTML = items.map(a => `<article class="ach rank-${a.rank}">
      <div class="rank-bar">${RANK_LABEL[a.rank]}${a.level ? ` <small>· ${esc(a.level)}</small>` : ''}</div>
      ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ''}
      <div class="ach-body"><h3>${esc(a.name)}</h3><p>${esc(a.text)}</p></div></article>`).join('') || '<p class="todo">لا توجد إنجازات في هذا التصنيف.</p>';
  };
  document.querySelectorAll('.filters button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.filters button').forEach(x => x.setAttribute('aria-pressed', x === b));
    draw(b.dataset.f);
  });
  draw('all');
})();
