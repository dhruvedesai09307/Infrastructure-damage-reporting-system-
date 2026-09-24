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
    const icons = document.querySelectorAll('#themeIcon, .theme-icon, .theme-toggle-btn i');
    icons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        icon.parentElement?.setAttribute('title', 'Switch to Light Mode');
      } else {
        icon.className = 'fas fa-moon';
        icon.parentElement?.setAttribute('title', 'Switch to Dark Mode');
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
        <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
          <i class="fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}" id="themeIcon"></i>
        </button>
      `;
      document.body.appendChild(floatWrap);
    }
  });
})();
