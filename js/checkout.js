/* ============================================================
   Om Flower Store — Checkout logic
   ============================================================ */

const cart = getCart();

if (cart.length === 0) {
  document.getElementById('checkoutGrid').classList.add('hidden');
  document.getElementById('emptyState').classList.remove('hidden');
} else {
  renderSummary();
}

function renderSummary() {
  const itemsEl = document.getElementById('summaryItems');
  itemsEl.innerHTML = cart.map(item => `
    <div class="item-row">
      <span>${escapeAmp(item.name)} × ${item.qty}</span>
      <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
    </div>
  `).join('');
  document.getElementById('summaryTotal').textContent = `₹${getCartTotal().toLocaleString('en-IN')}`;
}

function escapeAmp(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const placeBtn = document.getElementById('placeOrderBtn');
  const errorEl = document.getElementById('formError');
  errorEl.classList.add('hidden');

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();

  if (!name || !phone || !address) {
    errorEl.textContent = 'Name, phone aur address fill karo.';
    errorEl.classList.remove('hidden');
    return;
  }

  placeBtn.disabled = true;
  placeBtn.textContent = 'Placing order…';

  try {
    const total = getCartTotal();
    const orderRef = await db.collection('orders').add({
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      customerName: name,
      phone,
      address,
      notes,
      totalAmount: total,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const shortId = orderRef.id.slice(0, 6).toUpperCase();
    document.getElementById('orderIdText').textContent = shortId;

    const itemLines = cart.map(i => `• ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
    const message =
      `New order at ${SHOP_NAME}\n` +
      `Order ID: ${shortId}\n\n` +
      `${itemLines}\n\n` +
      `Total: ₹${total.toLocaleString('en-IN')}\n\n` +
      `Name: ${name}\nPhone: ${phone}\nAddress: ${address}` +
      (notes ? `\nNotes: ${notes}` : '');

    document.getElementById('whatsappConfirmBtn').href = buildWhatsAppLink(message);

    clearCart();
    document.getElementById('checkoutGrid').classList.add('hidden');
    document.getElementById('successPanel').classList.remove('hidden');
  } catch (err) {
    console.error('Order placement failed:', err);
    errorEl.textContent = 'Order place nahi hua, dobara try karo: ' + err.message;
    errorEl.classList.remove('hidden');
    placeBtn.disabled = false;
    placeBtn.textContent = 'Place order';
  }
});
