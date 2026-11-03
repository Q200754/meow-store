// ==========================================================================
// MEOW STUDIO - 2nd Hand Fashion Store Application Logic & IG Order Flow
// No color/size selection - Each piece is 1-of-1 vintage with fixed measurements
// ==========================================================================

const Store = {
  products: [],
  settings: {},
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
  activeProduct: null,

  // Initialize store with localStorage persistence
  init() {
    // Check if user previously had 1st hand demo data, replace with 2nd hand data if necessary
    const savedProducts = localStorage.getItem('meow_products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        // If old data had colors array instead of color string, reset to 2nd hand data
        if (parsed.length > 0 && Array.isArray(parsed[0].colors)) {
          this.products = [...DEFAULT_PRODUCTS];
          this.saveProducts();
        } else {
          // Normalize condition ratings to ~...%/100% format if old /10 format is detected
          let hasMigrated = false;
          this.products = parsed.map(p => {
            let updated = { ...p };
            if (updated.condition && updated.condition.includes('/10') && !updated.condition.includes('/100%')) {
              updated.condition = updated.condition
                .replace(/9\.5\/10/g, '~95%/100%')
                .replace(/9\.0\/10/g, '~90%/100%')
                .replace(/9\/10/g, '~90%/100%')
                .replace(/8\.5\/10/g, '~85%/100%')
                .replace(/8\/10/g, '~80%/100%')
                .replace(/10\/10/g, '~100%/100%');
              hasMigrated = true;
            }
            if (Array.isArray(updated.details)) {
              updated.details = updated.details.map(d => {
                if (typeof d === 'string' && d.includes('/10') && !d.includes('/100%')) {
                  hasMigrated = true;
                  return d.replace(/9\.5\/10/g, '~95%/100%')
                          .replace(/9\.0\/10/g, '~90%/100%')
                          .replace(/9\/10/g, '~90%/100%')
                          .replace(/8\.5\/10/g, '~85%/100%')
                          .replace(/8\/10/g, '~80%/100%')
                          .replace(/10\/10/g, '~100%/100%');
                }
                return d;
              });
            }
            return updated;
          });
          if (hasMigrated) {
            this.saveProducts();
          }
        }
      } catch (e) {
        this.products = [...DEFAULT_PRODUCTS];
      }
    } else {
      this.products = [...DEFAULT_PRODUCTS];
      this.saveProducts();
    }

    const savedSettings = localStorage.getItem('meow_settings');
    if (savedSettings) {
      try {
        this.settings = JSON.parse(savedSettings);
        if (!this.settings.instagramHandle || this.settings.instagramHandle === 'meow.studio.th') {
          this.settings.instagramHandle = DEFAULT_SHOP_SETTINGS.instagramHandle;
          this.settings.instagramUrl = DEFAULT_SHOP_SETTINGS.instagramUrl;
          this.saveSettings();
        }
        if (this.settings.announcementText && this.settings.announcementText.includes('9/10+')) {
          this.settings.announcementText = this.settings.announcementText.replace('9/10+', '~90%+/100%');
          this.saveSettings();
        }
      } catch (e) {
        this.settings = { ...DEFAULT_SHOP_SETTINGS };
      }
    } else {
      this.settings = { ...DEFAULT_SHOP_SETTINGS };
      this.saveSettings();
    }

    this.applyShopSettings();
    this.renderCategories();
    this.renderProducts();
    this.renderFeaturedSections();
    this.setupEventListeners();
    this.checkUrlParams();
  },

  saveProducts() {
    localStorage.setItem('meow_products', JSON.stringify(this.products));
  },

  saveSettings() {
    localStorage.setItem('meow_settings', JSON.stringify(this.settings));
    this.applyShopSettings();
  },

  applyShopSettings() {
    const logoTexts = document.querySelectorAll('.shop-name-display');
    logoTexts.forEach(el => el.textContent = this.settings.shopName);

    const announcementEl = document.getElementById('announcementText');
    if (announcementEl) announcementEl.textContent = this.settings.announcementText;

    const igHandleDisplays = document.querySelectorAll('.ig-handle-display');
    igHandleDisplays.forEach(el => el.textContent = `@${this.settings.instagramHandle}`);

    const igLinks = document.querySelectorAll('.ig-link-target');
    igLinks.forEach(link => {
      link.href = this.settings.instagramUrl || `https://www.instagram.com/${this.settings.instagramHandle}/`;
    });
  },

  renderCategories() {
    const container = document.getElementById('categoriesBar');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const count = cat.id === 'all' 
        ? this.products.length 
        : this.products.filter(p => p.category === cat.id).length;

      const isActive = this.activeCategory === cat.id;
      return `
        <button class="category-pill ${isActive ? 'active' : ''}" data-category="${cat.id}">
          <span class="cat-icon">${cat.icon}</span>
          <span>${cat.name}</span>
          <span style="font-size: 0.7rem; opacity: 0.7; margin-left: 2px;">(${count})</span>
        </button>
      `;
    }).join('');
  },

  getFilteredProducts() {
    return this.products.filter(item => {
      if (this.activeCategory !== 'all' && item.category !== this.activeCategory) {
        return false;
      }
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchSize = item.size ? item.size.toLowerCase().includes(query) : false;
        if (!matchName && !matchCode && !matchSize) return false;
      }
      return true;
    }).sort((a, b) => {
      // In stock items first
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      if (this.sortBy === 'price-low') return a.price - b.price;
      if (this.sortBy === 'price-high') return b.price - a.price;
      if (this.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0;
    });
  },

  renderProducts() {
    const grid = document.getElementById('productGrid');
    const countBadge = document.getElementById('productCountBadge');
    if (!grid) return;

    const filtered = this.getFilteredProducts();

    if (countBadge) {
      countBadge.textContent = `พบสินค้า ${filtered.length} รายการ`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔍</div>
          <h3 style="font-weight: 700; color: var(--charcoal-800); margin-bottom: 0.4rem;">ไม่พบสินค้าที่ตรงกับการค้นหา</h3>
          <p style="color: var(--charcoal-500); font-size: 0.9rem; margin-bottom: 1.25rem;">ลองเปลี่ยนหมวดหมู่หรือคำค้นหาดูอีกครั้งนะคะ</p>
          <button class="btn-primary" onclick="Store.resetFilters()">ล้างตัวกรองทั้งหมด</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(product => this.createProductCardHtml(product)).join('');
  },

  // 2nd Hand Product Card (with 1-of-1 badge, condition, fixed size, and sold out state)
  createProductCardHtml(product) {
    const primaryImg = product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
    const secondaryImg = product.images[1] || primaryImg;

    let badgeHtml = '';
    if (!product.inStock) {
      badgeHtml += `<span class="badge-tag badge-sold-out">SOLD OUT</span>`;
    } else {
      badgeHtml += `<span class="badge-tag badge-one-piece">1-OF-1 (มีตัวเดียว)</span>`;
      if (product.isNew) badgeHtml += `<span class="badge-tag badge-new">NEW DROP</span>`;
      if (product.isBestSeller) badgeHtml += `<span class="badge-tag badge-hot">HOT</span>`;
    }

    // Measurements snippet for 2nd hand card
    let measurementText = product.size || 'FREE SIZE';
    if (product.measurements && product.measurements.chest) {
      measurementText += ` • ${product.measurements.chest}`;
    }

    return `
      <div class="product-card ${!product.inStock ? 'is-sold-out' : ''}" data-product-id="${product.id}">
        <div class="card-image-wrap" onclick="Store.openProductModal('${product.id}')">
          <img class="primary-img" src="${primaryImg}" alt="${product.name}" loading="lazy">
          <img class="secondary-img" src="${secondaryImg}" alt="${product.name} back" loading="lazy">
          
          <div class="card-badges">
            ${badgeHtml}
          </div>

          <div class="card-quick-actions">
            <button class="btn-card-order" onclick="event.stopPropagation(); Store.openProductModal('${product.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ${product.inStock ? 'ดูรายละเอียด & สั่งซื้อ' : 'ดูรายละเอียด (ขายแล้ว)'}
            </button>
          </div>
        </div>

        <div class="card-details">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span class="card-sku">${product.code}</span>
            <span class="condition-pill">${product.condition ? product.condition.split(' ')[0] : '~90%/100%'}</span>
          </div>

          <h3 class="card-title" onclick="Store.openProductModal('${product.id}')">${product.name}</h3>

          <!-- Fixed Color and Size specification (2nd Hand 1-of-1) -->
          <div class="secondhand-specs-row">
            <div class="fixed-spec-tag">
              <span class="color-dot" style="background-color: ${product.colorHex || '#F4B6C2'};"></span>
              <span>${product.color || 'พาสเทล'}</span>
            </div>
            <div class="fixed-size-tag">
              ${measurementText}
            </div>
          </div>

          <div class="card-pricing">
            <span class="price-current">${this.settings.currency}${product.price.toLocaleString()}</span>
            ${product.originalPrice && product.originalPrice > product.price 
              ? `<span class="price-original">${this.settings.currency}${product.originalPrice.toLocaleString()}</span>` 
              : ''}
            <span class="secondhand-status-tag ${product.inStock ? 'available' : 'sold'}">
              ${product.inStock ? '● ชิ้นเดียวพร้อมส่ง' : '✕ ขายแล้ว'}
            </span>
          </div>
        </div>
      </div>
    `;
  },

  renderFeaturedSections() {
    const newArrivalsGrid = document.getElementById('newArrivalsGrid');
    if (newArrivalsGrid) {
      const newItems = this.products.filter(p => p.isNew).slice(0, 4);
      newArrivalsGrid.innerHTML = newItems.map(p => this.createProductCardHtml(p)).join('');
    }
  },

  // Open 2nd Hand Product Detail Modal
  openProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.activeProduct = product;

    const modal = document.getElementById('productModal');
    const container = document.getElementById('productModalContent');
    if (!modal || !container) return;

    const mainImg = product.images[0] || '';
    const thumbsHtml = product.images.map((img, idx) => `
      <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="Store.switchMainImage('${img}', this)">
        <img src="${img}" alt="angle ${idx + 1}">
      </div>
    `).join('');

    const detailsHtml = (product.details || []).map(d => `<li>${d}</li>`).join('');

    // Format measurements for 2nd hand
    const m = product.measurements || {};
    const measurementsHtml = `
      <div class="measurements-box">
        <div class="measure-item">
          <span class="measure-label">อก (Chest)</span>
          <span class="measure-val">${m.chest || '-'}</span>
        </div>
        <div class="measure-item">
          <span class="measure-label">ยาว (Length)</span>
          <span class="measure-val">${m.length || '-'}</span>
        </div>
        <div class="measure-item">
          <span class="measure-label">ไหล่ / สะโพก</span>
          <span class="measure-val">${m.shoulder || '-'}</span>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="detail-grid">
        <!-- Gallery -->
        <div class="detail-gallery">
          <div class="gallery-main-view">
            <img id="modalMainImage" src="${mainImg}" alt="${product.name}">
            <div class="one-of-one-stamp">1 OF 1 PIECE • มีตัวเดียว</div>
          </div>
          <div class="gallery-thumbs">
            ${thumbsHtml}
          </div>
        </div>

        <!-- Product Details -->
        <div class="detail-info">
          <div class="detail-header-meta">
            <span class="sku-badge-large">รหัสสินค้า: ${product.code}</span>
            <span class="stock-status ${product.inStock ? '' : 'sold-out'}">
              ${product.inStock ? '● สินค้ามือสองพร้อมส่ง (มีตัวเดียว)' : '✕ สินค้าขายแล้ว (SOLD OUT)'}
            </span>
          </div>

          <h2 class="detail-title">${product.name}</h2>

          <div class="detail-pricing">
            <span class="detail-price-main">${this.settings.currency}${product.price.toLocaleString()}</span>
            ${product.originalPrice && product.originalPrice > product.price 
              ? `<span class="detail-price-crossed">${this.settings.currency}${product.originalPrice.toLocaleString()}</span>` 
              : ''}
            <span class="vintage-grade-tag">เกรดวินเทจคัดพิเศษ</span>
          </div>

          <!-- Secondhand Fixed Specifications (NO SELECTOR - FIXED 1-OF-1) -->
          <div class="secondhand-inspect-card">
            <div class="inspect-row">
              <span class="inspect-title">ไซซ์เสื้อ (Size)</span>
              <strong class="inspect-value" style="font-size: 1.05rem; color: var(--pink-600);">${product.size}</strong>
            </div>

            <!-- Measurements grid -->
            ${measurementsHtml}

            <div class="inspect-row" style="margin-top: 0.75rem; border-top: 1px dashed var(--border-light); padding-top: 0.6rem;">
              <span class="inspect-title">โทนสีของเสื้อ</span>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span class="color-dot" style="background-color: ${product.colorHex || '#F4B6C2'};"></span>
                <span class="inspect-value">${product.color || 'พาสเทล'}</span>
              </div>
            </div>

            <div class="inspect-row">
              <span class="inspect-title">ระดับสภาพ (Condition)</span>
              <span class="inspect-badge-green">${product.condition || '~95%/100% สภาพดีเยี่ยม'}</span>
            </div>

            <div class="inspect-row">
              <span class="inspect-title">ตำหนิ (Defects)</span>
              <span class="inspect-value" style="color: var(--charcoal-600);">${product.defect || 'ไม่มีตำหนิ (ผ่านการคลีนแล้ว)'}</span>
            </div>
          </div>

          <!-- Instagram Order Box & Screenshot Card -->
          <div class="ig-order-box">
            <div class="ig-order-header">
              <span class="ig-order-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                สั่งซื้อทาง Instagram DM
              </span>
              <span class="ig-badge-pill">เสื้อผ้ามือสอง 1-OF-1</span>
            </div>

            <!-- Mobile Screenshot Preview Frame (Perfect for DM capture) -->
            <div class="screenshot-preview-card" id="screenshotPreviewFrame">
              <div class="screenshot-stamp">
                <span class="screenshot-shop-tag">${this.settings.shopName} [2ND HAND]</span>
                <span class="screenshot-handle-tag">@${this.settings.instagramHandle}</span>
              </div>
              <div class="screenshot-order-summary">
                <img class="screenshot-img-mini" id="screenshotThumb" src="${mainImg}" alt="thumbnail">
                <div class="screenshot-order-info">
                  <div class="screenshot-sku-highlight">รหัสสินค้า: ${product.code}</div>
                  <div class="screenshot-title-text">${product.name}</div>
                  <div class="screenshot-specs">
                    ไซซ์: <strong>${product.size}</strong> (${product.measurements ? product.measurements.chest : ''}) | 
                    สภาพ: <strong>${product.condition ? product.condition.split(' ')[0] : '~95%/100%'}</strong>
                  </div>
                </div>
                <div class="screenshot-price-tag">
                  ${this.settings.currency}${product.price.toLocaleString()}
                </div>
              </div>
              <div class="screenshot-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                แคปภาพการ์ดนี้ หรือกดปุ่มด้านล่างเพื่อส่งข้อมูลใน DM ได้ทันที
              </div>
            </div>

            <!-- Direct Actions -->
            ${product.inStock ? `
              <button class="btn-ig-order-main" onclick="Store.handleInstagramOrder()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                สั่งซื้อ / ทักแชตรับชิ้นนี้ (@${this.settings.instagramHandle})
              </button>

              <button class="btn-copy-order-text" onclick="Store.copyOrderTextOnly()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                คัดลอกข้อความสำหรับส่งในแชต IG
              </button>
            ` : `
              <button class="btn-ig-order-main" style="background: var(--charcoal-400); cursor: not-allowed; box-shadow: none;" disabled>
                สินค้ารายการนี้ขายแล้ว (SOLD OUT)
              </button>
            `}
          </div>

          <!-- Description Accordion -->
          <div class="detail-desc-box">
            <p class="detail-desc-text">${product.description}</p>
            <ul class="detail-bullets">
              ${detailsHtml}
            </ul>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      this.activeProduct = null;
    }
  },

  switchMainImage(imgUrl, thumbEl) {
    const mainImg = document.getElementById('modalMainImage');
    const screenshotThumb = document.getElementById('screenshotThumb');
    if (mainImg) mainImg.src = imgUrl;
    if (screenshotThumb) screenshotThumb.src = imgUrl;

    const allThumbs = document.querySelectorAll('.gallery-thumb');
    allThumbs.forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  // Generate 2nd Hand Order Message
  generateOrderMessage() {
    if (!this.activeProduct) return '';
    const p = this.activeProduct;
    const m = p.measurements || {};
    return `สวัสดีค่ะ สนใจรับสินค้ามือสองจาก ${this.settings.shopName} ✨
- รหัสสินค้า: ${p.code}
- รายการ: ${p.name}
- ไซซ์: ${p.size} (อก ${m.chest || '-'} ยาว ${m.length || '-'})
- สี: ${p.color || '-'}
- สภาพ: ${p.condition || '~95%/100%'}
- ราคา: ${this.settings.currency}${p.price.toLocaleString()} บาท
(รับชิ้นนี้ค่ะ ยังมีของอยู่ไหมคะ? แคปภาพหน้าจอมาแล้วค่ะ 🌸)`;
  },

  async copyOrderTextOnly() {
    const msg = this.generateOrderMessage();
    try {
      await navigator.clipboard.writeText(msg);
      showToast('📋 คัดลอกข้อความสั่งซื้อแล้ว! นำไป Paste ในแชต IG ได้ทันที');
    } catch (err) {
      fallbackCopyText(msg);
      showToast('📋 คัดลอกข้อความสั่งซื้อแล้ว!');
    }
  },

  async handleInstagramOrder() {
    if (!this.activeProduct || !this.activeProduct.inStock) return;

    const msg = this.generateOrderMessage();
    
    try {
      await navigator.clipboard.writeText(msg);
    } catch (e) {
      fallbackCopyText(msg);
    }

    showToast('✨ คัดลอกข้อความแล้ว! กำลังเปิดหน้า Instagram @' + this.settings.instagramHandle);

    setTimeout(() => {
      const igUrl = this.settings.instagramUrl || `https://www.instagram.com/${this.settings.instagramHandle}/`;
      window.open(igUrl, '_blank');
    }, 600);
  },

  openSizeGuide() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) modal.classList.add('open');
  },

  closeSizeGuide() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) modal.classList.remove('open');
  },

  resetFilters() {
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    this.renderCategories();
    this.renderProducts();
  },

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku') || params.get('code');
    if (sku) {
      const found = this.products.find(p => p.code.toLowerCase() === sku.toLowerCase());
      if (found) {
        setTimeout(() => this.openProductModal(found.id), 300);
      }
    }

    if (params.get('admin') === '1' || params.get('admin') === 'true') {
      setTimeout(() => AdminPortal.openAuthModal(), 400);
    }
  },

  setupEventListeners() {
    const catBar = document.getElementById('categoriesBar');
    if (catBar) {
      catBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-pill');
        if (!btn) return;
        this.activeCategory = btn.dataset.category;
        this.renderCategories();
        this.renderProducts();
      });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProducts();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerCloseBtn');

    const toggleDrawer = (open) => {
      if (drawer && backdrop) {
        drawer.classList.toggle('open', open);
        backdrop.classList.toggle('open', open);
      }
    };

    if (menuBtn) menuBtn.addEventListener('click', () => toggleDrawer(true));
    if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
    if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProductModal();
        AdminPortal.closeAdmin();
      }
    });

    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 20);
      }
    });
  }
};

function showToast(message, duration = 3200) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(textArea);
}

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
});
