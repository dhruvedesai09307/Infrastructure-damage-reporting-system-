const damageForm = document.getElementById('damageForm');
const resultSection = document.getElementById('result');
const reportSummary = document.getElementById('reportSummary');
const formFeedback = document.getElementById('formFeedback');

const stateSelect = document.getElementById('state');
const citySelect = document.getElementById('city');

// Indian states and all cities
const citiesByState = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Hyderabad', 'Tirupati', 'Nellore', 'Rajahmundry', 'Kakinada', 'Tenali', 'Ongole', 'Kadapa', 'Anantapur', 'Guntur', 'Kurnool', 'Machilipatnam', 'Eluru'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezu', 'Ziro', 'Changlang', 'Tawang', 'Roing', 'Namsai', 'Bomdila'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Tinsukia', 'Nagaon', 'Jorhat', 'Barpeta', 'Golaghat', 'Dhubri', 'Karimganj', 'Kamrup', 'Kokrajhar', 'Sibsagar'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Madhubani', 'Munger', 'Darbhanga', 'Arrah', 'Siwan', 'Motihari', 'Purnia', 'Muzaffarpur', 'Begusarai', 'Saharsa', 'Supaul'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Durg', 'Bilaspur', 'Rajnandgaon', 'Duisikop', 'Mandir', 'Jagdalpur', 'Korba', 'Raigarh'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Sanquelim', 'Pernem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Jamnagar', 'Bhavnagar', 'Anand', 'Junagadh', 'Kheda', 'Mehsana', 'Porbandar', 'Surendranagar', 'Tapi', 'Kutch', 'Chhota Udaipur', 'Navsari', 'Valsad'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat', 'Ambala', 'Karnal', 'Yamunanagar', 'Panchkula', 'Mandi', 'Sonipat', 'Bhiwani', 'Jhajjar', 'Rewari'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Mandi', 'Kangra', 'Kullu', 'Chamba', 'Kinnaur', 'Lahaul and Spiti', 'Bilaspur', 'Hamirpur'],
  'Jharkhand': ['Ranchi', 'Dhanbad', 'Jamshedpur', 'Giridih', 'Bokaro', 'Deoghar', 'Dhanabad', 'East Singhbhum', 'West Singhbhum', 'Koderma', 'Pakur', 'Ramgarh', 'Sahibganj'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga', 'Tumkur', 'Bijapur', 'Davangere', 'Chickmagalore', 'Shimoga', 'Udupi', 'Chikballapur', 'Kolar', 'Raichur', 'Yadgiri', 'Bagalkote'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kannur', 'Kottayam', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kasaragod', 'Idukki', 'Wayanad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Ratlam', 'Mhow', 'Sehore', 'Ashok Nagar', 'Betul', 'Burhanpur', 'Chhindwara', 'Damoh', 'Dindori', 'Dhar', 'Dholpur', 'Mandla', 'Mandsaur', 'Morena', 'Nagda', 'Panna', 'Rewa', 'Sagar', 'Satna', 'Seoni', 'Shahdol', 'Shivpuri', 'Sidhi', 'Tikamgarh'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Aurangabad', 'Nashik', 'Thane', 'Solapur', 'Kolhapur', 'Sangli', 'Satara', 'Ahmednagar', 'Jalna', 'Parbhani', 'Latur', 'Nanded', 'Nandurbar', 'Dhule', 'Jalgaon', 'Buldana', 'Akola', 'Amravati', 'Yavatmal', 'Washim', 'Buldhana', 'Hingoli', 'Wardha', 'Raigarh', 'Ratnagiri', 'Sindhudurg'],
  'Manipur': ['Imphal', 'Thoubal', 'Ukhrul', 'Senapati', 'Bishnupur', 'Kakching', 'Moirang', 'Tamenglong', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Baghmara', 'Jowai', 'Nongstoin', 'Cherrapunjee', 'Mawsynram', 'Ampati', 'Nongpoh'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Serchhip', 'Kolasib', 'Mamit', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Zunheboto', 'Mon', 'Tuensang', 'Longleng', 'Kiphire'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Balasore', 'Berhampur', 'Jajpur', 'Puri', 'Angul', 'Dhenkanal', 'Bolangir', 'Kalahandi', 'Kandhamal', 'Koraput', 'Malkangiri', 'Nabarangpur', 'Nayagarh', 'Khordha'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar', 'Bathinda', 'Firozpur', 'Hoshiarpur', 'Gurdaspur', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Fatehgarh Sahib'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Dungarpur', 'Hanumangarh', 'Jaisalmer', 'Jalor', 'Jhalawar', 'Nagaur', 'Pali', 'Sikar', 'Sirohi', 'Tonk', 'Banswara', 'Barmer', 'Beawar', 'Chittorgarh', 'Churu'],
  'Sikkim': ['Gangtok', 'Pelling', 'Ravangla', 'Geyzing', 'Namchi', 'Mangan', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Kanniyakumari', 'Thanjavur', 'Tirunelveli', 'Villupuram', 'Virudhunagar', 'Tiruppur', 'Erode', 'Cuddalore', 'Kanchipuram', 'Karur', 'Krishnagiri', 'Namakkal', 'Perambalur', 'Ranipet', 'Sivaganga', 'Tenkasi', 'Theni', 'Tirupathur', 'Udagamandalam'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Adilabad', 'Medak', 'Nalgonda', 'Mahbubnagar', 'Rangareddy'],
  'Tripura': ['Agartala', 'Udaipur', 'Ambassa', 'Dharmanagar', 'Kailashahar', 'Sabroom', 'Teliamura', 'Kumarghat'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Ghaziabad', 'Allahabad', 'Bareilly', 'Aligarh', 'Gorakhpur', 'Noida', 'Greater Noida', 'Moradabad', 'Rampur', 'Saharanpur', 'Muzaffarnagar', 'Mathura', 'Vrindavan', 'Fatehpur', 'Banda', 'Chitrakoot', 'Hamirpur', 'Mahoba', 'Jalaun', 'Jhansi', 'Lalitpur', 'Raisen', 'Rewa', 'Sheopur', 'Tikamgarh', 'Etah', 'Firozabad', 'Mainpuri', 'Etawah', 'Mukundpur', 'Farrukhabad', 'Kasganj', 'Kannauj', 'Dhampur', 'Shamli', 'Mandi', 'Orai', 'Bhinga', 'Banthra', 'Khatauli'],
  'Uttarakhand': ['Dehradun', 'Nainital', 'Rishikesh', 'Haridwar', 'Mussoorie', 'Almora', 'Bageshwar', 'Champawat', 'Pithoragarh', 'Rudraprayag', 'Uttarkashi', 'Tehri', 'Pauri', 'Garhwal', 'Chamoli', 'Udham Singh Nagar'],
  'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur', 'Bardhaman', 'Purulia', 'Hooghly', 'Howrah', 'East Midnapore', 'West Midnapore', 'Bankura', 'Birbhum', 'Murshidabad', 'Malda', 'Dinajpur', 'Jalpaiguri', 'Cooch Behar', 'Kalimpong', 'Kurseong', 'Darjeeling Sadar'],
};

