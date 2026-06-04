from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, Student, Intervention
from .. import db

interventions_bp = Blueprint('interventions', __name__)

@interventions_bp.route('/my-notes', methods=['GET'])
@jwt_required()
def get_my_notes():
    """Siswa reads their own intervention notes."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'siswa':
        return jsonify({'message': 'Hanya siswa yang dapat mengakses catatan ini'}), 403

    student = Student.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify([]), 200

    interventions = (
        Intervention.query
        .filter_by(student_id=student.id)
        .order_by(Intervention.action_date.desc())
        .all()
    )
    return jsonify([{
        'id': i.id,
        'guru': User.query.get(i.guru_id).nama if User.query.get(i.guru_id) else 'Guru',
        'note': i.note,
        'date': i.action_date.isoformat()
    } for i in interventions]), 200

@interventions_bp.route('/<student_id>', methods=['POST'])
@jwt_required()
def add_intervention(student_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'guru':
        return jsonify({'message': 'Hanya guru yang dapat menambahkan intervensi'}), 403

    data = request.get_json()
    note = data.get('note')
    if not note:
        return jsonify({'message': 'Catatan diperlukan'}), 400

    intervention = Intervention(
        student_id=student_id,
        guru_id=user_id,
        note=note
    )
    db.session.add(intervention)
    db.session.commit()
    return jsonify({'message': 'Intervensi disimpan'}), 201

@interventions_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_interventions(student_id):
    interventions = Intervention.query.filter_by(student_id=student_id).order_by(Intervention.action_date.desc()).all()
    return jsonify([{
        'id': i.id,
        'guru': User.query.get(i.guru_id).nama,
        'note': i.note,
        'date': i.action_date.isoformat()
    } for i in interventions]), 200