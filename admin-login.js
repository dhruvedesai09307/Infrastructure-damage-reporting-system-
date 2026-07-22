const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');

// Simple client-side admin credentials (demo only)
const ADMIN_USERNAME = 'sujal';
const ADMIN_PASSWORD = 'sujal123';

adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  loginError.style.display = 'none';
  loginError.textContent = '';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    window.location.href = 'admin.html';
  } else {
    loginError.textContent = 'Invalid admin credentials.';
    loginError.style.display = 'block';
    document.getElementById('adminPassword').value = '';
  }
});
