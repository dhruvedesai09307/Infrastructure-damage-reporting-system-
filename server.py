from flask import Flask, request, jsonify, send_from_directory
from models import db, Report, Admin, User, Feedback
import os
import datetime
import jwt
from functools import wraps
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
            # Migrate 'report' table columns
            if 'report' in inspector.get_table_names():
                existing_cols = [c['name'] for c in inspector.get_columns('report')]
                for col_name, col_type in [
                    ('city', 'VARCHAR(100)'),
                    ('state', 'VARCHAR(100)'),
                    ('name', 'VARCHAR(100)'),
                    ('email', 'VARCHAR(120)'),
                    ('phone', 'VARCHAR(50)'),
                    ('severity', 'VARCHAR(50)'),
                    ('assigned_dept', 'VARCHAR(100)'),
                    ('admin_notes', 'TEXT'),
                    ('latitude', 'FLOAT'),
                    ('longitude', 'FLOAT')
                ]:
                    if col_name not in existing_cols:
                        try:
                            db.session.execute(text(f"ALTER TABLE report ADD COLUMN {col_name} {col_type}"))
                            db.session.commit()
                        except Exception as alter_err:
                            db.session.rollback()
                            print(f"Column {col_name} migration note: {alter_err}")
            # Migrate 'user' table – add phone column if missing
            if 'user' in inspector.get_table_names():
                existing_user_cols = [c['name'] for c in inspector.get_columns('user')]
                if 'phone' not in existing_user_cols:
                    try:
                        db.session.execute(text("ALTER TABLE user ADD COLUMN phone VARCHAR(20) UNIQUE"))
                        db.session.commit()
                    except Exception as alter_err:
                        db.session.rollback()
                        print(f"User phone column migration note: {alter_err}")
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


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response


