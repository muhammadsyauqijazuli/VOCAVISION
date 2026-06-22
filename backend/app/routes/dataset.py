from threading import Thread

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Dataset, Student, Prediction, SHAPAnalysis, User
from ..services.ml_service import MLService
from ..utils import role_required
import pandas as pd
import io
from werkzeug.security import generate_password_hash

dataset_bp = Blueprint('dataset', __name__)
STUDENT_COLUMN_NAMES = set(Student.__table__.columns.keys())
DATASET_JOB_PROGRESS = {}
JOB_PHASE_LABELS = {
    'queued': 'Menunggu diproses',
    'validating': 'Memvalidasi file',
    'creating_accounts': 'Membuat akun siswa',
    'predicting': 'Menjalankan prediksi siswa',
    'saving_results': 'Menyimpan hasil ke database',
    'completed': 'Selesai diproses',
    'failed': 'Pemrosesan gagal',
}


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


def upsert_student_user(nisn, nama_siswa, email=None, student_payload=None):
    normalized_nisn = normalize_nisn(nisn)
    if not normalized_nisn:
        raise ValueError('NISN tidak valid')

    student_user_email = email if email else None
    default_password_hash = generate_password_hash(normalized_nisn)

    student = Student.query.filter_by(nisn=normalized_nisn).first()
    user = User.query.get(student.user_id) if student and student.user_id else None

    if not user and student_user_email:
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
        if student_user_email is not None:
            user.email = student_user_email
        user.role = 'siswa'
        user.password_hash = default_password_hash

    if not student:
        student = Student(nisn=normalized_nisn, nama_siswa=nama_siswa, user_id=user.id)
        # Apply student data columns BEFORE flush so NOT NULL constraints are satisfied
        if student_payload:
            for col, val in student_payload.items():
                setattr(student, col, val)
        db.session.add(student)
        db.session.flush()
    else:
        student.nama_siswa = nama_siswa
        student.user_id = user.id
        # Update existing student with new data
        if student_payload:
            for col, val in student_payload.items():
                setattr(student, col, val)

    return student, user, created_user


def ensure_student_user_link(student):
    if student.user_id:
        return False

    normalized_nisn = normalize_nisn(student.nisn)
    if not normalized_nisn:
        return False

    fallback_name = student.nama_siswa or f"Siswa {normalized_nisn}"
    default_password_hash = generate_password_hash(normalized_nisn)

    user = User(
        nama=fallback_name,
        email=None,
        password_hash=default_password_hash,
        role='siswa',
    )
    db.session.add(user)
    db.session.flush()
    created_user = True

    student.user_id = user.id
    return created_user


def set_job_progress(dataset_id, *, phase=None, current=0, total=0, message=None, status=None):
    progress = DATASET_JOB_PROGRESS.setdefault(dataset_id, {})
    if phase is not None:
        progress['phase'] = phase
        progress['phase_label'] = JOB_PHASE_LABELS.get(phase, phase)
    if current is not None:
        progress['current'] = current
    if total is not None:
        progress['total'] = total
    if message is not None:
        progress['message'] = message
    if status is not None:
        progress['status'] = status
    DATASET_JOB_PROGRESS[dataset_id] = progress
    return progress


