/* ══════════════════════════════════════════
   ARTIZAN — DISCOVERY PAGE JS (discover.js)
   Handles: Google Maps, artisan fetching,
   SkillScore ranking, filtering, drawer,
   geolocation, URL params, view modes
══════════════════════════════════════════ */

'use strict';

// ── CONSTANTS
const LAGOS_CENTER   = { lat: 6.5244, lng: 3.3792 };
const DEFAULT_RADIUS = 10; // km
// const API_BASE       = '/api'; // Change to full URL when backend is live

// Avatar gradient palettes
const AVATAR_GRADIENTS = [
  ['#4F46E5','#818CF8'],['#059669','#34D399'],['#E85D04','#F4A261'],
  ['#7B2D8B','#C084FC'],['#0077B6','#48CAE4'],['#DC2626','#FCA5A5'],
  ['#D97706','#FDE68A'],['#1447E6','#60A5FA'],
];

// ── STATE
const state = {
  map: null,
  markers: [],
  infoWindows: [],
  userLocation: null,
  artisans: [],
  filtered: [],
  activeCard: null,
  activeMarkerId: null,
  radiusCircle: null,
  radius: DEFAULT_RADIUS,
  sort: 'skillscore',
  skillFilter: '',
  availableOnly: false,
  view: 'split', // 'split' | 'map' | 'list'
};

// ── DEMO DATA (used until backend is live)
const DEMO_ARTISANS = [
  { id:'a1', name:'Chukwudi Nwosu',   skill:'Plumbing',      category:'plumbing',   lat:6.4280, lng:3.4215, rating:4.9, jobs:203, price:6500,  completion:97, trust:94, trustBand:'high', isAvailable:true,  gradient:['#059669','#34D399'] },
  { id:'a2', name:'Aisha Bello',      skill:'Tailoring',     category:'tailoring',  lat:6.5150, lng:3.3630, rating:4.8, jobs:156, price:4000,  completion:95, trust:88, trustBand:'high', isAvailable:true,  gradient:['#7B2D8B','#C084FC'] },
  { id:'a3', name:'Tayo Adeyemi',     skill:'Home Cleaning', category:'cleaning',   lat:6.4500, lng:3.4700, rating:4.7, jobs:89,  price:7000,  completion:92, trust:76, trustBand:'mid',  isAvailable:false, gradient:['#059669','#34D399'] },
  { id:'a4', name:'Emeka Okafor',     skill:'Electrical',    category:'electrical', lat:6.5950, lng:3.3390, rating:4.9, jobs:312, price:8000,  completion:98, trust:96, trustBand:'high', isAvailable:true,  gradient:['#1447E6','#60A5FA'] },
  { id:'a5', name:'Funke Adeleke',    skill:'Babysitting',   category:'babysitting',lat:6.4680, lng:3.5100, rating:4.6, jobs:44,  price:5000,  completion:90, trust:68, trustBand:'mid',  isAvailable:true,  gradient:['#DC2626','#FCA5A5'] },
  { id:'a6', name:'Biodun Lawal',     skill:'Carpentry',     category:'carpentry',  lat:6.5380, lng:3.3200, rating:4.8, jobs:178, price:9000,  completion:94, trust:90, trustBand:'high', isAvailable:false, gradient:['#E85D04','#F4A261'] },
  { id:'a7', name:'Ngozi Okonkwo',    skill:'Home Repair',   category:'home-repair',lat:6.4820, lng:3.3570, rating:4.5, jobs:67,  price:10000, completion:88, trust:72, trustBand:'mid',  isAvailable:true,  gradient:['#0077B6','#48CAE4'] },
  { id:'a8', name:'Seun Adegoke',     skill:'Painting',      category:'painting',   lat:6.5620, lng:3.4100, rating:4.7, jobs:122, price:12000, completion:93, trust:85, trustBand:'high', isAvailable:true,  gradient:['#D97706','#FDE68A'] },
  { id:'a9', name:'Kemi Ogundimu',    skill:'Elder Care',    category:'elder-care', lat:6.5090, lng:3.3850, rating:4.9, jobs:58,  price:6000,  completion:96, trust:89, trustBand:'high', isAvailable:false, gradient:['#4F46E5','#818CF8'] },
  { id:'a10',name:'Rotimi Fasanya',   skill:'Security',      category:'security',   lat:6.4390, lng:3.4550, rating:4.4, jobs:201, price:8000,  completion:91, trust:80, trustBand:'high', isAvailable:true,  gradient:['#2B2D42','#8D99AE'] },
  { id:'a11',name:'Bola Martins',     skill:'Laundry',       category:'laundry',    lat:6.5760, lng:3.3650, rating:4.6, jobs:93,  price:3500,  completion:89, trust:74, trustBand:'mid',  isAvailable:true,  gradient:['#48CAE4','#90E0EF'] },
  { id:'a12',name:'Damilola Adetoye', skill:'Tutoring',      category:'tutoring',   lat:6.4980, lng:3.3410, rating:4.8, jobs:137, price:5000,  completion:95, trust:87, trustBand:'high', isAvailable:false, gradient:['#F59E0B','#FDE68A'] },
];