@app.route('/')
def home():
    return send_from_directory(os.getcwd(), 'home-page.html')

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        total = Report.query.count()
        resolved = Report.query.filter_by(status='Resolved').count()
        in_progress = Report.query.filter_by(status='In Progress').count()
        pending = Report.query.filter(Report.status != 'Resolved').count()
        success_rate = round((resolved / total) * 100) if total > 0 else 0

        return jsonify({
            'success': True,
            'total': total,
            'resolved': resolved,
            'in_progress': in_progress,
            'pending': pending,
            'success_rate': success_rate
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/feedback', methods=['GET'])
def list_feedback():
    feedback = Feedback.query.all()
    return jsonify({'success': True, 'feedback': [f.to_dict() for f in feedback]})


@app.route('/api/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify({'success': True, 'users': [u.to_dict() for u in users]})




@app.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}

        # Safely parse rating
        rating_val = None
        if data.get('rating') not in [None, '']:
            try:
                rating_val = int(data.get('rating'))
            except (ValueError, TypeError):
                rating_val = 5

        new_feedback = Feedback(
            name=str(data.get('name', '')).strip(),
            email=str(data.get('email', '')).strip(),
            category=str(data.get('category', '')).strip(),
            location=str(data.get('location', '')).strip(),
            rating=rating_val,
            message=str(data.get('message', '')).strip(),
            anonymous=bool(data.get('anonymous', False))
        )
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Thank you for your feedback!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        name = str(data.get('name', '')).strip()
        email = str(data.get('email', '')).strip()
        phone = str(data.get('phone', '')).strip()
        password = str(data.get('password', '')).strip()

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400

        if phone:
            existing_phone = User.query.filter_by(phone=phone).first()
            if existing_phone:
                return jsonify({'success': False, 'message': 'An account with this mobile number already exists'}), 400

        new_user = User(name=name, email=email, phone=phone or None)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Account created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/user-login', methods=['POST'])
def user_login():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    identifier = str(data.get('email', '')).strip()  # can be email OR mobile number
    password = str(data.get('password', '')).strip()

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Email/mobile and password are required'}), 400

    # Support login by email or mobile number
    user = User.query.filter(
        (User.email == identifier) | (User.phone == identifier)
    ).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email/mobile or password'}), 401

    token = jwt.encode(
        {'email': user.email, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=6)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'success': True, 'token': token, 'name': user.name})


# ── Helper: extract email from Bearer token ────────────────────────────────
def get_email_from_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return data.get('email')
    except Exception:
        return None


@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    email = get_email_from_token()
    if not email:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({
        'success': True,
        'name': user.name or '',
        'email': user.email,
        'phone': user.phone or '',
    })


@app.route('/api/user/profile/update', methods=['POST'])
def update_user_profile():
    email = get_email_from_token()
    if not email:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        new_name = str(data.get('name', '')).strip()
        new_phone = str(data.get('phone', '')).strip()

        if new_name:
            user.name = new_name
        if new_phone:
            # Check uniqueness only if phone is changing
            if new_phone != (user.phone or ''):
                existing = User.query.filter(User.phone == new_phone, User.email != email).first()
                if existing:
                    return jsonify({'success': False, 'message': 'Phone number already in use'}), 400
            user.phone = new_phone

        db.session.commit()
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/user/change-password', methods=['POST'])
def change_user_password():
    email = get_email_from_token()
    if not email:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        old_password = str(data.get('old_password', '')).strip()
        new_password = str(data.get('new_password', '')).strip()

        if not old_password or not new_password:
            return jsonify({'success': False, 'message': 'All password fields are required'}), 400
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(old_password):
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401

        user.set_password(new_password)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Password changed successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/user/reports', methods=['GET'])
def get_user_reports():
    email = get_email_from_token()
    if not email:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    reports = Report.query.filter_by(email=email).order_by(Report.id.desc()).all()
    return jsonify({'success': True, 'reports': [r.to_dict() for r in reports]})



@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400

    admin = Admin.query.filter_by(username=username).first()
    if not admin or not admin.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

    token = jwt.encode(
        {'username': admin.username, 'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=6)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return jsonify({'success': True, 'token': token})


@app.route('/report', methods=['POST'])
@app.route('/submit_report', methods=['POST'])
def submit_report():
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}

        raw_name = data.get('name') or data.get('fullName') or data.get('username') or 'USER'
        clean_name = ''.join(c for c in str(raw_name) if c.isalnum()).upper() or 'USER'
        custom_id = data.get('report_id') or data.get('refId')
        
        if custom_id and not Report.query.filter_by(report_id=str(custom_id).strip()).first():
            report_id = str(custom_id).strip()
        else:
            report_count = Report.query.count()
            report_id = f"IDRS-{clean_name}-{report_count + 1:03d}"

        # Parse GPS coordinates
        latitude = None
        longitude = None
        try:
            if data.get('latitude') not in [None, '']:
                latitude = float(data.get('latitude'))
            elif data.get('lat') not in [None, '']:
                latitude = float(data.get('lat'))
            
            if data.get('longitude') not in [None, '']:
                longitude = float(data.get('longitude'))
            elif data.get('lng') not in [None, '']:
                longitude = float(data.get('lng'))
        except (ValueError, TypeError):
            latitude = None
            longitude = None

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
            status='Pending',
            latitude=latitude,
            longitude=longitude,
            image_path=data.get('image_path') or data.get('image') or ''
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
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        report_id = str(req.get('report_id', '')).strip()
        new_status = str(req.get('status', '')).strip()

        if not report_id or not new_status:
            return jsonify({'success': False, 'message': 'report_id and status are required'}), 400

        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        report.status = new_status
        db.session.commit()

        return jsonify({'success': True, 'report_id': report_id, 'status': new_status})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/report/delete', methods=['POST'])
def delete_report():
    try:
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        report_id = str(req.get('report_id', '')).strip()

        if not report_id:
            return jsonify({'success': False, 'message': 'report_id is required'}), 400

        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        db.session.delete(report)
        db.session.commit()

        return jsonify({'success': True, 'message': f'Report {report_id} deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/report/note', methods=['POST'])
def update_report_note():
    try:
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        report_id = str(req.get('report_id', '')).strip()
        note = str(req.get('note', '')).strip()

        if not report_id:
            return jsonify({'success': False, 'message': 'report_id is required'}), 400

        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        current_notes = report.admin_notes or ''
        timestamp = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
        updated_notes = f"{current_notes}\n[{timestamp}] {note}".strip() if current_notes else f"[{timestamp}] {note}"
        report.admin_notes = updated_notes
        db.session.commit()

        return jsonify({'success': True, 'report_id': report_id, 'admin_notes': report.admin_notes})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/report/assign', methods=['POST'])
def assign_report_dept():
    try:
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        report_id = str(req.get('report_id', '')).strip()
        dept = str(req.get('assigned_dept', '')).strip()

        if not report_id:
            return jsonify({'success': False, 'message': 'report_id is required'}), 400

        report = Report.query.filter_by(report_id=report_id).first()
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404

        report.assigned_dept = dept
        if report.status == 'Pending':
            report.status = 'In Progress'
        db.session.commit()

        return jsonify({'success': True, 'report_id': report_id, 'assigned_dept': report.assigned_dept, 'status': report.status})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/reports/batch-update', methods=['POST'])
def batch_update_reports():
    try:
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        report_ids = req.get('report_ids', [])
        new_status = str(req.get('status', '')).strip()
        action = str(req.get('action', '')).strip()

        if not report_ids:
            return jsonify({'success': False, 'message': 'No report IDs provided'}), 400

        if action == 'delete':
            Report.query.filter(Report.report_id.in_(report_ids)).delete(synchronize_session=False)
            db.session.commit()
            return jsonify({'success': True, 'message': f'Deleted {len(report_ids)} reports'})

        if new_status:
            reports = Report.query.filter(Report.report_id.in_(report_ids)).all()
            for r in reports:
                r.status = new_status
            db.session.commit()
            return jsonify({'success': True, 'message': f'Updated {len(reports)} reports to {new_status}'})

        return jsonify({'success': False, 'message': 'Invalid action or status'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/stats', methods=['GET'])
def get_admin_detailed_stats():
    try:
        reports = Report.query.all()
        total = len(reports)
        pending = sum(1 for r in reports if (r.status or 'Pending') == 'Pending')
        in_progress = sum(1 for r in reports if r.status == 'In Progress')
        resolved = sum(1 for r in reports if r.status == 'Resolved')
        critical = sum(1 for r in reports if (r.severity or '').lower() in ['critical', 'high'])

        category_counts = {}
        for r in reports:
            cat = r.category or 'Other'
            category_counts[cat] = category_counts.get(cat, 0) + 1

        users_count = User.query.count()
        feedback_count = Feedback.query.count()

        return jsonify({
            'success': True,
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'critical': critical,
            'users_count': users_count,
            'feedback_count': feedback_count,
            'category_breakdown': category_counts
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat_ai():
    try:
        req = request.get_json(silent=True) or request.form.to_dict() or {}
        message = str(req.get('message', '')).strip()

        if not message:
            return jsonify({'success': False, 'reply': 'Please provide a message.'}), 400

        # 1. Try Gemini API if key is available
        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                sys_prompt = (
                    "You are the IDRS (Infrastructure Damage Reporting System) Civic AI Assistant — a friendly, witty, intelligent, and deeply helpful companion. "
                    "You love having fun, engaging conversations, answering general questions, telling jokes, giving advice, doing trivia, and chatting about any topic. "
                    "When citizens ask about civic infrastructure (potholes, water leaks, streetlights, bridges, garbage, traffic lights, tracking complaints), "
                    "provide expert municipal advice, SLAs, and guide them to report.html or track-report.html. "
                    "Keep your tone warm, charismatic, knowledgeable, and enjoyable to talk to!"
                )
                response = model.generate_content(f"{sys_prompt}\n\nUser: {message}")
                if response and response.text:
                    return jsonify({'success': True, 'reply': response.text})
            except Exception as ai_err:
                print(f"Gemini API note: {ai_err}")

        return jsonify({'success': True, 'reply': None})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.getcwd(), filename)


if __name__ == '__main__':
    app.run(debug=True, port=5001)