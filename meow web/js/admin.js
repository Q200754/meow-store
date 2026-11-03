// ==========================================================================
// MEOW STUDIO - 2nd Hand Fashion Store Admin Portal (v2.0 High-End UX/UI)
// Features: Search, Status Filters, Category Filters, Image Dropzone & Cover Select,
// Live Analytics, Quick Stock Toggles, Realtime Color Dot Preview, and Store Settings.
// ==========================================================================

const AdminPortal = {
  isAuthenticated: false,
  editingProductId: null,
  currentUploadedImages: [],
  searchQuery: '',
  filterStatus: 'all', // 'all' | 'inStock' | 'sold'
  filterCategory: 'all',

  // ------------------------------------------------------------------------
  // AUTHENTICATION & SESSION
  // ------------------------------------------------------------------------
  openAuthModal() {
    if (this.isAuthenticated) {
      this.openAdminDashboard();
      return;
    }
    const modal = document.getElementById('adminAuthModal');
    if (modal) {
      modal.classList.add('open');
      const input = document.getElementById('adminPinInput');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('adminAuthModal');
    if (modal) modal.classList.remove('open');
  },

  verifyPin() {
    const input = document.getElementById('adminPinInput');
    const enteredPin = input ? input.value.trim() : '';
    const currentPin = Store.settings.adminPin || '8888';

    if (enteredPin === currentPin) {
      this.isAuthenticated = true;
      this.closeAuthModal();
      this.openAdminDashboard();
      showToast('🔓 เข้าสู่ระบบจัดการร้านเสื้อผ้ามือสองแล้ว');
    } else {
      showToast('❌ รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 8888)');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  logout() {
    this.isAuthenticated = false;
    this.closeAdmin();
    showToast('🔒 ล็อคและออกจากระบบจัดการหลังบ้านแล้ว');
  },

  // ------------------------------------------------------------------------
  // DASHBOARD & TABS
  // ------------------------------------------------------------------------
  openAdminDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.switchTab('products');
      this.renderAdminProducts();
      this.loadSettingsForm();
      this.initDropzone();
    }
  },

  closeAdmin() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    this.editingProductId = null;
  },

  switchTab(tabName) {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    contents.forEach(c => {
      const isActive = c.id === `tabContent-${tabName}`;
      c.style.display = isActive ? 'block' : 'none';
      if (isActive) c.scrollTop = 0;
    });

    const container = document.querySelector('.admin-modal-container');
    if (container) container.scrollTop = 0;

    if (tabName === 'products') {
      this.renderAdminProducts();
    } else if (tabName === 'analytics') {
      this.renderAnalytics();
    }
  },

  // ------------------------------------------------------------------------
  // TAB 1: PRODUCT LIST, SEARCH & FILTERS
  // ------------------------------------------------------------------------
  onSearchInput(val) {
    this.searchQuery = val.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clearBtn = document.getElementById('adminClearSearch');
    if (clearBtn) {
      clearBtn.style.display = val.trim() ? 'inline-flex' : 'none';
    }
    this.renderAdminProducts();
  },

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('adminSearchInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('adminClearSearch');
    if (clearBtn) clearBtn.style.display = 'none';
    this.renderAdminProducts();
  },

  setFilterStatus(status) {
    this.filterStatus = status;
    const btns = document.querySelectorAll('.filter-seg-btn');
    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.status === status));
    this.renderAdminProducts();
  },

  setFilterCategory(cat) {
    this.filterCategory = cat;
    this.renderAdminProducts();
  },

  resetAllFilters() {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterCategory = 'all';

    const input = document.getElementById('adminSearchInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('adminClearSearch');
    if (clearBtn) clearBtn.style.display = 'none';

    const catSelect = document.getElementById('adminCategoryFilter');
    if (catSelect) catSelect.value = 'all';

    const btns = document.querySelectorAll('.filter-seg-btn');
    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.status === 'all'));

    this.renderAdminProducts();
  },

  renderAdminProducts() {
    const tbody = document.getElementById('adminProductsTbody');
    const totalCountEl = document.getElementById('adminTotalCount');
    const inStockCountEl = document.getElementById('adminInStockCount');
    const soldCountEl = document.getElementById('adminSoldCountSummary');
    const invValueEl = document.getElementById('adminInventoryValueSummary');
    const tabBadge = document.getElementById('tabBadgeProducts');
    const resultCountEl = document.getElementById('adminFilterResultCount');

    if (!tbody) return;

    const allProducts = Store.products;
    const inStockProducts = allProducts.filter(p => p.inStock);
    const soldProducts = allProducts.filter(p => !p.inStock);
    const totalInventoryValue = inStockProducts.reduce((sum, p) => sum + (p.price || 0), 0);

    // Update global dashboard counter cards
    if (totalCountEl) totalCountEl.textContent = allProducts.length;
    if (inStockCountEl) inStockCountEl.textContent = inStockProducts.length;
    if (soldCountEl) soldCountEl.textContent = soldProducts.length;
    if (invValueEl) invValueEl.textContent = `${Store.settings.currency}${totalInventoryValue.toLocaleString()}`;
    if (tabBadge) tabBadge.textContent = allProducts.length;

    // Filter products
    let filtered = allProducts.filter(prod => {
      // 1. Search Query
      if (this.searchQuery) {
        const q = this.searchQuery;
        const norm = str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const codeMatch = norm(prod.code).includes(q);
        const nameMatch = norm(prod.name).includes(q);
        const sizeMatch = norm(prod.size).includes(q);
        const colorMatch = norm(prod.color).includes(q);
        if (!codeMatch && !nameMatch && !sizeMatch && !colorMatch) return false;
      }
      // 2. Status Filter
      if (this.filterStatus === 'inStock' && !prod.inStock) return false;
      if (this.filterStatus === 'sold' && prod.inStock) return false;
      // 3. Category Filter
      if (this.filterCategory !== 'all' && prod.category !== this.filterCategory) return false;

      return true;
    });

    if (resultCountEl) {
      resultCountEl.textContent = `พบ ${filtered.length} จาก ${allProducts.length} รายการ`;
    }

    const categoryLabels = {
      tshirt: 'เสื้อยืด (T-Shirt)',
      hoodie: 'ฮู้ดดี้ (Hoodie)',
      pants: 'กางเกง (Pants)',
      cap: 'หมวก (Cap)',
      accessories: 'พร็อพ (Accessories)'
    };

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem; opacity: 0.7;">🔍</div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--charcoal-800); margin-bottom: 0.35rem;">
              ไม่พบสินค้าตามเงื่อนไขที่ค้นหา
            </h4>
            <p style="font-size: 0.8rem; color: var(--charcoal-400); margin-bottom: 1rem;">
              ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองสถานะและหมวดหมู่
            </p>
            <button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.78rem;" onclick="AdminPortal.resetAllFilters()">
              ล้างตัวกรองทั้งหมด
            </button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(prod => `
      <tr class="admin-table-row ${!prod.inStock ? 'is-sold-row' : ''}">
        <td>
          <div class="admin-thumb-wrap">
            <img src="${prod.images[0] || ''}" class="admin-table-img" alt="${prod.name}">
            ${prod.images.length > 1 ? `<span class="img-count-chip">${prod.images.length}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="admin-sku-chip">${prod.code}</span>
        </td>
        <td>
          <div class="admin-prod-cell">
            <strong class="admin-prod-name">${prod.name}</strong>
            <div class="admin-prod-sub">
              <span class="admin-size-chip">${prod.size || 'FREE'}</span>
              <span class="admin-spec-sep">•</span>
              <span class="color-dot" style="background-color: ${prod.colorHex || '#F4B6C2'};"></span>
              <span style="font-size: 0.75rem; color: var(--charcoal-600);">${prod.color || '-'}</span>
              <span class="admin-spec-sep">•</span>
              <span class="admin-condition-tag">${prod.condition ? prod.condition.split(' ')[0] : '~95%/100%'}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-pill-tag">${categoryLabels[prod.category] || prod.category}</span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span class="admin-price-text">${Store.settings.currency}${prod.price.toLocaleString()}</span>
            ${prod.originalPrice ? `<span class="admin-price-orig">${Store.settings.currency}${prod.originalPrice.toLocaleString()}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="stock-pill ${prod.inStock ? 'in-stock' : 'sold'}">
            <span class="stock-pill-dot"></span>
            ${prod.inStock ? 'พร้อมส่ง' : 'ขายแล้ว'}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button class="btn-admin-sm btn-stock-toggle" onclick="AdminPortal.quickToggleStock('${prod.id}')" title="สลับสถานะพร้อมส่ง / ปิดการขาย">
              ${prod.inStock ? '✕ มาร์กขายแล้ว' : '🔄 เปิดขายใหม่'}
            </button>
            <button class="btn-admin-sm btn-edit" onclick="AdminPortal.openEditProduct('${prod.id}')" title="แก้ไขข้อมูล">
              ✏️ แก้ไข
            </button>
            <button class="btn-admin-sm btn-delete" onclick="AdminPortal.deleteProduct('${prod.id}')" title="ลบสินค้า">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  quickToggleStock(id) {
    const product = Store.products.find(p => p.id === id);
    if (!product) return;

    product.inStock = !product.inStock;
    product.stockCount = product.inStock ? 1 : 0;

    Store.saveProducts();
    Store.renderProducts();
    Store.renderFeaturedSections();
    this.renderAdminProducts();
    this.renderAnalytics();

    if (product.inStock) {
      showToast(`📦 สินค้า "${product.name}" (${product.code}) กลับมาเปิดขายแล้ว`);
    } else {
      showToast(`🎉 ปิดการขายสินค้า "${product.name}" (${product.code}) แล้ว`);
    }
  },

  // ------------------------------------------------------------------------
  // TAB 2: SALES & INVENTORY ANALYTICS
  // ------------------------------------------------------------------------
  renderAnalytics() {
    const products = Store.products;
    const soldProducts = products.filter(p => !p.inStock);
    const inStockProducts = products.filter(p => p.inStock);

    const totalSoldRevenue = soldProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalInventoryValue = inStockProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalCount = products.length;
    const sellThroughRate = totalCount > 0 ? Math.round((soldProducts.length / totalCount) * 100) : 0;
    const avgPrice = totalCount > 0 ? Math.round((totalSoldRevenue + totalInventoryValue) / totalCount) : 0;

    // Update KPIs
    const elSoldRevenue = document.getElementById('kpiSoldRevenue');
    const elSoldCount = document.getElementById('kpiSoldCount');
    const elInvValue = document.getElementById('kpiInventoryValue');
    const elInvCount = document.getElementById('kpiInventoryCount');
    const elSellThrough = document.getElementById('kpiSellThrough');
    const elTotalPieces = document.getElementById('kpiTotalPieces');
    const elAvgPrice = document.getElementById('kpiAvgPrice');

    if (elSoldRevenue) elSoldRevenue.textContent = `${Store.settings.currency}${totalSoldRevenue.toLocaleString()}`;
    if (elSoldCount) elSoldCount.textContent = `${soldProducts.length} ชิ้นที่ปิดการขายแล้ว`;
    if (elInvValue) elInvValue.textContent = `${Store.settings.currency}${totalInventoryValue.toLocaleString()}`;
    if (elInvCount) elInvCount.textContent = `${inStockProducts.length} ชิ้นรอเจ้าของใหม่`;
    if (elSellThrough) elSellThrough.textContent = `${sellThroughRate}%`;
    if (elTotalPieces) elTotalPieces.textContent = `จากสินค้าทั้งหมด ${totalCount} รายการ`;
    if (elAvgPrice) elAvgPrice.textContent = `${Store.settings.currency}${avgPrice.toLocaleString()}`;

    // Category breakdown
    const categoryLabels = {
      tshirt: 'T-Shirt (เสื้อยืด)',
      hoodie: 'Hoodie (ฮู้ดดี้/สเวตเตอร์)',
      pants: 'Pants (กางเกง)',
      cap: 'Cap (หมวก)',
      accessories: 'Accessories (กระเป๋า/พร็อพ)'
    };

    const categoryListEl = document.getElementById('analyticsCategoryList');
    if (categoryListEl) {
      const categories = ['tshirt', 'hoodie', 'pants', 'cap', 'accessories'];
      categoryListEl.innerHTML = categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat);
        const catSold = catProducts.filter(p => !p.inStock);
        const catInStock = catProducts.filter(p => p.inStock);
        const catRevenue = catSold.reduce((sum, p) => sum + (p.price || 0), 0);
        const catPercent = totalCount > 0 ? Math.round((catProducts.length / totalCount) * 100) : 0;

        return `
          <div class="category-stat-row">
            <div class="cat-stat-meta">
              <span class="cat-stat-name">${categoryLabels[cat] || cat}</span>
              <span class="cat-stat-nums">
                <strong>${catProducts.length} ชิ้น</strong> 
                (พร้อมส่ง ${catInStock.length} / ขายแล้ว ${catSold.length})
                ${catRevenue > 0 ? ` • <span style="color:var(--pink-600); font-weight:700;">ยอดขาย ${Store.settings.currency}${catRevenue.toLocaleString()}</span>` : ''}
              </span>
            </div>
            <div class="cat-progress-bar">
              <div class="cat-progress-fill" style="width: ${catPercent}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Sold Items History Table
    const soldTbody = document.getElementById('analyticsSoldTbody');
    const soldSummaryEl = document.getElementById('analyticsSoldSummary');
    if (soldSummaryEl) {
      soldSummaryEl.textContent = `รวม ${soldProducts.length} ชิ้น (ยอดขาย ${Store.settings.currency}${totalSoldRevenue.toLocaleString()})`;
    }

    if (soldTbody) {
      if (soldProducts.length === 0) {
        soldTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--charcoal-400);">
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🧺</div>
              <p style="font-weight: 600; color: var(--charcoal-700);">ยังไม่มีสินค้าที่มาร์กเป็น "ขายแล้ว"</p>
              <span style="font-size: 0.78rem;">สามารถคลิกปุ่ม "มาร์กขายแล้ว" ในแถบรายการสินค้า เพื่อทดสอบบันทึกยอดขาย</span>
            </td>
          </tr>
        `;
      } else {
        soldTbody.innerHTML = soldProducts.map(p => `
          <tr>
            <td>
              <img src="${p.images[0] || ''}" class="admin-table-img" alt="${p.name}">
            </td>
            <td>
              <span class="admin-sku-chip">${p.code}</span>
            </td>
            <td>
              <strong>${p.name}</strong>
              <div style="font-size: 0.72rem; color: var(--charcoal-400);">ไซซ์: ${p.size || '-'} | ${p.color || '-'}</div>
            </td>
            <td>
              <span class="category-pill-tag">${categoryLabels[p.category] || p.category}</span>
            </td>
            <td>
              <strong style="font-family: var(--font-mono); color: var(--charcoal-900);">
                ${Store.settings.currency}${p.price.toLocaleString()}
              </strong>
            </td>
            <td style="text-align: center;">
              <button class="btn-admin-sm btn-restock" onclick="AdminPortal.quickToggleStock('${p.id}')">
                🔄 นำกลับมาขายใหม่
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  },

  // ------------------------------------------------------------------------
  // TAB 3: IMAGE UPLOAD & GALLERY MANAGEMENT
  // ------------------------------------------------------------------------
  initDropzone() {
    const dropzone = document.getElementById('imgDropzone');
    if (!dropzone || dropzone.dataset.initialized) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.handleImageFiles(files);
      }
    }, false);

    dropzone.dataset.initialized = 'true';
  },

  handleImageFiles(files) {
    if (!files || files.length === 0) return;

    let loadedCount = 0;
    const totalFiles = Array.from(files).filter(f => f.type.startsWith('image/')).length;
    if (totalFiles === 0) {
      showToast('⚠️ กรุณาเลือกไฟล์ที่เป็นรูปภาพ (JPG, PNG, WebP)');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.currentUploadedImages.push(dataUrl);
        loadedCount++;

        if (loadedCount === totalFiles) {
          this.renderImageThumbnails();
          this.syncToUrlTextarea();
          showToast(`📸 เพิ่มรูปภาพจากเครื่องสำเร็จ ${totalFiles} รูป`);
        }
      };
      reader.readAsDataURL(file);
    });
  },

  renderImageThumbnails() {
    const grid = document.getElementById('uploadedThumbsGrid');
    const countEl = document.getElementById('uploadedCount');
    if (!grid) return;

    if (countEl) countEl.textContent = this.currentUploadedImages.length;

    if (this.currentUploadedImages.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--charcoal-400); font-size: 0.82rem; background: var(--surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-light);">
          📷 ยังไม่มีรูปภาพในแกลเลอรี คลิกกล่องด้านบนเพื่ออัปโหลดจากเครื่อง หรือพิมพ์ URL
        </div>
      `;
      return;
    }

    grid.innerHTML = this.currentUploadedImages.map((imgSrc, index) => {
      const isCover = index === 0;
      return `
        <div class="thumb-card ${isCover ? 'is-cover' : ''}">
          <img src="${imgSrc}" class="thumb-img" alt="Product view ${index + 1}">
          ${isCover ? '<span class="thumb-cover-tag">★ หน้าปกหลัก</span>' : ''}
          <div class="thumb-overlay">
            ${!isCover ? `
              <button type="button" class="btn-thumb-action cover" onclick="AdminPortal.setCoverImage(${index})" title="ตั้งเป็นรูปหน้าปก">
                ตั้งหน้าปก
              </button>
            ` : ''}
            <button type="button" class="btn-thumb-action delete" onclick="AdminPortal.removeUploadedImage(${index})" title="ลบรูปนี้">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  setCoverImage(index) {
    if (index <= 0 || index >= this.currentUploadedImages.length) return;
    const [selected] = this.currentUploadedImages.splice(index, 1);
    this.currentUploadedImages.unshift(selected);
    this.renderImageThumbnails();
    this.syncToUrlTextarea();
    showToast('★ ตั้งรูปภาพเป็นหน้าปกหลักแล้ว');
  },

  removeUploadedImage(index) {
    if (index < 0 || index >= this.currentUploadedImages.length) return;
    this.currentUploadedImages.splice(index, 1);
    this.renderImageThumbnails();
    this.syncToUrlTextarea();
  },

  toggleUrlInput() {
    const container = document.getElementById('urlInputContainer');
    if (container) {
      const isHidden = container.style.display === 'none';
      container.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        const textarea = document.getElementById('prodImages');
        if (textarea) textarea.focus();
      }
    }
  },

  syncFromUrlTextarea() {
    const textarea = document.getElementById('prodImages');
    if (!textarea) return;
    const urls = textarea.value.split('\n').map(u => u.trim()).filter(Boolean);
    urls.forEach(url => {
      if (!this.currentUploadedImages.includes(url)) {
        this.currentUploadedImages.push(url);
      }
    });
    this.renderImageThumbnails();
  },

  syncToUrlTextarea() {
    const textarea = document.getElementById('prodImages');
    if (textarea) {
      textarea.value = this.currentUploadedImages.join('\n');
    }
  },

  updateLiveColorPreview(hex) {
    const val = hex || (document.getElementById('prodColorHex') ? document.getElementById('prodColorHex').value : '#F3C5CE');
    const dot = document.getElementById('liveColorPreviewDot');
    if (dot) {
      dot.style.backgroundColor = val || '#F3C5CE';
    }
  },

  // ------------------------------------------------------------------------
  // ADD & EDIT PRODUCT FORM
  // ------------------------------------------------------------------------
  openAddProduct() {
    this.editingProductId = null;
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');
    const submitBtn = document.getElementById('productFormSubmitBtn');
    if (form) form.reset();
    if (title) title.innerHTML = '✨ เพิ่มสินค้ามือสองชิ้นใหม่ <span style="font-size: 0.85rem; font-weight: normal; color: var(--charcoal-500);">(1-of-1 Piece)</span>';
    if (submitBtn) submitBtn.textContent = '💾 บันทึกสินค้าใหม่';

    this.currentUploadedImages = [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
    ];
    this.renderImageThumbnails();
    this.syncToUrlTextarea();

    document.getElementById('prodInStock').checked = true;
    document.getElementById('prodStockCount').value = '1';
    document.getElementById('prodColorHex').value = '#F3C5CE';
    this.updateLiveColorPreview('#F3C5CE');

    this.switchTab('form');
  },

  openEditProduct(id) {
    const product = Store.products.find(p => p.id === id);
    if (!product) return;

    this.editingProductId = id;
    const title = document.getElementById('productFormTitle');
    const submitBtn = document.getElementById('productFormSubmitBtn');
    if (title) title.innerHTML = `✏️ แก้ไขสินค้า: <strong>${product.name}</strong> <span style="font-family: var(--font-mono); color: var(--pink-600);">(${product.code})</span>`;
    if (submitBtn) submitBtn.textContent = '💾 บันทึกการแก้ไข';

    document.getElementById('prodCode').value = product.code;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodOriginalPrice').value = product.originalPrice || '';
    document.getElementById('prodInStock').checked = product.inStock;
    document.getElementById('prodStockCount').value = product.stockCount || 1;
    document.getElementById('prodIsNew').checked = product.isNew || false;
    document.getElementById('prodIsBestSeller').checked = product.isBestSeller || false;
    
    // 2nd Hand specific fields
    document.getElementById('prodFixedSize').value = product.size || '';
    document.getElementById('prodChest').value = product.measurements ? (product.measurements.chest || '') : '';
    document.getElementById('prodLength').value = product.measurements ? (product.measurements.length || '') : '';
    document.getElementById('prodShoulder').value = product.measurements ? (product.measurements.shoulder || '') : '';
    document.getElementById('prodColor').value = product.color || '';
    document.getElementById('prodColorHex').value = product.colorHex || '#F3C5CE';
    this.updateLiveColorPreview(product.colorHex || '#F3C5CE');
    document.getElementById('prodCondition').value = product.condition || '~95%/100% สภาพเหมือนใหม่';
    document.getElementById('prodDefect').value = product.defect || 'ไม่มีตำหนิ';

    // Populate images
    this.currentUploadedImages = Array.isArray(product.images) && product.images.length > 0 
      ? [...product.images] 
      : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'];
    
    this.renderImageThumbnails();
    this.syncToUrlTextarea();

    document.getElementById('prodDescription').value = product.description || '';
    document.getElementById('prodDetails').value = (product.details || []).join('\n');

    this.switchTab('form');
  },

  saveProduct(e) {
    if (e) e.preventDefault();

    const code = document.getElementById('prodCode').value.trim();
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value) || 0;
    const originalPrice = parseFloat(document.getElementById('prodOriginalPrice').value) || null;
    const inStock = document.getElementById('prodInStock').checked;
    const isNew = document.getElementById('prodIsNew').checked;
    const isBestSeller = document.getElementById('prodIsBestSeller').checked;

    // 2nd hand specs
    const size = document.getElementById('prodFixedSize').value.trim() || 'FREE SIZE';
    const chest = document.getElementById('prodChest').value.trim();
    const length = document.getElementById('prodLength').value.trim();
    const shoulder = document.getElementById('prodShoulder').value.trim();
    const color = document.getElementById('prodColor').value.trim() || 'Pastel';
    const colorHex = document.getElementById('prodColorHex').value.trim() || '#F3C5CE';
    const condition = document.getElementById('prodCondition').value.trim() || '~95%/100%';
    const defect = document.getElementById('prodDefect').value.trim() || 'ไม่มีตำหนิ';

    // Images from currentUploadedImages
    let images = [...this.currentUploadedImages];
    if (images.length === 0) {
      const textarea = document.getElementById('prodImages');
      if (textarea && textarea.value.trim()) {
        images = textarea.value.split('\n').map(u => u.trim()).filter(Boolean);
      }
    }
    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'];
    }

    const description = document.getElementById('prodDescription').value.trim();
    const detailsStr = document.getElementById('prodDetails').value;
    const details = detailsStr.split('\n').map(d => d.trim()).filter(Boolean);

    if (!code || !name || price <= 0) {
      showToast('⚠️ กรุณากรอกรหัสสินค้า ชื่อสินค้า และราคา');
      return;
    }

    const measurements = { chest, length, shoulder };

    if (this.editingProductId) {
      const index = Store.products.findIndex(p => p.id === this.editingProductId);
      if (index !== -1) {
        Store.products[index] = {
          ...Store.products[index],
          code,
          name,
          category,
          price,
          originalPrice,
          inStock,
          stockCount: inStock ? 1 : 0,
          isNew,
          isBestSeller,
          size,
          measurements,
          color,
          colorHex,
          condition,
          defect,
          images,
          description,
          details
        };
        showToast(`✅ อัปเดตสินค้ามือสอง "${name}" แล้ว`);
      }
    } else {
      const newProduct = {
        id: 'prod-' + Date.now(),
        code,
        name,
        category,
        price,
        originalPrice,
        inStock,
        stockCount: inStock ? 1 : 0,
        isNew,
        isBestSeller,
        size,
        measurements,
        color,
        colorHex,
        condition,
        defect,
        images,
        description,
        details
      };
      Store.products.unshift(newProduct);
      showToast(`🎉 เพิ่มสินค้ามือสอง "${name}" เรียบร้อยแล้ว`);
    }

    Store.saveProducts();
    Store.renderCategories();
    Store.renderProducts();
    Store.renderFeaturedSections();

    this.switchTab('products');
  },

  deleteProduct(id) {
    const prod = Store.products.find(p => p.id === id);
    if (!prod) return;

    if (confirm(`ต้องการลบสินค้ามือสอง "${prod.name}" (${prod.code}) ออกจากระบบหรือไม่?`)) {
      Store.products = Store.products.filter(p => p.id !== id);
      Store.saveProducts();
      Store.renderCategories();
      Store.renderProducts();
      Store.renderFeaturedSections();
      this.renderAdminProducts();
      showToast(`🗑️ ลบสินค้า "${prod.name}" เรียบร้อยแล้ว`);
    }
  },

  // ------------------------------------------------------------------------
  // TAB 4: STORE & IG SETTINGS
  // ------------------------------------------------------------------------
  loadSettingsForm() {
    document.getElementById('settingShopName').value = Store.settings.shopName || '';
    document.getElementById('settingIgHandle').value = Store.settings.instagramHandle || '';
    document.getElementById('settingLineId').value = Store.settings.lineId || '';
    document.getElementById('settingAnnouncement').value = Store.settings.announcementText || '';
    document.getElementById('settingCurrency').value = Store.settings.currency || '฿';
    document.getElementById('settingPin').value = Store.settings.adminPin || '8888';
  },

  saveShopSettings(e) {
    if (e) e.preventDefault();

    const shopName = document.getElementById('settingShopName').value.trim();
    const instagramHandle = document.getElementById('settingIgHandle').value.trim().replace('@', '');
    const lineId = document.getElementById('settingLineId').value.trim();
    const announcementText = document.getElementById('settingAnnouncement').value.trim();
    const currency = document.getElementById('settingCurrency').value.trim();
    const adminPin = document.getElementById('settingPin').value.trim();

    if (!shopName || !instagramHandle) {
      showToast('⚠️ กรุณาระบุชื่อร้านและบัญชี Instagram');
      return;
    }

    const instagramUrl = instagramHandle === DEFAULT_SHOP_SETTINGS.instagramHandle
      ? DEFAULT_SHOP_SETTINGS.instagramUrl
      : `https://www.instagram.com/${instagramHandle}/`;

    Store.settings = {
      ...Store.settings,
      shopName,
      instagramHandle,
      instagramUrl,
      lineId,
      announcementText,
      currency,
      adminPin: adminPin || '8888'
    };

    Store.saveSettings();
    Store.renderProducts();
    Store.renderFeaturedSections();
    showToast('✨ บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว');
  },

  resetToDefaultCatalog() {
    if (confirm('⚠️ ยืนยันการรีเซ็ตสินค้าตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้น? (ข้อมูลที่เพิ่มเองจะถูกล้าง)')) {
      Store.products = [...DEFAULT_PRODUCTS];
      Store.settings = { ...DEFAULT_SHOP_SETTINGS };
      Store.saveProducts();
      Store.saveSettings();
      this.resetAllFilters();
      this.loadSettingsForm();
      Store.renderCategories();
      Store.renderProducts();
      Store.renderFeaturedSections();
      showToast('🔄 รีเซ็ตข้อมูลสินค้าเริ่มต้นเรียบร้อยแล้ว');
    }
  }
};
