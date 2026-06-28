/* ============================================================
   Om Flower Store — Admin panel logic
   ============================================================ */

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Sympathy',
  'Festival', 'Get Well Soon', 'Congratulations', 'Just Because'
];

const DEFAULT_CATEGORIES = [
  'Bouquets', 'Roses', 'Lilies', 'Mixed Arrangements', 'Plants', 'Gifts'
];

let allProducts = [];     // live cache from Firestore for client-side search
let allCategories = [];   // live cache of category docs {id, name}
let selectedOccasions = new Set();
let existingImages = [];        // [{url, path}] for the product currently being edited
let pendingFiles = [];          // File objects queued for upload on save
let removedExistingPaths = [];  // GitHub paths to delete from the repo once save succeeds

const $ = (id) => document.getElementById(id);

/* ---------------- Auth guard ---------------- */
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'admin-login.html';
    return;
  }
  $('adminEmail').textContent = user.email;
  $('authCheck').classList.add('hidden');
  $('app').classList.remove('hidden');

  if (!window.GITHUB_PROXY_CONFIGURED && $('setupBanner')) {
    $('setupBanner').textContent =
      '⚠️ GitHub image proxy abhi configure nahi hai — js/github-proxy-config.js mein apne Worker ka URL daalo, warna image upload fail hoga.';
    $('setupBanner').classList.remove('hidden');
  }

  initTabs();
  initDrawer();
  renderOccasionChips();
  listenToCategories();
  listenToProducts();
  ensureDefaultCategories();
});

$('logoutBtn').addEventListener('click', () => {
  auth.signOut().then(() => window.location.href = 'admin-login.html');
});

/* ---------------- Tabs ---------------- */
function initTabs() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

