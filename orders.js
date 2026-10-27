/**
 * Laundry Yuk - Orders History Logic
 */

// Orders Dataset matching Figma Screenshot exactly
const initialOrders = [
  {
    id: 'LDR - 1020',
    service: 'Cuci Kiloan + Setrika',
    date: '7 Okt 2026',
    estDate: '9 Okt 2026',
    weight: '5 Kg',
    status: 'diproses',
    statusLabel: 'Diproses',
    totalFormatted: 'Rp. 45.000',
    totalNum: 45000,
    paymentStatus: '--',
    breakdown: [
      { name: 'Cuci Kiloan', qty: '5 kg × Rp 6.000', price: 'Rp. 30.000' },
      { name: 'Setrika', qty: '5 kg × Rp 3.000', price: 'Rp. 15.000' }
    ]
  },
  {
    id: 'LDR - 1080',
    service: 'Cuci Kiloan + Setrika',
    date: '5 Okt 2026',
    estDate: '7 Okt 2026',
    weight: '3 Kg',
    status: 'diproses',
    statusLabel: 'Diproses',
    totalFormatted: 'Rp. 36.000',
    totalNum: 36000,
    paymentStatus: '--',
    breakdown: [
      { name: 'Cuci Kiloan', qty: '3 kg × Rp 7.000', price: 'Rp. 21.000' },
      { name: 'Setrika', qty: '3 kg × Rp 5.000', price: 'Rp. 15.000' }
    ]
  },
  {
    id: 'LDR - 1075',
    service: 'Cuci Kiloan + Setrika',
    date: '28 Sep 2026',
    estDate: '30 Sep 2026',
    weight: '3 Kg',
    status: 'selesai',
    statusLabel: 'Selesai',
    totalFormatted: 'Rp. 36.000',
    totalNum: 36000,
    paymentStatus: 'Lunas',
    breakdown: [
      { name: 'Cuci Kiloan', qty: '3 kg × Rp 7.000', price: 'Rp. 21.000' },
      { name: 'Setrika', qty: '3 kg × Rp 5.000', price: 'Rp. 15.000' }
    ]
  },
  {
    id: 'LDR - 1050',
    service: 'Cuci Kiloan + Setrika',
    date: '20 Sep 2026',
    estDate: '22 Sep 2026',
    weight: '4 Kg',
    status: 'selesai',
    statusLabel: 'Selesai',
    totalFormatted: 'Rp. 40.000',
    totalNum: 40000,
    paymentStatus: 'Lunas',
    breakdown: [
      { name: 'Cuci Kiloan', qty: '4 kg × Rp 6.000', price: 'Rp. 24.000' },
      { name: 'Setrika', qty: '4 kg × Rp 4.000', price: 'Rp. 16.000' }
    ]
  },
  {
    id: 'LDR - 1012',
    service: 'Cuci Kiloan + Setrika',
    date: '14 Sep 2026',
    estDate: '16 Sep 2026',
    weight: '3.5 Kg',
    status: 'selesai',
    statusLabel: 'Selesai',
    totalFormatted: 'Rp. 35.000',
    totalNum: 35000,
    paymentStatus: 'Lunas',
    breakdown: [
      { name: 'Cuci Kiloan', qty: '3.5 kg × Rp 6.000', price: 'Rp. 21.000' },
      { name: 'Setrika', qty: '3.5 kg × Rp 4.000', price: 'Rp. 14.000' }
    ]
  }
];

// Initialize local persistence if needed
function getStoredOrders() {
  const saved = localStorage.getItem('laundryOrders');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return initialOrders;
    }
  }
  localStorage.setItem('laundryOrders', JSON.stringify(initialOrders));
  return initialOrders;
}

document.addEventListener('DOMContentLoaded', () => {
  const orders = getStoredOrders();
  const ordersContainer = document.getElementById('ordersContainer');
  const tabPills = document.querySelectorAll('.tab-pill');
  
  // Profile elements
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');

  // Load user info from localStorage if available
  const storedUser = localStorage.getItem('laundryYukUser');
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      if (userObj.phone && userObj.phone !== '-') {
        userEmailDisplay.textContent = userObj.phone;
        userNameDisplay.textContent = userObj.name || `Pelanggan (${userObj.phone})`;
      } else if (userObj.name) {
        userNameDisplay.textContent = userObj.name;
        userEmailDisplay.textContent = userObj.phone || '0812-9999-8888';
      }
    } catch(e) {}
  }

  // Calculate & update stats
  const totalCount = orders.length;
  const processingCount = orders.filter(o => o.status === 'diproses').length;
  const completedCount = orders.filter(o => o.status === 'selesai').length;

  document.getElementById('statTotal').textContent = totalCount;
  document.getElementById('statProcessing').textContent = processingCount;
  document.getElementById('statCompleted').textContent = completedCount;

  document.getElementById('tabAll').textContent = `Semua (${totalCount})`;
  document.getElementById('tabProcessing').textContent = `Diproses (${processingCount})`;
  document.getElementById('tabCompleted').textContent = `Selesai (${completedCount})`;

  // Current Active Filter
  let currentFilter = 'all';

  // Render Order Cards
  function renderOrders(filter = 'all') {
    ordersContainer.innerHTML = '';

    const filtered = filter === 'all' 
      ? orders 
      : orders.filter(o => o.status === filter);

    if (filtered.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-orders">
          <p>Tidak ada pesanan dengan status ini.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(order => {
      const isDiproses = order.status === 'diproses';
      const badgeClass = isDiproses ? 'badge-diproses' : 'badge-selesai';

      const card = document.createElement('article');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-left-group">
          <div class="order-icon-badge" aria-hidden="true">
            <!-- Washing Machine Icon SVG -->
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

      // Event listener for "Lihat Detail"
      const detailBtn = card.querySelector('.btn-detail-link');
      detailBtn.addEventListener('click', () => {
        localStorage.setItem('selectedOrderId', order.id);
        window.location.href = 'order-detail.html';
      });

      ordersContainer.appendChild(card);
    });
  }

  // Filter Tab Switching
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tabPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentFilter = pill.dataset.filter;
      renderOrders(currentFilter);
    });
  });

  // User Profile Dropdown
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
    profileBtn.setAttribute('aria-expanded', !isExpanded);
    profileDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!profileDropdown.classList.contains('hidden') && !profileBtn.contains(e.target)) {
      profileDropdown.classList.add('hidden');
      profileBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Logout Handler -> back to index.html
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('laundryYukUser');
    window.location.href = 'index.html';
  });

  // Initial render
  renderOrders('all');
});
