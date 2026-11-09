'use strict';
/* Admin dashboard: sections are described by SECTIONS; forms, lists and the live preview are generated from it. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ico = (p, s = 22) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC = {
  home:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2V5zM17 8h3v9a2 2 0 0 1-2 2M7.5 9h6M7.5 12.5h6M7.5 16h4"/>',
  activities:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  achievements:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
  competitions:'<circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/>',
  set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  site:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 5.2A9.6 9.6 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s4 7 10 7a9.5 9.5 0 0 0 4-.9"/>'
};

/* ---- roles hook (next phase): every action goes through can() ---- */
const can = (action, section) => true;

/* ---- section definitions ---- */
const ACTS = [['radio','الإذاعة والصحافة المدرسية'],['library','النشاط المكتبي وعلوم اللغة'],['industrial','النشاط الصناعي والحرفي'],['art','النشاط الفني الإبداعي'],['sports','النشاط الرياضي'],['military','النشاط العسكري القيادي']];
const CATS = ['أخبار المدرسة','الأنشطة المدرسية','الفعاليات','إنجازات الطلاب','إعلانات'];
const RANKS = [[1,'المركز الأول'],[2,'المركز الثاني'],[3,'المركز الثالث'],[0,'إنجاز آخر']];
const RANK_LABEL = Object.fromEntries(RANKS);
const actName = id => (ACTS.find(a => a[0] === id) || [, id || ''])[1];
const SECTIONS = {
  news:{label:'الأخبار', one:'خبر', icon:IC.news, desc:'الأخبار والإعلانات التي تظهر في الصفحة الرئيسية.', fields:[
    {k:'title', l:'العنوان', t:'text', req:1, hint:'عنوان واضح في سطر واحد.'},
    {k:'category', l:'التصنيف', t:'select', opts:CATS.map(c => [c,c])},
    {k:'summary', l:'ملخص قصير', t:'textarea', rows:2, max:160, hint:'يظهر على بطاقة الخبر.'},
    {k:'details', l:'التفاصيل', t:'textarea', rows:7, hint:'يظهر عند فتح الخبر.'},
    {k:'image', l:'رابط الصورة', t:'url', hint:'اختياري. رابط مباشر يبدأ بـ https://'},
    {k:'date', l:'تاريخ النشر', t:'datetime'}]},
  activities:{label:'الأنشطة', one:'نشاط', icon:IC.activities, desc:'اكتب نفس اسم نشاط موجود لتعديل بياناته، أو اسمًا جديدًا لإضافة نشاط.', fields:[
    {k:'title', l:'اسم النشاط', t:'text', req:1, list:'act-titles'},
    {k:'summary', l:'تعريف قصير', t:'textarea', rows:2, max:140, hint:'يظهر على بطاقة النشاط.'},
    {k:'details', l:'التفاصيل', t:'textarea', rows:7, hint:'المشرفون، المواعيد، الفعاليات…'},
    {k:'image', l:'رابط الصورة', t:'url', hint:'اختياري. بدونها تظهر الصورة البديلة.'},
    {k:'date', l:'تاريخ التحديث', t:'datetime'}]},
  achievements:{label:'الإنجازات', one:'إنجاز', icon:IC.achievements, desc:'كل إنجاز يُربط بنشاط واحد ويظهر في صفحة إنجازات ذلك النشاط فقط.', fields:[
    {k:'activity', l:'النشاط', t:'select', req:1, opts:ACTS},
    {k:'rank', l:'المركز', t:'select', opts:RANKS},
    {k:'name', l:'اسم المسابقة', t:'text', req:1},
    {k:'level', l:'المستوى', t:'text', hint:'اختياري، مثل: على مستوى الإدارة.'},
    {k:'text', l:'الوصف', t:'textarea', rows:4, max:300},
    {k:'image', l:'رابط الصورة', t:'url', hint:'اختياري.'},
    {k:'date', l:'تاريخ الإنجاز', t:'datetime'}]},
  competitions:{label:'المسابقات', one:'مسابقة', icon:IC.competitions, desc:'المسابقات والفعاليات المفتوحة للطلاب (صفحتها العامة قيد البناء).', fields:[
    {k:'title', l:'اسم المسابقة', t:'text', req:1},
    {k:'kind', l:'النوع', t:'select', opts:[['quiz','كويز أونلاين'],['event','فعالية بتسجيل'],['other','أخرى']]},
    {k:'summary', l:'وصف قصير', t:'textarea', rows:2, max:160},
    {k:'details', l:'التفاصيل والشروط', t:'textarea', rows:6},
    {k:'deadline', l:'آخر موعد', t:'date'},
    {k:'image', l:'رابط الصورة', t:'url', hint:'اختياري.'},
    {k:'date', l:'تاريخ النشر', t:'datetime'}]}
};
const KEYS = Object.keys(SECTIONS);

