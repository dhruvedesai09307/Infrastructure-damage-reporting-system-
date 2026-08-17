from flask import Flask, request, jsonify, send_from_directory
import os
import datetime
from models import db, Report, Admin

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/idrs-db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return send_from_directory(os.getcwd(), 'home-page.html')

@app.route('/report', methods=['POST'])
def submit_report():
    try:
        data = request.get_json(force=True) or {}

        report_count = Report.query.count()
        report_id = f"report_{report_count + 1}"

        new_report = Report(
            report_id=report_id,
            title=data.get('title', ''),
            description=data.get('description', ''),
            category=data.get('category', ''),
            location=data.get('location', ''),
            status='Pending'
        )
        db.session.add(new_report)
        db.session.commit()

        return jsonify({'success': True, 'report_id': report_id, 'data': new_report.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/report_status/<report_id>', methods=['GET'])
def get_report_status(report_id):
    report = Report.query.filter_by(report_id=report_id.strip()).first()
    if report:
        return jsonify({'success': True, **report.to_dict()})
    else:
        return jsonify({'success': False, 'message': 'Report ID not found in server records.'}), 404

@app.route('/api/reports', methods=['GET'])
def list_reports():
    reports = Report.query.all()
    return jsonify({'success': True, 'reports': [r.to_dict() for r in reports]})

@app.route('/api/report_status/update', methods=['POST'])
def update_report_status():
    try:
        req = request.get_json(force=True) or {}
        report_id = req.get('report_id', '').strip()
        new_status = req.get('status', '').strip()

        if not report_id or not new_status:
            return jsonify({'success': False, 'message': 'report_id and status are required'}), 400

        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        report.status = new_status
        db.session.commit()

        return jsonify({'success': True, 'report_id': report_id, 'status': new_status})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat_ai():
    try:
        req = request.get_json(force=True) or {}
        message = req.get('message', '').strip()

        if not message:
            return jsonify({'success': False, 'reply': 'Please provide a message.'}), 400

        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                sys_prompt = (
                    "You are the IDRS (Infrastructure Damage Reporting System) Civic AI Assistant. "
                    "Help citizens report potholes, water leaks, broken streetlights, bridge defects, and structural issues. "
                    "Guide them to report at report.html and track complaints at track-report.html. "
                    "Keep answers helpful, direct, polite, and concise."
                )
                response = model.generate_content(f"{sys_prompt}\n\nUser: {message}")
                if response and response.text:
                    return jsonify({'success': True, 'reply': response.text})
            except Exception as ai_err:
                print(f"Gemini API fallback to rule engine: {ai_err}")

        return jsonify({'success': True, 'reply': None})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.getcwd(), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)