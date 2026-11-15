(() => {
'use strict';
const PACK = window.PACK;
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (v === true) n.setAttribute(k, ''); else if (v !== false && v != null) n.setAttribute(k, v); } kids.flat().forEach(c => n.append(c instanceof Node ? c : document.createTextNode(c))); return n; };
const fmt = (n, d = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Libellés, unités et habillage de chaque jeu de données */
const UI = {
  graine: {
    hash: 'graines', name: 'Graines de blé', file: 'wheat_seeds_dataset.csv', blurb: 'Petite ou grosse graine ?', noun: 'graine', algo: 'CAH',
    title: "Le groupe d'une graine de blé", out: 'Groupe estimé', predCol: 'groupe_predit',
    glyph: '<svg class="gl" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 31V13"/><path d="M17 13c-4 0-5-3-5-6 4 0 5 3 5 6z"/><path d="M17 13c4 0 5-3 5-6-4 0-5 3-5 6z"/><path d="M17 20c-4 0-5-3-5-6M17 20c4 0 5-3 5-6"/><path d="M17 27c-4 0-5-3-5-6M17 27c4 0 5-3 5-6"/></svg>',
    fields: { 'area A': { label: 'Surface', step: 0.1, dec: 2 }, perimeter: { label: 'Périmètre', step: 0.1, dec: 2 }, compactness: { label: 'Compacité', step: 0.005, dec: 4 }, 'length of kernel': { label: 'Longueur du grain', step: 0.05, dec: 3 }, 'width of kernel': { label: 'Largeur du grain', step: 0.05, dec: 3 }, 'asymmetry coefficient': { label: "Coefficient d'asymétrie", step: 0.1, dec: 3 }, 'length of kernel groove': { label: 'Longueur du sillon', step: 0.05, dec: 3 } },
    order: ['area A', 'perimeter', 'compactness', 'length of kernel', 'width of kernel', 'asymmetry coefficient', 'length of kernel groove'],
    cap: ''
  },
  client: {
    hash: 'clients-telecom', name: 'Clients télécom', file: 'Customer_dataset.csv', blurb: 'Client fidèle ou non ?', noun: 'client', algo: 'CAH',
    title: "Le groupe d'un client télécom", out: 'Groupe estimé', predCol: 'groupe_predit',
    glyph: '<svg class="gl" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="16" height="28" rx="4"/><path d="M15 27h4"/><circle cx="17" cy="14" r="3"/><path d="M12 21c1-3 9-3 10 0"/></svg>',
    fields: { 'Call  Failure': { label: 'Appels échoués', step: 1, dec: 0 }, Complains: { label: 'Plaintes', step: 1, dec: 0 }, 'Subscription  Length': { label: "Durée de l'abonnement", step: 1, dec: 0 }, 'Charge  Amount': { label: 'Montant facturé', step: 1, dec: 0 }, 'Seconds of Use': { label: "Temps d'utilisation", unit: 's', step: 100, dec: 0 }, 'Frequency of use': { label: "Fréquence d'utilisation", step: 5, dec: 0 }, 'Frequency of SMS': { label: 'Fréquence de SMS', step: 5, dec: 0 }, 'Distinct Called Numbers': { label: 'Numéros distincts appelés', step: 1, dec: 0 }, 'Age Group': { label: "Tranche d'âge (code)", step: 1, dec: 0 }, Status: { label: 'Statut (code)', step: 1, dec: 0 }, Age: { label: 'Âge', unit: 'ans', step: 1, dec: 0 }, 'Customer Value': { label: 'Valeur client', step: 10, dec: 2 } },
    order: ['Seconds of Use', 'Frequency of use', 'Frequency of SMS', 'Distinct Called Numbers', 'Call  Failure', 'Complains', 'Subscription  Length', 'Charge  Amount', 'Age', 'Age Group', 'Status', 'Customer Value'],
    cap: ''
  },
  heart: {
    hash: 'patients', name: 'Patients cardiaques', file: 'heart_failure_clinical_records_dataset.csv', blurb: 'Quel niveau de risque ?', noun: 'patient', algo: 'K-means',
    title: "Le groupe d'un patient", out: 'Groupe estimé', predCol: 'groupe_predit',
    glyph: '<svg class="gl" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 29S4 21 4 12.500A6.500 6.500 0 0 1 17 9a6.500 6.500 0 0 1 13 3.500C30 21 17 29 17 29z"/><path d="M8 17h5l2-4 3 7 2-3h6"/></svg>',
    fields: { age: { label: 'Âge', unit: 'ans', step: 1, dec: 1 }, creatinine_phosphokinase: { label: 'CPK (enzyme)', step: 50, dec: 0 }, ejection_fraction: { label: "Fraction d'éjection", unit: '%', step: 1, dec: 0 }, platelets: { label: 'Plaquettes', step: 10000, dec: 0 }, serum_creatinine: { label: 'Créatinine sérique', step: 0.1, dec: 2 }, serum_sodium: { label: 'Sodium sérique', step: 1, dec: 0 } },
    order: ['age', 'ejection_fraction', 'serum_creatinine', 'serum_sodium', 'creatinine_phosphokinase', 'platelets'],
    cap: "Outil pédagogique : ce n'est pas un avis médical."
  },
  wholesale: {
    hash: 'grossiste', name: 'Clients grossiste', file: 'Wholesale_customers_data.csv', blurb: 'Quel profil d\'achat ?', noun: 'client', algo: 'K-means',
    title: "Le groupe d'un client grossiste", out: 'Groupe estimé', predCol: 'groupe_predit',
    glyph: '<svg class="gl" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14h24l-2.500 14h-19z"/><path d="M11 14l4-8M23 14l-4-8"/><path d="M13 19v5M17 19v5M21 19v5"/></svg>',
    fields: { Fresh: { label: 'Produits frais', unit: 'unités', step: 1000, dec: 0 }, Milk: { label: 'Laitiers', unit: 'unités', step: 500, dec: 0 }, Grocery: { label: 'Épicerie', unit: 'unités', step: 500, dec: 0 }, Frozen: { label: 'Surgelés', unit: 'unités', step: 500, dec: 0 }, Detergents_Paper: { label: 'Détergents et papier', unit: 'unités', step: 250, dec: 0 }, Delicassen: { label: 'Charcuterie et traiteur', unit: 'unités', step: 250, dec: 0 } },
    order: ['Fresh', 'Milk', 'Grocery', 'Frozen', 'Detergents_Paper', 'Delicassen'],
    cap: ''
  }
};
const KEYS = Object.keys(UI);
const optLabel = (f, o) => o.label;   // valeurs telles qu'elles sont dans le jeu de données (Petrol, Dealer, Manual…)

/* État */
const S = { mod: 'graine', mode: 'single', vals: {}, batch: {} };
const models = {};
const getModel = (k) => PACK.meta[k];
function defaults(k) {
  const m = PACK.meta[k], v = {};
  m.feats.forEach((f, i) => { const raw = m.first[i]; v[f.name] = f.type === 'num' ? Number(raw) : (f.alias[strip(raw).replace(/\s*,\s*/g, ',')] ?? f.alias[strip(raw)] ?? f.options[0].code); });
  return v;
}
KEYS.forEach(k => S.vals[k] = defaults(k));

/* Thème clair / sombre */
/* Thème clair / sombre */
const paintTheme = () => $('#themeBtn').setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
$('#themeBtn').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; paintTheme();
  try { localStorage.setItem('groupes-theme', next); } catch (e) { /* stockage indisponible */ }
});
paintTheme();

