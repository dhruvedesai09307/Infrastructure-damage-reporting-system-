from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    location = db.Column(db.String(200))
    status = db.Column(db.String(50), default='Pending')
    image_path = db.Column(db.String(300))
    date = db.Column(db.String(50), default=lambda: datetime.datetime.now().strftime("%d %b %Y"))

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "location": self.location,
            "status": self.status,
            "image_path": self.image_path,
            "date": self.date
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    category = db.Column(db.String(100))
    location = db.Column(db.String(150))
    rating = db.Column(db.Integer)  # 1 to 5
    message = db.Column(db.Text)
    anonymous = db.Column(db.Boolean, default=False)
    date = db.Column(db.String(50), default=lambda: datetime.datetime.now().strftime("%d %b %Y"))

    def to_dict(self):
        return {
            "name": None if self.anonymous else self.name,
            "email": None if self.anonymous else self.email,
            "category": self.category,
            "location": self.location,
            "rating": self.rating,
            "message": self.message,
            "date": self.date
        }