// ── HAVERSINE DISTANCE (km)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
    + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── SKILLSCORE ALGORITHM
function computeSkillScore(artisan, userLat, userLng, radius) {
  const ratingScore   = (artisan.rating / 5) * 0.35;
  const compRate      = artisan.completion / 100;
  const compScore     = compRate * 0.30;
  const dist          = haversine(userLat, userLng, artisan.lat, artisan.lng);
  const proxScore     = Math.max(0, 1 - dist / radius) * 0.25;
  const responseScore = 0.10; // default until API provides real data
  return Math.round((ratingScore + compScore + proxScore + responseScore) * 100);
}

// ── STAR RENDERER
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── TRUST BADGE HTML
function trustBadge(band) {
  if (band === 'high') return `<span class="a-trust-badge trust-high"><i class="fa fa-shield-halved"></i> Highly Trusted</span>`;
  if (band === 'mid')  return `<span class="a-trust-badge trust-mid"><i class="fa fa-shield-halved"></i> Trusted</span>`;
  return `<span class="a-trust-badge trust-low">New</span>`;
}

// ── FORMAT PRICE
function formatPrice(n) {
  return n >= 1000 ? (n/1000).toFixed(n%1000===0?0:1)+'K' : n.toString();
}

// ── FORMAT DISTANCE
function formatDist(km) {
  return km < 1 ? `${Math.round(km*1000)}m` : `${km.toFixed(1)}km`;
}

// ══════════════════════════════════════════
//   GOOGLE MAPS INIT (called by Maps SDK)
// ══════════════════════════════════════════
window.initMap = function () {
  const mapEl = document.getElementById('google-map');

  state.map = new google.maps.Map(mapEl, {
    center: state.userLocation || LAGOS_CENTER,
    zoom: 13,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    styles: MAP_STYLE,
  });

  // Hide loading overlay
  document.getElementById('map-loading').classList.add('hidden');

  // Draw radius circle
  updateRadiusCircle();

  // Load artisans
  loadArtisans();

  // Map click clears active selection
  state.map.addListener('click', () => {
    closeAllInfoWindows();
    clearActiveCard();
  });
};

// ── RADIUS CIRCLE
function updateRadiusCircle() {
  if (!state.map) return;
  const center = state.userLocation || LAGOS_CENTER;

  if (state.radiusCircle) state.radiusCircle.setMap(null);
  state.radiusCircle = new google.maps.Circle({
    map: state.map,
    center,
    radius: state.radius * 1000,
    fillColor: '#4F46E5',
    fillOpacity: 0.06,
    strokeColor: '#4F46E5',
    strokeOpacity: 0.4,
    strokeWeight: 1.5,
    clickable: false,
  });
}

