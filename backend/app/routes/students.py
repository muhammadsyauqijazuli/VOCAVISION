from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Student, Prediction, SHAPAnalysis, User
from .. import db
from ..utils import role_required


students_bp = Blueprint('students', __name__)

# app/routes/students.py
@students_bp.route('', methods=['GET'])
@students_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['admin', 'guru'])
def get_students():
    search = request.args.get('search')
    risk_filter = request.args.get('risk_status')

    query = Student.query
    if search:
        query = query.filter(
            Student.nama_siswa.ilike(f'%{search}%') | Student.nisn.ilike(f'%{search}%')
        )

    students = query.all()
    result = []
    for s in students:
        pred = Prediction.query.filter_by(student_id=s.id).order_by(Prediction.created_at.desc()).first()
        if risk_filter and pred and pred.risk_status != risk_filter:
            continue
        result.append({
            'id': s.id,
            'nama': s.nama_siswa,
            'nisn': s.nisn,
            'predicted_score': pred.predicted_exam_score if pred else None,
            'risk_status': pred.risk_status if pred else None
        })
    return jsonify(result), 200


@students_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_student_detail(student_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = Student.query.get(student_id)

    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    if user and user.role == 'siswa' and student.user_id != user_id:
        return jsonify({'message': 'Akses ditolak'}), 403

    pred = Prediction.query.filter_by(student_id=student.id).order_by(Prediction.created_at.desc()).first()
    return jsonify({
        'id': student.id,
        'user_id': student.user_id,
        'nama': student.nama_siswa,
        'nisn': student.nisn,
        'jam_belajar_per_hari': student.jam_belajar_per_hari,
        'presentase_kehadiran': student.presentase_kehadiran,
        'nilai_rata_rata_raport': student.nilai_rata_rata_raport,
        'skor_time_management': student.skor_time_management,
        'jam_tidur': student.jam_tidur,
        'screen_time': student.screen_time,
        'kehadiran_pelatihan_industry': student.kehadiran_pelatihan_industry,
        'motivasi_akademik': student.motivasi_akademik,
        'exam_score': student.exam_score,
        'gender': student.gender,
        'rata_rata_pemasukan_keluarga': student.rata_rata_pemasukan_keluarga,
        'pendidikan_terakhir_orang_tua': student.pendidikan_terakhir_orang_tua,
        'kerja_sampingan': student.kerja_sampingan,
        'study_environment': student.study_environment,
        'kompetensi_skill_level': student.kompetensi_skill_level,
        'industry_readiness': student.industry_readiness,
        'stress_level': student.stress_level,
        'latest_prediction': {
            'predicted_exam_score': pred.predicted_exam_score,
            'risk_status': pred.risk_status,
            'created_at': pred.created_at.isoformat() if pred.created_at else None,
        } if pred else None
    }), 200