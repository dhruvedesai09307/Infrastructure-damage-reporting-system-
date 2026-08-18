from server import app
from models import db, Admin

with app.app_context():
    username = input("Enter admin username: ")
    password = input("Enter admin password: ")

    existing = Admin.query.filter_by(username=username).first()
    if existing:
        print("Admin already exists!")
    else:
        new_admin = Admin(username=username)
        new_admin.set_password(password)
        db.session.add(new_admin)
        db.session.commit()
        print(f"Admin '{username}' created successfully!")