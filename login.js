const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if (username.length < 3) { loginError.textContent = 'Username must contain at least 3 characters.'; loginError.style.display = 'block'; return; }
  if (password.length < 6) { loginError.textContent = 'Password must contain at least 6 characters.'; loginError.style.display = 'block'; return; }
  sessionStorage.setItem('currentUser', JSON.stringify({ username, email }));
  window.location.href = 'profile.html';
});
