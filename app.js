/**
 * Laundry Yuk - Complete Unified Single Page Application (SPA)
 * Authentication Rule:
 * - Login Admin ("admin") -> ADMIN (Akses Dashboard Hub, Kelola Pesanan, Papan Status Kanban)
 * - Login Nomor HP -> USER / PELANGGAN (Akses Riwayat Pesanan & Detail Pesanan)
 * Orders:
 * - Default: Kosong (Empty)
 */

class LaundryYukApp {
  constructor() {
    const isLocalFile = window.location.protocol === 'file:';
    this.apiUrl = isLocalFile ? 'http://localhost:5000/api' : '/api';
    this.isServerConnected = false;
    this.orders = this.loadOrders();
    this.currentUser = this.loadCurrentUser();
    this.currentOrder = this.orders[0] || null;
    this.currentFilter = 'all';
    this.toastTimer = null;

    this.initDOMElements();
    this.bindEvents();
    this.handleRoute();

    // Sync with backend API
    this.syncDatabase();
    setInterval(() => this.syncDatabase(true), 10000);
  }

  loadOrders() {
    const saved = localStorage.getItem('laundryOrdersUnified');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Fallback below
      }
    }
    // Default initial orders: Kosong (Empty)
    localStorage.setItem('laundryOrdersUnified', JSON.stringify([]));
    return [];
  }

  saveOrders() {
    localStorage.setItem('laundryOrdersUnified', JSON.stringify(this.orders));
  }

  loadCurrentUser() {
    const saved = localStorage.getItem('laundryYukCurrentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  saveCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('laundryYukCurrentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('laundryYukCurrentUser');
    }
  }

  async checkServerConnection() {
    try {
      const res = await fetch(`${this.apiUrl}/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Status not ok');
      const data = await res.json();
      this.isServerConnected = data.status === 'online';
      return true;
    } catch (e) {
      this.isServerConnected = false;
      return false;
    }
  }

  async syncDatabase(isSilent = false) {
    const isConn = await this.checkServerConnection();
    if (!isConn) return;

    try {
      const res = await fetch(`${this.apiUrl}/orders`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.orders = json.data;
          this.saveOrders();

          const hash = window.location.hash.replace('#', '') || 'login';
          const [route] = hash.split('?');
          if (route === 'orders') {
            this.updateCustomerStats();
            this.renderCustomerOrders(this.currentFilter);
          } else if (route === 'admin-orders') {
            this.renderAdminOrdersView();
          } else if (route === 'admin-kanban') {
            this.renderAdminKanbanView();
          }
        }
      }
    } catch (err) {
      if (!isSilent) console.warn('Sinkronisasi data gagal:', err);
    }
  }

  initDOMElements() {
    // Navigation & Views
    this.appNavbar = document.getElementById('appNavbar');
    this.viewLogin = document.getElementById('viewLogin');
    this.viewOrders = document.getElementById('viewOrders');
    this.viewDetail = document.getElementById('viewDetail');
    this.viewAdminHub = document.getElementById('viewAdminHub');
    this.viewAdminOrders = document.getElementById('viewAdminOrders');
    this.viewAdminKanban = document.getElementById('viewAdminKanban');

    // Navbar Role Badge & Menus
    this.roleIndicatorBadge = document.getElementById('roleIndicatorBadge');
    this.roleText = document.getElementById('roleText');
    this.profileBtn = document.getElementById('profileBtn');
    this.profileDropdown = document.getElementById('profileDropdown');
    this.userNameDisplay = document.getElementById('userNameDisplay');
    this.userEmailDisplay = document.getElementById('userEmailDisplay');
    this.userMenuLinks = document.getElementById('userMenuLinks');
    this.adminMenuLinks = document.getElementById('adminMenuLinks');
    this.menuOrdersBtn = document.getElementById('menuOrdersBtn');
    this.menuAdminHubBtn = document.getElementById('menuAdminHubBtn');
    this.menuAdminOrdersBtn = document.getElementById('menuAdminOrdersBtn');
    this.menuAdminKanbanBtn = document.getElementById('menuAdminKanbanBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.navLogoBtn = document.getElementById('navLogoBtn');

    // Login Form elements
    this.loginForm = document.getElementById('loginForm');
    this.identifierInput = document.getElementById('identifier');
    this.passwordInput = document.getElementById('password');
    this.togglePasswordBtn = document.getElementById('togglePassword');
    this.eyeOffIcon = document.getElementById('eyeOffIcon');
    this.eyeOnIcon = document.getElementById('eyeOnIcon');
    this.identifierError = document.getElementById('identifierError');
    this.passwordError = document.getElementById('passwordError');
    this.loginBtn = document.getElementById('loginBtn');
    this.loginSpinner = document.getElementById('loginSpinner');
    this.forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    this.registerBtn = document.getElementById('registerBtn');

    // Customer Orders View elements
    this.statTotal = document.getElementById('statTotal');
    this.statProcessing = document.getElementById('statProcessing');
    this.statCompleted = document.getElementById('statCompleted');
    this.tabAll = document.getElementById('tabAll');
    this.tabProcessing = document.getElementById('tabProcessing');
    this.tabCompleted = document.getElementById('tabCompleted');
    this.tabPills = document.querySelectorAll('.tab-pill');
    this.ordersListContainer = document.getElementById('ordersListContainer');

    // Customer Detail View elements
    this.backToOrdersBtn = document.getElementById('backToOrdersBtn');
    this.detailOrderCode = document.getElementById('detailOrderCode');
    this.detailStatusBadge = document.getElementById('detailStatusBadge');
    this.detailStepper = document.getElementById('detailStepper');
    this.detailBreakdownList = document.getElementById('detailBreakdownList');
    this.detailDate = document.getElementById('detailDate');
    this.detailEstDate = document.getElementById('detailEstDate');
    this.detailPaymentStatus = document.getElementById('detailPaymentStatus');
    this.payNowBtn = document.getElementById('payNowBtn');

    // Admin Hub elements
    this.cardGoAdminOrders = document.getElementById('cardGoAdminOrders');
    this.btnAdminPesanan = document.getElementById('btnAdminPesanan');
    this.cardGoAdminKanban = document.getElementById('cardGoAdminKanban');
    this.btnAdminPapanStatus = document.getElementById('btnAdminPapanStatus');

    // Admin Orders elements
    this.adminCountProcessing = document.getElementById('adminCountProcessing');
    this.adminCountReady = document.getElementById('adminCountReady');
    this.adminCountUnpaid = document.getElementById('adminCountUnpaid');
    this.btnSubnavOrders = document.getElementById('btnSubnavOrders');
    this.btnSubnavKanban = document.getElementById('btnSubnavKanban');
    this.adminNewOrderForm = document.getElementById('adminNewOrderForm');
    this.adminCustomerName = document.getElementById('adminCustomerName');
    this.adminCustomerPhone = document.getElementById('adminCustomerPhone');
    this.adminServiceSelect = document.getElementById('adminServiceSelect');
    this.adminWeightInput = document.getElementById('adminWeightInput');
    this.adminCalcTotal = document.getElementById('adminCalcTotal');
    this.adminOrdersTableBody = document.getElementById('adminOrdersTableBody');

    // Admin Kanban elements
    this.btnKanbanToOrders = document.getElementById('btnKanbanToOrders');
    this.btnKanbanCurrent = document.getElementById('btnKanbanCurrent');
    this.countWaiting = document.getElementById('countWaiting');
    this.countWashing = document.getElementById('countWashing');
    this.countIroning = document.getElementById('countIroning');
    this.countReady = document.getElementById('countReady');
    this.kanbanCardsWaiting = document.getElementById('kanbanCardsWaiting');
    this.kanbanCardsWashing = document.getElementById('kanbanCardsWashing');
    this.kanbanCardsIroning = document.getElementById('kanbanCardsIroning');
    this.kanbanCardsReady = document.getElementById('kanbanCardsReady');

    // Modals & Toast
    this.paymentModal = document.getElementById('paymentModal');
    this.returnDetailBtn = document.getElementById('returnDetailBtn');
    this.trxId = document.getElementById('trxId');
    this.trxTime = document.getElementById('trxTime');
    this.trxAmount = document.getElementById('trxAmount');
    this.generalModal = document.getElementById('generalModal');
    this.modalBody = document.getElementById('modalBody');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.toast = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');
    this.toastIcon = document.getElementById('toastIcon');
  }

  bindEvents() {
    // Hash router
    window.addEventListener('hashchange', () => this.handleRoute());

    // Password visibility toggle
    this.togglePasswordBtn.addEventListener('click', () => {
      const isPassword = this.passwordInput.getAttribute('type') === 'password';
      if (isPassword) {
        this.passwordInput.setAttribute('type', 'text');
        this.eyeOffIcon.classList.add('hidden');
        this.eyeOnIcon.classList.remove('hidden');
      } else {
        this.passwordInput.setAttribute('type', 'password');
        this.eyeOffIcon.classList.remove('hidden');
        this.eyeOnIcon.classList.add('hidden');
      }
      this.passwordInput.focus();
    });

    // Clear login errors
    this.identifierInput.addEventListener('input', () => {
      this.identifierInput.classList.remove('input-error');
      this.identifierError.textContent = '';
    });
    this.passwordInput.addEventListener('input', () => {
      this.passwordInput.classList.remove('input-error');
      this.passwordError.textContent = '';
    });

    // Login Form Submit
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));

    // Profile Dropdown
    this.profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.profileDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!this.profileDropdown.classList.contains('hidden') && !this.profileBtn.contains(e.target)) {
        this.profileDropdown.classList.add('hidden');
      }
    });

    // Logout
    this.logoutBtn.addEventListener('click', () => {
      this.saveCurrentUser(null);
      this.profileDropdown.classList.add('hidden');
      this.showToast('Anda telah keluar akun.', 'success');
      this.navigate('login');
    });

    // User Dropdown Link
    this.menuOrdersBtn.addEventListener('click', () => {
      this.profileDropdown.classList.add('hidden');
      this.navigate('orders');
    });

    // Admin Dropdown Links
    this.menuAdminHubBtn.addEventListener('click', () => {
      this.profileDropdown.classList.add('hidden');
      this.navigate('admin');
    });
    this.menuAdminOrdersBtn.addEventListener('click', () => {
      this.profileDropdown.classList.add('hidden');
      this.navigate('admin-orders');
    });
    this.menuAdminKanbanBtn.addEventListener('click', () => {
      this.profileDropdown.classList.add('hidden');
      this.navigate('admin-kanban');
    });

    // Navbar Logo Click
    this.navLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentUser && this.currentUser.role === 'admin') {
        this.navigate('admin');
      } else {
        this.navigate('orders');
      }
    });

    // Customer Filter Tabs
    this.tabPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.tabPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilter = pill.dataset.filter;
        this.renderCustomerOrders(this.currentFilter);
      });
    });

    // Customer Back button in Detail view
    this.backToOrdersBtn.addEventListener('click', () => {
      if (this.currentUser && this.currentUser.role === 'admin') {
        this.navigate('admin-orders');
      } else {
        this.navigate('orders');
      }
    });

    // Pay Now Button
    this.payNowBtn.addEventListener('click', () => {
      if (this.payNowBtn.disabled) return;
      this.openPaymentModal();
    });

    // Return to Detail after payment
    this.returnDetailBtn.addEventListener('click', () => {
      this.completePayment();
    });

    // Admin Hub Choices
    const goAdminOrders = () => this.navigate('admin-orders');
    const goAdminKanban = () => this.navigate('admin-kanban');

    this.cardGoAdminOrders.addEventListener('click', goAdminOrders);
    this.btnAdminPesanan.addEventListener('click', (e) => { e.stopPropagation(); goAdminOrders(); });

    this.cardGoAdminKanban.addEventListener('click', goAdminKanban);
    this.btnAdminPapanStatus.addEventListener('click', (e) => { e.stopPropagation(); goAdminKanban(); });

    // Admin Subnav Toggles
    this.btnSubnavOrders.addEventListener('click', () => this.navigate('admin-orders'));
    this.btnSubnavKanban.addEventListener('click', () => this.navigate('admin-kanban'));
    this.btnKanbanToOrders.addEventListener('click', () => this.navigate('admin-orders'));
    this.btnKanbanCurrent.addEventListener('click', () => this.navigate('admin-kanban'));

    // Admin Form Price Recalculation
    const updateAdminFormPrice = () => {
      const selectedOpt = this.adminServiceSelect.options[this.adminServiceSelect.selectedIndex];
      const pricePerKg = parseFloat(selectedOpt.dataset.price || '7000');
      const weight = parseFloat(this.adminWeightInput.value || '1');
      const total = Math.max(0, Math.round(weight * pricePerKg));
      this.adminCalcTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    };

    this.adminServiceSelect.addEventListener('change', updateAdminFormPrice);
    this.adminWeightInput.addEventListener('input', updateAdminFormPrice);

    // Admin Form Submit (Pesanan Baru)
    this.adminNewOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAdminCreateOrder();
    });

    // Dialogs
    this.forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openGeneralModal(`
        <h3 style="font-size: 20px; font-weight: 700; color: #0056C6; margin-bottom: 8px;">Lupa Kata Sandi?</h3>
        <p style="font-size: 14px; color: #64748B; margin-bottom: 20px;">Masukkan nomor WhatsApp / HP Anda untuk mereset kata sandi.</p>
        <form id="forgotForm" style="display: flex; flex-direction: column; gap: 14px;">
          <input type="tel" class="form-input" placeholder="Nomor WhatsApp / HP Terdaftar" required>
          <button type="submit" class="btn-primary" style="margin-top: 6px;">Kirim Petunjuk Reset via WhatsApp</button>
        </form>
      `);
      document.getElementById('forgotForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        this.closeGeneralModal();
        this.showToast('Instruksi reset kata sandi telah dikirim ke nomor WhatsApp / HP Anda!', 'success');
      });
    });

    this.registerBtn.addEventListener('click', () => {
      this.openGeneralModal(`
        <h3 style="font-size: 20px; font-weight: 700; color: #0056C6; margin-bottom: 8px;">Daftar Akun Laundry Yuk</h3>
        <p style="font-size: 14px; color: #64748B; margin-bottom: 20px;">Daftarkan diri Anda untuk kemudahan memesan dan memantau cucian laundry.</p>
        <form id="regForm" style="display: flex; flex-direction: column; gap: 12px;">
          <input type="text" id="regName" class="form-input" placeholder="Nama Lengkap" required>
          <input type="tel" id="regIdentifier" class="form-input" placeholder="Nomor WhatsApp / HP" required>
          <input type="password" id="regPass" class="form-input" placeholder="Kata Sandi" required>
          <button type="submit" class="btn-primary" style="margin-top: 8px;">Daftar Sekarang</button>
        </form>
      `);
      document.getElementById('regForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const identifier = document.getElementById('regIdentifier').value.trim();
        const password = document.getElementById('regPass').value;

        if (!name || !identifier || !password) {
          this.showToast('Semua kolom wajib diisi.', 'error');
          return;
        }

        this.closeGeneralModal();
        this.showToast('Pendaftaran berhasil! Silakan langsung login.', 'success');
        this.identifierInput.value = identifier;
        this.passwordInput.value = password;
      });
    });

    this.modalCloseBtn.addEventListener('click', () => this.closeGeneralModal());
    this.generalModal.addEventListener('click', (e) => {
      if (e.target === this.generalModal) this.closeGeneralModal();
    });
  }

  navigate(route, params = '') {
    window.location.hash = params ? `${route}?${params}` : route;
  }

  // Strict Role-Based Router
  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'login';
    const [route, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // 1. Unauthenticated state
    if (!this.currentUser) {
      if (route !== 'login') {
        this.navigate('login');
        return;
      }
      this.appNavbar.classList.add('hidden');
      this.hideAllViews();
      this.viewLogin.classList.add('active');
      return;
    }

    // 2. Authenticated: Configure Navbar & Role Elements
    this.appNavbar.classList.remove('hidden');
    this.userNameDisplay.textContent = this.currentUser.name;
    this.userEmailDisplay.textContent = (this.currentUser.phone && this.currentUser.phone !== '-')
      ? this.currentUser.phone
      : (this.currentUser.email && this.currentUser.email !== '-' ? this.currentUser.email : '0812-9999-8888');

    if (this.currentUser.role === 'admin') {
      this.roleText.textContent = 'ADMINISTRATOR';
      this.roleIndicatorBadge.classList.add('badge-role-admin');
      this.userMenuLinks.classList.add('hidden');
      this.adminMenuLinks.classList.remove('hidden');
    } else {
      this.roleText.textContent = 'PELANGGAN';
      this.roleIndicatorBadge.classList.remove('badge-role-admin');
      this.userMenuLinks.classList.remove('hidden');
      this.adminMenuLinks.classList.add('hidden');
    }

    // 3. Role Access Guard
    if (this.currentUser.role === 'user') {
      if (route === 'admin' || route === 'admin-orders' || route === 'admin-kanban') {
        this.showToast('Akses ditolak: Halaman tersebut khusus Admin.', 'error');
        this.navigate('orders');
        return;
      }
    } else if (this.currentUser.role === 'admin') {
      if (route === 'login') {
        this.navigate('admin');
        return;
      }
    }

    // 4. Render Target View
    this.hideAllViews();

    if (route === 'orders') {
      this.viewOrders.classList.add('active');
      this.updateCustomerStats();
      this.renderCustomerOrders(this.currentFilter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'detail') {
      this.viewDetail.classList.add('active');
      const orderId = params.get('id');
      this.loadOrderDetail(orderId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'admin') {
      this.viewAdminHub.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'admin-orders') {
      this.viewAdminOrders.classList.add('active');
      this.renderAdminOrdersView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (route === 'admin-kanban') {
      this.viewAdminKanban.classList.add('active');
      this.renderAdminKanbanView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (this.currentUser.role === 'admin') {
        this.navigate('admin');
      } else {
        this.navigate('orders');
      }
    }
  }

  hideAllViews() {
    this.viewLogin.classList.remove('active');
    this.viewOrders.classList.remove('active');
    this.viewDetail.classList.remove('active');
    this.viewAdminHub.classList.remove('active');
    this.viewAdminOrders.classList.remove('active');
    this.viewAdminKanban.classList.remove('active');
  }

  /**
   * Kunci Autentikasi:
   * - Login identifier mengandung 'admin' atau '@' -> ROLE = ADMIN
   * - Login identifier berupa Nomor HP -> ROLE = USER (PELANGGAN)
   */
  async handleLogin(e) {
    e.preventDefault();
    const identifier = this.identifierInput.value.trim();
    const password = this.passwordInput.value;

    let valid = true;
    if (!identifier) {
      this.identifierInput.classList.add('input-error');
      this.identifierError.textContent = 'Nomor WhatsApp / HP wajib diisi';
      valid = false;
    }
    if (!password) {
      this.passwordInput.classList.add('input-error');
      this.passwordError.textContent = 'Kata sandi wajib diisi';
      valid = false;
    }

    if (!valid) return;

    const btnText = this.loginBtn.querySelector('.btn-text');
    this.loginBtn.disabled = true;
    btnText.textContent = 'Memproses...';
    this.loginSpinner.classList.remove('hidden');

    const isAdmin = identifier.toLowerCase().includes('admin') || identifier.includes('@');
    let user;

    if (isAdmin) {
      // Role: ADMIN
      const cleanName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
      const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      user = {
        role: 'admin',
        name: displayName.toLowerCase() === 'admin' ? 'Administrator Laundry Yuk' : `Admin (${displayName})`,
        phone: '0812-ADMIN-01'
      };
    } else {
      // Role: USER (PELANGGAN)
      user = {
        role: 'user',
        name: `Pelanggan (${identifier})`,
        phone: identifier
      };
    }

    // Optional sync to server
    try {
      await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
    } catch (err) {
      // Offline fallback
    }

    setTimeout(() => {
      this.loginBtn.disabled = false;
      btnText.textContent = 'Masuk';
      this.loginSpinner.classList.add('hidden');

      this.saveCurrentUser(user);

      if (user.role === 'admin') {
        this.showToast('Login berhasil sebagai Administrator!', 'success');
        this.navigate('admin');
      } else {
        this.showToast('Login berhasil sebagai Pelanggan!', 'success');
        this.navigate('orders');
      }
    }, 250);
  }

  // ========================================================
  // CUSTOMER VIEW LOGIC
  // ========================================================
  updateCustomerStats() {
    const total = this.orders.length;
    const processing = this.orders.filter(o => o.status === 'diproses' || o.stage === 'dicuci' || o.stage === 'disetrika').length;
    const completed = this.orders.filter(o => o.status === 'selesai' || o.stage === 'selesai').length;

    this.statTotal.textContent = total;
    this.statProcessing.textContent = processing;
    this.statCompleted.textContent = completed;

    this.tabAll.textContent = `Semua (${total})`;
    this.tabProcessing.textContent = `Diproses (${processing})`;
    this.tabCompleted.textContent = `Selesai (${completed})`;
  }

  renderCustomerOrders(filter = 'all') {
    this.ordersListContainer.innerHTML = '';

    const list = filter === 'all'
      ? this.orders
      : this.orders.filter(o => {
        if (filter === 'diproses') return o.status === 'diproses' || o.stage === 'dicuci' || o.stage === 'disetrika';
        if (filter === 'selesai') return o.status === 'selesai' || o.stage === 'selesai';
        return true;
      });

    if (list.length === 0) {
      this.ordersListContainer.innerHTML = `
        <div class="empty-orders">
          <p>Belum ada pesanan laundry untuk ditampilkan.</p>
        </div>
      `;
      return;
    }

    list.forEach(order => {
      const isDiproses = order.status === 'diproses' || order.stage === 'dicuci' || order.stage === 'disetrika';
      const badgeClass = isDiproses ? 'badge-diproses' : 'badge-selesai';

      const card = document.createElement('article');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-left-group">
          <div class="order-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="4"></rect>
              <circle cx="12" cy="13" r="5"></circle>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="9" y1="6" x2="9.01" y2="6"></line>
            </svg>
          </div>
          <div class="order-meta-info">
            <h3 class="order-service-name">${order.service}</h3>
            <span class="order-code">${order.id}</span>
            <button class="btn-detail-link" data-id="${order.id}">
              Lihat Detail &rarr;
            </button>
          </div>
        </div>

        <div class="order-data-columns">
          <div class="data-col">
            <span class="data-label">Tanggal</span>
            <span class="data-value">${order.date}</span>
          </div>
          <div class="data-col">
            <span class="data-label">Berat</span>
            <span class="data-value">${order.weight}</span>
          </div>
          <div class="data-col">
            <span class="data-label">Status</span>
            <span class="badge-status ${badgeClass}">${order.statusLabel}</span>
          </div>
          <div class="data-col col-total">
            <span class="data-label">Total</span>
            <span class="data-value price">${order.totalFormatted}</span>
          </div>
        </div>
      `;

      card.querySelector('.btn-detail-link').addEventListener('click', () => {
        this.navigate('detail', `id=${encodeURIComponent(order.id)}`);
      });

      this.ordersListContainer.appendChild(card);
    });
  }

  loadOrderDetail(orderId) {
    const found = this.orders.find(o => o.id === orderId);
    if (!found) {
      if (this.orders.length > 0) {
        this.currentOrder = this.orders[0];
      } else {
        this.showToast('Belum ada pesanan untuk ditampilkan.', 'info');
        this.navigate(this.currentUser && this.currentUser.role === 'admin' ? 'admin-orders' : 'orders');
        return;
      }
    } else {
      this.currentOrder = found;
    }

    this.detailOrderCode.textContent = `Kode pesanan ${this.currentOrder.id}`;
    this.detailDate.textContent = this.currentOrder.date;
    this.detailEstDate.textContent = this.currentOrder.estDate;
    this.detailPaymentStatus.textContent = this.currentOrder.paymentStatus || '--';

    const isDiproses = this.currentOrder.status === 'diproses' || this.currentOrder.stage === 'dicuci' || this.currentOrder.stage === 'disetrika';
    this.detailStatusBadge.textContent = this.currentOrder.statusLabel;
    this.detailStatusBadge.className = `badge-status-lg ${isDiproses ? 'badge-diproses' : 'badge-selesai'}`;

    // Stepper Timeline
    const currentStage = this.currentOrder.stage || (this.currentOrder.status === 'selesai' ? 'selesai' : 'dicuci');

    let step2Class = 'step-pending';
    let step3Class = 'step-pending';
    let step4Class = 'step-pending';

    if (currentStage === 'dicuci') {
      step2Class = 'step-active';
    } else if (currentStage === 'disetrika') {
      step2Class = 'step-completed';
      step3Class = 'step-active';
    } else if (currentStage === 'siap' || currentStage === 'selesai') {
      step2Class = 'step-completed';
      step3Class = 'step-completed';
      step4Class = currentStage === 'selesai' ? 'step-completed' : 'step-active';
    }

    this.detailStepper.innerHTML = `
      <div class="step-item step-completed">
        <div class="step-marker-container">
          <div class="step-icon-circle icon-checked">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="step-line ${step2Class !== 'step-pending' ? 'line-active' : 'line-pending'}"></div>
        </div>
        <div class="step-content">
          <h3 class="step-title">Pesanan Diantar dan Diterima</h3>
          <span class="step-desc">${this.currentOrder.date}, 09.00</span>
        </div>
      </div>

      <div class="step-item ${step2Class}">
        <div class="step-marker-container">
          <div class="step-icon-circle ${step2Class === 'step-completed' ? 'icon-checked' : (step2Class === 'step-active' ? 'icon-current' : 'icon-idle')}">
            ${step2Class === 'step-completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : (step2Class === 'step-active' ? '<div class="step-inner-dot"></div>' : '')}
          </div>
          <div class="step-line ${step3Class !== 'step-pending' ? 'line-active' : 'line-pending'}"></div>
        </div>
        <div class="step-content">
          <h3 class="step-title ${step2Class === 'step-active' ? 'text-current' : (step2Class === 'step-pending' ? 'text-muted' : '')}">Sedang di cuci</h3>
          <span class="step-desc">${step2Class === 'step-active' ? `${this.currentOrder.date}, 11.25 - Sedang Berlangsung` : (step2Class === 'step-completed' ? 'Selesai dicuci' : 'Menunggu antrean')}</span>
        </div>
      </div>

      <div class="step-item ${step3Class}">
        <div class="step-marker-container">
          <div class="step-icon-circle ${step3Class === 'step-completed' ? 'icon-checked' : (step3Class === 'step-active' ? 'icon-current' : 'icon-idle')}">
            ${step3Class === 'step-completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : (step3Class === 'step-active' ? '<div class="step-inner-dot"></div>' : '')}
          </div>
          <div class="step-line ${step4Class !== 'step-pending' ? 'line-active' : 'line-pending'}"></div>
        </div>
        <div class="step-content">
          <h3 class="step-title ${step3Class === 'step-active' ? 'text-current' : (step3Class === 'step-pending' ? 'text-muted' : '')}">Di Setrika</h3>
          <span class="step-desc">${step3Class === 'step-active' ? 'Sedang disetrika rapi' : (step3Class === 'step-completed' ? 'Selesai disetrika' : 'Menunggu')}</span>
        </div>
      </div>

      <div class="step-item ${step4Class}">
        <div class="step-marker-container">
          <div class="step-icon-circle ${step4Class === 'step-completed' ? 'icon-checked' : (step4Class === 'step-active' ? 'icon-current' : 'icon-idle')}">
            ${step4Class === 'step-completed' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : (step4Class === 'step-active' ? '<div class="step-inner-dot"></div>' : '')}
          </div>
        </div>
        <div class="step-content">
          <h3 class="step-title ${step4Class === 'step-active' ? 'text-current' : (step4Class === 'step-pending' ? 'text-muted' : '')}">Siap Diambil</h3>
          <span class="step-desc">${step4Class === 'step-completed' ? 'Sudah diambil pelanggan' : (step4Class === 'step-active' ? 'Siap diambil di outlet' : `Estimasi ${this.currentOrder.estDate}`)}</span>
        </div>
      </div>
    `;

    // Breakdown list
    this.detailBreakdownList.innerHTML = '';
    const breakdownItems = Array.isArray(this.currentOrder.breakdown) ? this.currentOrder.breakdown : [];
    breakdownItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'service-item-row';
      row.innerHTML = `
        <div class="service-info-text">
          <span class="service-name">${item.name}</span>
          <span class="service-qty">${item.qty}</span>
        </div>
        <span class="service-subtotal">${item.price}</span>
      `;
      this.detailBreakdownList.appendChild(row);

      const div = document.createElement('div');
      div.className = 'service-divider';
      this.detailBreakdownList.appendChild(div);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'service-item-row total-row';
    totalRow.innerHTML = `
      <span class="service-total-label">Total</span>
      <span class="service-total-value">${this.currentOrder.totalFormatted}</span>
    `;
    this.detailBreakdownList.appendChild(totalRow);

    // Pay Button State
    if (this.currentOrder.paymentStatus === 'Lunas') {
      this.payNowBtn.textContent = 'Sudah Dibayar';
      this.payNowBtn.classList.add('paid-state');
      this.payNowBtn.disabled = true;
    } else {
      this.payNowBtn.textContent = 'Bayar Sekarang';
      this.payNowBtn.classList.remove('paid-state');
      this.payNowBtn.disabled = false;
    }
  }

  openPaymentModal() {
    if (!this.currentOrder) return;
    this.trxId.textContent = `#TRX-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    this.trxTime.textContent = `${this.currentOrder.estDate}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    this.trxAmount.textContent = this.currentOrder.totalFormatted;

    this.paymentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  async completePayment() {
    this.paymentModal.classList.add('hidden');
    document.body.style.overflow = '';

    if (!this.currentOrder) return;

    this.currentOrder.paymentStatus = 'Lunas';
    this.detailPaymentStatus.textContent = 'Lunas (Bank Mandiri)';
    this.payNowBtn.textContent = 'Sudah Dibayar';
    this.payNowBtn.classList.add('paid-state');
    this.payNowBtn.disabled = true;

    this.saveOrders();

    if (this.isServerConnected) {
      try {
        await fetch(`${this.apiUrl}/orders/${encodeURIComponent(this.currentOrder.id)}/payment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: 'Lunas' })
        });
      } catch (e) {
        // fallback to local save
      }
    }

    this.showToast('Pembayaran berhasil dikonfirmasi!', 'success');
  }

  // ========================================================
  // ADMIN VIEW LOGIC
  // ========================================================
  renderAdminOrdersView() {
    const countProcessing = this.orders.filter(o => o.stage === 'dicuci' || o.stage === 'disetrika' || o.status === 'diproses').length;
    const countReady = this.orders.filter(o => o.stage === 'siap').length;
    const countUnpaid = this.orders.filter(o => o.paymentStatus === 'Belum' || o.paymentStatus === '--').length;

    this.adminCountProcessing.textContent = countProcessing;
    this.adminCountReady.textContent = countReady;
    this.adminCountUnpaid.textContent = countUnpaid;

    this.adminOrdersTableBody.innerHTML = '';

    if (this.orders.length === 0) {
      this.adminOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px 16px; color: var(--text-secondary); font-size: 14px;">
            Belum ada pesanan. Tambahkan pesanan baru melalui formulir di samping.
          </td>
        </tr>
      `;
      return;
    }

    this.orders.forEach(order => {
      const tr = document.createElement('tr');
      const isPaid = order.paymentStatus === 'Lunas';

      let badgeClass = 'badge-admin-diproses';
      if (order.status === 'selesai' || order.stage === 'selesai') badgeClass = 'badge-admin-selesai';
      else if (order.stage === 'siap') badgeClass = 'badge-admin-siap';
      else if (order.stage === 'menunggu') badgeClass = 'badge-admin-menunggu';

      tr.innerHTML = `
        <td><strong>${order.id}</strong></td>
        <td>
          <span class="cust-name">${order.customerName || 'Pelanggan'}</span>
          <span class="cust-phone">${order.customerPhone || '-'}</span>
        </td>
        <td>${order.service}, ${order.weight}</td>
        <td><strong>${order.totalFormatted}</strong></td>
        <td><span class="badge-status ${badgeClass}">${order.statusLabel}</span></td>
        <td><span class="${isPaid ? 'status-paid' : 'status-unpaid'}">${isPaid ? 'Lunas' : 'Belum'}</span></td>
        <td>
          ${isPaid
            ? `<button type="button" class="btn-table-action btn-table-paid" disabled title="Pesanan sudah lunas">✓ Lunas</button>`
            : `<button type="button" class="btn-table-action btn-mark-paid" data-id="${order.id}" title="Klik untuk menandai pesanan lunas">Tandai Lunas</button>`
          }
        </td>
      `;

      if (!isPaid) {
        tr.querySelector('.btn-mark-paid').addEventListener('click', () => {
          this.handleAdminMarkPaid(order.id);
        });
      }

      this.adminOrdersTableBody.appendChild(tr);
    });
  }

  async handleAdminMarkPaid(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    order.paymentStatus = 'Lunas';
    this.saveOrders();

    if (this.isServerConnected) {
      try {
        await fetch(`${this.apiUrl}/orders/${encodeURIComponent(orderId)}/payment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: 'Lunas' })
        });
      } catch (e) {
        // fallback to local save
      }
    }

    this.showToast(`Pesanan ${order.id} berhasil ditandai Lunas!`, 'success');
    this.renderAdminOrdersView();
  }

  async handleAdminCreateOrder() {
    const custName = this.adminCustomerName.value.trim();
    const custPhone = this.adminCustomerPhone.value.trim();
    const serviceOpt = this.adminServiceSelect.options[this.adminServiceSelect.selectedIndex];
    const serviceName = serviceOpt.value;
    const pricePerKg = parseFloat(serviceOpt.dataset.price || '7000');
    const days = parseInt(serviceOpt.dataset.days || '2');
    const weightVal = parseFloat(this.adminWeightInput.value || '1');

    const totalNum = Math.round(weightVal * pricePerKg);
    const totalFormatted = `Rp ${totalNum.toLocaleString('id-ID')}`;

    const newCode = `LDR - ${String(1001 + this.orders.length).padStart(4, '0')}`;

    const newOrder = {
      id: newCode,
      customerName: custName,
      customerPhone: custPhone || '-',
      service: serviceName,
      date: '8 Okt 2026',
      estDate: `${8 + days} Okt 2026`,
      weight: `${weightVal} Kg`,
      stage: 'menunggu',
      status: 'menunggu',
      statusLabel: 'Menunggu',
      totalFormatted: totalFormatted,
      totalNum: totalNum,
      paymentStatus: 'Belum',
      breakdown: [
        { name: serviceName, qty: `${weightVal} kg × Rp ${pricePerKg.toLocaleString('id-ID')}`, price: totalFormatted }
      ]
    };

    if (this.isServerConnected) {
      try {
        const res = await fetch(`${this.apiUrl}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        const json = await res.json();
        if (res.ok && json.success) {
          this.orders.unshift(json.data);
          this.saveOrders();
          this.showToast(`Pesanan ${json.data.id} berhasil dibuat!`, 'success');
          this.adminNewOrderForm.reset();
          this.adminWeightInput.value = '3';
          this.adminCalcTotal.textContent = 'Rp 21.000';
          this.renderAdminOrdersView();
          return;
        }
      } catch (err) {
        console.warn('Simpan ke server gagal, menyimpan ke lokal:', err);
      }
    }

    this.orders.unshift(newOrder);
    this.saveOrders();
    this.showToast(`Pesanan ${newCode} berhasil dibuat!`, 'success');
    this.adminNewOrderForm.reset();
    this.adminWeightInput.value = '3';
    this.adminCalcTotal.textContent = 'Rp 21.000';
    this.renderAdminOrdersView();
  }

  renderAdminKanbanView() {
    this.kanbanCardsWaiting.innerHTML = '';
    this.kanbanCardsWashing.innerHTML = '';
    this.kanbanCardsIroning.innerHTML = '';
    this.kanbanCardsReady.innerHTML = '';

    const listWaiting = this.orders.filter(o => o.stage === 'menunggu');
    const listWashing = this.orders.filter(o => o.stage === 'dicuci');
    const listIroning = this.orders.filter(o => o.stage === 'disetrika');
    const listReady = this.orders.filter(o => o.stage === 'siap');

    this.countWaiting.textContent = listWaiting.length;
    this.countWashing.textContent = listWashing.length;
    this.countIroning.textContent = listIroning.length;
    this.countReady.textContent = listReady.length;

    const createCard = (order, nextStage, nextLabel) => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.innerHTML = `
        <div class="kanban-card-code">${order.id}</div>
        <div class="kanban-card-name">${order.customerName || 'Pelanggan'}</div>
        <div class="kanban-card-service">${order.service}, ${order.weight}</div>
        <button class="btn-kanban-action" type="button">
          ${nextLabel} &rarr;
        </button>
      `;

      card.querySelector('.btn-kanban-action').addEventListener('click', () => {
        this.advanceOrderStage(order.id, nextStage);
      });

      return card;
    };

    if (listWaiting.length === 0) this.kanbanCardsWaiting.innerHTML = '<div class="empty-kanban">Kosong</div>';
    else listWaiting.forEach(o => this.kanbanCardsWaiting.appendChild(createCard(o, 'dicuci', 'Mulai Cuci')));

    if (listWashing.length === 0) this.kanbanCardsWashing.innerHTML = '<div class="empty-kanban">Kosong</div>';
    else listWashing.forEach(o => this.kanbanCardsWashing.appendChild(createCard(o, 'disetrika', 'Selesai Cuci')));

    if (listIroning.length === 0) this.kanbanCardsIroning.innerHTML = '<div class="empty-kanban">Kosong</div>';
    else listIroning.forEach(o => this.kanbanCardsIroning.appendChild(createCard(o, 'siap', 'Selesai Setrika')));

    if (listReady.length === 0) this.kanbanCardsReady.innerHTML = '<div class="empty-kanban">Kosong</div>';
    else listReady.forEach(o => this.kanbanCardsReady.appendChild(createCard(o, 'selesai', 'Selesai / Diambil')));
  }

  async advanceOrderStage(orderId, nextStage) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    order.stage = nextStage;
    if (nextStage === 'dicuci') {
      order.status = 'diproses';
      order.statusLabel = 'Diproses';
    } else if (nextStage === 'disetrika') {
      order.status = 'diproses';
      order.statusLabel = 'Diproses';
    } else if (nextStage === 'siap') {
      order.status = 'siap';
      order.statusLabel = 'Siap Diambil';
    } else if (nextStage === 'selesai') {
      order.status = 'selesai';
      order.statusLabel = 'Selesai';
    }

    this.saveOrders();
    this.renderAdminKanbanView();

    if (this.isServerConnected) {
      try {
        await fetch(`${this.apiUrl}/orders/${encodeURIComponent(orderId)}/stage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: nextStage })
        });
      } catch (err) {
        // fallback to local save
      }
    }

    this.showToast(`Status ${order.id} dipindahkan ke ${order.statusLabel}!`, 'success');
  }

  openGeneralModal(html) {
    this.modalBody.innerHTML = html;
    this.generalModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeGeneralModal() {
    this.generalModal.classList.add('hidden');
    this.modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  showToast(message, type = 'success') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.className = `toast-notification ${type} show`;
    this.toastMessage.textContent = message;

    if (type === 'success') {
      this.toastIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'info') {
      this.toastIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    } else {
      this.toastIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3500);
  }
}

// Start application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LaundryYukApp();
});
