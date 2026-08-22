from flask import Flask, request, jsonify, send_from_directory
from models import db, Report, Admin, User, Feedback
import os
import datetime
import jwt
from functools import wraps
from models import db, Report, Admin
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = 'change-this-to-something-random-later'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db_url = os.environ.get('DATABASE_URL')

def ensure_columns():
    with app.app_context():
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if 'report' in inspector.get_table_names():
                existing_cols = [c['name'] for c in inspector.get_columns('report')]
                for col_name, col_type in [
                    ('city', 'VARCHAR(100)'),
                    ('state', 'VARCHAR(100)'),
                    ('name', 'VARCHAR(100)'),
                    ('email', 'VARCHAR(120)'),
                    ('phone', 'VARCHAR(50)'),
                    ('severity', 'VARCHAR(50)')
                ]:
                    if col_name not in existing_cols:
                        try:
                            db.session.execute(text(f"ALTER TABLE report ADD COLUMN {col_name} {col_type}"))
                            db.session.commit()
                        except Exception as alter_err:
                            db.session.rollback()
                            print(f"Column {col_name} migration note: {alter_err}")
        except Exception as err:
            print(f"Column migration check note: {err}")

def setup_database():
    if db_url:
        try:
            app.config['SQLALCHEMY_DATABASE_URI'] = db_url
            if 'mysql' in db_url or 'postgres' in db_url:
                app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
                    "connect_args": {"ssl": {"ssl_mode": "REQUIRED"}}
                }
            db.init_app(app)
            with app.app_context():
                db.create_all()
                ensure_columns()
            return
        except Exception as e:
            print(f"Primary database connection failed ({e}). Falling back to local SQLite database.")

    # Fallback to local SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///idrs.db'
    app.config.pop('SQLALCHEMY_ENGINE_OPTIONS', None)
    if 'sqlalchemy' in app.extensions:
        del app.extensions['sqlalchemy']
    db.init_app(app)
    with app.app_context():
        db.create_all()
        ensure_columns()

setup_database()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        try:
            token = token.replace('Bearer ', '')
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except Exception:
            return jsonify({'success': False, 'message': 'Token is invalid or expired'}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/')
def home():
    return send_from_directory(os.getcwd(), 'home-page.html')

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total = Report.query.count()
    resolved = Report.query.filter_by(status='Resolved').count()
    pending = Report.query.filter(Report.status.in_(['Pending', 'In Progress'])).count()
    success_rate = round((resolved / total) * 100) if total > 0 else 0

    return jsonify({
        'success': True,
        'total': total,
        'resolved': resolved,
        'pending': pending,
        'success_rate': success_rate
    })



@app.route('/api/feedback', methods=['GET'])
def list_feedback():
    feedback = Feedback.query.all()
    return jsonify({'success': True, 'feedback': [f.to_dict() for f in feedback]})


@app.route('/api/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify({'success': True, 'users': [{'name': u.name, 'email': u.email} for u in users]})




@app.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json(force=True) or {}

        new_feedback = Feedback(
            name=data.get('name', '').strip(),
            email=data.get('email', '').strip(),
            category=data.get('category', '').strip(),
            location=data.get('location', '').strip(),
            rating=data.get('rating'),
            message=data.get('message', '').strip(),
            anonymous=data.get('anonymous', False)
        )
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Thank you for your feedback!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json(force=True) or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400

        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Account created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/user-login', methods=['POST'])
def user_login():
    data = request.get_json(force=True) or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    token = jwt.encode(
        {'email': user.email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'success': True, 'token': token, 'name': user.name})


@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json(force=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    admin = Admin.query.filter_by(username=username).first()
    if not admin or not admin.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

    token = jwt.encode(
        {'username': admin.username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'success': True, 'token': token})


@app.route('/report', methods=['POST'])
def submit_report():
    try:
        data = request.get_json(force=True) or {}

        raw_name = data.get('name') or data.get('fullName') or data.get('username') or 'USER'
        clean_name = ''.join(c for c in str(raw_name) if c.isalnum()).upper() or 'USER'
        report_count = Report.query.count()
        report_id = f"IDRS-{clean_name}-{report_count + 1:03d}"

        new_report = Report(
            report_id=report_id,
            title=data.get('title', '') or data.get('category', 'Damage Report'),
            description=data.get('description', ''),
            category=data.get('category', ''),
            location=data.get('location', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            name=raw_name,
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            severity=data.get('severity', 'Medium'),
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
@token_required
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