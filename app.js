import { SECTIONS, STYLES, pieces } from './catalog.js';

const $ = (selector) => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Pieces without a photo yet render as a colour swatch instead of an image,
// so the tool is useful before the camera comes out. Extend freely: any tag
// not listed here falls back to FALLBACK_HEX.
const COLOR_HEX = { black: '#141414', white: '#f2efe9', red: '#d81324', blue: '#2647ff', denim: '#3c5a8a', grey: '#8a8781', gray: '#8a8781', green: '#2f5d3a', pink: '#e893b8', brown: '#6b4a35', olive: '#5c5a3a', beige: '#cdbfa3', yellow: '#e8c22a', orange: '#e0621a', purple: '#7a2fd1' };
const FALLBACK_HEX = '#9a958c';
const hexToRgb = (hex) => [1, 2, 3].map(i => parseInt(hex.slice(i * 2 - 1, i * 2 + 1), 16));
const contrastColor = (hex) => {
  const [r, g, b] = hexToRgb(hex.length === 7 ? hex : '#9a958c');
  return (r * .299 + g * .587 + b * .114) > 150 ? '#141414' : '#f2efe9';
};
function paintArt(tile, piece) {
  const fill = tile.querySelector('.art-fill'), label = tile.querySelector('.art-label');
  if (piece.image) {
    fill.style.background = `center / contain no-repeat url('${piece.image}')`;
    label.hidden = true; label.textContent = '';
  } else {
    const hexes = piece.colors.map(c => COLOR_HEX[c.toLowerCase()] || FALLBACK_HEX);
    const step = 100 / hexes.length;
    fill.style.background = hexes.length > 1
      ? `linear-gradient(135deg, ${hexes.map((h, i) => `${h} ${i * step}% ${(i + 1) * step}%`).join(', ')})`
      : hexes[0];
    label.hidden = false; label.textContent = piece.name; label.style.color = contrastColor(hexes[0]);
  }
}
function dotRow(colors) {
  return colors.map(c => `<span class="dot" style="background:${COLOR_HEX[c.toLowerCase()] || FALLBACK_HEX}" title="${c}"></span>`).join('');
}

// --- filter state -----------------------------------------------------
// The colour filter is three buckets, not literal colour tags: this
// wardrobe is mostly black, so "red" or "blue" as standalone chips would
// mean almost nothing. A solo black piece is 'black'; black plus any other
// tag is 'accent'; anything without black is 'wild'.
const COLOUR_BUCKETS = [
  { id: 'black', label: 'Black' },
  { id: 'accent', label: 'Accent on black' },
  { id: 'wild', label: 'Wild colour' },
];
const bucketOf = (p) => {
  if (p.colors.length === 1 && p.colors[0] === 'black') return 'black';
  if (p.colors.includes('black')) return 'accent';
  return 'wild';
};
const filters = { style: 'all', color: 'all' };
const matches = (p) => (filters.style === 'all' || p.styles.includes(filters.style)) && (filters.color === 'all' || bucketOf(p) === filters.color);
const currentList = (sectionId) => pieces.filter(p => p.section === sectionId && matches(p));

function buildChips(container, entries, kind) {
  container.innerHTML = '';
  entries.forEach(({ id, label }) => {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'chip'; chip.dataset.value = id;
    chip.textContent = label;
    chip.setAttribute('aria-pressed', String(filters[kind] === id));
    chip.addEventListener('click', () => setFilter(kind, id));
    container.append(chip);
  });
}
buildChips($('#style-filters'), [{ id: 'all', label: 'All' }, ...STYLES], 'style');
buildChips($('#color-filters'), [{ id: 'all', label: 'All' }, ...COLOUR_BUCKETS], 'color');

function setFilter(kind, value) {
  filters[kind] = value;
  [...document.querySelectorAll(`#${kind}-filters .chip`)].forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.value === value)));
  SECTIONS.forEach(s => { if (!selected[s.id] || !matches(pieceById(selected[s.id]))) selected[s.id] = currentList(s.id)[0]?.id ?? null; });
  renderGrid(); renderCounts();
  SECTIONS.forEach((_, row) => finishTurn(row));
}