/* Toast */
let tt; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800); }

/* Étals */
function renderStalls() {
  const host = $('#stalls'); host.replaceChildren();
  KEYS.forEach(k => {
    const u = UI[k], b = el('button', { class: 'stall', role: 'tab', id: 'st-' + k, 'aria-selected': String(k === S.mod), onclick: () => go(k) });
    b.innerHTML = u.glyph; b.append(el('h2', {}, u.name), el('span', { class: 'file' }, u.file));
    host.append(b);
  });
}

/* Champs */
function numField(f, u, k) {
  const fu = UI[k].fields[f.name], dec = fu.dec ?? (f.integer ? 0 : 2), step = fu.step ?? 1;
  const input = el('input', { id: 'f-' + f.name, type: 'text', inputmode: 'decimal' });
  const show = () => { const v = S.vals[k][f.name]; input.value = v == null || Number.isNaN(v) ? '' : fmt(v, dec); };
  const set = (v) => { S.vals[k][f.name] = v; touch(); };
  input.addEventListener('input', () => { const s = input.value.replace(/\s/g, '').replace(',', '.'); set(s === '' || isNaN(Number(s)) ? null : Number(s)); });
  input.addEventListener('blur', show);
  const nudge = (d) => { const cur = S.vals[k][f.name] ?? f.median; const nv = Math.max(0, Math.round((cur + d * step) * 10000) / 10000); set(nv); show(); };
  const wrap = el('div', { class: 'num' }, input, fu.unit ? el('span', { class: 'u' }, fu.unit) : '', el('button', { type: 'button', 'aria-label': 'Diminuer', onclick: () => nudge(-1) }, '−'), el('button', { type: 'button', 'aria-label': 'Augmenter', onclick: () => nudge(1) }, '+'));
  show();
  return [wrap];
}
function radioField(f, k) {
  const g = el('div', { class: 'radios', role: 'radiogroup', 'aria-labelledby': 'l-' + f.name });
  const paint = () => [...g.children].forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.code) === S.vals[k][f.name])));
  f.options.forEach(o => g.append(el('button', { type: 'button', role: 'radio', 'data-code': o.code, onclick: () => { S.vals[k][f.name] = o.code; paint(); touch(); } }, optLabel(f, o))));
  paint(); return [g];
}
function comboField(f, k) {
  const id = 'f-' + f.name, list = el('ul', { role: 'listbox', id: id + '-l', hidden: true }), input = el('input', { id, type: 'text', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': id + '-l', 'aria-autocomplete': 'list', spellcheck: 'false' });
  const byCode = new Map(f.options.map(o => [o.code, o]));
  let act = -1, shown = [];
  const cur = () => byCode.get(S.vals[k][f.name]);
  const label = () => { const o = cur(); input.value = o ? optLabel(f, o) : ''; };
  const build = (q) => {
    const s = strip(q || ''); shown = f.options.filter(o => !s || strip(optLabel(f, o)).includes(s)); list.replaceChildren();
    if (!shown.length) list.append(el('li', { class: 'empty' }, 'Aucun résultat'));
    shown.forEach((o, i) => list.append(el('li', { role: 'option', class: o.code === S.vals[k][f.name] ? 'on' : '', 'aria-selected': String(i === act), onmousedown: (e) => { e.preventDefault(); pick(o); } }, el('span', {}, optLabel(f, o)), el('small', {}, fmt(o.n) + (o.n > 1 ? ' ' + UI[k].noun + 's' : ' ' + UI[k].noun)))));
  };
  const open = (q) => {
    act = -1; build(q); list.classList.remove('up'); list.hidden = false; input.setAttribute('aria-expanded', 'true');
    // Pas assez de place sous le champ : la liste s'ouvre vers le haut, sinon on fait défiler la page pour la montrer en entier
    const r = list.getBoundingClientRect();
    if (r.bottom > innerHeight - 8) { if (input.getBoundingClientRect().top > r.height + 16) list.classList.add('up'); else list.scrollIntoView({ block: 'nearest' }); }
    const on = list.querySelector('.on'); if (on && !q) on.scrollIntoView({ block: 'nearest' });
  };
  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); label(); };
  const pick = (o) => { S.vals[k][f.name] = o.code; close(); touch(); };
  const mark = () => { [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === act))); list.children[act]?.scrollIntoView({ block: 'nearest' }); };
  input.addEventListener('focus', () => { input.select(); open(''); });
  input.addEventListener('click', () => { if (list.hidden) open(''); });
  input.addEventListener('input', () => open(input.value));
  input.addEventListener('blur', close);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(''); act = Math.min(shown.length - 1, act + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[act >= 0 ? act : 0] && !list.hidden) pick(shown[act >= 0 ? act : 0]); }
    else if (e.key === 'Escape') { close(); }
  });
  label();
  return [el('div', { class: 'combo' }, input, list)];
}
function renderForm() {
  const k = S.mod, u = UI[k], m = PACK.meta[k], form = $('#fields'); form.replaceChildren();
  u.order.forEach(name => {
    const f = m.feats.find(x => x.name === name), fu = u.fields[name];
    const body = f.type === 'num' ? numField(f, u, k) : (f.options.length <= 4 ? radioField(f, k) : comboField(f, k));
    form.append(el('div', { class: 'field' + (fu.wide ? ' wide' : '') }, el('div', { class: 'lab', id: 'l-' + name }, el('label', { for: 'f-' + name }, fu.label)), ...body));
  });
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('viewBox', '0 0 20 20'); arrow.setAttribute('width', '18'); arrow.setAttribute('height', '18'); arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = '<path d="M4 10h11m0 0-4.500-4.500M15 10l-4.500 4.500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  form.append(el('button', { class: 'cta', type: 'submit' }, el('span', {}, 'Prédire'), arrow));
}

