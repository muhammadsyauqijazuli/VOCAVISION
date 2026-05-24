from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Student, Prediction
from ..utils import role_required


dashboard_bp = Blueprint('dashboard', __name__)

# app/routes/dashboard.py
@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required(['admin', 'guru'])
def stats():
    total_students = Student.query.count()
    latest_preds = {}

    for prediction in Prediction.query.all():
        current = latest_preds.get(prediction.student_id)
        if not current:
            latest_preds[prediction.student_id] = prediction
            continue

        current_time = current.created_at
        new_time = prediction.created_at
        if current_time is None or (new_time is not None and new_time > current_time):
            latest_preds[prediction.student_id] = prediction

    avg_score = 0.0
    risk_counts = {'Sangat Beresiko': 0, 'Beresiko': 0, 'Tidak Beresiko': 0}

    if latest_preds:
        scores = [p.predicted_exam_score for p in latest_preds.values() if p.predicted_exam_score is not None]
        if scores:
            avg_score = sum(scores) / len(scores)

        for prediction in latest_preds.values():
            if prediction.risk_status in risk_counts:
                risk_counts[prediction.risk_status] += 1

    return jsonify({
        'total_siswa': total_students,
        'rata_rata_prediksi': round(avg_score, 2),
        'sangat_beresiko': risk_counts['Sangat Beresiko'],
        'beresiko': risk_counts['Beresiko'],
        'tidak_beresiko': risk_counts['Tidak Beresiko']
    }), 200