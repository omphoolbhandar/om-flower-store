/* ============================================================
   Om Flower Store — Product detail page logic
   ============================================================ */

document.getElementById('footerWhatsapp').href = buildWhatsAppLink(
  `Hi! I'd like to know more about ${SHOP_NAME}'s flowers and bouquets.`
);

const productId = new URLSearchParams(window.location.search).get('id');
let currentProduct = null;
let qty = 1;

if (!productId) {
  showNotFound();
} else {
  db.collection('products').doc(productId).get().then((doc) => {
    if (!doc.exists) return showNotFound();
    currentProduct = { id: doc.id, ...doc.data() };
    renderProduct(currentProduct);
  }).catch((err) => {
    console.error('Failed to load product:', err);
    showNotFound();
  });
}

function showNotFound() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('notFoundState').classList.remove('hidden');
}

function renderProduct(p) {
  document.title = `${p.name} · Om Flower Store`;
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('productDetail').classList.remove('hidden');

  const images = (p.imageUrls && p.imageUrls.length) ? p.imageUrls : [];
  const mainEl = document.getElementById('galleryMain');
  const thumbsEl = document.getElementById('galleryThumbs');

  function setMainImage(url) {
    mainEl.innerHTML = url ? `<img src="${url}" alt="${escapeHtml(p.name)}">` : pickFlowerEmoji(p.id);
  }
  setMainImage(images[0]);

  if (images.length > 1) {
    thumbsEl.innerHTML = images.map((url, i) =>
      `<img src="${url}" data-i="${i}" class="${i === 0 ? 'active' : ''}">`
    ).join('');
    thumbsEl.querySelectorAll('img').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        setMainImage(images[thumb.dataset.i]);
        thumbsEl.querySelectorAll('img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  document.getElementById('pName').textContent = p.name || 'Untitled';
  document.getElementById('pCategory').textContent = p.category || '';
  document.getElementById('pPrice').textContent = `₹${Number(p.price || 0).toLocaleString('en-IN')}`;
  document.getElementById('pDescription').textContent = p.description || '';

  const inStock = p.inStock !== false;
  const badge = document.getElementById('pStockBadge');
  badge.className = `stock-badge ${inStock ? 'in' : 'out'}`;
  badge.textContent = inStock ? '● In stock' : '● Out of stock';

  const occWrap = document.getElementById('pOccasions');
  occWrap.innerHTML = (p.occasions || []).map(tag => `<span class="chip selected">${escapeHtml(tag)}</span>`).join('');

  const addBtn = document.getElementById('addToCartBtn');
  if (!inStock) {
    addBtn.disabled = true;
    addBtn.textContent = 'Out of stock';
  }

  document.getElementById('qtyMinus').addEventListener('click', () => {
    if (qty > 1) { qty--; document.getElementById('qtyValue').textContent = qty; }
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty++; document.getElementById('qtyValue').textContent = qty;
  });

  addBtn.addEventListener('click', () => {
    addToCart(currentProduct, qty);
    document.getElementById('addedMsg').classList.remove('hidden');
  });
}
