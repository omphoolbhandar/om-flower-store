/* ============================================================
   Om Flower Store — Cart utilities
   Cart lives in localStorage so it survives page reloads without
   needing customer accounts. Shape: [{id, name, price, imageUrl, qty}]
   ============================================================ */

const CART_KEY = 'omFlowerCart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: (product.imageUrls && product.imageUrls[0]) || '',
      qty,
    });
  }
  saveCart(cart);
}

function updateCartQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Updates the little badge on the cart icon in the header, if present
// on the current page.
function renderCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

document.addEventListener('DOMContentLoaded', renderCartBadge);
