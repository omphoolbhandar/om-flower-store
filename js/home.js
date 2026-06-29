/* ============================================================
   Om Flower Store — Homepage logic
   ============================================================ */

document.getElementById('footerWhatsapp').href = buildWhatsAppLink(
  `Hi! I'd like to know more about ${SHOP_NAME}'s flowers and bouquets.`
);
document.getElementById('heroWhatsapp').href = buildWhatsAppLink(
  `Hi! I'd like to know more about ${SHOP_NAME}'s flowers and bouquets.`
);

// ---- Shop by category ----
db.collection('categories').orderBy('name').get().then((snap) => {
  const grid = document.getElementById('categoryGrid');
  const section = document.getElementById('categorySection');
  if (snap.empty) { section.classList.add('hidden'); return; }
  grid.innerHTML = snap.docs.map((doc) => {
    const name = doc.data().name;
    return `
      <a href="shop.html?category=${encodeURIComponent(name)}" class="cat-card">
        <div class="cat-icon">${pickCategoryIcon(name)}</div>
        <div class="cat-name">${escapeHtml(name)}</div>
      </a>
    `;
  }).join('');
}).catch((err) => console.error('Failed to load categories:', err));

// ---- Shop by occasion ----
const occasionRail = document.getElementById('occasionRail');
occasionRail.innerHTML = OCCASIONS.map(tag => `
  <a href="shop.html?occasion=${encodeURIComponent(tag)}" class="pill-card">${pickOccasionIcon(tag)} ${tag}</a>
`).join('');

// ---- New arrivals ----
db.collection('products').orderBy('createdAt', 'desc').limit(8).get().then((snap) => {
  const grid = document.getElementById('newArrivals');
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  document.getElementById('emptyState').classList.toggle('hidden', products.length > 0);
  grid.innerHTML = products.map(productCardHtml).join('');
  attachAddToCartHandlers(grid, products);
}).catch((err) => console.error('Failed to load new arrivals:', err));

function pickCategoryIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('rose') || n.includes('gulab')) return '🌹';
  if (n.includes('lily')) return '🌸';
  if (n.includes('plant')) return '🌿';
  if (n.includes('gift')) return '🎁';
  if (n.includes('wedding') || n.includes('shaadi')) return '🎊';
  if (n.includes('pooja') || n.includes('garland') || n.includes('haar')) return '🪔';
  if (n.includes('sunflower')) return '🌻';
  if (n.includes('orchid')) return '🪷';
  if (n.includes('mixed') || n.includes('bouquet')) return '💐';
  return '💐';
}

function pickOccasionIcon(tag) {
  const map = {
    Birthday: '🎂', Anniversary: '💞', Wedding: '💍', Sympathy: '🤍',
    Festival: '🪔', 'Get Well Soon': '🌼', Congratulations: '🎉', 'Just Because': '🌸',
  };
  return map[tag] || '🌸';
}
