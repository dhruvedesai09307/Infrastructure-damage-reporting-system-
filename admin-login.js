document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }

      const u = adminUsername ? adminUsername.value.trim() : '';
      const p = adminPassword ? adminPassword.value : '';

      try {
        const response = await fetch('/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });

        const result = await response.json();

        if (result.success) {
          sessionStorage.setItem('adminLoggedIn', 'true');
          sessionStorage.setItem('adminToken', result.token);
          sessionStorage.setItem('currentAdmin', JSON.stringify({ username: u }));
          window.location.href = 'admin.html';
        } else {
          if (loginError) {
            loginError.textContent = result.message || 'Invalid admin credentials.';
            loginError.style.display = 'block';
          }
          if (adminPassword) {
            adminPassword.value = '';
            adminPassword.focus();
          }
        }
      } catch (err) {
        if (loginError) {
          loginError.textContent = 'Could not connect to server. Please try again.';
          loginError.style.display = 'block';
        }
      }
    });
  }
});