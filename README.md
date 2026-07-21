# Infrastructure-damage-reporting-system-

A simple static infrastructure damage reporting form for reporting road, utility, and public infrastructure issues.

## Files

- `index.html` – main reporting form UI
- `styles.css` – responsive form styling
- `script.js` – client-side submit handling and report preview
- `admin.html` – simple admin page to view submitted reports (local demo)
- `admin.js` – admin page logic

## Usage

1. Open `index.html` in a browser.
2. Fill in the report details and submit. You will receive a reference ID.
3. Admins can open `admin.html`, sign in with the demo password, and view all submissions stored locally.

## Admin Page (local demo)

This project includes a simple local admin page for viewing submitted reports.

- Open `admin.html` in a browser to view the admin panel.
- Demo admin password: `admin123` (only for local testing).

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