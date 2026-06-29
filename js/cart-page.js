/* ============================================================
   Om Flower Store — Cart page logic
   ============================================================ */

renderCartPage();

function renderCartPage() {
  const cart = getCart();
  const listEl = document.getElementById('cartList');
  const summaryEl = document.getElementById('cartSummary');
  const emptyEl = document.getElementById('emptyState');

  if (cart.length === 0) {
    listEl.innerHTML = '';
    summaryEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  summaryEl.classList.remove('hidden');

  listEl.innerHTML = cart.map((item) => `
    <div class="cart-row" data-id="${item.id}">
      ${item.imageUrl
        ? `<img src="${item.imageUrl}" alt="">`
        : `<div style="font-size:1.8rem; display:flex; align-items:center; justify-content:center;">${pickFlowerEmoji(item.id)}</div>`}
      <div>
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="unit-price">₹${item.price.toLocaleString('en-IN')} each</div>
        <div class="qty-stepper" style="margin-top:0.5rem">
          <button type="button" class="qty-minus">−</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-plus">+</button>
        </div>
      </div>
      <div class="line-total">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      <button type="button" class="remove-btn">Remove</button>
    </div>
  `).join('');

  listEl.querySelectorAll('.cart-row').forEach((row) => {
    const id = row.dataset.id;
    const item = cart.find(i => i.id === id);
    row.querySelector('.qty-minus').addEventListener('click', () => {
      updateCartQty(id, item.qty - 1);
      renderCartPage();
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      updateCartQty(id, item.qty + 1);
      renderCartPage();
    });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      removeFromCart(id);
      renderCartPage();
    });
  });

  const total = getCartTotal();
  document.getElementById('subtotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString('en-IN')}`;
}
