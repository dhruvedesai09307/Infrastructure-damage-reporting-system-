document.addEventListener('DOMContentLoaded', () => {
  const damageForm = document.getElementById('damageForm');
  if (damageForm) {
    damageForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(damageForm);
      const data = Object.fromEntries(formData.entries());
      
      fetch('/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          const resultDiv = document.getElementById('result');
          const refIdSpan = document.getElementById('refId');
          if (resultDiv && refIdSpan) {
            refIdSpan.textContent = result.report_id;
            resultDiv.style.display = 'block';
          }
          damageForm.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error submitting report:', error);
      });
    });
  }
});