/* ---------------- Categories ---------------- */
// Seeds a starter category list the very first time the shop is set up,
// so the product form dropdown isn't empty on day one.
async function ensureDefaultCategories() {
  const snap = await db.collection('categories').limit(1).get();
  if (snap.empty) {
    const batch = db.batch();
    DEFAULT_CATEGORIES.forEach((name) => {
      const ref = db.collection('categories').doc();
      batch.set(ref, { name, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
  }
}

function listenToCategories() {
  db.collection('categories').orderBy('name').onSnapshot((snap) => {
    allCategories = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
    renderCategoryList();
    renderCategoryOptions();
  });
}

function renderCategoryList() {
  const list = $('categoryList');
  list.innerHTML = '';
  allCategories.forEach((cat) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(cat.name)}</span>`;
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete category';
    delBtn.addEventListener('click', () => deleteCategory(cat.id));
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function renderCategoryOptions() {
  const select = $('fieldCategory');
  const current = select.value;
  select.innerHTML = '<option value="" disabled>Select category</option>';
  allCategories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
  if (current) select.value = current;
}

$('addCategoryBtn').addEventListener('click', async () => {
  const input = $('newCategoryInput');
  const name = input.value.trim();
  if (!name) return;
  const exists = allCategories.some(c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) { input.value = ''; return; }
  await db.collection('categories').add({
    name, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  input.value = '';
});

async function deleteCategory(id) {
  // Note: products already using this category keep the text value;
  // they just won't match a dropdown option until re-edited.
  await db.collection('categories').doc(id).delete();
}

/* ---------------- Products: list + search ---------------- */
function listenToProducts() {
  db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snap) => {
    allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProductGrid(allProducts);
  }, (err) => {
    console.error('Failed to load products:', err);
  });
}

$('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.trim().toLowerCase();
  const filtered = term
    ? allProducts.filter(p => (p.name || '').toLowerCase().includes(term))
    : allProducts;
  renderProductGrid(filtered);
});

function renderProductGrid(products) {
  const grid = $('productGrid');
  grid.innerHTML = '';
  $('emptyState').classList.toggle('hidden', products.length > 0 || allProducts.length > 0);
  if (allProducts.length === 0) return;

  products.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const thumbUrl = (p.imageUrls && p.imageUrls[0]) || '';
    const inStock = p.inStock !== false;

    card.innerHTML = `
      <div class="thumb">${thumbUrl ? `<img src="${thumbUrl}" alt="${escapeHtml(p.name)}">` : noImageSvg()}</div>
      <div class="body">
        <h3>${escapeHtml(p.name || 'Untitled')}</h3>
        <div class="meta">${escapeHtml(p.category || 'Uncategorized')}</div>
        <div class="price">₹${Number(p.price || 0).toLocaleString('en-IN')}</div>
        <span class="stock-badge ${inStock ? 'in' : 'out'}">${bloomDotSvg()} ${inStock ? 'In stock' : 'Out of stock'}</span>
        <div class="card-actions" data-actions></div>
      </div>
    `;

    const actions = card.querySelector('[data-actions]');
    renderCardActions(actions, p);
    grid.appendChild(card);
  });
}

function renderCardActions(container, product) {
  container.innerHTML = '';
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openDrawer(product));

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'danger';
  delBtn.addEventListener('click', () => showDeleteConfirm(container, product));

  container.appendChild(editBtn);
  container.appendChild(delBtn);
}

function showDeleteConfirm(container, product) {
  container.innerHTML = `
    <div class="confirm-row">
      <span>Delete this product?</span>
      <button type="button" class="yes">Yes</button>
      <button type="button" class="no">Cancel</button>
    </div>
  `;
  container.querySelector('.yes').addEventListener('click', () => deleteProduct(product));
  container.querySelector('.no').addEventListener('click', () => renderCardActions(container, product));
}

async function deleteProduct(product) {
  try {
    if (Array.isArray(product.imagePaths)) {
      await Promise.all(
        product.imagePaths.filter(Boolean).map(path => deleteImageFromGitHub(path))
      );
    }
    await db.collection('products').doc(product.id).delete();
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Delete fail ho gaya, console check karo.');
  }
}

/* ---------------- Drawer: add / edit product ---------------- */
function initDrawer() {
  $('addProductBtn').addEventListener('click', () => openDrawer(null));
  $('closeDrawerBtn').addEventListener('click', closeDrawer);
  $('cancelDrawerBtn').addEventListener('click', closeDrawer);
  $('drawerOverlay').addEventListener('click', closeDrawer);
  $('fieldImages').addEventListener('change', handleNewFiles);
  $('productForm').addEventListener('submit', saveProduct);
}

function renderOccasionChips() {
  const wrap = $('occasionChips');
  wrap.innerHTML = '';
  OCCASIONS.forEach((tag) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => {
      if (selectedOccasions.has(tag)) {
        selectedOccasions.delete(tag);
        chip.classList.remove('selected');
      } else {
        selectedOccasions.add(tag);
        chip.classList.add('selected');
      }
    });
    wrap.appendChild(chip);
  });
}

function openDrawer(product) {
  $('formError').classList.add('hidden');
  existingImages = [];
  pendingFiles = [];
  removedExistingPaths = [];
  selectedOccasions = new Set(product?.occasions || []);

  $('drawerTitle').textContent = product ? 'Edit product' : 'Add product';
  $('productId').value = product?.id || '';
  $('fieldName').value = product?.name || '';
  $('fieldPrice').value = product?.price ?? '';
  $('fieldDescription').value = product?.description || '';
  $('fieldInStock').checked = product ? product.inStock !== false : true;
  $('fieldImages').value = '';

  renderCategoryOptions();
  $('fieldCategory').value = product?.category || '';

  document.querySelectorAll('#occasionChips .chip').forEach((chip) => {
    chip.classList.toggle('selected', selectedOccasions.has(chip.textContent));
  });

  if (product && Array.isArray(product.imageUrls)) {
    existingImages = product.imageUrls.map((url, i) => ({
      url, path: (product.imagePaths && product.imagePaths[i]) || null
    }));
  }
  renderImagePreview();

  $('drawerOverlay').classList.remove('hidden');
  $('productDrawer').classList.add('open');
}

function closeDrawer() {
  $('drawerOverlay').classList.add('hidden');
  $('productDrawer').classList.remove('open');
}

function handleNewFiles(e) {
  pendingFiles = pendingFiles.concat(Array.from(e.target.files));
  renderImagePreview();
}

function renderImagePreview() {
  const wrap = $('imagePreview');
  wrap.innerHTML = '';

  existingImages.forEach((img, idx) => {
    const div = document.createElement('div');
    div.className = 'thumb-wrap';
    div.innerHTML = `<img src="${img.url}" alt="">`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.addEventListener('click', () => {
      if (img.path) removedExistingPaths.push(img.path);
      existingImages.splice(idx, 1);
      renderImagePreview();
    });
    div.appendChild(btn);
    wrap.appendChild(div);
  });

  pendingFiles.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'thumb-wrap';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    div.appendChild(img);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.addEventListener('click', () => {
      pendingFiles.splice(idx, 1);
      renderImagePreview();
    });
    div.appendChild(btn);
    wrap.appendChild(div);
  });
}

async function saveProduct(e) {
  e.preventDefault();
  const saveBtn = $('saveProductBtn');
  const errorEl = $('formError');
  errorEl.classList.add('hidden');

  const name = $('fieldName').value.trim();
  const price = Number($('fieldPrice').value);
  const category = $('fieldCategory').value;

  if (!name || !category || isNaN(price) || price < 0) {
    errorEl.textContent = 'Name, price aur category fill karo.';
    errorEl.classList.remove('hidden');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const existingId = $('productId').value;
    const docRef = existingId ? db.collection('products').doc(existingId) : db.collection('products').doc();

    // Upload any newly selected images, compressing them client-side first
    // so phone-camera photos don't bloat the repo.
    const uploadedUrls = [];
    const uploadedPaths = [];
    for (const file of pendingFiles) {
      const base64Content = await compressImage(file);
      const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
      const path = `product-images/${docRef.id}/${Date.now()}_${safeName}.jpg`;
      const uploaded = await uploadImageToGitHub(path, base64Content, `Add image for ${name}`);
      uploadedUrls.push(uploaded.url);
      uploadedPaths.push(uploaded.path);
    }

    const finalImageUrls = existingImages.map(i => i.url).concat(uploadedUrls);
    const finalImagePaths = existingImages.map(i => i.path).concat(uploadedPaths);

    const data = {
      name,
      price,
      category,
      description: $('fieldDescription').value.trim(),
      occasions: Array.from(selectedOccasions),
      inStock: $('fieldInStock').checked,
      imageUrls: finalImageUrls,
      imagePaths: finalImagePaths,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (!existingId) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(data, { merge: true });

    // Clean up images the admin removed from this product during editing.
    // Best-effort: Firestore is already updated, so a failed cleanup here
    // just leaves an orphaned file in the repo rather than breaking the save.
    if (removedExistingPaths.length) {
      await Promise.all(removedExistingPaths.map(path => deleteImageFromGitHub(path)));
    }

    closeDrawer();
  } catch (err) {
    console.error('Save failed:', err);
    errorEl.textContent = 'Save fail ho gaya: ' + err.message;
    errorEl.classList.remove('hidden');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save product';
  }
}

/* ---------------- GitHub image proxy ---------------- */

// Resizes/compresses an image in the browser before upload (max width
// 1200px, JPEG ~82% quality) so phone-camera photos don't bloat the repo.
// Returns base64 content (no data: prefix) ready for the GitHub Contents API.
function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image file'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImageToGitHub(path, base64Content, message) {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(`${GITHUB_PROXY_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ path, base64Content, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Image upload failed');
  return data; // { url, path, sha }
}

async function deleteImageFromGitHub(path) {
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch(`${GITHUB_PROXY_URL}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('Image delete failed for', path, data.error);
    }
  } catch (err) {
    console.warn('Image delete failed for', path, err);
  }
}

/* ---------------- Small helpers ---------------- */
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
