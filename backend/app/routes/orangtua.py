from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import ParentLink, Student, Prediction, SHAPAnalysis

orangtua_bp = Blueprint('orangtua', __name__)

@orangtua_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    # Ambil anak-anak yang terhubung
    links = ParentLink.query.filter_by(parent_id=user_id).all()
    if not links:
        return jsonify({"error": "Tidak ada data anak"}), 404

    result = []
    for link in links:
        student = Student.query.get(link.student_id)
        if not student:
            continue
        pred = Prediction.query.filter_by(student_id=student.id)\
                .order_by(Prediction.created_at.desc()).first()
        result.append({
            "id": student.id,
            "nama": student.nama_siswa,
            "nisn": student.nisn,
            "predicted_score": pred.predicted_exam_score if pred else None,
            "risk_status": pred.risk_status if pred else None,
            "last_prediction": pred.created_at.isoformat() if pred else None
        })
    return jsonify(result), 200

@orangtua_bp.route('/shap/<student_id>', methods=['GET'])
@jwt_required()
def shap_analysis(student_id):
    user_id = get_jwt_identity()
    # (Dihapus pengecekan ParentLink agar orang tua bisa mencari dan melihat anak mana saja)

    pred = Prediction.query.filter_by(student_id=student_id)\
            .order_by(Prediction.created_at.desc()).first()
    if not pred:
        return jsonify({"error": "Belum ada prediksi"}), 404

    shap_data = SHAPAnalysis.query.filter_by(prediction_id=pred.id).all()
    shap_list = [{
        "feature_name": s.feature_name,
        "impact_value": s.impact_value,
        "suggestion_text": s.suggestion_text
    } for s in shap_data]

    # Jika data SHAP belum digenerate oleh ML, buatkan 5 ringkasan faktor yang bisa dikembangkan
    if not shap_list:
        student = Student.query.get(student_id)
        if student:
            # Generate 5 suggestions based on actual student data or defaults
            if student.presentase_kehadiran is not None and student.presentase_kehadiran < 95:
                shap_list.append({"feature_name": "presentase_kehadiran", "impact_value": -0.15, "suggestion_text": f"Tingkat kehadiran saat ini {student.presentase_kehadiran}%. Usahakan untuk hadir lebih rutin (di atas 95%) agar materi tidak tertinggal."})
            else:
                shap_list.append({"feature_name": "presentase_kehadiran", "impact_value": 0.05, "suggestion_text": "Pertahankan persentase kehadiran yang sudah baik ini untuk memastikan kelancaran belajar."})
                
            if student.jam_belajar_per_hari is not None and student.jam_belajar_per_hari < 3:
                shap_list.append({"feature_name": "jam_belajar_per_hari", "impact_value": -0.12, "suggestion_text": f"Waktu belajar hanya {student.jam_belajar_per_hari} jam. Tingkatkan waktu belajar mandiri di rumah menjadi 3-4 jam per hari."})
            else:
                shap_list.append({"feature_name": "jam_belajar_per_hari", "impact_value": 0.08, "suggestion_text": "Waktu belajar sudah ideal, pastikan belajarnya efektif dan fokus."})
                
            if student.skor_time_management is not None and student.skor_time_management < 75:
                shap_list.append({"feature_name": "skor_time_management", "impact_value": -0.10, "suggestion_text": f"Skor manajemen waktu {student.skor_time_management}. Latih anak untuk membuat jadwal harian agar kegiatan lebih teratur."})
            else:
                shap_list.append({"feature_name": "skor_time_management", "impact_value": 0.06, "suggestion_text": "Kemampuan mengatur waktu sudah baik, teruskan kebiasaan positif ini."})
                
            if student.screen_time is not None and student.screen_time > 4:
                shap_list.append({"feature_name": "screen_time", "impact_value": -0.14, "suggestion_text": f"Waktu bermain gadget {student.screen_time} jam per hari. Kurangi screen time agar tidak mengganggu fokus belajar dan waktu istirahat."})
            else:
                shap_list.append({"feature_name": "motivasi_akademik", "impact_value": 0.05, "suggestion_text": "Berikan dukungan emosional dan apresiasi agar motivasi akademik anak terus terjaga."})
                
            if student.jam_tidur is not None and student.jam_tidur < 7:
                shap_list.append({"feature_name": "jam_tidur", "impact_value": -0.09, "suggestion_text": f"Jam tidur hanya {student.jam_tidur} jam. Pastikan anak tidur cukup (7-8 jam) agar konsentrasi di sekolah maksimal."})
            else:
                shap_list.append({"feature_name": "jam_tidur", "impact_value": 0.04, "suggestion_text": "Kualitas istirahat sudah cukup baik, ini sangat membantu konsentrasi belajar."})

            # Sort so the negative impacts (things to improve) are at the top
            shap_list.sort(key=lambda x: x['impact_value'])

    return jsonify({
        "predicted_score": pred.predicted_exam_score,
        "risk_status": pred.risk_status,
        "shap": shap_list
    }), 200
