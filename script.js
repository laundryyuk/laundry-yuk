/**
 * Laundry Yuk - Interactive Client Script
 * Handles password visibility, validation, and demo modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const identifierInput = document.getElementById('identifier');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const eyeOffIcon = document.getElementById('eyeOffIcon');
  const eyeOnIcon = document.getElementById('eyeOnIcon');
  const identifierError = document.getElementById('identifierError');
  const passwordError = document.getElementById('passwordError');
  const loginBtn = document.getElementById('loginBtn');
  const loginSpinner = document.getElementById('loginSpinner');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const registerBtn = document.getElementById('registerBtn');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  let toastTimeout = null;

  // 1. Toggle Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    if (isPassword) {
      passwordInput.setAttribute('type', 'text');
      eyeOffIcon.classList.add('hidden');
      eyeOnIcon.classList.remove('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Sembunyikan kata sandi');
    } else {
      passwordInput.setAttribute('type', 'password');
      eyeOffIcon.classList.remove('hidden');
      eyeOnIcon.classList.add('hidden');
      togglePasswordBtn.setAttribute('aria-label', 'Tampilkan kata sandi');
    }
    passwordInput.focus();
  });

  // 2. Clear Errors on User Input
  identifierInput.addEventListener('input', () => {
    identifierInput.classList.remove('input-error');
    identifierError.textContent = '';
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('input-error');
    passwordError.textContent = '';
  });

  // 3. Form Submission & Validation
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const identifierVal = identifierInput.value.trim();
    const passwordVal = passwordInput.value;

    // Validate Identifier
    if (!identifierVal) {
      identifierInput.classList.add('input-error');
      identifierError.textContent = 'Nomor HP wajib diisi';
      isValid = false;
    }

    // Validate Password
    if (!passwordVal) {
      passwordInput.classList.add('input-error');
      passwordError.textContent = 'Kata sandi wajib diisi';
      isValid = false;
    } else if (passwordVal.length < 6) {
      passwordInput.classList.add('input-error');
      passwordError.textContent = 'Kata sandi minimal 6 karakter';
      isValid = false;
    }

    if (!isValid) return;

    // Simulate login request
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast('Login berhasil! Mengalihkan ke Riwayat Pesanan...', 'success');
      
      // Simpan status login di sessionStorage/localStorage
      localStorage.setItem('laundryYukUser', JSON.stringify({
        name: identifierVal.toLowerCase().includes('admin') ? 'Administrator Laundry Yuk' : `Pelanggan (${identifierVal})`,
        phone: identifierVal
      }));

      // Redirect ke halaman Riwayat Pesanan
      setTimeout(() => {
        window.location.href = 'orders.html';
      }, 900);
    }, 800);
  });

  // Helper: Loading state
  function setLoading(isLoading) {
    const btnText = loginBtn.querySelector('.btn-text');
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.textContent = 'Memproses...';
      loginSpinner.classList.remove('hidden');
    } else {
      loginBtn.disabled = false;
      btnText.textContent = 'Masuk';
      loginSpinner.classList.add('hidden');
    }
  }

  // Helper: Toast Message
  function showToast(message, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);

    toast.className = `toast-notification ${type} show`;
    toastMessage.textContent = message;

    if (type === 'success') {
      toastIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else {
      toastIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 4. Modal: Forgot Password
  forgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(`
      <h3 id="modalTitle" style="font-size: 20px; font-weight: 700; color: #0056C6; margin-bottom: 8px;">Lupa Kata Sandi?</h3>
      <p style="font-size: 14px; color: #64748B; margin-bottom: 20px;">Masukkan nomor WhatsApp / HP akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
      <form id="forgotForm" style="display: flex; flex-direction: column; gap: 14px;">
        <input type="tel" id="resetPhone" class="form-input" placeholder="Nomor WhatsApp / HP Terdaftar" required style="width: 100%;">
        <button type="submit" class="btn-primary" style="margin-top: 6px;">Kirim Petunjuk Reset via WhatsApp</button>
      </form>
    `);

    const forgotForm = document.getElementById('forgotForm');
    forgotForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      closeModal();
      showToast('Petunjuk reset kata sandi telah dikirim ke nomor WhatsApp Anda!', 'success');
    });
  });

  // 5. Modal: Register
  registerBtn.addEventListener('click', () => {
    openModal(`
      <h3 id="modalTitle" style="font-size: 20px; font-weight: 700; color: #0056C6; margin-bottom: 8px;">Daftar Akun Laundry Yuk</h3>
      <p style="font-size: 14px; color: #64748B; margin-bottom: 20px;">Nikmati kemudahan layanan laundry cepat, aman, dan terpercaya langsung dari ponsel Anda.</p>
      <form id="registerForm" style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" class="form-input" placeholder="Nama Lengkap" required>
        <input type="tel" class="form-input" placeholder="Nomor WhatsApp / HP" required>
        <input type="password" class="form-input" placeholder="Buat Kata Sandi" required>
        <button type="submit" class="btn-primary" style="margin-top: 10px;">Daftar Sekarang</button>
      </form>
    `);

    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      closeModal();
      showToast('Pendaftaran berhasil! Silakan login dengan akun baru Anda.', 'success');
    });
  });

  // Modal Control Functions
  function openModal(contentHtml) {
    modalBody.innerHTML = contentHtml;
    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
      closeModal();
    }
  });
});
