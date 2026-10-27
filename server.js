/**
 * 🧺 Laundry Yuk - Node.js + Express Backend Server
 * Simple & Lightweight Mock Architecture
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files directly
app.use(express.static(path.join(__dirname)));

// State (Default empty orders)
let orders = [];

// ========================================================
// API ROUTES
// ========================================================

// 1. Status & Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// 2. Auth: Login
// Kunci: Jika login menggunakan 'admin' atau '@' -> ADMIN. Jika Nomor HP -> PELANGGAN (USER).
app.post('/api/auth/login', (req, res) => {
  const { identifier, phone, password } = req.body;
  const loginId = (identifier || phone || '').trim();

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'Nomor WhatsApp / HP dan kata sandi wajib diisi.' });
  }

  const isAdmin = loginId.toLowerCase().includes('admin') || loginId.includes('@');

  if (isAdmin) {
    const cleanName = loginId.includes('@') ? loginId.split('@')[0] : loginId;
    const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    return res.json({
      success: true,
      user: {
        id: 1,
        phone: '0812-ADMIN-01',
        name: displayName.toLowerCase() === 'admin' ? 'Administrator Laundry Yuk' : `Admin (${displayName})`,
        role: 'admin'
      }
    });
  } else {
    return res.json({
      success: true,
      user: {
        id: Date.now(),
        phone: loginId,
        name: `Pelanggan (${loginId})`,
        role: 'user'
      }
    });
  }
});

// 3. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, phone, identifier, password } = req.body;
  const userIdentifier = (identifier || phone || '').trim();

  if (!name || !userIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
  }

  const isAdmin = userIdentifier.toLowerCase().includes('admin') || userIdentifier.includes('@');
  res.status(201).json({
    success: true,
    message: 'Pendaftaran berhasil.',
    user: {
      id: Date.now(),
      name: name,
      role: isAdmin ? 'admin' : 'user',
      phone: userIdentifier
    }
  });
});

// 4. Orders: Get All
app.get('/api/orders', (req, res) => {
  res.json({ success: true, count: orders.length, data: orders });
});

// 5. Orders: Get One by ID
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }
  res.json({ success: true, data: order });
});

// 6. Orders: Create New Order (Admin)
app.post('/api/orders', (req, res) => {
  const {
    id,
    customerName,
    customerPhone,
    service,
    date,
    estDate,
    weight,
    stage = 'menunggu',
    status = 'menunggu',
    statusLabel = 'Menunggu',
    totalFormatted,
    totalNum,
    paymentStatus = 'Belum',
    breakdown = []
  } = req.body;

  if (!customerName || !service) {
    return res.status(400).json({ success: false, message: 'Data pesanan tidak lengkap.' });
  }

  let orderId = id;
  if (!orderId) {
    const nextNum = (orders.length + 1).toString().padStart(4, '0');
    orderId = `LDR - ${nextNum}`;
  }

  const newOrder = {
    id: orderId,
    customerName: customerName,
    customerPhone: customerPhone || '-',
    service: service,
    date: date || '8 Okt 2026',
    estDate: estDate || '10 Okt 2026',
    weight: weight || '1 Kg',
    stage: stage,
    status: status,
    statusLabel: statusLabel,
    totalFormatted: totalFormatted || `Rp ${totalNum ? totalNum.toLocaleString('id-ID') : '0'}`,
    totalNum: totalNum || 0,
    paymentStatus: paymentStatus,
    breakdown: breakdown,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Pesanan berhasil disimpan.',
    data: newOrder
  });
});

// 7. Orders: Update Stage (Kanban Move)
app.put('/api/orders/:id/stage', (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  order.stage = stage;
  if (stage === 'dicuci' || stage === 'disetrika') {
    order.status = 'diproses';
    order.statusLabel = 'Diproses';
  } else if (stage === 'siap') {
    order.status = 'siap';
    order.statusLabel = 'Siap Diambil';
  } else if (stage === 'selesai') {
    order.status = 'selesai';
    order.statusLabel = 'Selesai';
  }

  res.json({
    success: true,
    message: `Status pesanan ${id} berhasil diperbarui ke ${order.statusLabel}.`,
    data: order
  });
});

// 8. Orders: Update Payment Status
app.put('/api/orders/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentStatus = 'Lunas' } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  order.paymentStatus = paymentStatus;

  res.json({
    success: true,
    message: `Pembayaran pesanan ${id} berhasil diperbarui menjadi ${paymentStatus}.`,
    data: order
  });
});

// 9. Orders: Clear All Orders
app.delete('/api/orders', (req, res) => {
  orders = [];
  res.json({
    success: true,
    message: 'Semua pesanan berhasil dikosongkan.'
  });
});

// 10. Orders: Delete One Order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = orders.length;
  orders = orders.filter(o => o.id !== id);

  if (orders.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  res.json({ success: true, message: `Pesanan ${id} berhasil dihapus.` });
});

// Fallback: send index.html for unknown web paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (Standalone / Local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🧺 Laundry Yuk Server Berjalan di: http://localhost:${PORT}`);
    console.log('🔑 Aturan Login:');
    console.log('   - Nomor WhatsApp / HP       -> Masuk sebagai PELANGGAN');
    console.log('   - Akun Admin ("admin")      -> Masuk sebagai ADMIN');
    console.log('====================================================');
  });
}

module.exports = app;
