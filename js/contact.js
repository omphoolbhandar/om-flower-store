/* ============================================================
   Om Flower Store — Contact page logic
   ============================================================ */

document.getElementById('whatsappBtn').href = buildWhatsAppLink(
  `Hi! I have a question for ${SHOP_NAME}.`
);

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const sendBtn = document.getElementById('sendBtn');
  const errorEl = document.getElementById('formError');
  const successEl = document.getElementById('formSuccess');
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');

  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  if (!name || !phone || !message) {
    errorEl.textContent = 'Saari fields fill karo.';
    errorEl.classList.remove('hidden');
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';

  try {
    await db.collection('enquiries').add({
      name, phone, message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    document.getElementById('contactForm').reset();
    successEl.classList.remove('hidden');
  } catch (err) {
    console.error('Enquiry send failed:', err);
    errorEl.textContent = 'Bhejne mein error aaya, dobara try karo.';
    errorEl.classList.remove('hidden');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
});
