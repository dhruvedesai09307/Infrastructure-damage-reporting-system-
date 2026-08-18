from server import app
from models import db, Report, Admin, User, Feedback

with app.app_context():
    print("=== Reports ===")
    for r in Report.query.all():
        print(r.to_dict())

    print("\n=== Admins ===")
    for a in Admin.query.all():
        print(a.username)

    print("\n=== Users ===")
    for u in User.query.all():
        print(u.name, u.email)

    print("\n=== Feedback ===")
    for f in Feedback.query.all():
        print(f.to_dict())