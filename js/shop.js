/* ============================================================
   Om Flower Store — Shop page logic
   ============================================================ */

const params = new URLSearchParams(window.location.search);
let selectedCategory = params.get('category') || 'All';
let selectedOccasion = params.get('occasion') || 'All';
let searchTerm = '';
let allCategories = [];
let allProducts = [];

document.getElementById('footerWhatsapp').href = buildWhatsAppLink(
  `Hi! I'd like to know more about ${SHOP_NAME}'s flowers and bouquets.`
);

updatePageTitle();

db.collection('categories').orderBy('name').get().then((snap) => {
  allCategories = snap.docs.map(d => d.data().name);
  renderCategoryFilters();
}).catch((err) => console.error('Failed to load categories:', err));

renderOccasionFilters();

db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snap) => {
  allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderGrid();
}, (err) => console.error('Failed to load products:', err));

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderGrid();
});

function renderCategoryFilters() {
  const wrap = document.getElementById('categoryFilters');
  wrap.innerHTML = '';
  ['All', ...allCategories].forEach((name) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (name === selectedCategory ? ' selected' : '');
    chip.textContent = name;
    chip.addEventListener('click', () => {
      selectedCategory = name;
      updatePageTitle();
      renderCategoryFilters();
      renderGrid();
    });
    wrap.appendChild(chip);
  });
}

function renderOccasionFilters() {
  const wrap = document.getElementById('occasionFilters');
  wrap.innerHTML = '';
  ['All', ...OCCASIONS].forEach((name) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (name === selectedOccasion ? ' selected' : '');
    chip.textContent = name;
    chip.addEventListener('click', () => {
      selectedOccasion = name;
      updatePageTitle();
      renderOccasionFilters();
      renderGrid();
    });
    wrap.appendChild(chip);
  });
}

function updatePageTitle() {
  if (selectedOccasion !== 'All') {
    document.getElementById('pageTitle').textContent = `Shop — ${selectedOccasion}`;
  } else if (selectedCategory !== 'All') {
    document.getElementById('pageTitle').textContent = `Shop — ${selectedCategory}`;
  } else {
    document.getElementById('pageTitle').textContent = 'Shop';
  }
}

function renderGrid() {
  const filtered = allProducts.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedOccasion !== 'All' && !(p.occasions || []).includes(selectedOccasion)) return false;
    if (searchTerm && !(p.name || '').toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  const grid = document.getElementById('productGrid');
  document.getElementById('emptyState').classList.toggle('hidden', filtered.length > 0);
  grid.innerHTML = filtered.map(productCardHtml).join('');
  attachAddToCartHandlers(grid, filtered);
}
