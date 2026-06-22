from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Student, Prediction, User
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
    scored_students = 0
    rata_rata_nilai_raport = 0.0
    jumlah_siswa_dinilai = 0
    risk_counts = {'Rendah': 0, 'Netral': 0, 'Tinggi': 0}
    top_risky_students = []

    if latest_preds:
        scores = [p.predicted_exam_score for p in latest_preds.values() if p.predicted_exam_score is not None]
        if scores:
            avg_score = sum(scores) / len(scores)
            scored_students = len(scores)

        ordered_predictions = sorted(
            latest_preds.values(),
            key=lambda item: item.predicted_exam_score if item.predicted_exam_score is not None else 10**9,
        )

        risk_map = {
            'Aman': 'Tinggi',
            'Beresiko': 'Netral',
            'Sangat Beresiko': 'Rendah'
        }

        for prediction in ordered_predictions[:5]:
            student = Student.query.get(prediction.student_id)
            user = User.query.get(student.user_id) if student and student.user_id else None
            mapped_risk = risk_map.get(prediction.risk_status, prediction.risk_status)
            top_risky_students.append({
                'student_id': prediction.student_id,
                'nama': student.nama_siswa if student else '-',
                'nisn': student.nisn if student else '-',
                'role': user.role if user else 'siswa',
                'predicted_score': round(prediction.predicted_exam_score, 2) if prediction.predicted_exam_score is not None else None,
                'risk_status': mapped_risk,
            })

    student_scores = [student.nilai_rata_rata_raport for student in Student.query.all() if student.nilai_rata_rata_raport is not None]
    if student_scores:
        rata_rata_nilai_raport = sum(student_scores) / len(student_scores)
        jumlah_siswa_dinilai = len(student_scores)

    risk_map = {
        'Aman': 'Tinggi',
        'Beresiko': 'Netral',
        'Sangat Beresiko': 'Rendah'
    }
    
    for prediction in latest_preds.values():
        mapped_risk = risk_map.get(prediction.risk_status, prediction.risk_status)
        if mapped_risk in risk_counts:
            risk_counts[mapped_risk] += 1

    return jsonify({
        'total_siswa': total_students,
        'rata_rata_prediksi': round(avg_score, 2),
        'jumlah_siswa_berprediksi': scored_students,
        'rata_rata_nilai_raport': round(rata_rata_nilai_raport, 2),
        'jumlah_siswa_dinilai': jumlah_siswa_dinilai,
        'rendah': risk_counts.get('Rendah', 0),
        'netral': risk_counts.get('Netral', 0),
        'tinggi': risk_counts.get('Tinggi', 0),
        'top_risky_students': top_risky_students,
    }), 200