document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const submitBtn = adminLoginForm ? adminLoginForm.querySelector('button[type="submit"]') : null;
  const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Authenticate & Enter Suite';

  // Helper to determine base URL (handles desktop, mobile web, and Android WebView wrappers)
  const getApiUrl = (endpoint) => {
    let base = window.location.origin;
    if (!base || base === 'null' || base.startsWith('file:') || base.startsWith('content:')) {
      base = 'https://infrastructure-damage-reporting-system.onrender.com';
    }
    return `${base.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  };

  // Helper to persist auth data reliably across embedded WebViews & standard browsers
  const persistAuth = (token, username) => {
    // 1. LocalStorage (persistent across WebView navigations and reloads)
    try {
      localStorage.setItem('adminLoggedIn', 'true');
      if (token) localStorage.setItem('adminToken', token);
      if (username) localStorage.setItem('currentAdmin', JSON.stringify({ username }));
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }

    // 2. SessionStorage (per-session standard storage)
    try {
      sessionStorage.setItem('adminLoggedIn', 'true');
      if (token) sessionStorage.setItem('adminToken', token);
      if (username) sessionStorage.setItem('currentAdmin', JSON.stringify({ username }));
    } catch (e) {
      console.warn('SessionStorage unavailable:', e);
    }

    // 3. Document Cookie (fallback recognized across standard WebView domains)
    try {
      const maxAge = 86400 * 7; // 7 days
      document.cookie = `adminLoggedIn=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      if (token) {
        document.cookie = `adminToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (username) {
        document.cookie = `currentAdmin=${encodeURIComponent(JSON.stringify({ username }))}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    } catch (e) {
      console.warn('Cookie storage unavailable:', e);
    }
  };

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
      }

      const u = adminUsername ? adminUsername.value.trim() : '';
      const p = adminPassword ? adminPassword.value : '';

      if (!u || !p) {
        if (loginError) {
          loginError.textContent = 'Please enter both username and password.';
          loginError.style.display = 'block';
        }
        return;
      }

      // Indicate loading state (helps during Render server cold starts & slow network)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
      }

      try {
        const loginUrl = getApiUrl('admin-login');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout

        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'omit',
          body: JSON.stringify({ username: u, password: p }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        let result;
        try {
          result = await response.json();
        } catch (jsonErr) {
          throw new Error('Server returned an invalid response.');
        }

        if (response.ok && result.success) {
          persistAuth(result.token, u);

          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Verified! Redirecting...';
          }

          // Small delay to ensure storage writes complete, then redirect
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 150);
        } else {
          if (loginError) {
            loginError.textContent = result.message || 'Invalid admin credentials.';
            loginError.style.display = 'block';
          }
          if (adminPassword) {
            adminPassword.value = '';
            adminPassword.focus();
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
          }
        }
      } catch (err) {
        console.error('Admin login error:', err);
        if (loginError) {
          if (err.name === 'AbortError') {
            loginError.textContent = 'Server response timed out. The backend might be waking up, please retry.';
          } else {
            loginError.textContent = 'Could not connect to authentication server. Please check your network connection.';
          }
          loginError.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        }
      }
    });
  }
});