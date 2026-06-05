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

    # Sorting and pagination params
    sort_by = request.args.get('sort_by')  # nama, nisn, predicted_score, risk_status
    sort_dir = request.args.get('sort_dir', 'asc')  # asc or desc
    try:
        page = int(request.args.get('page') or 1)
    except Exception:
        page = 1
    try:
        page_size = int(request.args.get('page_size') or 30)
    except Exception:
        page_size = 30

    # Build base query with optional search
    query = Student.query
    if search:
        query = query.filter(
            Student.nama_siswa.ilike(f'%{search}%') | Student.nisn.ilike(f'%{search}%')
        )

    # Get total count for pagination before applying limits
    try:
        total = query.count()
    except Exception:
        # fallback if count fails
        total = None

    # Apply sorting at DB level for supported fields
    if sort_by == 'nama':
        query = query.order_by(Student.nama_siswa.asc() if sort_dir.lower() == 'asc' else Student.nama_siswa.desc())
    elif sort_by == 'nisn':
        # nisn stored as string; sort lexicographically
        query = query.order_by(Student.nisn.asc() if sort_dir.lower() == 'asc' else Student.nisn.desc())

    # DB-level pagination to avoid loading all students into memory
    start = (page - 1) * page_size
    students = query.offset(start).limit(page_size).all()

    # Fetch latest predictions for the students on this page in a single query (avoid N+1)
    student_ids = [s.id for s in students]
    latest_preds = {}
    if student_ids:
        preds_q = Prediction.query.filter(Prediction.student_id.in_(student_ids)).order_by(Prediction.student_id, Prediction.created_at.desc()).all()
        for p in preds_q:
            if p.student_id not in latest_preds:
                latest_preds[p.student_id] = p

    # Build result (keep payload small for list view)
    result = []
    for s in students:
        pred = latest_preds.get(s.id)
        if risk_filter and pred and pred.risk_status != risk_filter:
            continue
        result.append({
            'id': s.id,
            'nama': s.nama_siswa,
            'nisn': s.nisn,
            'exam_score': s.exam_score,
            'predicted_score': pred.predicted_exam_score if pred else None,
            'risk_status': pred.risk_status if pred else None,
            'latest_prediction': {
                'predicted_exam_score': pred.predicted_exam_score if pred else None,
                'risk_status': pred.risk_status if pred else None,
                'created_at': pred.created_at.isoformat() if pred and pred.created_at else None,
            } if pred else None,
        })

    # Sorting
    if sort_by:
        reverse = sort_dir.lower() == 'desc'
        if sort_by == 'nama':
            result.sort(key=lambda x: (x.get('nama') or '').lower(), reverse=reverse)
        elif sort_by == 'nisn':
            def nisn_key(x):
                v = x.get('nisn') or ''
                digits = ''.join(c for c in v if c.isdigit())
                try:
                    return int(digits) if digits else v
                except Exception:
                    return v
            result.sort(key=nisn_key, reverse=reverse)
        elif sort_by == 'predicted_score':
            def score_key(x):
                v = x.get('predicted_score')
                return (v is None, v if v is not None else 0)
            result.sort(key=score_key, reverse=reverse)
        elif sort_by == 'risk_status':
            order = {'Rendah': 2, 'Netral': 1, 'Tinggi': 0, None: -1}
            result.sort(key=lambda x: order.get(x.get('risk_status')), reverse=reverse)

    total = len(result)
    # Pagination
    if page_size > 0:
        start = (page - 1) * page_size
        end = start + page_size
        paged = result[start:end]
    else:
        paged = result

    return jsonify({
        'items': paged,
        'total': total,
        'page': page,
        'page_size': page_size,
    }), 200


@students_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_student_detail(student_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    # Try primary key first, then fallback to user_id lookup
    student = Student.query.get(student_id)
    if not student:
        student = Student.query.filter_by(user_id=student_id).first()

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