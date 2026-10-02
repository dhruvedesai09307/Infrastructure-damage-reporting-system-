/**
 * IDRS Centralized Theme Management Script
 * Handles immediate theme initialization (Light default), toggling, and UI icon synchronization across all pages.
 */
(function () {
  // 1. Immediate Theme Initialization (Prevents light/dark visual flash)
  const savedTheme = localStorage.getItem('idrs_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Global Toggle Function
  window.toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('idrs_theme', nextTheme);
    updateThemeIcons(nextTheme);

    // Optional toast notification if showToast function exists on page
    if (typeof window.showToast === 'function') {
      window.showToast('info', `Switched to ${nextTheme.toUpperCase()} theme mode`);
    }
  };

  // 3. Update Theme Button Icons Across Page
  function updateThemeIcons(theme) {
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
      if (theme === 'dark') {
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
        const i = btn.querySelector('i');
        if (i) i.className = 'fas fa-sun';
      } else {
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
        const i = btn.querySelector('i');
        if (i) i.className = 'fas fa-moon';
      }
    });

    const standaloneIcons = document.querySelectorAll('#themeIcon, .theme-icon');
    standaloneIcons.forEach(icon => {
      if (icon.tagName && icon.tagName.toLowerCase() === 'svg') {
        if (theme === 'dark') {
          icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
          icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
      } else if (icon.tagName) {
        if (theme === 'dark') {
          icon.className = 'fas fa-sun';
        } else {
          icon.className = 'fas fa-moon';
        }
      }
    });
  }

  // 4. On DOM Ready: Sync icons & auto-inject toggle if missing
  document.addEventListener('DOMContentLoaded', function () {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcons(currentTheme);

    // Auto-inject floating theme toggle button if page does not have #themeToggleBtn
    if (!document.getElementById('themeToggleBtn') && !document.querySelector('.theme-toggle-btn')) {
      const floatWrap = document.createElement('div');
      floatWrap.className = 'floating-theme-toggle';
      floatWrap.innerHTML = `
        <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleTheme()" title="${currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}" aria-label="Toggle Dark/Light Mode">
          <svg class="theme-icon-svg" id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${currentTheme === 'dark' ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'}
          </svg>
        </button>
      `;
      document.body.appendChild(floatWrap);
    }

    // 5. Initialize Side Menu & Backdrop
    initSideMenuNavigation();

    // 6. Populate Profile Chip if present
    syncProfileChip();
  });

  // Global Universal toggleMenu function
  window.toggleMenu = function (forceState) {
    const sideMenu = document.getElementById('sideMenu');
    let backdrop = document.getElementById('menuBackdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'menuBackdrop';
      backdrop.className = 'menu-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.onclick = function () { window.toggleMenu(false); };
      document.body.appendChild(backdrop);
    }

    if (!sideMenu) return;

    const willShow = typeof forceState === 'boolean'
      ? forceState
      : !sideMenu.classList.contains('show');

    if (willShow) {
      sideMenu.classList.add('show');
      backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      sideMenu.classList.remove('show');
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  // Global Universal logout function
  window.logout = function () {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('userRole');
    window.location.href = 'login-page.html';
  };

  // Synchronize side menu links & highlight current page
  function initSideMenuNavigation() {
    const sideMenu = document.getElementById('sideMenu');
    if (!sideMenu) return;

    // Create backdrop if not already existing
    if (!document.getElementById('menuBackdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'menuBackdrop';
      backdrop.className = 'menu-backdrop';
      backdrop.onclick = function () { window.toggleMenu(false); };
      document.body.appendChild(backdrop);
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sideMenu.classList.contains('show')) {
        window.toggleMenu(false);
      }
    });

    // Auto highlight active page link in side menu
    const currentPath = window.location.pathname.toLowerCase().split('/').pop() || 'home-page.html';
    const menuLinks = sideMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase().split('/').pop();
      if (href && (href === currentPath || (currentPath === '' && href === 'home-page.html') || (currentPath === 'home-page.html' && href === '#top'))) {
        link.classList.add('active');
      }
    });
  }

  // Populate profile chip avatar & initials from localStorage
  function syncProfileChip() {
    const name = localStorage.getItem('currentUserName') || localStorage.getItem('currentUser') || '';
    const avatarEl = document.getElementById('navAvatar');
    const nameEl = document.getElementById('navUserName');
    if (name) {
      const parts = name.trim().split(/\s+/);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = parts[0];
    }
  }
})();