// ── LOAD + RENDER ARTISANS
async function loadArtisans() {
  const center = state.userLocation || LAGOS_CENTER;

  // Try API first, fall back to demo data
  let artisans = DEMO_ARTISANS;
  try {
    const params = new URLSearchParams({
      lat: center.lat,
      lng: center.lng,
      radius: state.radius,
      ...(state.skillFilter && { category: state.skillFilter }),
    });
    const res = await fetch(`${API_BASE}/artisans/?${params}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results?.length) artisans = data.results;
    }
  } catch { /* use demo */ }

  // Attach distances and SkillScores
  artisans = artisans.map(a => ({
    ...a,
    distance: haversine(center.lat, center.lng, a.lat, a.lng),
    skillScore: computeSkillScore(a, center.lat, center.lng, state.radius),
  }));

  state.artisans = artisans;
  applyFilters();
}

// ── FILTER + SORT
function applyFilters() {
  let list = [...state.artisans];

  // Skill filter
  if (state.skillFilter) list = list.filter(a => a.category === state.skillFilter);

  // Available only
  if (state.availableOnly) list = list.filter(a => a.isAvailable);

  // Radius
  list = list.filter(a => a.distance <= state.radius);

  // Sort
  const sorts = {
    skillscore: (a, b) => b.skillScore - a.skillScore,
    nearest:    (a, b) => a.distance - b.distance,
    rating:     (a, b) => b.rating - a.rating,
    price:      (a, b) => a.price - b.price,
  };
  list.sort(sorts[state.sort] || sorts.skillscore);

  state.filtered = list;
  renderAll();
}

// ── RENDER EVERYTHING
function renderAll() {
  renderMap();
  renderList();
  updateResultsSummary();
}

// ── RENDER MAP MARKERS
function renderMap() {
  if (!state.map) return;

  // Clear existing markers
  state.markers.forEach(m => m.setMap(null));
  state.markers = [];
  state.infoWindows = [];
  closeAllInfoWindows();

  const bounds = new google.maps.LatLngBounds();
  const userPos = state.userLocation || LAGOS_CENTER;
  bounds.extend(userPos);

  // User location marker
  new google.maps.Marker({
    position: userPos,
    map: state.map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#4F46E5',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
    },
    title: 'Your location',
    zIndex: 999,
  });

  state.filtered.forEach((artisan, i) => {
    const pos = { lat: artisan.lat, lng: artisan.lng };
    bounds.extend(pos);

    // Custom marker SVG
    const isAvail = artisan.isAvailable;
    const color   = isAvail ? '#059669' : '#8E8E93';
    const markerSvg = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="18" cy="42" rx="8" ry="2.5" fill="rgba(0,0,0,0.15)"/>
        <circle cx="18" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2.5"/>
        <text x="18" y="21" text-anchor="middle" font-size="12" fill="white" font-family="sans-serif" font-weight="600">
          ${artisan.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
        </text>
        <polygon points="12,28 24,28 18,38" fill="${color}"/>
      </svg>
    `;

    const marker = new google.maps.Marker({
      position: pos,
      map: state.map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
        scaledSize: new google.maps.Size(36, 44),
        anchor: new google.maps.Point(18, 44),
      },
      title: artisan.name,
      zIndex: isAvail ? 10 + i : i,
    });

    // Info window
    const infoContent = `
      <div class="map-info-window">
        <div class="miw-header">
          <div class="miw-avatar" style="background:linear-gradient(135deg,${artisan.gradient[0]},${artisan.gradient[1]})">
            ${artisan.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <div>
            <div class="miw-name">${artisan.name}</div>
            <div class="miw-skill">${artisan.skill}</div>
          </div>
        </div>
        <div class="miw-stats">
          <span><i class="fa fa-star" style="color:#F59E0B"></i> ${artisan.rating}</span>
          <span><i class="fa fa-location-dot"></i> ${formatDist(artisan.distance)}</span>
          <span><i class="fa fa-naira-sign"></i> ${formatPrice(artisan.price)}/job</span>
        </div>
        <a href="artisan-profile.html?id=${artisan.id}" class="miw-btn">View Profile & Book</a>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
      pixelOffset: new google.maps.Size(0, -8),
    });
    state.infoWindows.push(infoWindow);

    marker.addListener('click', () => {
      closeAllInfoWindows();
      infoWindow.open(state.map, marker);
      highlightCard(artisan.id);
      openDrawer(artisan);
      state.activeMarkerId = artisan.id;
    });

    state.markers.push(marker);
  });

  // Fit bounds
  if (state.filtered.length > 0) {
    state.map.fitBounds(bounds, { padding: 60 });
    const maxZoom = 15;
    const listener = state.map.addListener('idle', () => {
      if (state.map.getZoom() > maxZoom) state.map.setZoom(maxZoom);
      google.maps.event.removeListener(listener);
    });
  }

  // Update bubble count
  document.getElementById('map-artisan-count').textContent = state.filtered.length;
}

// ── RENDER LIST
function renderList() {
  const listEl   = document.getElementById('artisan-list');
  const recSec   = document.getElementById('recommended-section');
  const recCards = document.getElementById('rec-cards');
  const divider  = document.getElementById('list-divider');
  const template = document.getElementById('artisan-card-template');
  const recTmpl  = document.getElementById('rec-card-template');
  const emptyEl  = document.getElementById('empty-state');

  // Clear
  listEl.innerHTML = '';
  recCards.innerHTML = '';

  if (state.filtered.length === 0) {
    emptyEl.style.display = 'flex';
    recSec.style.display = 'none';
    divider.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';

  // Top 3 recommended
  const top3 = state.filtered.slice(0, 3);
  recCards.innerHTML = '';
  top3.forEach(artisan => {
    const clone = recTmpl.content.cloneNode(true);
    const card  = clone.querySelector('.rec-card');
    card.dataset.id = artisan.id;

    const av = clone.querySelector('.rec-avatar');
    av.style.background = `linear-gradient(135deg,${artisan.gradient[0]},${artisan.gradient[1]})`;
    av.textContent = artisan.name.split(' ').map(w=>w[0]).join('').slice(0,2);

    clone.querySelector('.rec-name').textContent    = artisan.name;
    clone.querySelector('.rec-skill').textContent   = artisan.skill;
    clone.querySelector('.rec-score-val').textContent = artisan.skillScore;
    clone.querySelector('.rec-stars').textContent   = '★'.repeat(Math.round(artisan.rating));
    clone.querySelector('.rec-rating-val').textContent = artisan.rating.toFixed(1);
    clone.querySelector('.rec-dist-val').textContent = formatDist(artisan.distance);
    clone.querySelector('.rec-price-val').textContent = `${formatPrice(artisan.price)}/job`;

    card.addEventListener('click', () => {
      openDrawer(artisan);
      panToArtisan(artisan);
      highlightCard(artisan.id);
    });

    recCards.appendChild(clone);
  });

  recSec.style.display = 'block';
  divider.style.display = 'block';

  // All artisans list
  state.filtered.forEach((artisan, i) => {
    const clone = template.content.cloneNode(true);
    const card  = clone.querySelector('.a-card');
    card.dataset.id = artisan.id;

    // Avatar
    const av = clone.querySelector('.a-avatar');
    av.style.background = `linear-gradient(135deg,${artisan.gradient[0]},${artisan.gradient[1]})`;
    av.textContent = artisan.name.split(' ').map(w=>w[0]).join('').slice(0,2);

    // Availability dot
    const dot = clone.querySelector('.a-avail-dot');
    if (artisan.isAvailable) dot.classList.add('available');
    dot.title = artisan.isAvailable ? 'Available now' : 'Busy';

    // Info
    clone.querySelector('.a-name').textContent = artisan.name;
    clone.querySelector('.a-skill').textContent = artisan.skill;
    clone.querySelector('.a-trust-badge').outerHTML; // replaced below
    clone.querySelector('.a-trust-badge').innerHTML = trustBadge(artisan.trustBand).replace(/<span[^>]*>|<\/span>/g,'');
    clone.querySelector('.a-trust-badge').className = `a-trust-badge trust-${artisan.trustBand}`;

    clone.querySelector('.a-stars').textContent     = renderStars(artisan.rating);
    clone.querySelector('.a-rating-count').textContent = `${artisan.rating} (${artisan.jobs})`;
    clone.querySelector('.a-dist-val').textContent  = formatDist(artisan.distance);
    clone.querySelector('.a-price-val').textContent = `${formatPrice(artisan.price)}/job`;
    clone.querySelector('.a-comp-val').textContent  = artisan.completion;

    // Animation delay
    card.style.animationDelay = `${i * 40}ms`;
    card.style.animation = 'cardFadeIn 0.3s ease both';

    card.addEventListener('click', () => {
      openDrawer(artisan);
      panToArtisan(artisan);
      highlightCard(artisan.id);
    });

    listEl.appendChild(clone);
  });
}

// ── UPDATE RESULTS SUMMARY
function updateResultsSummary() {
  const count = state.filtered.length;
  document.getElementById('results-count').textContent =
    `${count} artisan${count !== 1 ? 's' : ''} found`;
  const area = sessionStorage.getItem('userArea') || 'Lagos';
  document.getElementById('results-area').textContent = `near ${area}`;
}

// ── HIGHLIGHT CARD IN LIST
function highlightCard(id) {
  document.querySelectorAll('.a-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.a-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function clearActiveCard() {
  document.querySelectorAll('.a-card').forEach(c => c.classList.remove('active'));
  state.activeMarkerId = null;
}

// ── PAN MAP TO ARTISAN
function panToArtisan(artisan) {
  if (!state.map) return;
  state.map.panTo({ lat: artisan.lat, lng: artisan.lng });
  if (state.map.getZoom() < 14) state.map.setZoom(14);

  // Open corresponding info window
  const idx = state.filtered.findIndex(a => a.id === artisan.id);
  if (idx >= 0 && state.infoWindows[idx]) {
    closeAllInfoWindows();
    state.infoWindows[idx].open(state.map, state.markers[idx]);
  }
}

// ── CLOSE ALL INFO WINDOWS
function closeAllInfoWindows() {
  state.infoWindows.forEach(iw => iw.close());
}

// ── PREVIEW DRAWER
function openDrawer(artisan) {
  const drawer  = document.getElementById('preview-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const content = document.getElementById('drawer-content');
  const template = document.getElementById('drawer-template');

  const clone = template.content.cloneNode(true);

  // Avatar
  const av = clone.querySelector('.dw-avatar');
  av.style.background = `linear-gradient(135deg,${artisan.gradient[0]},${artisan.gradient[1]})`;
  av.textContent = artisan.name.split(' ').map(w=>w[0]).join('').slice(0,2);

  clone.querySelector('.dw-name').textContent  = artisan.name;
  clone.querySelector('.dw-skill').textContent = `${artisan.skill} · ${artisan.isAvailable ? '🟢 Available now' : '🔴 Busy'}`;

  const trust = clone.querySelector('.dw-trust');
  trust.textContent = artisan.trustBand === 'high' ? '🛡 Highly Trusted' : artisan.trustBand === 'mid' ? '🛡 Trusted' : 'New';
  trust.className = `dw-trust trust-${artisan.trustBand}`;

  clone.querySelector('.dw-rating-val').textContent  = `${artisan.rating}★`;
  clone.querySelector('.dw-jobs-val').textContent    = artisan.jobs;
  clone.querySelector('.dw-dist-val').textContent    = formatDist(artisan.distance);
  clone.querySelector('.dw-price-val').textContent   = `₦${formatPrice(artisan.price)}`;

  const fill = clone.querySelector('.dw-ts-fill');
  fill.style.width = `${artisan.trust}%`;
  clone.querySelector('.dw-ts-val').textContent = `${artisan.trust}/100`;

  // Portfolio placeholders
  const grid = clone.querySelector('.dw-portfolio-grid');
  for (let i = 0; i < 3; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'dw-portfolio-thumb';
    thumb.innerHTML = '<i class="fa fa-image"></i>';
    grid.appendChild(thumb);
  }

  const days = ['Mon–Sat', 'Mon–Fri', 'Mon–Sun', 'Tue–Sat'];
  clone.querySelector('.dw-avail-text').textContent =
    `${days[Math.floor(Math.random()*days.length)]}, 8:00am – 6:00pm`;

  content.innerHTML = '';
  content.appendChild(clone);

  // Update action buttons
  document.getElementById('drawer-view-profile').href = `artisan-profile.html?id=${artisan.id}`;
  document.getElementById('drawer-book-now').href     = `artisan-profile.html?id=${artisan.id}#book`;

  // Animate trust bar
  setTimeout(() => {
    const bar = content.querySelector('.dw-ts-fill');
    if (bar) { bar.style.width = '0'; requestAnimationFrame(() => { bar.style.width = `${artisan.trust}%`; }); }
  }, 50);

  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('preview-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
  document.body.style.overflow = '';
  clearActiveCard();
  closeAllInfoWindows();
}

document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);

// ── URL PARAMS on page load
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const skill  = params.get('skill');
  const lat    = parseFloat(params.get('lat'));
  const lng    = parseFloat(params.get('lng'));
  const loc    = params.get('location');

  if (skill) {
    state.skillFilter = skill;
    const sel = document.getElementById('skill-filter');
    if (sel) sel.value = skill;
  }
  if (!isNaN(lat) && !isNaN(lng)) {
    state.userLocation = { lat, lng };
  }
  if (loc) {
    const inp = document.getElementById('location-filter');
    if (inp) inp.value = loc;
  }
}

