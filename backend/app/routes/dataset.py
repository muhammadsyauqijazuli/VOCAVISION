from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Dataset, Student, Prediction, SHAPAnalysis, User
from ..services.ml_service import MLService
from ..utils import role_required
import pandas as pd
import io
from werkzeug.security import generate_password_hash

dataset_bp = Blueprint('dataset', __name__)


def clean_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None
    return value


def normalize_nisn(nisn):
    if nisn is None or pd.isna(nisn):
        return None

    if isinstance(nisn, float) and nisn.is_integer():
        return str(int(nisn))

    raw_nisn = str(nisn).strip()
    if not raw_nisn:
        return None

    if raw_nisn.endswith('.0') and raw_nisn[:-2].isdigit():
        raw_nisn = raw_nisn[:-2]

    digits_only = ''.join(char for char in raw_nisn if char.isdigit())
    return digits_only or raw_nisn.replace(' ', '')


def build_student_email(nisn):
    normalized_nisn = normalize_nisn(nisn)
    return f"{normalized_nisn}@siswa.local"


def upsert_student_user(nisn, nama_siswa):
    normalized_nisn = normalize_nisn(nisn)
    if not normalized_nisn:
        raise ValueError('NISN tidak valid')

    student_user_email = build_student_email(normalized_nisn)
    default_password_hash = generate_password_hash(normalized_nisn)

    student = Student.query.filter_by(nisn=normalized_nisn).first()
    user = User.query.get(student.user_id) if student and student.user_id else None
    if not user:
        user = User.query.filter_by(email=student_user_email).first()

    created_user = False
    if not user:
        user = User(
            nama=nama_siswa,
            email=student_user_email,
            password_hash=default_password_hash,
            role='siswa',
        )
        db.session.add(user)
        db.session.flush()
        created_user = True
    else:
        user.nama = nama_siswa
        user.email = student_user_email
        user.role = 'siswa'
        user.password_hash = default_password_hash

    if not student:
        student = Student(nisn=normalized_nisn, nama_siswa=nama_siswa, user_id=user.id)
        db.session.add(student)
        db.session.flush()
    else:
        student.nama_siswa = nama_siswa
        student.user_id = user.id

    return student, user, created_user


def ensure_student_user_link(student):
    if student.user_id:
        return False

    normalized_nisn = normalize_nisn(student.nisn)
    if not normalized_nisn:
        return False

    fallback_name = student.nama_siswa or f"Siswa {normalized_nisn}"
    student_user_email = build_student_email(normalized_nisn)
    default_password_hash = generate_password_hash(normalized_nisn)

    user = User.query.filter_by(email=student_user_email).first()
    created_user = False
    if not user:
        user = User(
            nama=fallback_name,
            email=student_user_email,
            password_hash=default_password_hash,
            role='siswa',
        )
        db.session.add(user)
        db.session.flush()
        created_user = True
    else:
        user.nama = fallback_name
        user.role = 'siswa'
        user.password_hash = default_password_hash

    student.user_id = user.id
    return created_user

@dataset_bp.route('/upload', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'message': 'Tidak ada file'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'Nama file kosong'}), 400

    user_id = get_jwt_identity()
    # Simpan log
    dataset_entry = Dataset(admin_id=user_id, file_name=file.filename, status='processing')
    db.session.add(dataset_entry)
    db.session.commit()

    try:
        # Baca file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            raise ValueError('Format file tidak didukung')

        # Proses batch
        ml = MLService()
        success = 0
        errors = []
        created_accounts = 0
        for idx, row in df.iterrows():
            try:
                raw_data = {key: clean_value(value) for key, value in row.to_dict().items()}

                nisn = raw_data.get('nisn')
                nama = str(raw_data.get('nama_siswa') or raw_data.get('nama') or '').strip()

                if not nisn or not nama:
                    raise ValueError('Kolom nisn dan nama_siswa wajib diisi')

                student_payload = {
                    key: value
                    for key, value in raw_data.items()
                    if key not in {'nisn', 'nama_siswa', 'nama', 'email'} and hasattr(Student, key)
                }

                # upsert_student_user expects (nisn, nama_siswa)
                student, user, created_user = upsert_student_user(nisn, nama)
                created_accounts += 1 if created_user else 0

                for col, val in student_payload.items():
                    setattr(student, col, val)

                db.session.commit()

                try:
                    result = ml.predict(student_payload)
                    pred = Prediction(
                        student_id=student.id,
                        predicted_exam_score=result['predicted_exam_score'],
                        risk_status=result['risk_status'],
                        model_version=result.get('model_version', '2.0.0')
                    )
                    db.session.add(pred)
                    db.session.flush()
                    for shap in result['shap_analysis']:
                        db.session.add(SHAPAnalysis(
                            prediction_id=pred.id,
                            feature_name=shap['feature_name'],
                            impact_value=shap['impact_value'],
                            suggestion_text=shap['suggestion_text']
                        ))
                    db.session.commit()
                except Exception as prediction_error:
                    db.session.rollback()
                    errors.append({'row': idx, 'error': f'Prediksi gagal: {str(prediction_error)}'})
                    success += 1
                    continue
                success += 1
            except Exception as e:
                db.session.rollback()
                errors.append({'row': idx, 'error': str(e)})

        orphan_students = Student.query.filter(Student.user_id.is_(None)).all()
        for student in orphan_students:
            try:
                ensure_student_user_link(student)
            except Exception as link_error:
                errors.append({'row': student.nisn, 'error': f'Link user gagal: {str(link_error)}'})

        db.session.commit()
        dataset_entry.row_count = success
        dataset_entry.status = 'completed'
        db.session.commit()
        return jsonify({
            'message': f'Diproses: {success} sukses, {len(errors)} error',
            'created_accounts': created_accounts,
            'errors': errors,
            'account_note': 'Akun siswa dibuat/diperbarui dengan password default NISN.',
        }), 201
    except Exception as e:
        dataset_entry.status = 'failed'
        db.session.commit()
        return jsonify({'message': f'Gagal: {str(e)}'}), 500


    @dataset_bp.route('/_debug_file', methods=['GET'])
    def debug_file():
        import inspect, sys
        try:
            src = inspect.getsourcefile(sys.modules[__name__])
        except Exception:
            src = None
        return jsonify({'module': __name__, 'file': src}), 200