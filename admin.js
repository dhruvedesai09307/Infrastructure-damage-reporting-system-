// Check if admin is logged in; if not, redirect to the admin-specific login page
if (!sessionStorage.getItem('adminLoggedIn')) {
  window.location.href = 'admin-login.html';
}

const reportsList = document.getElementById('reportsList');
const logoutBtn = document.getElementById('logoutBtn');
const clearBtn = document.getElementById('clearBtn');

function renderReports() {
  const reports = JSON.parse(localStorage.getItem('reports') || '[]').slice().reverse();
  if (!reports.length) {
    reportsList.innerHTML = '<p>No reports submitted yet.</p>';
    return;
  }

  const rows = reports.map(r => {
    const photoHtml = r.photoAttached && r.photoData ? `<img src="${r.photoData}" style="max-width:160px;border-radius:8px"/>` : '';
    return `<div style="border:1px solid #e2e8f0;padding:12px;border-radius:12px;margin-bottom:12px">
      <p><strong>ID:</strong> ${r.id} <strong style="margin-left:12px">${new Date(r.submittedAt).toLocaleString()}</strong></p>
      <p><strong>Name:</strong> ${r.fullName} &nbsp; <strong>Email:</strong> ${r.email} &nbsp; <strong>Phone:</strong> ${r.phone}</p>
      <p><strong>Location:</strong> ${r.state}, ${r.city} - ${r.location}</p>
      <p><strong>Category:</strong> ${r.category} &nbsp; <strong>Severity:</strong> ${r.severity}</p>
      <p><strong>Description:</strong> ${r.description}</p>
      <div>${photoHtml}</div>
    </div>`;
  }).join('');

  reportsList.innerHTML = rows;
}

// Render reports on page load
renderReports();

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'admin-login.html';
});

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all saved reports? This cannot be undone.')) return;
  localStorage.removeItem('reports');
  renderReports();
});