/* ---- state, prefs, helpers ---- */
const state = {user:null, cache:{}, dirty:false, device:'desktop', pmode:'card', timer:0};
const prefs = (() => { try { return JSON.parse(localStorage.getItem('adm_prefs') || '{}'); } catch { return {}; } })();
function applyPrefs() { const r = document.documentElement; r.dataset.text = prefs.text || 'md'; r.dataset.contrast = prefs.contrast ? 'high' : ''; r.dataset.density = prefs.compact ? 'compact' : ''; r.dataset.motion = prefs.calm ? 'reduce' : ''; }
const savePrefs = () => { try { localStorage.setItem('adm_prefs', JSON.stringify(prefs)); } catch {} };
applyPrefs();
let tt; const toast = (m, k = '') => { const t = $('#toast'); t.textContent = m; t.className = 'toast show ' + k; clearTimeout(tt); tt = setTimeout(() => t.className = 'toast', 4200); };
const nowTs = () => firebase.firestore.FieldValue.serverTimestamp();
const fmt = ts => ts?.toDate ? ts.toDate().toLocaleDateString('ar-EG', {day:'numeric', month:'short', year:'numeric'}) : '';
const toLocalInput = d => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return x.toISOString().slice(0, 16); };
const titleOf = (sec, d) => sec === 'achievements' && d.name ? `${RANK_LABEL[d.rank ?? 0] || ''} — ${d.name}` : (d.title || '(بدون عنوان)');
const isDraft = d => d.status === 'draft';
function setTitle(t) { document.title = t + ' — لوحة التحكم'; $('#crumb').textContent = t; }
function askConfirm(title, msg, ok = 'تأكيد') { return new Promise(res => { const d = $('#dlg-confirm'); $('#dc-t').textContent = title; $('#dc-m').textContent = msg; $('#dc-ok').textContent = ok; d.onclose = () => res(d.returnValue === 'ok'); d.showModal(); }); }
const mainEl = () => $('#main');
const focusH1 = () => { const h = $('#h1'); if (h) h.focus({preventScroll:false}); };
async function loadSection(sec) { const s = await db.collection(sec).orderBy('date', 'desc').get(); return state.cache[sec] = s.docs.map(d => ({id:d.id, ...d.data()})); }
const failMsg = e => { console.error(e); return `<div class="empty" role="alert"><p>تعذر تحميل البيانات. تأكد من اتصال الإنترنت ومن قواعد Firestore.</p></div>`; };

