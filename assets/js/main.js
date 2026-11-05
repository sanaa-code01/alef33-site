// ============================================================
// ALEF 33 : scripts du site
// ============================================================

// ---- Réglages faciles à modifier ----
const WHATSAPP_NUMERO = '212611334293'; // format international, sans + ni espaces
const WHATSAPP_MESSAGE = 'Bonjour ALEF 33, je souhaite avoir un devis pour ';
const PHOTOS_PAR_PAGE = 16;             // photos affichées avant « Afficher plus »
const DOSSIER_PHOTOS = 'assets/img/realisations/';

// ---- Liens WhatsApp ----
const waUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
document.querySelectorAll('.js-wa').forEach(a => {
  a.href = waUrl;
  a.target = '_blank';
  a.rel = 'noopener';
});

// ---- Bande « Ils nous font confiance » ----
const CLIENTS = ['Top Cake', 'Agadir Bay', 'Lolo Agadir', 'Amira Fish', 'Boca Tanger', 'Snack Zrika',
  'Oukla', 'Pocadios', 'Coffee Shop Wega', 'Boucherie Nahda', 'Boucherie Chichaoua', 'Halawiyat Souss',
  'Crocante', 'Djou Food', 'Restaurant Tawmat', 'Simple Coffee Shop', 'Snack Tata', 'Fofamily', 'Hope Café'];
(function marquee() {
  const track = document.querySelector('.marquee-track');
  const html = CLIENTS.map(c => `<span>${c}</span>`).join('');
  track.innerHTML = html + html.replace(/<span>/g, '<span aria-hidden="true">'); // doublé pour un défilement continu
})();

// ---- Apparition au défilement ----
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
})();

// ---- Année du pied de page ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- Menu mobile ----
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));

// ---- Galerie ----
const gallery = document.getElementById('gallery');
const moreBtn = document.getElementById('more');
const chips = document.querySelectorAll('.chip');
let categorie = 'tout';
let visibles = PHOTOS_PAR_PAGE;

function photosFiltrees() {
  return categorie === 'tout'
    ? REALISATIONS
    : REALISATIONS.filter(r => r.categorie === categorie);
}

function afficherGalerie() {
  const liste = photosFiltrees();
  gallery.innerHTML = '';
  liste.slice(0, visibles).forEach((r, i) => {
    const btn = document.createElement('button');
    btn.className = 'tile';
    btn.type = 'button';
    btn.setAttribute('aria-label', `Agrandir : ${r.titre}`);

    const img = document.createElement('img');
    img.src = `${DOSSIER_PHOTOS}${r.photo}-sm.jpg`;
    img.alt = r.titre;
    img.loading = 'lazy';
    img.decoding = 'async';
    // Si la version réduite n'existe pas, on utilise la photo normale
    img.onerror = () => { img.onerror = null; img.src = `${DOSSIER_PHOTOS}${r.photo}.jpg`; };

    const cap = document.createElement('span');
    cap.className = 'tile-cap';
    cap.textContent = r.titre;

    btn.append(img, cap);
    btn.addEventListener('click', () => ouvrir(i));
    gallery.appendChild(btn);
  });
  moreBtn.parentElement.hidden = visibles >= liste.length;
}

function choisirCategorie(cat) {
  categorie = cat;
  visibles = PHOTOS_PAR_PAGE;
  chips.forEach(c => {
    const actif = c.dataset.cat === cat;
    c.classList.toggle('is-active', actif);
    c.setAttribute('aria-pressed', String(actif));
  });
  afficherGalerie();
}

chips.forEach(c => c.addEventListener('click', () => choisirCategorie(c.dataset.cat)));
moreBtn.addEventListener('click', () => { visibles += PHOTOS_PAR_PAGE; afficherGalerie(); });

// Boutons « Voir les réalisations » de la section Produits
document.querySelectorAll('.js-filter').forEach(b => b.addEventListener('click', () => {
  choisirCategorie(b.dataset.cat);
  document.getElementById('realisations').scrollIntoView();
}));

afficherGalerie();

// ---- Visionneuse ----
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-cap');
let courant = 0;

function montrer(i) {
  const liste = photosFiltrees();
  courant = (i + liste.length) % liste.length;
  const r = liste[courant];
  lbImg.src = `${DOSSIER_PHOTOS}${r.photo}.jpg`;
  lbImg.alt = r.titre;
  lbCap.textContent = r.titre;
}
function ouvrir(i) { montrer(i); lb.showModal(); }

lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
lb.querySelector('.lb-prev').addEventListener('click', () => montrer(courant - 1));
lb.querySelector('.lb-next').addEventListener('click', () => montrer(courant + 1));
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') montrer(courant - 1);
  if (e.key === 'ArrowRight') montrer(courant + 1);
});

// Glisser à gauche / à droite sur téléphone
let x0 = null;
lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) montrer(courant + (dx < 0 ? 1 : -1));
  x0 = null;
});