/* Carte du groupe : les individus du jeu de données sont projetés en 2 dimensions (ACP), les centres des groupes sont des anneaux, la fiche saisie est l'épingle */
const SVG = 'http://www.w3.org/2000/svg';
const gcol = (i) => `var(--g${i % 3})`;
function mapSvg(k, r) {
  const M = PACK.meta[k], mp = M.map, W = 300, H = 190, pad = 16;
  const all = mp.pts.map(p => [p[0], p[1]]).concat(mp.cen2);
  let x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), y1 = Math.max(...all.map(p => p[1]));
  const sc = Math.min((W - 2 * pad) / Math.max(x1 - x0, 1e-9), (H - 2 * pad) / Math.max(y1 - y0, 1e-9));
  const ox = (W - sc * (x1 - x0)) / 2 - sc * x0, oy = (H + sc * (y1 - y0)) / 2 + sc * y0;
  const X = (v) => ox + sc * v, Y = (v) => oy - sc * v, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const svg = document.createElementNS(SVG, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'gmap'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Carte des groupes en 2 dimensions : la fiche saisie est rattachée à ' + r.label);
  const px = clamp(X(r.xy[0]), 8, W - 8), py = clamp(Y(r.xy[1]), 8, H - 8), out = px !== X(r.xy[0]) || py !== Y(r.xy[1]);
  const cx = X(mp.cen2[r.index][0]), cy = Y(mp.cen2[r.index][1]);
  svg.innerHTML = '<rect x="0.750" y="0.750" width="298.500" height="188.500" rx="12" class="gm-bg"/>' +
    mp.pts.map(p => `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2.300" fill="${gcol(p[2])}" opacity=".5"/>`).join('') +
    `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" class="gm-link"/>` +
    mp.cen2.map((c, i) => `<circle cx="${X(c[0]).toFixed(1)}" cy="${Y(c[1]).toFixed(1)}" r="9" class="gm-cen" stroke="${gcol(i)}"/><circle cx="${X(c[0]).toFixed(1)}" cy="${Y(c[1]).toFixed(1)}" r="3.500" fill="${gcol(i)}"/>`).join('') +
    `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="11" class="gm-pulse" stroke="${gcol(r.index)}"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="6" class="gm-pin${out ? ' out' : ''}" stroke="${gcol(r.index)}"/>`;
  return svg;
}
let lastKey = '', shownVal = 0, raf, countFrom = null, hasResult = false;
function countTo(node, to, render) {
  cancelAnimationFrame(raf);
  if (reduce) { node.textContent = render(to); shownVal = to; return; }
  const from = shownVal, t0 = performance.now(), dur = 380;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); node.textContent = render(from + (to - from) * e); shownVal = from + (to - from) * e; if (p < 1) raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
}
function inputsOf(k) {
  const m = PACK.meta[k], raw = [], warn = [];
  for (const f of m.feats) { const v = S.vals[k][f.name]; if (v == null || Number.isNaN(v)) return { raw: null }; raw.push(v); if (f.type === 'num' && (v < f.min || v > f.max)) warn.push(UI[k].fields[f.name].label); }
  return { raw, warn };
}
/* Carte vierge : avant le premier clic sur « Prédire » */
function showEmpty() {
  const u = UI[S.mod];
  $('#tagHost').replaceChildren(el('div', { class: 'res', id: 'tag' }, el('p', { class: 'res-k' }, u.out), el('p', { class: 'res-empty' }, 'Renseignez la fiche, puis cliquez sur Prédire.')));
  $('#tagCap').textContent = u.cap || '';
  hasResult = false; lastKey = '';
}
/* La fiche a changé après une prédiction : on grise la carte jusqu'au prochain clic */
function touch() {
  if (!hasResult) return;
  $('#tag')?.classList.add('stale');
}
function compute() {
  const k = S.mod, u = UI[k], host = $('#tagHost'), { raw, warn } = inputsOf(k);
  $('#tagCap').textContent = u.cap || ''; hasResult = false;
  const card = el('div', { class: 'res', id: 'tag' });
  if (!raw) {
    card.append(el('p', { class: 'res-k' }, u.out), el('p', { class: 'res-empty' }, 'Complétez tous les champs pour obtenir un résultat.'));
    host.replaceChildren(card); lastKey = ''; return;
  }
  const r = Engine.predict(getModel(k), raw), M = PACK.meta[k];
  card.append(el('p', { class: 'res-k' }, u.out), el('p', { class: 'res-v' }, el('i', { class: 'dot', style: `background:${gcol(r.index)}` }), r.label), mapSvg(k, r),
  );
  const bars = el('div', { class: 'bars' });
  M.groups.map((g, i) => [g.name, r.prox[i], i, r.dist[i]]).sort((a, b) => b[1] - a[1]).forEach(([c, p, i, d]) => bars.append(el('div', { class: 'bar' + (i === r.index ? ' top' : ''), style: `--w:${(p * 100).toFixed(1)}%;--c:${gcol(i)}` }, el('b', {}, el('i', { class: 'dot', style: `background:${gcol(i)}` }), c), el('span', {}, 'distance ' + fmt(d, 3)), el('i', { class: 'trk2' }))));
  card.append(bars);
  if (warn.length) card.append(el('p', { class: 'res-warn' }, 'Valeur hors de la plage connue : ' + warn.join(', ') + '. Résultat peu fiable.'));
  const tag = card; host.replaceChildren(tag); hasResult = true; lastKey = k;
  if (!reduce) tag.classList.add('swing');
  lastKey = k;
}

