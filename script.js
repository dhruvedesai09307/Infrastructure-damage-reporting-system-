document.addEventListener('DOMContentLoaded', () => {
  // State -> City Mapping
  const cityData = {
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Patan", "Mehsana", "Palanpur", "Gandhinagar", "Jamnagar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"]
  };

  const stateSelect = document.getElementById('state');
  const citySelect = document.getElementById('city');

  if (stateSelect && citySelect) {
    stateSelect.addEventListener('change', () => {
      const selectedState = stateSelect.value;
      citySelect.innerHTML = '<option value="">Select your city</option>';

      if (selectedState && cityData[selectedState]) {
        cityData[selectedState].forEach(city => {
          const opt = document.createElement('option');
          opt.value = city;
          opt.textContent = city;
          citySelect.appendChild(opt);
        });
      } else if (selectedState) {
        // Fallback default cities
        ['Central City', 'Capital District', 'North Zone', 'South Zone'].forEach(city => {
          const opt = document.createElement('option');
          opt.value = city;
          opt.textContent = city;
          citySelect.appendChild(opt);
        });
      }
    });
  }

  // Damage Form Submission
  const damageForm = document.getElementById('damageForm');
  if (damageForm) {
    damageForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(damageForm);
      const data = Object.fromEntries(formData.entries());

      // Add default metadata if missing
      if (!data.status) data.status = 'Pending';
      if (!data.date) data.date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      let reportId = 'report_' + Date.now().toString().slice(-6);

      try {
        const response = await fetch('/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.report_id) {
            reportId = result.report_id;
          }
        }
      } catch (error) {
        console.warn('Backend server submit warning, operating in local storage mode:', error);
      }

      data.report_id = reportId;
      data.refId = reportId;

      // Save to localStorage reports
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      reports.push(data);
      localStorage.setItem('reports', JSON.stringify(reports));

      // Display result
      const resultDiv = document.getElementById('result');
      const refIdSpan = document.getElementById('refId');
      if (resultDiv && refIdSpan) {
        refIdSpan.textContent = reportId;
        resultDiv.style.display = 'block';
        resultDiv.classList.remove('hidden');

        // Add track button if not present
        if (!document.getElementById('trackLinkBtn')) {
          const trackBtn = document.createElement('a');
          trackBtn.id = 'trackLinkBtn';
          trackBtn.href = `track-report.html?id=${encodeURIComponent(reportId)}`;
          trackBtn.className = 'btn1';
          trackBtn.style.display = 'inline-block';
          trackBtn.style.marginTop = '16px';
          trackBtn.style.padding = '10px 20px';
          trackBtn.style.textDecoration = 'none';
          trackBtn.textContent = 'Track Report Progress →';
          resultDiv.appendChild(trackBtn);
        }
      }

      damageForm.style.display = 'none';
    });
  }
});
