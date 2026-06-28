/* ============================================================
   Om Flower Store — Homepage logic
   ============================================================ */

document.getElementById('footerWhatsapp').href = buildWhatsAppLink(
  `Hi! I'd like to know more about ${SHOP_NAME}'s flowers and bouquets.`
);

// ---- Shop by category ----
db.collection('categories').orderBy('name').get().then((snap) => {
  const rail = document.getElementById('categoryRail');
  rail.innerHTML = '';
  snap.docs.forEach((doc) => {
    const a = document.createElement('a');
    a.className = 'pill-card';
    a.href = `shop.html?category=${encodeURIComponent(doc.data().name)}`;
    a.textContent = doc.data().name;
    rail.appendChild(a);
  });
}).catch((err) => console.error('Failed to load categories:', err));

// ---- Shop by occasion ----
const occasionRail = document.getElementById('occasionRail');
OCCASIONS.forEach((tag) => {
  const a = document.createElement('a');
  a.className = 'pill-card';
  a.href = `shop.html?occasion=${encodeURIComponent(tag)}`;
  a.textContent = tag;
  occasionRail.appendChild(a);
});

// ---- New arrivals ----
db.collection('products').orderBy('createdAt', 'desc').limit(4).get().then((snap) => {
  const grid = document.getElementById('newArrivals');
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  document.getElementById('emptyState').classList.toggle('hidden', products.length > 0);
  grid.innerHTML = products.map(productCardHtml).join('');
  attachAddToCartHandlers(grid, products);
}).catch((err) => console.error('Failed to load new arrivals:', err));
