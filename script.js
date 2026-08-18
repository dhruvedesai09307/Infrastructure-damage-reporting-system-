document.addEventListener('DOMContentLoaded', () => {
  // State -> City Mapping
  const cityData = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Bharuch", "Mehsana", "Patan", "Palanpur", "Porbandar"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Ballari", "Udupi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Satna"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Chhatrapati Sambhajinagar", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Gorakhpur"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Kharagpur"]
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

      const rawName = (data.fullName || data.name || data.username || 'USER').trim();
      const cleanUsername = rawName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'USER';
      let reportId = `IDRS-${cleanUsername}-${Math.floor(100 + Math.random() * 900)}`;

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