/* ---- auth ---- */
auth.onAuthStateChanged(u => {
  state.user = u; $('#login').hidden = !!u; $('#app').hidden = !u;
  if (u) { $('#who').textContent = u.email; $('#ic-site').innerHTML = ico(IC.site, 20); $('#ic-set').innerHTML = ico(IC.set, 20); renderNav(); route(); }
});
$('#login-form').onsubmit = async e => {
  e.preventDefault(); const m = $('#login-msg'); m.className = 'msg'; m.textContent = '';
  try { await auth.signInWithEmailAndPassword($('#email').value.trim(), $('#pass').value); }
  catch { m.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'; $('#pass').focus(); }
};
$('#pw-toggle').onclick = e => { const p = $('#pass'), show = p.type === 'password'; p.type = show ? 'text' : 'password'; e.currentTarget.textContent = show ? 'إخفاء' : 'إظهار'; e.currentTarget.setAttribute('aria-pressed', show); };
$('#reset').onclick = async () => {
  const m = $('#login-msg'), em = $('#email').value.trim(); m.className = 'msg';
  if (!em) { m.textContent = 'اكتب بريدك الإلكتروني أولًا ثم اضغط "نسيت كلمة المرور".'; $('#email').focus(); return; }
  try { await auth.sendPasswordResetEmail(em); m.className = 'msg ok'; m.textContent = 'تم إرسال رابط إعادة التعيين إلى بريدك.'; } catch { m.textContent = 'تعذر إرسال الرابط، تأكد من البريد.'; }
};
$('#logout').onclick = () => auth.signOut();

/* ---- shell: nav, settings, mobile menu ---- */
function renderNav() {
  const items = [['overview','نظرة عامة',IC.home], ...KEYS.map(k => [k, SECTIONS[k].label, SECTIONS[k].icon])];
  $('#nav').innerHTML = items.map(([k, l, i]) => `<a href="#/${k}" data-nav="${k}">${ico(i, 20)}<span>${l}</span></a>`).join('');
}
const setMenu = open => { $('#app').classList.toggle('nav-open', open); $('#menu').setAttribute('aria-expanded', open); };
$('#menu').onclick = () => setMenu(!$('#app').classList.contains('nav-open'));
$('#scrim').onclick = () => setMenu(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
$('#open-settings').onclick = () => {
  const f = $('#settings-form'); f.text.value = prefs.text || 'md'; f.contrast.checked = !!prefs.contrast; f.compact.checked = !!prefs.compact; f.calm.checked = !!prefs.calm; $('#dlg-settings').showModal();
};
$('#settings-form').addEventListener('change', () => { const f = $('#settings-form'); Object.assign(prefs, {text:f.text.value, contrast:f.contrast.checked, compact:f.compact.checked, calm:f.calm.checked}); savePrefs(); applyPrefs(); });

/* ---- routing (hash based, warns about unsaved changes) ---- */
let lastHash = location.hash, reverting = false;
addEventListener('hashchange', () => {
  if (reverting) { reverting = false; return; }
  if (state.dirty && !confirm('لديك تغييرات غير محفوظة. هل تريد المغادرة؟')) { reverting = true; location.hash = lastHash; return; }
  state.dirty = false; lastHash = location.hash; route();
});
addEventListener('beforeunload', e => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
async function route() {
  if (!state.user) return;
  const [sec = 'overview', mode, id] = (location.hash.replace(/^#\/?/, '') || 'overview').split('/');
  $$('#nav a').forEach(a => a.dataset.nav === sec ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  setMenu(false);
  if (sec === 'overview' || !SECTIONS[sec]) await viewOverview();
  else if (mode === 'new') await viewEdit(sec, null);
  else if (mode === 'edit') await viewEdit(sec, id);
  else viewList(sec);
  focusH1(); scrollTo(0, 0);
}

/* ---- overview ---- */
async function viewOverview() {
  setTitle('نظرة عامة');
  mainEl().innerHTML = `<div class="page-head"><div><h1 id="h1" tabindex="-1">مرحبًا بك في لوحة التحكم</h1><p class="muted">ملخص سريع لمحتوى الموقع وأحدث التعديلات.</p></div></div><p class="muted" role="status">جارٍ التحميل…</p>`;
  try {
    const all = await Promise.all(KEYS.map(loadSection));
    const recent = KEYS.flatMap((k, i) => all[i].map(d => ({...d, _s:k}))).sort((a, b) => (b.updatedAt?.seconds || b.date?.seconds || 0) - (a.updatedAt?.seconds || a.date?.seconds || 0)).slice(0, 6);
    mainEl().innerHTML = `<div class="page-head"><div><h1 id="h1" tabindex="-1">مرحبًا بك في لوحة التحكم</h1><p class="muted">ملخص سريع لمحتوى الموقع وأحدث التعديلات.</p></div></div>
    <div class="stats">${KEYS.map((k, i) => { const r = all[i], dr = r.filter(isDraft).length; return `<a class="stat" href="#/${k}"><span class="stat-ico">${ico(SECTIONS[k].icon, 22)}</span><strong>${r.length}</strong><span>${SECTIONS[k].label}</span><small>${r.length - dr} منشور · ${dr} مسودة</small></a>`; }).join('')}</div>
    <h2 class="sec">إضافة سريعة</h2><div class="quick">${KEYS.filter(k => can('create', k)).map(k => `<a class="btn" href="#/${k}/new">${ico(IC.plus, 18)}<span>${SECTIONS[k].one} جديد</span></a>`).join('')}</div>
    <h2 class="sec">آخر التعديلات</h2>${recent.length ? `<ul class="rows">${recent.map(d => `<li class="row-i"><div class="row-main"><span class="badge ${isDraft(d) ? 'draft' : 'pub'}">${isDraft(d) ? 'مسودة' : 'منشور'}</span><a class="row-title" href="#/${d._s}/edit/${d.id}">${esc(titleOf(d._s, d))}</a><span class="meta">${SECTIONS[d._s].label}</span></div></li>`).join('')}</ul>` : '<div class="empty">لا يوجد محتوى بعد. ابدأ بإضافة أول عنصر.</div>'}`;
    focusH1();
  } catch (e) { mainEl().innerHTML = failMsg(e); }
}

/* ---- list view ---- */
function metaOf(sec, d) {
  if (sec === 'news') return [d.category, fmt(d.date)].filter(Boolean).join(' · ');
  if (sec === 'achievements') return [actName(d.activity), d.level].filter(Boolean).join(' · ');
  if (sec === 'competitions') return [({quiz:'كويز', event:'فعالية', other:'أخرى'})[d.kind], d.deadline && 'حتى ' + d.deadline].filter(Boolean).join(' · ');
  return fmt(d.date);
}
function viewList(sec) {
  const S = SECTIONS[sec]; setTitle(S.label);
  mainEl().innerHTML = `<div class="page-head"><div><h1 id="h1" tabindex="-1">${S.label}</h1><p class="muted">${S.desc}</p></div>${can('create', sec) ? `<a class="btn primary" href="#/${sec}/new">${ico(IC.plus, 18)}<span>${S.one} جديد</span></a>` : ''}</div>
  <div class="toolbar"><label class="sr" for="q">بحث</label><input id="q" type="search" placeholder="ابحث في ${S.label}…"><label class="sr" for="st">الحالة</label><select id="st"><option value="">كل الحالات</option><option value="published">منشور</option><option value="draft">مسودة</option></select><span id="count" class="muted" role="status"></span></div>
  <ul class="rows" id="rows" aria-busy="true"></ul>`;
  const draw = () => {
    const q = $('#q').value.trim().toLowerCase(), st = $('#st').value;
    const rows = (state.cache[sec] || []).filter(d => (!st || (st === 'draft') === isDraft(d)) && (!q || (titleOf(sec, d) + ' ' + (d.summary || d.text || '')).toLowerCase().includes(q)));
    $('#count').textContent = `${rows.length} نتيجة`; $('#rows').removeAttribute('aria-busy');
    $('#rows').innerHTML = rows.length ? rows.map(d => { const t = esc(titleOf(sec, d)), pub = !isDraft(d);
      return `<li class="row-i"><div class="row-main"><span class="badge ${pub ? 'pub' : 'draft'}">${pub ? 'منشور' : 'مسودة'}</span><a class="row-title" href="#/${sec}/edit/${d.id}">${t}</a><span class="meta">${esc(metaOf(sec, d))}</span></div>
      <div class="row-actions">${can('update', sec) ? `<a class="btn ghost sm" href="#/${sec}/edit/${d.id}" aria-label="تعديل ${t}">${ico(IC.edit, 17)}<span>تعديل</span></a><button class="btn ghost sm" data-act="toggle" data-id="${d.id}" aria-label="${pub ? 'إلغاء نشر' : 'نشر'} ${t}">${ico(pub ? IC.eyeoff : IC.eye, 17)}<span>${pub ? 'إلغاء النشر' : 'نشر'}</span></button>` : ''}${can('create', sec) ? `<button class="btn ghost sm" data-act="dup" data-id="${d.id}" aria-label="نسخ ${t}">${ico(IC.copy, 17)}<span>نسخ</span></button>` : ''}${can('delete', sec) ? `<button class="btn ghost sm danger" data-act="del" data-id="${d.id}" aria-label="حذف ${t}">${ico(IC.trash, 17)}<span>حذف</span></button>` : ''}</div></li>`; }).join('')
      : `<li class="empty"><p>${(state.cache[sec] || []).length ? 'لا توجد نتائج مطابقة.' : `لا يوجد ${S.label} بعد.`}</p>${can('create', sec) && !(state.cache[sec] || []).length ? `<a class="btn primary" href="#/${sec}/new">أضف أول ${S.one}</a>` : ''}</li>`;
  };
  $('#q').oninput = draw; $('#st').onchange = draw;
  $('#rows').onclick = async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const d = state.cache[sec].find(x => x.id === b.dataset.id); if (!d) return;
    try {
      if (b.dataset.act === 'toggle') { const s = isDraft(d) ? 'published' : 'draft'; await db.collection(sec).doc(d.id).update({status:s, updatedAt:nowTs()}); d.status = s; toast(s === 'draft' ? 'تم إلغاء النشر (أصبح مسودة).' : 'تم النشر.'); draw(); }
      if (b.dataset.act === 'dup') { const {id, ...c} = d; c.status = 'draft'; c.updatedAt = nowTs(); c.date = nowTs(); if (c.title) c.title += ' (نسخة)'; if (c.name) { c.name += ' (نسخة)'; c.title = titleOf(sec, c); } await db.collection(sec).add(c); await loadSection(sec); toast('تم إنشاء نسخة كمسودة.'); draw(); }
      if (b.dataset.act === 'del' && await askConfirm('حذف نهائي', `سيتم حذف "${titleOf(sec, d)}" نهائيًا ولا يمكن التراجع.`, 'حذف')) { await db.collection(sec).doc(d.id).delete(); state.cache[sec] = state.cache[sec].filter(x => x.id !== d.id); toast('تم الحذف.'); draw(); }
    } catch (err) { console.error(err); toast('تعذر تنفيذ العملية. تأكد من صلاحيات الحساب.', 'bad'); }
  };
  (state.cache[sec] ? Promise.resolve() : loadSection(sec)).then(draw).catch(e => { $('#rows').innerHTML = failMsg(e); });
  if (state.cache[sec]) draw();
}

/* ---- editor with live preview ---- */
function fieldHtml(f, val) {
  const id = 'f-' + f.k, desc = `${f.hint ? id + '-h ' : ''}${id}-e`;
  const attrs = `id="${id}" name="${f.k}" aria-describedby="${desc}" ${f.req ? 'required' : ''}`;
  let ctl;
  if (f.t === 'textarea') ctl = `<textarea ${attrs} rows="${f.rows || 4}" ${f.max ? `maxlength="${f.max}"` : ''}>${esc(val)}</textarea>`;
  else if (f.t === 'select') ctl = `<select ${attrs}>${f.opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  else ctl = `<input ${attrs} type="${f.t === 'datetime' ? 'datetime-local' : f.t}" value="${esc(val)}" ${f.list ? `list="${f.list}"` : ''} ${f.t === 'url' ? 'dir="ltr" placeholder="https://"' : ''}>`;
  return `<div class="field"><label for="${id}">${f.l}${f.req ? ' <span class="req" aria-hidden="true">*</span><span class="sr">(مطلوب)</span>' : ''}</label>${ctl}${f.hint ? `<small class="hint" id="${id}-h">${f.hint}</small>` : ''}${f.max ? `<small class="cnt" id="${id}-c" aria-hidden="true"></small>` : ''}<small class="err" id="${id}-e" role="alert"></small></div>`;
}
function readForm(S) {
  const o = {};
  S.fields.forEach(f => { const v = $('#f-' + f.k).value.trim(); o[f.k] = f.k === 'rank' ? Number(v) : v; });
  return o;
}
async function viewEdit(sec, id) {
  const S = SECTIONS[sec]; let d = {status:'draft'};
  if (id) { const rows = state.cache[sec] || await loadSection(sec).catch(() => []); d = rows.find(r => r.id === id); if (!d) { setTitle('غير موجود'); mainEl().innerHTML = `<div class="page-head"><h1 id="h1" tabindex="-1">العنصر غير موجود</h1></div><a class="btn" href="#/${sec}">العودة إلى ${S.label}</a>`; return; } }
  const published = id && !isDraft(d);
  setTitle(id ? 'تعديل ' + S.one : S.one + ' جديد');
  const val = f => f.k === 'date' ? toLocalInput(d.date?.toDate ? d.date.toDate() : new Date()) : (d[f.k] ?? (f.k === 'category' ? CATS[0] : f.k === 'rank' ? 1 : f.k === 'text' ? (d.summary || '') : ''));
  mainEl().innerHTML = `<div class="page-head"><div><h1 id="h1" tabindex="-1">${id ? 'تعديل ' : ''}${S.one}${id ? '' : ' جديد'}</h1><p class="muted"><span class="badge ${published ? 'pub' : 'draft'}">${published ? 'منشور' : 'مسودة'}</span> · شاهد المعاينة قبل النشر.</p></div><a class="btn" href="#/${sec}">العودة إلى ${S.label}</a></div>
  <div class="edit-grid" id="editor"><form class="panel" id="form" novalidate aria-label="نموذج ${S.one}"><h2>البيانات</h2>${S.fields.map(f => fieldHtml(f, val(f))).join('')}
    <div class="sticky-actions"><button type="submit" class="btn primary">${published ? 'تحديث المنشور' : 'نشر'}</button><button type="button" class="btn" id="save-draft">${published ? 'تحويل إلى مسودة' : 'حفظ كمسودة'}</button><a class="btn ghost" href="#/${sec}">إلغاء</a></div></form>
    <section class="panel prev" aria-label="المعاينة"><h2>معاينة مباشرة</h2>
      <div><span class="seg" role="group" aria-label="نوع المعاينة"><button type="button" data-pm="card" aria-pressed="true">البطاقة</button>${sec === 'news' || sec === 'activities' ? '<button type="button" data-pm="page" aria-pressed="false">التفاصيل</button>' : ''}</span>
      <span class="seg" role="group" aria-label="حجم الشاشة"><button type="button" data-dv="desktop" aria-pressed="true">كمبيوتر</button><button type="button" data-dv="mobile" aria-pressed="false">موبايل</button></span></div>
      <div class="frame-wrap" id="fw"><iframe id="pv" title="معاينة ${S.one}" sandbox></iframe></div></section></div>
  <datalist id="act-titles">${ACTS.map(a => `<option value="${esc(a[1])}">`).join('')}</datalist>`;
  state.pmode = 'card'; state.device = 'desktop'; state.dirty = false; lastHash = location.hash;
  const form = $('#form'), upd = () => { S.fields.filter(f => f.max).forEach(f => { $('#f-' + f.k + '-c').textContent = `${$('#f-' + f.k).value.length}/${f.max}`; }); clearTimeout(state.timer); state.timer = setTimeout(() => { $('#pv').srcdoc = previewDoc(sec, readForm(S), state.pmode); }, 250); };
  form.addEventListener('input', () => { state.dirty = true; upd(); });
  form.addEventListener('change', () => { state.dirty = true; upd(); });
  $$('[data-pm]').forEach(b => b.onclick = () => { state.pmode = b.dataset.pm; $$('[data-pm]').forEach(x => x.setAttribute('aria-pressed', x === b)); upd(); });
  $$('[data-dv]').forEach(b => b.onclick = () => { $('#fw').classList.toggle('mobile', b.dataset.dv === 'mobile'); $$('[data-dv]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  const save = async status => {
    const data = readForm(S); let bad = null;
    S.fields.forEach(f => { const el = $('#f-' + f.k), er = $('#f-' + f.k + '-e'); let m = ''; if (f.req && !data[f.k]) m = 'هذا الحقل مطلوب.'; else if (f.t === 'url' && data[f.k] && !/^https?:\/\//i.test(data[f.k])) m = 'اكتب رابطًا صحيحًا يبدأ بـ https://'; er.textContent = m; el.toggleAttribute('aria-invalid', !!m); if (m) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); if (m && !bad) bad = el; });
    if (bad) { bad.focus(); toast('راجع الحقول المطلوبة.', 'bad'); return; }
    data.date = firebase.firestore.Timestamp.fromDate(new Date(data.date || Date.now()));
    if (sec === 'achievements') { data.title = `${RANK_LABEL[data.rank]} — ${data.name}`; data.summary = data.text; }
    data.status = status; data.updatedAt = nowTs();
    $$('#form button').forEach(b => b.disabled = true);
    try { id ? await db.collection(sec).doc(id).set(data, {merge:true}) : await db.collection(sec).add(data); state.dirty = false; delete state.cache[sec]; toast(status === 'published' ? 'تم النشر بنجاح.' : 'تم الحفظ كمسودة.'); location.hash = '#/' + sec; }
    catch (e) { console.error(e); toast('تعذر الحفظ. تأكد من صلاحيات الحساب وقواعد Firestore.', 'bad'); $$('#form button').forEach(b => b.disabled = false); }
  };
  form.onsubmit = e => { e.preventDefault(); save('published'); };
  $('#save-draft').onclick = () => save('draft');
  upd();
}
document.addEventListener('keydown', e => {
  if (!$('#editor') || !(e.ctrlKey || e.metaKey)) return;
  if (e.key === 's') { e.preventDefault(); $('#save-draft').click(); }
  if (e.key === 'Enter') { e.preventDefault(); $('#form').requestSubmit(); }
});

/* ---- preview: renders the real site cards inside an isolated frame ---- */
const PH = '/assets/activities/placeholder.svg';
function previewDoc(sec, raw, mode) {
  const d = {...raw}; const dt = raw.date ? new Date(raw.date) : new Date();
  d.dateLabel = isNaN(dt) ? '' : dt.toLocaleDateString('ar-EG', {day:'numeric', month:'long', year:'numeric'});
  const img = d.image ? esc(d.image) : '';
  let body = '';
  if (sec === 'news') body = mode === 'page'
    ? `<div class="news-modal__dialog" style="margin:0 auto">${img ? `<div class="news-modal__image" style="background-image:url('${img}')"></div>` : ''}<p class="news-modal__category">${esc(d.category || CATS[0])}</p><time>${esc(d.dateLabel)}</time><h3>${esc(d.title || 'عنوان الخبر')}</h3><p class="news-modal__summary">${esc(d.summary)}</p><p class="news-modal__details">${esc(d.details || d.summary)}</p></div>`
    : `<section class="news-section" style="padding:0;background:none;border:0"><div id="news-list" style="grid-template-columns:minmax(0,420px)!important;justify-content:center"><article class="news-item"><div class="news-card__media">${img ? `<img class="news-card__photo" src="${img}" alt="">` : `<div class="news-card__cover"><span>✦</span><small>${esc(d.category || CATS[0])}</small></div>`}<span class="news-card__tag">${esc(d.category || CATS[0])}</span></div><div class="news-card__body"><time>${esc(d.dateLabel)}</time><h3>${esc(d.title || 'عنوان الخبر')}</h3><p>${esc(d.summary)}</p><span class="news-card__more">اقرأ التفاصيل <b>←</b></span></div></article></div></section>`;
  else if (sec === 'activities') body = mode === 'page'
    ? `<div class="act-cover"><img src="${img || PH}" alt=""></div><h2 style="margin-top:1rem">${esc(d.title || 'اسم النشاط')}</h2><p style="margin-top:.6rem">${esc(d.summary)}</p>${d.details ? `<div class="card" style="margin-top:1rem"><p>${esc(d.details).replace(/\n/g, '<br>')}</p></div>` : ''}`
    : `<div class="act-grid" style="grid-template-columns:minmax(0,360px);justify-content:center"><a class="act-card"><img src="${img || PH}" alt=""><div><h3>${esc(d.title || 'اسم النشاط')}</h3><p>${esc(d.summary)}</p><span class="more">تفاصيل النشاط</span></div></a></div>`;
  else if (sec === 'achievements') body = `<div class="ach-grid" style="grid-template-columns:minmax(0,380px);justify-content:center"><article class="ach rank-${d.rank || 0}"><div class="rank-bar">${RANK_LABEL[d.rank] ?? 'إنجاز'}${d.level ? ` <small>· ${esc(d.level)}</small>` : ''}</div>${img ? `<img src="${img}" alt="">` : ''}<div class="ach-body"><h3>${esc(d.name || 'اسم المسابقة')}</h3><p>${esc(d.text)}</p><p class="meta" style="font-size:.85rem">${esc(actName(d.activity))}</p></div></article></div>`;
  else body = `<article class="card" style="max-width:420px;margin:auto"><h3>${esc(d.title || 'اسم المسابقة')}</h3><p>${esc(d.summary)}</p><p style="margin-top:.5rem;font-size:.9rem">${({quiz:'كويز أونلاين', event:'فعالية بتسجيل', other:'مسابقة'})[d.kind] || ''}${d.deadline ? ' · آخر موعد ' + esc(d.deadline) : ''}</p></article>`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600&family=Cairo:wght@500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/motion.css"><link rel="stylesheet" href="/css/refine.css"><style>body{padding:1.1rem;background:#f2f5fc}.news-section::before{display:none}.news-modal__dialog{max-height:none}</style></head><body>${body}</body></html>`;
}
