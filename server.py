from flask import Flask, request, jsonify, send_from_directory
import os
import datetime

app = Flask(__name__)

REPORTS_DIR = os.path.join(os.getcwd(), 'reports')
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

@app.route('/')
def home():
    return send_from_directory(os.getcwd(), 'home-page.html')

@app.route('/report', methods=['POST'])
def submit_report():
    try:
        data = request.get_json(force=True) or {}
        report_count = len([f for f in os.listdir(REPORTS_DIR) if f.endswith('.txt') or f.endswith('.json')])
        report_num = report_count + 1
        report_id = f"report_{report_num}.txt"
        report_path = os.path.join(REPORTS_DIR, report_id)
        
        if 'status' not in data:
            data['status'] = 'Pending'
        if 'date' not in data:
            data['date'] = datetime.datetime.now().strftime("%d %b %Y")
        if 'report_id' not in data:
            data['report_id'] = report_id

        with open(report_path, 'w', encoding='utf-8') as f:
            for key, value in data.items():
                f.write(f"{key}: {value}\n")

        return jsonify({'success': True, 'report_id': report_id, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/report_status/<report_id>', methods=['GET'])
def get_report_status(report_id):
    clean_id = report_id.strip()
    filename = clean_id if clean_id.endswith('.txt') else f"{clean_id}.txt"
    report_path = os.path.join(REPORTS_DIR, filename)
    
    if os.path.exists(report_path):
        data = {}
        with open(report_path, 'r', encoding='utf-8') as f:
            for line in f:
                if ':' in line:
                    key, val = line.split(':', 1)
                    data[key.strip()] = val.strip()
        return jsonify({'success': True, 'report_id': filename, **data})
    else:
        return jsonify({'success': False, 'message': 'Report ID not found in server records.'}), 404

@app.route('/api/reports', methods=['GET'])
def list_reports():
    reports_list = []
    if os.path.exists(REPORTS_DIR):
        for filename in os.listdir(REPORTS_DIR):
            if filename.endswith('.txt'):
                report_path = os.path.join(REPORTS_DIR, filename)
                data = {'report_id': filename}
                with open(report_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if ':' in line:
                            key, val = line.split(':', 1)
                            data[key.strip()] = val.strip()
                reports_list.append(data)
    return jsonify({'success': True, 'reports': reports_list})

@app.route('/api/report_status/update', methods=['POST'])
def update_report_status():
    try:
        req = request.get_json(force=True) or {}
        report_id = req.get('report_id', '').strip()
        new_status = req.get('status', '').strip()
        
        if not report_id or not new_status:
            return jsonify({'success': False, 'message': 'report_id and status are required'}), 400
            
        filename = report_id if report_id.endswith('.txt') else f"{report_id}.txt"
        report_path = os.path.join(REPORTS_DIR, filename)
        
        if not os.path.exists(report_path):
            return jsonify({'success': False, 'message': 'Report not found'}), 404
            
        data = {}
        with open(report_path, 'r', encoding='utf-8') as f:
            for line in f:
                if ':' in line:
                    key, val = line.split(':', 1)
                    data[key.strip()] = val.strip()
                    
        data['status'] = new_status
        
        with open(report_path, 'w', encoding='utf-8') as f:
            for key, value in data.items():
                f.write(f"{key}: {value}\n")
                
        return jsonify({'success': True, 'report_id': filename, 'status': new_status})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.getcwd(), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
