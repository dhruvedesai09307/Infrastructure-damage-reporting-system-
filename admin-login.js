document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }

      const u = adminUsername ? adminUsername.value.trim() : '';
      const p = adminPassword ? adminPassword.value : '';

      if ((u === 'sujal' && p === 'sujal123') || (u === 'admin' && p === 'admin123') || (u === 'admin' && p === 'sujal123')) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('currentAdmin', JSON.stringify({ username: u, name: 'System Administrator' }));
        window.location.href = 'admin.html';
        return;
      }

      if (loginError) {
        loginError.textContent = 'Invalid admin credentials. (Default: sujal / sujal123)';
        loginError.style.display = 'block';
      }
      if (adminPassword) {
        adminPassword.value = '';
        adminPassword.focus();
      }
    });
  }
});
