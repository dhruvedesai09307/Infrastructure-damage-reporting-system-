# Infrastructure-damage-reporting-system-

A simple static infrastructure damage reporting form for reporting road, utility, and public infrastructure issues.

## Files

- `landing.html` – **Welcome/home page** with navigation, statistics, and quick access (START HERE!)
- `home.html` – All-in-one dashboard with reporting form, admin panel, and statistics
- `index.html` – Main reporting form UI 
- `styles.css` – Responsive form styling
- `script.js` – Client-side submit handling and report preview
- `admin.html` – Admin dashboard (access after login)
- `admin.js` – Admin page logic
- `login.html` – Separate login page
- `login.js` – Login authentication

## Quick Start

1. **Open `landing.html`** - Welcome page with all options
2. Choose one of:
   - **Report Damage** - Go to index.html to submit reports
   - **Dashboard** - Open home.html for all-in-one experience
   - **Admin Access** - Login to view reports

## Usage

**Starting Point: Landing Page**
- Open `landing.html` in a browser
- See system statistics
- Choose your action:
  - Report new damage
  - Access the full dashboard
  - Login to admin panel

**Report Damage Flow**
1. Click "Report Damage" or open `index.html`
2. Fill in all required details
3. Submit with optional photo
4. Get reference ID for your report

**Admin Access Flow**
1. From landing page, click "Access Admin"
2. Enter credentials: username: `sujal` | password: `sujal123`
3. View all submitted reports
4. See report details with photos

## Admin Page (local demo)

This project includes a simple local admin page for viewing submitted reports.

- Open `admin.html` in a browser to view the admin panel.
- Demo login: Username: `sujal`, Password: `sujal123` (only for local testing).

Notes:
- Submitted reports are stored in your browser's `localStorage` under the `reports` key.
- For a production system, replace `localStorage` with a server-side database and implement secure authentication.

## Report Categories

Includes support for:
- Pothole / Damaged Road
- Cracked Road
- Bridge Damage
- Streetlight Not Working
- Traffic Signal Not Working
- Water Leakage
- Burst Water Pipeline
- Drainage / Sewer Overflow
- Garbage Not Collected
- Fallen Tree
- Electric Pole Damage
- Hanging or Broken Electric Wires
- Damaged Road Sign
- Damaged Bus Stop
- Waterlogging / Flooding
- Footpath / Sidewalk Damage
- Manhole Cover Missing or Broken
- Damage to Public Buildings
- Park Equipment Damage
- Other (with description)