// ── GEOLOCATION
function requestLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      sessionStorage.setItem('userLat', pos.coords.latitude);
      sessionStorage.setItem('userLng', pos.coords.longitude);
      if (state.map) {
        state.map.panTo(state.userLocation);
        updateRadiusCircle();
      }
      loadArtisans();
    },
    () => {}, { timeout: 6000 }
  );
}

// ── SEARCH HANDLER
function handleSearch() {
  state.skillFilter = document.getElementById('skill-filter').value;
  const locVal = document.getElementById('location-filter').value.trim();
  // If location input changed, attempt geocoding via Nominatim
  if (locVal) {
    geocodeLocation(locVal).then(coords => {
      if (coords) {
        state.userLocation = coords;
        if (state.map) { state.map.panTo(coords); updateRadiusCircle(); }
      }
      loadArtisans();
    });
  } else {
    loadArtisans();
  }
}

async function geocodeLocation(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lagos, Nigeria')}&format=json&limit=1`
    );
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

// ── EVENT LISTENERS

// Search
document.getElementById('search-btn')?.addEventListener('click', handleSearch);
document.getElementById('location-filter')?.addEventListener('keydown', e => { if (e.key==='Enter') handleSearch(); });
document.getElementById('skill-filter')?.addEventListener('change', handleSearch);

