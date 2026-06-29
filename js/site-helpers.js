/* ============================================================
   Om Flower Store — Shared storefront render helpers
   ============================================================ */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

const FLOWER_EMOJIS = ['🌸', '🌺', '🌹', '🌼', '💐', '🌷', '🌻', '🏵️'];

// Deterministic per-product emoji fallback (same product always gets the
// same flower icon) for cards/galleries that have no uploaded photo yet.
function pickFlowerEmoji(seed) {
  const str = String(seed || '');
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return FLOWER_EMOJIS[sum % FLOWER_EMOJIS.length];
}

// Renders one product card for the home/shop grids.
function productCardHtml(p) {
  const thumbUrl = (p.imageUrls && p.imageUrls[0]) || '';
  const inStock = p.inStock !== false;
  const imgInner = thumbUrl
    ? `<img src="${thumbUrl}" alt="${escapeHtml(p.name)}">`
    : pickFlowerEmoji(p.id);

  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}" class="product-img-link">
        <div class="product-img">${imgInner}</div>
      </a>
      <div class="product-info">
        <span class="product-tag${inStock ? '' : ' out'}">${escapeHtml(p.category || (inStock ? 'Fresh' : 'Out of stock'))}</span>
        <a href="product.html?id=${p.id}"><div class="product-name">${escapeHtml(p.name || 'Untitled')}</div></a>
        <div class="product-footer">
          <span class="product-price">₹${Number(p.price || 0).toLocaleString('en-IN')}</span>
          ${inStock
            ? `<button class="add-btn add-to-cart-btn" data-id="${p.id}" title="Cart mein daalen">+</button>`
            : `<span class="out-of-stock-label">Unavailable</span>`}
        </div>
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
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = original; }, 1000);
    });
  });
}