// --- wardrobe grid ------------------------------------------------------
const gallery = $('#wardrobe-grid');
const emptyState = $('#wardrobe-empty');
function renderGrid() {
  gallery.innerHTML = '';
  const visible = pieces.filter(matches);
  emptyState.hidden = visible.length > 0;
  visible.forEach((p, i) => {
    const section = SECTIONS.find(s => s.id === p.section);
    const card = document.createElement('button');
    card.className = 'piece-card';
    card.style.setProperty('--tilt', `${[-1.6, 1.1, -1.1, 1.6][i % 4]}deg`);
    card.dataset.piece = p.id;
    card.setAttribute('aria-label', `Wear ${p.name}, ${section.label}`);
    card.innerHTML = `<span class="card-art"><span class="art-fill"></span><span class="art-label"></span><span class="card-top"><span>${section.short}</span><span class="worn"></span></span></span><span class="card-caption"><strong>${p.name}</strong><span class="dots">${dotRow(p.colors)}</span></span>`;
    card.addEventListener('click', () => { choose(p.section, p.id, false); location.hash = 'flipbook'; });
    gallery.append(card);
    paintArt(card.querySelector('.card-art'), p);
    card.classList.toggle('is-selected', selected[p.section] === p.id);
  });
  $('#wardrobe-count').textContent = pieces.length;
  $('#wardrobe-summary').textContent = `THE WARDROBE / ${visible.length} OF ${pieces.length} PIECES SHOWN`;
  $('#footer-count').textContent = `${pieces.length} PIECES CATALOGUED`;
}

