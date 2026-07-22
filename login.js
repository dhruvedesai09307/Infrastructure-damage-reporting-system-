const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

const ADMIN_USERNAME = 'sujal';
const ADMIN_PASSWORD = 'sujal123';

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  loginError.style.display = 'none';
  loginError.textContent = '';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Store session flag
    sessionStorage.setItem('adminLoggedIn', 'true');
    // Redirect to admin dashboard
    window.location.href = 'admin.html';
  } else {
    loginError.textContent = 'Invalid username or password. Please try again.';
    loginError.style.display = 'block';
    document.getElementById('password').value = '';
  }
});
