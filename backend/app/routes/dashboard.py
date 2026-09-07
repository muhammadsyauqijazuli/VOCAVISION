from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Student, Prediction, User
from ..utils import role_required
from ..services.ml_service import MLService


dashboard_bp = Blueprint('dashboard', __name__)

"""
Dashboard API Routes.
Provides aggregated statistics and metrics for the admin and teacher dashboards.
"""

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required(['admin', 'guru', 'orang_tua'])
def stats():
    """
    Get global statistics including total students, average predicted scores,
    risk distributions, top risky students, and global feature importances.
    """
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
    risk_counts = {'Beresiko': 0, 'Aman': 0, 'Sangat Aman': 0}
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

        for prediction in ordered_predictions[:5]:
            student = Student.query.get(prediction.student_id)
            user = User.query.get(student.user_id) if student and student.user_id else None
            mapped_risk = prediction.risk_status
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

    for prediction in latest_preds.values():
        risk_status = prediction.risk_status
        if risk_status in risk_counts:
            risk_counts[risk_status] += 1
        elif risk_status == "Aman" and "Aman" not in risk_counts:
             pass

    global_shap = []
    try:
        ml = MLService()
        if hasattr(ml.classifier, 'feature_importances_'):
            importances = ml.classifier.feature_importances_
            features = ml.train_columns if ml.train_columns is not None else ml.feature_names
            if features is not None and len(features) == len(importances):
                # Map feature names to readable labels
                name_map = {
                    'presentase_kehadiran': 'Presentase Kehadiran',
                    'presentase_kehadiran_efektif': 'Libur Tanpa Keterangan',
                    'skor_time_management': 'Skor Time Management',
                    'industry_readiness': 'Kesiapan Industri',
                    'jam_belajar_per_hari': 'Jam Belajar per Hari',
                    'screen_time': 'Screen Time',
                    'motivasi_akademik': 'Motivasi Akademik',
                    'jam_tidur': 'Jam Tidur',
                }
                for f, imp in zip(features, importances):
                    clean_name = name_map.get(f, f.replace('_', ' ').title())
                    global_shap.append({
                        'feature': clean_name,
                        'importance': round(float(imp) * 100, 2)
                    })
                
                # Sort descending and keep the top 6 features
                global_shap.sort(key=lambda x: x['importance'], reverse=True)
                global_shap = global_shap[:6]
    except Exception as e:
        print("Error fetching global SHAP:", e)

    return jsonify({
        'total_siswa': total_students,
        'rata_rata_prediksi': round(avg_score, 2),
        'jumlah_siswa_berprediksi': scored_students,
        'rata_rata_nilai_raport': round(rata_rata_nilai_raport, 2),
        'jumlah_siswa_dinilai': jumlah_siswa_dinilai,
        'beresiko': risk_counts.get('Beresiko', 0),
        'aman': risk_counts.get('Aman', 0),
        'sangat_aman': risk_counts.get('Sangat Aman', 0),
        'top_risky_students': top_risky_students,
        'global_shap': global_shap,
    }), 200