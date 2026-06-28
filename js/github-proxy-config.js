/* ============================================================
   Om Flower Store — GitHub image proxy configuration
   ------------------------------------------------------------
   Product images are committed directly into this GitHub repo
   (folder: product-images/) instead of using Firebase Storage,
   via a small Cloudflare Worker that holds the GitHub token
   server-side. See /cloudflare-worker/ and SETUP_GUIDE.md.

   Replace this with YOUR deployed Worker's URL, e.g.
   "om-flower-proxy.ctetone31.workers.dev"
   ============================================================ */

const GITHUB_PROXY_URL = "https://om-flower-proxy.ctetone31.workers.dev";

window.GITHUB_PROXY_CONFIGURED = !GITHUB_PROXY_URL.includes('YOUR-WORKER-SUBDOMAIN');