// Locate
document.getElementById('locate-btn')?.addEventListener('click', () => {
  const btn = document.getElementById('locate-btn');
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
  navigator.geolocation?.getCurrentPosition(
    pos => {
      state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      // Reverse geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
        .then(r => r.json())
        .then(d => {
          const area = d.address?.suburb || d.address?.city_district || 'Your location';
          document.getElementById('location-filter').value = area;
          sessionStorage.setItem('userArea', area);
          btn.innerHTML = '<i class="fa fa-crosshairs"></i>';
          if (state.map) { state.map.panTo(state.userLocation); updateRadiusCircle(); }
          loadArtisans();
        }).catch(() => { btn.innerHTML = '<i class="fa fa-crosshairs"></i>'; });
    },
    () => { btn.innerHTML = '<i class="fa fa-crosshairs"></i>'; }
  );
});

// Radius
const radiusSlider = document.getElementById('radius-slider');
const radiusVal    = document.getElementById('radius-val');
radiusSlider?.addEventListener('input', () => {
  state.radius = parseInt(radiusSlider.value, 10);
  radiusVal.textContent = `${state.radius} km`;
  // Update slider gradient
  const pct = ((state.radius - 2) / (20 - 2)) * 100;
  radiusSlider.style.background = `linear-gradient(to right,var(--brand-purple) 0%,var(--brand-purple) ${pct}%,var(--border) ${pct}%)`;
  updateRadiusCircle();
  applyFilters();
});