// Event listener to populate cities based on state
if (stateSelect) {
  stateSelect.addEventListener('change', () => {
    const selectedState = stateSelect.value;
    const cities = citiesByState[selectedState] || [];
    
    citySelect.innerHTML = '<option value="">Select your city</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    
    // Reset city selection
    citySelect.value = '';
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const normalized = phone.replace(/\s|[-()]/g, '');
  return /^(?:\+91|0)?[6-9]\d{9}$/.test(normalized);
}

function validateLocation(location) {
  const cleaned = location.trim();
  if (cleaned.length < 10) {
    return false;
  }
  const blacklist = /(?:asdf|qwer|test|12345|fake|address|xyz|random|abcd)/i;
  if (blacklist.test(cleaned)) {
    return false;
  }
  return cleaned.split(/\s+/).length >= 2;
}

function showFeedback(message) {
  const el = document.getElementById('formFeedback');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideFeedback() {
  const el = document.getElementById('formFeedback');
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

if (damageForm) {
  damageForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(damageForm);
    const fullName = formData.get('fullName').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const state = formData.get('state');
    const city = formData.get('city');
    const location = formData.get('location').trim();

    const normalizedPhone = phone
      .replace(/\s|[-()]/g, '')
      .replace(/^\+?91/, '');
    const finalPhone = normalizedPhone.length === 10 ? `+91${normalizedPhone}` : phone;

    if (!validateEmail(email)) {
      showFeedback('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(phone)) {
      showFeedback('Please enter a valid Indian mobile number (10 digits, starting with 6-9).');
      return;
    }

    if (!state) {
      showFeedback('Please select a state.');
      return;
    }

    if (!city) {
      showFeedback('Please select a city.');
      return;
    }

    if (!validateLocation(location)) {
      showFeedback('Please enter a real address. Use a full street or landmark name so the damage location is clear.');
      return;
    }

    hideFeedback();

    const photoFile = formData.get('photo');
    let photoData = null;

    if (photoFile && photoFile.size > 0) {
      photoData = await toBase64(photoFile);
    }

    const report = {
      id: `REP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      submittedAt: new Date().toISOString(),
      fullName,
      email,
      phone: finalPhone,
      state,
      city,
      location,
      category: formData.get('category'),
      severity: formData.get('severity'),
      description: formData.get('description').trim(),
      photoAttached: Boolean(photoData),
      photoData: photoData || null,
    };

    // save to localStorage for admin review
    const existing = JSON.parse(localStorage.getItem('reports') || '[]');
    existing.push(report);
    localStorage.setItem('reports', JSON.stringify(existing));

    // show generic confirmation with reference id to user
    const refEl = document.getElementById('refId');
    if (refEl) refEl.textContent = report.id;
    resultSection.classList.remove('hidden');
    damageForm.reset();
  });
}
