import os
import sys

# Add backend directory to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Student, Prediction

app = create_app()

with app.app_context():
    print("Checking database...")
    students = Student.query.limit(5).all()
    for s in students:
        preds = Prediction.query.filter_by(student_id=s.id).all()
        print(f"Student {s.nama_siswa} (ID: {s.id})")
        if not preds:
            print("  No predictions")
        for p in preds:
            print(f"  Prediction: {p.predicted_exam_score}, {p.risk_status}")