/* Fichier CSV */
function parseCSV(text) {
  text = text.replace(/^﻿/, ''); const first = text.split(/\r?\n/, 1)[0], sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true; else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = []; }
    else cell += c; }
  row.push(cell); if (row.some(x => x.trim() !== '')) rows.push(row);
  return { rows, sep };
}
const csvCell = (v) => { v = String(v ?? ''); return /[",\n\r;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
function runBatch(k, text, name, size) {
  const u = UI[k], m = PACK.meta[k], { rows, sep } = parseCSV(text);
  if (rows.length < 2) { S.batch[k] = { size, name, error: 'Le fichier est vide ou ne contient que des en-têtes.' }; renderBatch(); return; }
  const head = rows[0].map(h => h.trim()), idx = {}, missing = [], sq = (t) => strip(t).replace(/\s+/g, ' ');
  m.feats.forEach(f => { const j = head.findIndex(h => sq(h) === sq(f.name)); if (j < 0) missing.push(f.name); else idx[f.name] = j; });
  if (missing.length) { S.batch[k] = { size, error: `Colonnes manquantes : ${missing.join(', ')}. Colonnes attendues : ${m.feats.map(f => f.name).join(', ')}.`, name }; renderBatch(); return; }
  const model = getModel(k), out = []; let bad = 0;
  rows.slice(1).forEach((r, n) => {
    const raw = []; let err = '';
    for (const f of m.feats) { const s = (r[idx[f.name]] ?? '').trim();
      if (f.type === 'num') { const t = s.replace(/\s/g, ''), v = Number(sep === ';' ? t.replace(',', '.') : t); if (s === '' || Number.isNaN(v)) { err = `${f.name} : nombre attendu, reçu « ${s} »`; break; } raw.push(v); }
      else { const c = f.alias[strip(s).replace(/\s*,\s*/g, ',')] ?? f.alias[strip(s)]; if (c === undefined) { err = `${f.name} : valeur inconnue « ${s} »`; break; } raw.push(c); } }
    if (err) { bad++; out.push({ r, err }); } else out.push({ r, res: Engine.predict(model, raw) });
  });
  S.batch[k] = { head, idx, out, bad, name, sep, size: size ?? text.length };
  renderBatch();
  toast(`Fichier chargé : ${fmt(out.length)} ligne${out.length > 1 ? 's' : ''} lues, ${fmt(out.length - bad)} estimée${out.length - bad > 1 ? 's' : ''}.`);
}
function predText(k, res) {
  const u = UI[k]; if (res.label !== undefined) return res.label;
  const v = u.round ? Math.round(res.value / u.round) * u.round : res.value; return fmt(v, u.dec ?? 0) + ' ' + u.unit;
}
function resultsCSV(k) {
  const b = S.batch[k], u = UI[k], isC = true;
  const extra = isC ? [u.predCol, 'distance_au_centre'] : [u.predCol, 'fourchette_basse', 'fourchette_haute'];
  const lines = [[...b.head, ...extra].map(csvCell).join(',')];
  b.out.forEach(o => { const base = b.head.map((_, i) => o.r[i] ?? '');
    if (o.err) lines.push([...base, 'erreur : ' + o.err, ...extra.slice(1).map(() => '')].map(csvCell).join(','));
    else if (isC) lines.push([...base, o.res.label, o.res.dist[o.res.index].toFixed(4)].map(csvCell).join(','));
    else { const rd = (v) => u.round ? Math.round(v / u.round) * u.round : Math.round(v * 100) / 100; lines.push([...base, rd(o.res.value), rd(o.res.low), rd(o.res.high)].map(csvCell).join(',')); } });
  return '﻿' + lines.join('\r\n');
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  try { const t = el('textarea', { style: 'position:fixed;left:-9999px' }); t.value = text; document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; } catch (e) { return false; }
}
async function save(filename, data) {
  try {
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' })), a = el('a', { href: url, download: filename });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Téléchargement lancé : ' + filename);
  } catch (e) { toast('Téléchargement impossible ici. Utilisez « Copier le CSV ».'); }
}
function renderBatch() {
  const k = S.mod, u = UI[k], m = PACK.meta[k], host = $('#batch'), b = S.batch[k]; host.replaceChildren();
  const loaded = !!b && !b.error, failed = !!b && !!b.error;
  const fileIn = el('input', { type: 'file', accept: '.csv,text/csv', hidden: true, id: 'file' });
  const readFile = (f) => { if (f) f.text().then(t => runBatch(k, t, f.name, f.size)); };
  fileIn.addEventListener('change', () => { readFile(fileIn.files[0]); fileIn.value = ''; });
  const check = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const mark = el('div', { class: 'okmark' }); mark.innerHTML = check;
  const sizeTxt = b && b.size != null ? (b.size < 1024 ? b.size + ' o' : fmt(b.size / 1024, 1) + ' Ko') : '';
  const drop = el('div', { class: 'drop' + (loaded ? ' ok' : '') + (failed ? ' bad' : ''), id: 'drop' },
    loaded ? mark : '',
    el('h4', {}, loaded ? 'Fichier chargé' : failed ? 'Fichier non utilisable' : 'Déposez un fichier CSV ici'),
    loaded ? el('p', { class: 'fname' }, `${b.name} · ${fmt(b.out.length)} ligne${b.out.length > 1 ? 's' : ''} · ${sizeTxt}`)
           : (failed ? el('p', {}, b.error) : ''),
    el('div', { class: 'cols' }, m.feats.map(f => el('code', {}, f.name))),
    el('div', { class: 'btns' },
      el('button', { class: 'btn', type: 'button', onclick: () => fileIn.click() }, loaded ? 'Changer de fichier' : 'Choisir un fichier'),
      el('button', { class: 'btn ghost', type: 'button', onclick: () => runBatch(k, m.sample, 'exemple_' + u.file, m.sample.length) }, 'Essayer avec 5 lignes d\'exemple')), fileIn);
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => readFile(e.dataTransfer.files[0]));
  host.append(drop);
  if (!b) return;
  if (b.error) return;
  const ok = b.out.length - b.bad, cols = m.feats.map(f => f.name);
  host.append(el('div', { class: 'res-head' }, el('p', {}, `${fmt(ok)} estimation${ok > 1 ? 's' : ''}`, el('small', {}, ` · ${b.name}` + (b.bad ? ` · ${b.bad} ligne${b.bad > 1 ? 's' : ''} à corriger` : ''))),
    el('div', { class: 'btns' }, el('button', { class: 'btn', type: 'button', onclick: () => save(`xaalis_predictions_${u.file}`, resultsCSV(k)) }, 'Télécharger les résultats (CSV)'),
      el('button', { class: 'btn ghost', type: 'button', onclick: async () => toast((await copyText(resultsCSV(k).replace(/^\uFEFF/, ''))) ? 'CSV copié : collez-le dans un fichier .csv ou dans Excel.' : 'Copie impossible.') }, 'Copier le CSV'))));
  const thead = el('thead', {}, el('tr', {}, cols.map(c => el('th', {}, c)), el('th', {}, u.predCol)));
  const tb = el('tbody'); b.out.slice(0, 300).forEach(o => { const tr = el('tr', {}, cols.map(c => el('td', {}, o.r[b.idx[c]] ?? ''))); if (o.err) tr.append(el('td', { class: 'err' }, o.err)); else tr.append(el('td', { class: 'pred' }, predText(k, o.res))); tb.append(tr); });
  host.append(el('div', { class: 'tw', tabindex: '0', role: 'region', 'aria-label': 'Résultats' }, el('table', {}, thead, tb)));
  if (b.out.length > 300) host.append(el('p', { class: 'hint' }, `Aperçu des 300 premières lignes sur ${fmt(b.out.length)}. Le fichier téléchargé contient tout.`));
}

