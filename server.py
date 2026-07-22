import json
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "reports.db"

def connection():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def initialize_database():
    with connection() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY, submitted_at TEXT NOT NULL, full_name TEXT NOT NULL,
            email TEXT NOT NULL, phone TEXT NOT NULL, state TEXT NOT NULL, city TEXT NOT NULL,
            location TEXT NOT NULL, category TEXT NOT NULL, severity TEXT NOT NULL,
            description TEXT NOT NULL, photo_attached INTEGER NOT NULL DEFAULT 0, photo_data TEXT
        )""")

def report_json(row):
    report = dict(row)
    report.update(fullName=report.pop("full_name"), submittedAt=report.pop("submitted_at"),
                  photoAttached=bool(report.pop("photo_attached")), photoData=report.pop("photo_data"))
    return report

class Handler(SimpleHTTPRequestHandler):
    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length) or b"{}")

    def do_GET(self):
        if urlparse(self.path).path == "/api/reports":
            with connection() as db:
                rows = db.execute("SELECT * FROM reports ORDER BY submitted_at DESC").fetchall()
            self.send_json([report_json(row) for row in rows])
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/reports":
            self.send_json({"error": "Not found"}, 404)
            return
        try:
            report = self.read_json()
            required = ["id", "submittedAt", "fullName", "email", "phone", "state", "city", "location", "category", "severity", "description"]
            if any(not str(report.get(field, "")).strip() for field in required):
                self.send_json({"error": "Missing required report fields"}, 400)
                return
            with connection() as db:
                db.execute("""INSERT INTO reports
                    (id, submitted_at, full_name, email, phone, state, city, location,
                     category, severity, description, photo_attached, photo_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (report["id"], report["submittedAt"], report["fullName"], report["email"], report["phone"], report["state"], report["city"], report["location"], report["category"], report["severity"], report["description"], int(bool(report.get("photoData"))), report.get("photoData")))
            self.send_json({"message": "Report saved", "report": report}, 201)
        except (json.JSONDecodeError, sqlite3.Error, KeyError) as error:
            self.send_json({"error": str(error)}, 400)

    def do_DELETE(self):
        if urlparse(self.path).path != "/api/reports":
            self.send_json({"error": "Not found"}, 404)
            return
        with connection() as db:
            db.execute("DELETE FROM reports")
        self.send_json({"message": "Reports cleared"})

if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer(("localhost", 8080), Handler)
    print("Infrastructure reporting system: http://localhost:8080/landing.html")
    print(f"SQLite database: {DATABASE}")
    server.serve_forever()