def _process_dataset_job(app, dataset_id, rows):
    with app.app_context():
        ml = MLService()
        success = 0
        created_accounts = 0
        errors = []
        total_rows = len(rows)

        try:
            set_job_progress(
                dataset_id,
                phase='creating_accounts',
                current=0,
                total=total_rows,
                message='Menyiapkan pembuatan akun siswa',
                status='processing',
            )
            for idx, row in enumerate(rows):
                try:
                    set_job_progress(
                        dataset_id,
                        phase='validating',
                        current=idx,
                        total=total_rows,
                        message=f'Memvalidasi baris {idx + 1} dari {total_rows}',
                        status='processing',
                    )
                    raw_data = {key: clean_value(value) for key, value in row.items()}

                    nisn = raw_data.get('nisn')
                    nama = str(raw_data.get('nama_siswa') or raw_data.get('nama') or '').strip()
                    email = clean_value(raw_data.get('email'))

                    if not nisn or not nama:
                        raise ValueError('Kolom nisn dan nama_siswa wajib diisi')

                    student_payload = {
                        key: value
                        for key, value in raw_data.items()
                        if key in STUDENT_COLUMN_NAMES and key not in {'id', 'user_id', 'nisn', 'nama_siswa', 'created_at', 'updated_at', 'email'}
                    }

                    student, user, created_user = upsert_student_user(nisn, nama, email, student_payload=student_payload)
                    created_accounts += 1 if created_user else 0

                    set_job_progress(
                        dataset_id,
                        phase='predicting',
                        current=idx,
                        total=total_rows,
                        message=f'Menjalankan prediksi untuk baris {idx + 1} dari {total_rows}',
                        status='processing',
                    )

                    db.session.commit()

                    result = ml.predict(student_payload)
                    pred = Prediction(
                        student_id=student.id,
                        predicted_exam_score=result['predicted_exam_score'],
                        risk_status=result['risk_status'],
                        model_version=result.get('model_version', '2.0.0')
                    )
                    db.session.add(pred)
                    db.session.flush()

                    set_job_progress(
                        dataset_id,
                        phase='saving_results',
                        current=idx + 1,
                        total=total_rows,
                        message=f'Sedang menyimpan hasil baris {idx + 1} dari {total_rows}',
                        status='processing',
                    )

                    for shap_item in result['shap_analysis']:
                        db.session.add(SHAPAnalysis(
                            prediction_id=pred.id,
                            feature_name=shap_item['feature_name'],
                            impact_value=shap_item['impact_value'],
                            suggestion_text=shap_item['suggestion_text']
                        ))

                    db.session.commit()
                    success += 1

                    dataset_entry = Dataset.query.get(dataset_id)
                    if dataset_entry:
                        dataset_entry.row_count = success
                        db.session.commit()
                except Exception as row_error:
                    import traceback
                    traceback.print_exc()
                    print(f"Row {idx} failed with error: {row_error}")
                    db.session.rollback()
                    errors.append({'row': idx, 'error': str(row_error)})

            dataset_entry = Dataset.query.get(dataset_id)
            if dataset_entry:
                dataset_entry.row_count = success
                dataset_entry.status = 'completed'
                db.session.commit()
            set_job_progress(
                dataset_id,
                phase='completed',
                current=success,
                total=total_rows,
                message=f'Selesai memproses {success} dari {total_rows} baris',
                status='completed',
            )
        except Exception as job_error:
            db.session.rollback()
            dataset_entry = Dataset.query.get(dataset_id)
            if dataset_entry:
                dataset_entry.status = 'failed'
                db.session.commit()
            set_job_progress(
                dataset_id,
                phase='failed',
                current=success,
                total=total_rows,
                message=str(job_error),
                status='failed',
            )
            current_app.logger.exception('Dataset job failed: %s', job_error)
        finally:
            db.session.remove()

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

        rows = df.to_dict(orient='records')
        dataset_entry.row_count = 0
        db.session.commit()

        set_job_progress(
            dataset_id=dataset_entry.id,
            phase='queued',
            current=0,
            total=len(rows),
            message='Dataset diterima oleh server',
            status='processing',
        )

        app = current_app._get_current_object()
        worker = Thread(target=_process_dataset_job, args=(app, dataset_entry.id, rows), daemon=True)
        worker.start()

        return jsonify({
            'message': 'Dataset diterima. Proses pembuatan akun dan prediksi sedang berjalan.',
            'dataset_id': dataset_entry.id,
            'total_rows': len(rows),
            'status': 'processing',
        }), 202
    except Exception as e:
        dataset_entry.status = 'failed'
        db.session.commit()
        return jsonify({'message': f'Gagal: {str(e)}'}), 500


@dataset_bp.route('/<dataset_id>', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_dataset_status(dataset_id):
    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({'message': 'Dataset tidak ditemukan'}), 404

    progress = DATASET_JOB_PROGRESS.get(dataset_id, {})

    return jsonify({
        'id': dataset.id,
        'file_name': dataset.file_name,
        'row_count': dataset.row_count or 0,
        'status': dataset.status,
        'phase': progress.get('phase', dataset.status),
        'phase_label': progress.get('phase_label', JOB_PHASE_LABELS.get(dataset.status, dataset.status)),
        'current': progress.get('current', dataset.row_count or 0),
        'total': progress.get('total', dataset.row_count or 0),
        'message': progress.get('message'),
        'uploaded_at': dataset.uploaded_at.isoformat() if dataset.uploaded_at else None,
    }), 200