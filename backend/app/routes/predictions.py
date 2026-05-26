import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Student, Prediction, SHAPAnalysis, User
from ..services.ml_service import MLService
from .. import db

predictions_bp = Blueprint('predictions', __name__)
ml_service = MLService()

# app/routes/predictions.py (perbaikan)
@predictions_bp.route('/single', methods=['POST'])
@jwt_required()
def predict_single():
    data = request.get_json(silent=True) or {}
    student_id = data.pop('student_id', None)
    user_id = data.pop('user_id', None)
    nisn = data.pop('nisn', None)
    nama = data.pop('nama_siswa', 'Tanpa Nama')

    student = None
    if student_id:
        student = Student.query.get(student_id)
    elif user_id:
        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            student = Student(
                user_id=user_id,
                nisn=nisn or f'AUTO{str(uuid.uuid4())[:8]}',
                nama_siswa=nama,
            )
            db.session.add(student)
            db.session.flush()
    else:
        if not nisn:
            nisn = f'AUTO{str(uuid.uuid4())[:8]}'
        student = Student.query.filter_by(nisn=nisn).first()
        if not student:
            student = Student(nisn=nisn, nama_siswa=nama)
            db.session.add(student)
            db.session.flush()

    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    # Update data siswa dari payload
    for key, value in data.items():
        if hasattr(student, key):
            setattr(student, key, value)
    if user_id and not student.user_id:
        student.user_id = user_id
    db.session.commit()

    # Prediksi
    result = ml_service.predict(data)

    # Simpan prediksi & SHAP
    pred = Prediction(
        student_id=student.id,
        predicted_exam_score=result['predicted_exam_score'],
        risk_status=result['risk_status'],
        model_version=result.get('model_version', '2.0.0')
    )
    db.session.add(pred)
    db.session.flush()

    for shap_item in result['shap_analysis']:
        db.session.add(SHAPAnalysis(
            prediction_id=pred.id,
            feature_name=shap_item['feature_name'],
            impact_value=shap_item['impact_value'],
            suggestion_text=shap_item['suggestion_text']
        ))
    db.session.commit()

    return jsonify({
        'student_id': student.id,
        'predicted_exam_score': result['predicted_exam_score'],
        'risk_status': result['risk_status'],
        'shap_analysis': result['shap_analysis']
    }), 201


@predictions_bp.route('/insight/<student_id>', methods=['GET'])
@jwt_required()
def get_insight(student_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = Student.query.get(student_id)

    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    if user and user.role == 'siswa' and student.user_id != user_id:
        return jsonify({'message': 'Akses ditolak'}), 403

    prediction = Prediction.query.filter_by(student_id=student_id).order_by(Prediction.created_at.desc()).first()
    if not prediction:
        return jsonify({'message': 'Prediksi tidak ditemukan'}), 404

    shap_rows = SHAPAnalysis.query.filter_by(prediction_id=prediction.id).all()
    return jsonify({
        'student_id': student.id,
        'student_name': student.nama_siswa,
        'predicted_exam_score': prediction.predicted_exam_score,
        'risk_status': prediction.risk_status,
        'shap_analysis': [
            {
                'feature_name': row.feature_name,
                'impact_value': row.impact_value,
                'suggestion_text': row.suggestion_text,
            }
            for row in shap_rows
        ]
    }), 200