// Sort pills
document.querySelectorAll('.sort-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.sort-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.sort = pill.dataset.sort;
    applyFilters();
  });
});

// Available toggle
document.getElementById('available-toggle')?.addEventListener('change', e => {
  state.availableOnly = e.target.checked;
  applyFilters();
});

// View toggles
document.getElementById('view-split')?.addEventListener('click', () => setView('split'));
document.getElementById('view-map')?.addEventListener('click',   () => setView('map'));
document.getElementById('view-list')?.addEventListener('click',  () => setView('list'));

function setView(view) {
  state.view = view;
  const main = document.getElementById('discover-main');
  main.classList.remove('view-map-only','view-list-only');
  if (view === 'map') main.classList.add('view-map-only');
  if (view === 'list') main.classList.add('view-list-only');
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');
  if (state.map) google.maps.event.trigger(state.map, 'resize');
}

// Map custom controls
document.getElementById('my-location-btn')?.addEventListener('click', () => {
  if (state.userLocation && state.map) state.map.panTo(state.userLocation);
  else requestLocation();
});
document.getElementById('zoom-in-btn')?.addEventListener('click',  () => state.map?.setZoom((state.map.getZoom()||12)+1));
document.getElementById('zoom-out-btn')?.addEventListener('click', () => state.map?.setZoom((state.map.getZoom()||12)-1));

