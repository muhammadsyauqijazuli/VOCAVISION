from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Dataset, Student, Prediction, SHAPAnalysis
from ..services.ml_service import MLService
from ..utils import role_required
import pandas as pd
import io

dataset_bp = Blueprint('dataset', __name__)

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

        # Validasi kolom minimal ada 17 variabel (sesuaikan dengan FEATURE_ORDER)
        # Asumsikan kolom: nisn, nama, lalu 17 variabel
        required_cols = ['nisn', 'nama_siswa', 'jam_belajar_per_hari', ...]  # lengkapi
        # Proses batch
        ml = MLService()
        success = 0
        errors = []
        for idx, row in df.iterrows():
            try:
                data = row.to_dict()
                nisn = str(data.pop('nisn'))
                nama = str(data.pop('nama_siswa'))
                student = Student.query.filter_by(nisn=nisn).first()
                if not student:
                    student = Student(nisn=nisn, nama_siswa=nama)
                    db.session.add(student)
                    db.session.flush()
                # Update data
                for col, val in data.items():
                    if hasattr(student, col):
                        setattr(student, col, val)
                db.session.commit()
                # Prediksi
                result = ml.predict(data)
                pred = Prediction(
                    student_id=student.id,
                    predicted_exam_score=result['predicted_exam_score'],
                    risk_status=result['risk_status']
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
                success += 1
            except Exception as e:
                errors.append({'row': idx, 'error': str(e)})
        dataset_entry.row_count = success
        dataset_entry.status = 'completed'
        db.session.commit()
        return jsonify({'message': f'Diproses: {success} sukses, {len(errors)} error', 'errors': errors}), 201
    except Exception as e:
        dataset_entry.status = 'failed'
        db.session.commit()
        return jsonify({'message': f'Gagal: {str(e)}'}), 500