@echo off
title Laundry Yuk Web Application
echo =========================================================
echo              APLIKASI WEB LAUNDRY YUK
echo                  Node.js + Express
echo =========================================================
echo.
echo [1/3] Memeriksa modul dependensi...
if not exist node_modules (
    echo Menginstal modul (npm install)...
    call npm install
)

echo.
echo [2/3] Membuka Laundry Yuk di Browser...
start http://localhost:5000

echo.
echo [3/3] Menjalankan Server di http://localhost:5000...
echo.
echo Aturan Login:
echo - Masuk dengan Akun Admin ("admin")    = ADMIN
echo - Masuk dengan Nomor WhatsApp / HP     = PELANGGAN
echo.
echo Tekan Ctrl+C untuk menghentikan server.
echo =========================================================
echo.

node server.js
pause