// Expand radius helper
window.expandRadius = function() {
  radiusSlider.value = '20';
  radiusSlider.dispatchEvent(new Event('input'));
};

// ── CSS ANIMATION FOR CARDS
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes cardFadeIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(styleEl);

// ── INIT
readUrlParams();

// Try to get location from sessionStorage first
const storedLat = sessionStorage.getItem('userLat');
const storedLng = sessionStorage.getItem('userLng');
if (storedLat && storedLng && !state.userLocation) {
  state.userLocation = { lat: parseFloat(storedLat), lng: parseFloat(storedLng) };
}

// If Maps not loaded yet (e.g. API key not set), init without Maps
if (typeof google === 'undefined') {
  document.getElementById('map-loading').innerHTML = `
    <i class="fa fa-map" style="font-size:2rem;color:var(--ink-300)"></i>
    <p>Map unavailable — add your Google Maps API key to enable the live map.</p>
  `;
  // Still render the list
  DEMO_ARTISANS.forEach(a => {
    a.distance = haversine(
      state.userLocation?.lat || LAGOS_CENTER.lat,
      state.userLocation?.lng || LAGOS_CENTER.lng,
      a.lat, a.lng
    );
    a.skillScore = computeSkillScore(a,
      state.userLocation?.lat || LAGOS_CENTER.lat,
      state.userLocation?.lng || LAGOS_CENTER.lng,
      DEFAULT_RADIUS
    );
  });
  state.artisans = DEMO_ARTISANS;
  applyFilters();
}

// ── GOOGLE MAPS CUSTOM STYLE (subtle, clean)
const MAP_STYLE = [
  { featureType:'all', elementType:'geometry', stylers:[{color:'#f8f7ff'}] },
  { featureType:'road', elementType:'geometry', stylers:[{color:'#ffffff'}] },
  { featureType:'road.arterial', elementType:'geometry', stylers:[{color:'#fafafa'}] },
  { featureType:'road.highway', elementType:'geometry', stylers:[{color:'#e8e5ff'}] },
  { featureType:'water', elementType:'geometry', stylers:[{color:'#c7d2fe'}] },
  { featureType:'poi.park', elementType:'geometry', stylers:[{color:'#d1fae5'}] },
  { featureType:'poi.business', stylers:[{visibility:'off'}] },
  { featureType:'transit', stylers:[{visibility:'off'}] },
  { featureType:'administrative', elementType:'labels.text.fill', stylers:[{color:'#6b7280'}] },
  { featureType:'road', elementType:'labels.text.fill', stylers:[{color:'#9ca3af'}] },
];
