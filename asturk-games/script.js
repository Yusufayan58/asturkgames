// ASTÜRK GAMES — script.js
// games.js'u okur, sol menüyü ve içerik bölümlerini (anasayfa / kategori / arama) render eder.

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const scrim = document.getElementById('scrim');
const searchInput = document.getElementById('searchInput');
const categoryNav = document.getElementById('categoryNav');
const sectionsEl = document.getElementById('sections');
const emptyStateEl = document.getElementById('emptyState');
const emptyTextEl = document.getElementById('emptyText');
const heroSection = document.getElementById('heroSection');
const heroMedia = document.getElementById('heroMedia');
const heroTitle = document.getElementById('heroTitle');
const heroTag = document.getElementById('heroTag');
const heroPlayBtn = document.getElementById('heroPlayBtn');

const layoutShell = document.getElementById('layoutShell');
const viewLibrary = document.getElementById('view-library');
const viewPlayer = document.getElementById('view-player');
const gameFrame = document.getElementById('gameFrame');
const playerTitle = document.getElementById('playerTitle');
const playerPath = document.getElementById('playerPath');
const backBtn = document.getElementById('backBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let allGames = [];
let currentNav = 'home'; // home | new | popular | all | category:<id> | search

// Bilinen kategoriler için ikon + etiket. games.js'da geçen ama burada olmayan
// kategoriler otomatik olarak 🎮 ikonu ve baş harfi büyütülmüş adla gösterilir.
const CATEGORY_META = {
  aksiyon:  { label: 'Aksiyon',  icon: '🎯' },
  macera:   { label: 'Macera',   icon: '🗺️' },
  bulmaca:  { label: 'Bulmaca',  icon: '🧩' },
  spor:     { label: 'Spor',     icon: '⚽' },
  yaris:    { label: 'Yarış',    icon: '🏎️' },
  strateji: { label: 'Strateji', icon: '♟️' },
  arcade:   { label: 'Arcade',   icon: '👾' },
  platform: { label: 'Platform', icon: '🧱' },
  korku:    { label: 'Korku',    icon: '👻' },
  ikoyunculu:{ label: 'İki Kişilik', icon: '🎮' },
};
function categoryMeta(id) {
  return CATEGORY_META[id] || { label: id.charAt(0).toUpperCase() + id.slice(1), icon: '🎮' };
}

const ACCENTS = ['#ffb020', '#ff3d81', '#45e0d0', '#9b7bff'];
function accentFor(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % ACCENTS.length;
  return ACCENTS[Math.abs(h)];
}
function initials(title) {
  return title.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function gamePath(game, file) {
  return `games/${game.folder}/${file}`;
}
function coverUrl(game) {
  return game.cover ? gamePath(game, game.cover) : '';
}

/* ---------------- kart oluşturma ---------------- */
function makeCard(game) {
  const accent = accentFor(game.id);
  const card = document.createElement('article');
  card.className = 'cart';
  card.style.setProperty('--accent', accent);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${game.title} oyununu oyna`);

  const coverHtml = game.cover
    ? `<img src="${coverUrl(game)}" alt="${game.title} kapak görseli" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'fallback-initials\\'>${initials(game.title)}</span>'">`
    : `<span class="fallback-initials">${initials(game.title)}</span>`;

  card.innerHTML = `
    <div class="cart-cover">${coverHtml}</div>
    <div class="cart-label">
      <span class="cart-title">${game.title}</span>
      <span class="cart-tag">${game.tag || 'YEREL KASET'}</span>
    </div>
    <div class="cart-footer">
      <span class="cart-play">
        <svg viewBox="0 0 24 24" fill="none"><path d="M7 4v16l14-8L7 4Z" fill="currentColor"/></svg>
        OYNA
      </span>
    </div>
  `;

  const open = () => playGame(game);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  return card;
}

/* ---------------- yardımcı seçiciler ---------------- */
function gamesByCategory(catId) {
  return allGames.filter(g => Array.isArray(g.categories) && g.categories.includes(catId));
}
function newGames() {
  const flagged = allGames.filter(g => g.isNew);
  return flagged.length ? flagged : [...allGames].slice(-8).reverse();
}
function popularGames() {
  const flagged = allGames.filter(g => g.popular);
  return flagged.length ? flagged : allGames.slice(0, 8);
}
function featuredGame() {
  return allGames.find(g => g.featured) || allGames[0] || null;
}

/* ---------------- sol menüyü doldur ---------------- */
function buildCategoryNav() {
  const counts = {};
  allGames.forEach(g => (g.categories || []).forEach(c => (counts[c] = (counts[c] || 0) + 1)));
  const ids = Object.keys(counts).sort((a, b) => categoryMeta(a).label.localeCompare(categoryMeta(b).label, 'tr'));

  categoryNav.innerHTML = '';
  if (ids.length === 0) {
    categoryNav.innerHTML = `<li class="nav-heading" style="margin:4px 12px; opacity:.6;">Henüz kategori yok</li>`;
    return;
  }
  for (const id of ids) {
    const meta = categoryMeta(id);
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" class="nav-link" data-nav="category:${id}" style="--accent-nav:${accentFor(id)}">
        <span class="nav-icon">${meta.icon}</span>${meta.label}
        <span class="nav-count">${counts[id]}</span>
      </a>`;
    categoryNav.appendChild(li);
  }
}

function refreshActiveNav() {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === currentNav);
  });
}

/* ---------------- bölüm çizimleri ---------------- */
function renderRow(title, games, opts = {}) {
  if (!games.length) return null;
  const section = document.createElement('section');
  section.className = 'row-section';
  section.innerHTML = `<div class="row-head">
      <h2 class="row-title">${title} <span class="count-pill">${games.length}</span></h2>
    </div>`;
  const scroll = document.createElement('div');
  scroll.className = 'row-scroll';
  games.forEach(g => scroll.appendChild(makeCard(g)));
  section.appendChild(scroll);
  return section;
}

function renderGrid(title, games) {
  const wrap = document.createElement('section');
  wrap.className = 'row-section';
  const heading = title ? `<h2 class="section-heading">${title} <span class="count-pill">${games.length}</span></h2>` : '';
  wrap.innerHTML = heading;
  const grid = document.createElement('div');
  grid.className = 'grid';
  games.forEach(g => grid.appendChild(makeCard(g)));
  wrap.appendChild(grid);
  return wrap;
}

function showEmpty(text) {
  sectionsEl.innerHTML = '';
  heroSection.hidden = true;
  emptyStateEl.hidden = false;
  emptyTextEl.innerHTML = text;
}

function renderView() {
  sectionsEl.innerHTML = '';
  emptyStateEl.hidden = true;
  heroSection.hidden = true;

  if (allGames.length === 0) {
    showEmpty('<strong>Raf boş.</strong> <code>games/</code> klasörüne bir oyun ekleyip <code>games.js</code>’a kaydını düşünce burada belirir.');
    return;
  }

  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const results = allGames.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.tag || '').toLowerCase().includes(q) ||
      (g.categories || []).some(c => c.toLowerCase().includes(q) || categoryMeta(c).label.toLowerCase().includes(q))
    );
    currentNav = 'search';
    refreshActiveNav();
    if (results.length === 0) {
      showEmpty(`<strong>"${searchInput.value}"</strong> için sonuç bulunamadı.`);
    } else {
      sectionsEl.appendChild(renderGrid(`“${searchInput.value}” için sonuçlar`, results));
    }
    return;
  }

  refreshActiveNav();

  if (currentNav === 'home') {
    const feat = featuredGame();
    if (feat) {
      heroSection.hidden = false;
      heroMedia.style.backgroundImage = coverUrl(feat) ? `url('${coverUrl(feat)}')` : '';
      heroMedia.style.backgroundColor = accentFor(feat.id) + '22';
      heroTitle.textContent = feat.title;
      heroTag.textContent = feat.tag || 'ÖZEL SEÇKİ';
      heroPlayBtn.onclick = () => playGame(feat);
    }
    const nRow = renderRow('🆕 Yeni Eklenenler', newGames());
    const pRow = renderRow('🔥 Popüler', popularGames());
    if (nRow) sectionsEl.appendChild(nRow);
    if (pRow) sectionsEl.appendChild(pRow);
    sectionsEl.appendChild(renderGrid('🗂️ Tüm Oyunlar', allGames));
    return;
  }

  if (currentNav === 'new') {
    sectionsEl.appendChild(renderGrid('🆕 Yeni Eklenenler', newGames()));
    return;
  }
  if (currentNav === 'popular') {
    sectionsEl.appendChild(renderGrid('🔥 Popüler', popularGames()));
    return;
  }
  if (currentNav === 'all') {
    sectionsEl.appendChild(renderGrid('🗂️ Tüm Oyunlar', allGames));
    return;
  }
  if (currentNav.startsWith('category:')) {
    const id = currentNav.split(':')[1];
    const meta = categoryMeta(id);
    const games = gamesByCategory(id);
    if (games.length === 0) {
      showEmpty(`<strong>${meta.icon} ${meta.label}</strong> kategorisinde henüz oyun yok.`);
    } else {
      sectionsEl.appendChild(renderGrid(`${meta.icon} ${meta.label}`, games));
    }
    return;
  }
}

/* ---------------- navigasyon olayları ---------------- */
document.body.addEventListener('click', e => {
  const link = e.target.closest('[data-nav]');
  if (!link) return;
  e.preventDefault();
  currentNav = link.dataset.nav;
  searchInput.value = '';
  closeGame(false);
  renderView();
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

searchInput.addEventListener('input', renderView);

/* ---------------- mobil menü ---------------- */
function openSidebar() {
  sidebar.classList.add('open');
  scrim.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  scrim.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
scrim.addEventListener('click', closeSidebar);

/* ---------------- oynatıcı ---------------- */
function playGame(game) {
  const src = gamePath(game, game.entry || 'index.html');
  gameFrame.src = src;
  playerTitle.textContent = game.title;
  playerPath.textContent = src;
  layoutShell.hidden = true;
  viewPlayer.hidden = false;
  window.scrollTo({ top: 0 });
}
function closeGame(restoreScroll = true) {
  gameFrame.src = 'about:blank';
  viewPlayer.hidden = true;
  layoutShell.hidden = false;
  if (restoreScroll) window.scrollTo({ top: 0 });
}
backBtn.addEventListener('click', () => closeGame());
fullscreenBtn.addEventListener('click', () => {
  if (gameFrame.requestFullscreen) gameFrame.requestFullscreen();
});

/* ---------------- veri yükleme ---------------- */
// Oyunlar games.js dosyasından, sıradan bir <script> etiketiyle gelir (window.GAMES).
// fetch/JSON kullanılmıyor — bu sayede index.html'e çift tıklayarak (file://) açtığında da çalışır.
function loadGames() {
  try {
    allGames = Array.isArray(window.GAMES) ? window.GAMES : [];
    buildCategoryNav();
    renderView();
  } catch (err) {
    console.error(err);
    showEmpty('<strong>games.js okunamadı.</strong> Dosyanın index.html ile aynı klasörde olduğundan ve doğru biçimde yazıldığından emin ol.');
  }
}

loadGames();
