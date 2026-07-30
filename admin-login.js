const adminLoginForm = document.getElementById('adminLoginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

const ADMIN_USERNAME = 'sujal';
const ADMIN_PASSWORD = 'sujal123';

adminLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loginError.style.display = 'none';
  loginError.textContent = '';

  if (adminUsername.value.trim() === ADMIN_USERNAME && adminPassword.value === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    window.location.href = 'admin.html';
    return;
  }

  loginError.textContent = 'Invalid admin credentials.';
  loginError.style.display = 'block';
  adminPassword.value = '';
  adminPassword.focus();
});
