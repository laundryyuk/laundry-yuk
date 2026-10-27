# 🧺 Laundry Yuk - Web Application

Aplikasi web modern untuk manajemen laundry dengan pemisahan peran antara **Pelanggan (Customer)** dan **Administrator**.

---

## 🔑 Aturan Autentikasi (Sederhana & Fleksibel)

Kunci masuk akun ditentukan langsung dari format identifier:
- **Masuk dengan Nomor HP / WhatsApp** (contoh: `08123456789`) $\rightarrow$ **Pelanggan** (Akses: *Riwayat Pesanan* & *Detail Pesanan*).
- **Masuk dengan Akun Admin** (ketik `admin`) $\rightarrow$ **Administrator** (Akses: *Dashboard Hub*, *Kelola Pesanan*, & *Papan Status Kanban*).
- **Kata Sandi**: Bebas diisi kata sandi apa saja.

---

## 📁 Struktur Berkas Proyek

Semua berkas proyek berada di:
`C:\Users\Acer\.gemini\antigravity-ide\scratch\laundry-yuk\`

```text
laundry-yuk/
│
├── index.html            # Frontend SPA: Login, Pelanggan, & Admin Hub
├── style.css             # Styling CSS responsif
├── app.js                # Frontend client logic & role guard
├── assets/               # Aset gambar & ilustrasi ombak
│
├── server.js             # Server Node.js + Express
├── package.json          # Dependensi Node.js
├── start.bat             # Skrip 1-klik untuk menjalankan server
└── README.md             # Dokumentasi lengkap
```

---

## 🚀 Cara Menjalankan

### Pilihan 1: Jalankan Server via `start.bat`
1. Klik ganda berkas **`start.bat`** (atau ketik `npm start` di terminal).
2. Server berjalan di **`http://localhost:5000`** dan otomatis membuka browser.

### Pilihan 2: Buka Langsung Tanpa Server
Cukup klik ganda berkas **`index.html`** di browser.

---

## 📦 Data Pesanan Awal

- Daftar pesanan berstatus **kosong secara default**.
- Admin dapat menambahkan pesanan baru kapan saja melalui formulir di halaman **Kelola Pesanan** (`#admin-orders`). Pesanan yang dibuat akan langsung tampil di tabel pesanan, papan status Kanban (`#admin-kanban`), dan riwayat pesanan pelanggan.
