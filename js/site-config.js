/* ============================================================
   Om Flower Store — Storefront configuration
   ------------------------------------------------------------
   Replace with your real WhatsApp number, country code first,
   digits only — no "+", spaces or dashes. Example for an Indian
   number 98765 43210 → "919876543210".
   ============================================================ */

const SHOP_WHATSAPP_NUMBER = "91XXXXXXXXXX";
const SHOP_NAME = "Om Flower Store";

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Sympathy',
  'Festival', 'Get Well Soon', 'Congratulations', 'Just Because'
];

window.SHOP_CONFIGURED = SHOP_WHATSAPP_NUMBER !== "91XXXXXXXXXX";

function buildWhatsAppLink(message) {
  return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
