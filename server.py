from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Directory for storing reports
REPORTS_DIR = 'reports'
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

@app.route('/')
def home():
    return send_from_directory(os.getcwd(), 'home-page.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.getcwd(), filename)

@app.route('/report', methods=['POST'])
def submit_report():
    data = request.json
    report_id = f"report_{len(os.listdir(REPORTS_DIR)) + 1}.txt"
    report_path = os.path.join(REPORTS_DIR, report_id)
    with open(report_path, 'w') as f:
        for key, value in data.items():
            f.write(f"{key}: {value}\n")
    return jsonify({'success': True, 'report_id': report_id})

@app.route('/report_status/<report_id>', methods=['GET'])
def get_report_status(report_id):
    filename = report_id if report_id.endswith('.txt') else f"{report_id}.txt"
    report_path = os.path.join(REPORTS_DIR, filename)
    
    if os.path.exists(report_path):
        data = {}
        with open(report_path, 'r') as f:
            for line in f:
                if ':' in line:
                    key, val = line.split(':', 1)
                    data[key.strip()] = val.strip()
        return jsonify({'success': True, 'report_id': filename, **data})
    else:
        return jsonify({'success': False, 'message': 'Report ID not found in server records.'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
