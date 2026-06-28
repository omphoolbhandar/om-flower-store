/* ============================================================
   Om Flower Store — Shared storefront render helpers
   ============================================================ */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function bloomDotSvg() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px">
    <circle cx="12" cy="6" r="4.2"/><circle cx="17.3" cy="9.8" r="4.2"/>
    <circle cx="15.4" cy="16" r="4.2"/><circle cx="8.6" cy="16" r="4.2"/>
    <circle cx="6.7" cy="9.8" r="4.2"/><circle cx="12" cy="12" r="2.6" fill="#fffbf2"/>
  </svg>`;
}

function noImageSvg() {
  return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none"/>
    <path d="M3 17l5-5 4 4 3-3 5 5" />
  </svg>`;
}

// Renders one product card for the home/shop grids.
function productCardHtml(p) {
  const thumbUrl = (p.imageUrls && p.imageUrls[0]) || '';
  const inStock = p.inStock !== false;
  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}" class="thumb">${thumbUrl ? `<img src="${thumbUrl}" alt="${escapeHtml(p.name)}">` : noImageSvg()}</a>
      <div class="body">
        <a href="product.html?id=${p.id}"><h3>${escapeHtml(p.name || 'Untitled')}</h3></a>
        <div class="meta">${escapeHtml(p.category || '')}</div>
        <div class="price">₹${Number(p.price || 0).toLocaleString('en-IN')}</div>
        <span class="stock-badge ${inStock ? 'in' : 'out'}">${bloomDotSvg()} ${inStock ? 'In stock' : 'Out of stock'}</span>
        <button class="btn-primary add-to-cart-btn" data-id="${p.id}" ${inStock ? '' : 'disabled'}>
          ${inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </div>
  `;
}

// Wires up every ".add-to-cart-btn" inside `container` against the given
// `products` array (matched by data-id).
function attachAddToCartHandlers(container, products) {
  container.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = products.find(p => p.id === btn.dataset.id);
      if (!product) return;
      addToCart(product, 1);
      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => { btn.textContent = original; }, 1200);
    });
  });
}