/* À propos : tous les chiffres viennent du pack exporté et recalculé à partir des notebooks et des CSV */
function renderAbout() {
  const k = S.mod, u = UI[k], m = PACK.meta[k], d = $('#about'); d.replaceChildren();
  const item = (t, v, ...subs) => el('div', {}, el('dt', {}, t), el('dd', {}, v, ...subs.filter(Boolean).map(x => el('small', {}, x))));
  const st = m.stats, pct = fmt(st.agree * 100, st.agree === 1 ? 0 : 2);
  d.append(item('Modèle déployé', st.algo, st.detail, `Un nouvel individu est rattaché au centre le plus proche (${pct} % d'accord avec le modèle du notebook).`),
    item('Données', fmt(st.rows) + ' ' + u.noun + 's', u.file),
    item('Variables', String(m.feats.length), m.feats.map(f => u.fields[f.name].label).join(', ')),
    item('Silhouette', fmt(st.sil, 3), 'plus elle est proche de 1, mieux les groupes sont séparés'),
    item('Taille des groupes', st.sizes.map(n => fmt(n)).join(' / '), m.groups.map(g => g.name).join(' / ')));
}

/* Navigation */
function go(k, fromHash) {
  S.mod = k; if (!fromHash && location.hash !== '#' + UI[k].hash) history.replaceState(null, '', '#' + UI[k].hash);
  KEYS.forEach(x => $('#st-' + x)?.setAttribute('aria-selected', String(x === k)));
  $('#wsTitle').textContent = UI[k].title; lastKey = ''; shownVal = 0;
  renderForm(); renderBatch(); renderAbout(); showEmpty(); setMode(S.mode);
}
function setMode(m) {
  S.mode = m; $('#single').hidden = m !== 'single'; $('#batch').hidden = m !== 'batch';
  $('#m-single').setAttribute('aria-selected', String(m === 'single')); $('#m-batch').setAttribute('aria-selected', String(m === 'batch'));
  document.body.classList.toggle('batchmode', m === 'batch');
  if (m === 'batch') renderBatch();
}
$('#fields').addEventListener('submit', (e) => { e.preventDefault(); compute(); });
$('#m-single').addEventListener('click', () => setMode('single'));
$('#m-batch').addEventListener('click', () => setMode('batch'));
const fromHash = () => { const h = location.hash.slice(1), k = KEYS.find(x => UI[x].hash === h); return k; };
addEventListener('hashchange', () => { const k = fromHash(); if (k && k !== S.mod) go(k, true); });
renderStalls(); go(fromHash() || 'graine', true);
})();
