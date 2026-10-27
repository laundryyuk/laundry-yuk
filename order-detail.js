/**
 * Laundry Yuk - Order Detail & Payment Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const orderCodeDisplay = document.getElementById('orderCodeDisplay');
  const orderStatusBadge = document.getElementById('orderStatusBadge');
  const orderDateValue = document.getElementById('orderDateValue');
  const orderEstValue = document.getElementById('orderEstValue');
  const orderPaymentStatus = document.getElementById('orderPaymentStatus');
  const orderTotalValue = document.getElementById('orderTotalValue');
  const payNowBtn = document.getElementById('payNowBtn');
  const paymentModal = document.getElementById('paymentModal');
  const returnDetailBtn = document.getElementById('returnDetailBtn');
  const trxId = document.getElementById('trxId');
  const trxTime = document.getElementById('trxTime');
  const trxAmount = document.getElementById('trxAmount');

  // Profile elements
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown')
  const logoutBtn = document.getElementById('logoutBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');

  // Load user info from localStorage
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
    } catch (e) { }
  }

  // Retrieve current order
  const savedOrders = JSON.parse(localStorage.getItem('laundryOrders') || '[]');
  const selectedOrderId = localStorage.getItem('selectedOrderId') || 'LDR - 1020';

  let currentOrder = savedOrders.find(o => o.id === selectedOrderId);

  // Fallback default order if not found
  if (!currentOrder) {
    currentOrder = {
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
    };
  }

  // Populate data into UI
  orderCodeDisplay.textContent = `Kode pesanan ${currentOrder.id}`;
  orderDateValue.textContent = currentOrder.date;
  orderEstValue.textContent = currentOrder.estDate || '9 Okt 2026';
  orderTotalValue.textContent = currentOrder.totalFormatted;
  orderPaymentStatus.textContent = currentOrder.paymentStatus || '--';

  // Badge Status
  const isDiproses = currentOrder.status === 'diproses';
  orderStatusBadge.textContent = currentOrder.statusLabel;
  orderStatusBadge.className = `badge-status-lg ${isDiproses ? 'badge-diproses' : 'badge-selesai'}`;

  // If already paid
  if (currentOrder.paymentStatus && currentOrder.paymentStatus !== '--') {
    payNowBtn.textContent = 'Sudah Dibayar';
    payNowBtn.classList.add('paid-state');
    payNowBtn.disabled = true;
  }

  // Setup Modal details
  trxAmount.textContent = currentOrder.totalFormatted;
  trxId.textContent = `#TRX-${Math.floor(10000 + Math.random() * 90000)}`;

  const now = new Date();
  const timeFormatted = `${currentOrder.date}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  trxTime.textContent = timeFormatted;

  // Pay Now Click -> Open Modal
  payNowBtn.addEventListener('click', () => {
    if (payNowBtn.disabled) return;
    paymentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  // Return to Detail -> Confirm payment and update status
  returnDetailBtn.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    document.body.style.overflow = '';

    // Update payment status
    currentOrder.paymentStatus = 'Lunas';
    orderPaymentStatus.textContent = 'Lunas (Bank Mandiri)';

    payNowBtn.textContent = 'Sudah Dibayar';
    payNowBtn.classList.add('paid-state');
    payNowBtn.disabled = true;

    // Save updated orders to localStorage
    const orderIndex = savedOrders.findIndex(o => o.id === currentOrder.id);
    if (orderIndex > -1) {
      savedOrders[orderIndex].paymentStatus = 'Lunas';
      localStorage.setItem('laundryOrders', JSON.stringify(savedOrders));
    }
  });

  // Profile Dropdown
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!profileDropdown.classList.contains('hidden') && !profileBtn.contains(e.target)) {
      profileDropdown.classList.add('hidden');
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('laundryYukUser');
    window.location.href = 'index.html';
  });
});
