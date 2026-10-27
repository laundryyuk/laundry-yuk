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

---

## 🌐 Panduan Hosting & Deploy Online

Berkas konfigurasi siap pakai telah disertakan di dalam proyek:

### 1. Deploy ke GitHub Pages (Gratis & Terintegrasi GitHub)
1. Buat repositori baru di GitHub: [github.com/new](https://github.com/new) dengan nama repositori **`laundry-yuk`**.
2. Di terminal, jalankan perintah push:
   ```bash
   git push -u origin main
   ```
3. Buka repositori Anda di GitHub $\rightarrow$ Masuk ke menu **Settings** $\rightarrow$ **Pages**.
4. Pada bagian **Build and deployment**:
   - Pilih **Source**: `GitHub Actions` (otomatis dideploy oleh workflow `.github/workflows/pages.yml`), atau
   - Pilih `Deploy from a branch`, lalu pilih branch `main` dan folder `/ (root)` $\rightarrow$ Klik **Save**.
5. Situs Anda akan aktif di: **`https://gopar086.github.io/laundry-yuk/`**

---

### 2. Deploy ke Vercel (Full-Stack Express Serverless)
- Konfigurasi `vercel.json` sudah disiapkan.
- Hubungkan repositori GitHub ke [vercel.com](https://vercel.com).
- Vercel akan otomatis menjalankan backend Express dan menyajikan frontend static.

---

### 3. Deploy ke Netlify (Instan Drag-and-Drop)
- Konfigurasi `netlify.toml` sudah disiapkan.
- Kunjungi [app.netlify.com/drop](https://app.netlify.com/drop) dan seret folder proyek ini.
- Website langsung aktif dengan URL HTTPS gratis.