// --- flipbook -------------------------------------------------------
const selected = Object.fromEntries(SECTIONS.map(s => [s.id, currentList(s.id)[0]?.id ?? null]));
const pieceById = (id) => pieces.find(p => p.id === id);
const turns = new Map();
const bands = SECTIONS.map((s, row) => {
  const band = document.createElement('button');
  band.className = 'figure-band';
  band.innerHTML = `<span class="band-label">0${row + 1} / ${s.short}</span><span class="figure-art"><span class="art-fill"></span><span class="art-label"></span></span><span class="band-caption"><strong></strong><span class="dots"></span></span><span class="band-next" aria-hidden="true">&#8596;</span>`;
  band.addEventListener('click', () => { if (!band.swiped) step(s.id, 1); });
  let startX = 0, startY = 0;
  band.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; band.swiped = false; });
  band.addEventListener('pointerup', e => {
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) { band.swiped = true; step(s.id, dx < 0 ? 1 : -1); setTimeout(() => band.swiped = false, 350); }
  });
  $('#figure').append(band);
  return band;
});
const controls = SECTIONS.map((s, row) => {
  const control = document.createElement('div');
  control.className = 'outfit-control';
  control.innerHTML = `<div class="control-label"><span>0${row + 1} / ${s.label}</span><span class="piece-count"></span></div><div class="control-main"><div><h3></h3><p></p></div><div class="arrows"><button aria-label="Previous ${s.label.toLowerCase()}">&#8592;</button><button aria-label="Next ${s.label.toLowerCase()}">&#8594;</button></div></div>`;
  const arrows = control.querySelectorAll('button');
  arrows[0].addEventListener('click', () => step(s.id, -1));
  arrows[1].addEventListener('click', () => step(s.id, 1));
  $('#outfit-controls').append(control);
  return control;
});
function renderSelection(row) {
  const s = SECTIONS[row], band = bands[row], control = controls[row];
  const list = currentList(s.id);
  const p = pieceById(selected[s.id]);
  band.classList.toggle('is-empty', !p);
  if (p) {
    paintArt(band.querySelector('.figure-art'), p);
    band.querySelector('.band-caption strong').textContent = p.name;
    band.querySelector('.band-caption .dots').innerHTML = dotRow(p.colors);
    band.setAttribute('aria-label', `${s.label}: ${p.name}. Click or swipe to flip. ${list.length} option${list.length === 1 ? '' : 's'} in this filter.`);
    control.querySelector('h3').textContent = p.name;
    control.querySelector('p').textContent = p.notes || '';
    const idx = list.findIndex(x => x.id === p.id);
    control.querySelector('.piece-count').textContent = `0${idx + 1} / 0${list.length}`;
  } else {
    band.querySelector('.art-label').hidden = false;
    band.querySelector('.art-label').textContent = 'Nothing tagged here yet';
    band.querySelector('.art-fill').style.background = 'var(--line)';
    band.querySelector('.band-caption strong').textContent = 'No match';
    band.querySelector('.band-caption .dots').innerHTML = '';
    band.setAttribute('aria-label', `${s.label}: nothing matches the current filters.`);
    control.querySelector('h3').textContent = 'No match';
    control.querySelector('p').textContent = `No ${s.label.toLowerCase()} tagged for this filter yet.`;
    control.querySelector('.piece-count').textContent = '0 / 0';
  }
  const arrowButtons = control.querySelectorAll('.arrows button');
  arrowButtons.forEach(b => b.disabled = list.length < 2);
}
function finishTurn(row) {
  const turn = turns.get(row);
  if (turn) { turns.delete(row); turn.animation.cancel(); turn.leaf.remove(); }
  bands[row].style.zIndex = '';
  renderSelection(row);
}
function choose(sectionId, pieceId, animate = true, direction = 1) {
  const row = SECTIONS.findIndex(s => s.id === sectionId);
  if (row < 0) throw new Error('Unknown section.');
  finishTurn(row);
  const band = bands[row];
  const oldArt = band.querySelector('.figure-art').cloneNode(true);
  selected[sectionId] = pieceId;
  renderSelection(row);
  if (animate && !reduced.matches) {
    const leaf = document.createElement('span');
    leaf.className = 'turning-page'; leaf.setAttribute('aria-hidden', 'true');
    const front = direction > 0 ? oldArt : band.querySelector('.figure-art').cloneNode(true);
    front.className = 'page-front';
    const back = document.createElement('span'); back.className = 'page-back';
    leaf.append(front, back);
    if (direction < 0) band.querySelector('.figure-art').style.cssText = oldArt.style.cssText;
    band.style.zIndex = '10'; band.append(leaf);
    const frames = [
      { transform: 'rotateY(0deg)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
      { transform: 'rotateY(-90deg)', boxShadow: '10px 4px 18px rgba(0,0,0,.3)', offset: .5 },
      { transform: 'rotateY(-180deg)', boxShadow: '0 0 0 rgba(0,0,0,0)' },
    ];
    const animation = leaf.animate(frames, { duration: 620, easing: 'cubic-bezier(.3,.05,.2,1)', direction: direction > 0 ? 'normal' : 'reverse', fill: 'both' });
    const turn = { leaf, animation };
    turns.set(row, turn);
    animation.onfinish = () => { if (turns.get(row) === turn) finishTurn(row); };
  }
  const p = pieceById(pieceId);
  $('#announce').textContent = p ? `${SECTIONS[row].label}: ${p.name}` : `${SECTIONS[row].label}: no match`;
  renderCounts();
  syncGridSelection();
}
function syncGridSelection() {
  gallery.querySelectorAll('.piece-card').forEach(card => {
    const p = pieceById(card.dataset.piece);
    card.classList.toggle('is-selected', !!p && selected[p.section] === p.id);
  });
}
function step(sectionId, direction) {
  const list = currentList(sectionId);
  if (list.length < 2) return;
  const idx = list.findIndex(p => p.id === selected[sectionId]);
  const next = list[(idx + direction + list.length) % list.length];
  choose(sectionId, next.id, true, direction);
}
$('#shuffle').addEventListener('click', () => {
  SECTIONS.forEach(s => {
    const list = currentList(s.id);
    if (!list.length) return;
    const pick = list[Math.floor(Math.random() * list.length)];
    choose(s.id, pick.id, true);
  });
  $('#announce').textContent = 'Outfit shuffled within the current filters.';
});
function renderCounts() {
  const counts = SECTIONS.map(s => currentList(s.id).length);
  const combos = counts.reduce((n, c) => n * c, 1);
  $('#look-count').textContent = counts.some(c => c === 0) ? '0' : String(combos);
  $('#look-scope').textContent = filters.style === 'all' && filters.color === 'all' ? 'POSSIBLE, NO FILTER' : 'POSSIBLE WITH THIS FILTER';
  const filled = SECTIONS.filter(s => selected[s.id]).length;
  $('#outfit-count').textContent = `${filled} / ${SECTIONS.length}`;
  $('#specimen').textContent = [filters.style === 'all' ? null : STYLES.find(s => s.id === filters.style)?.label, filters.color === 'all' ? null : COLOUR_BUCKETS.find(b => b.id === filters.color)?.label].filter(Boolean).join(' · ').toUpperCase() || 'ANY MOOD';
}

// --- routing -------------------------------------------------------
const routeOf = () => location.hash === '#flipbook' ? 'flipbook' : 'wardrobe';
function showRoute() {
  const route = routeOf();
  $('#wardrobe').hidden = route !== 'wardrobe';
  $('#flipbook').hidden = route !== 'flipbook';
  document.querySelectorAll('[data-route]').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
    if (el.dataset.route === route) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  document.title = route === 'wardrobe' ? 'DAILY WARDROBE: the wardrobe' : 'DAILY WARDROBE: the flipbook';
  // A direct load or reload on a #flipbook URL makes the browser jump straight
  // to that section natively, after this script's own scrollTo would run.
  // Deferring past a paint wins that race.
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' })));
}
addEventListener('hashchange', showRoute);

SECTIONS.forEach((_, row) => finishTurn(row));
renderGrid(); renderCounts(); showRoute();
