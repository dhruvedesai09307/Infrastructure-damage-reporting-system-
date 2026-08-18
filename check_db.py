from server import app
from models import db, Report

with app.app_context():
    reports = Report.query.all()
    print(f"Total reports: {len(reports)}")
    for r in reports:
        print(r.to_dict())