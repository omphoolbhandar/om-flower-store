/* ============================================================
   Om Flower Store — Firebase configuration
   ------------------------------------------------------------
   Replace the values below with YOUR Firebase project's web
   app config. You'll find this in:
   Firebase Console → Project Settings (gear icon) → General
   → "Your apps" → Web app (</>) → SDK setup and configuration
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyD5w9PIclL8_PvoMMM-pk-iSpztp2jHczI",
  authDomain: "om-flower-store.firebaseapp.com",
  projectId: "om-flower-store",
  appId: "1:674447113672:web:2d81db19f234cf89b154fd"
};

// Used by admin-login.html / admin.html to show a setup reminder
// instead of failing silently if you forget to fill in the config above.
window.FIREBASE_CONFIGURED = firebaseConfig.apiKey !== "YOUR_API_KEY";

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
// Note: Firebase Storage is NOT used in this project. Product images are
// committed to the GitHub repo itself via a Cloudflare Worker proxy —
// see js/github-proxy-config.js and /cloudflare-worker/.
