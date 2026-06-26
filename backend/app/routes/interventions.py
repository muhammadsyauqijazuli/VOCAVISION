from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, Student, Intervention, Notification
from .. import db, socketio

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
        'guru_id': i.guru_id,
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

    student = Student.query.get(student_id)
    if not student:
        student = Student.query.filter_by(user_id=student_id).first()
    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    data = request.get_json()
    note = data.get('note')
    if not note:
        return jsonify({'message': 'Catatan diperlukan'}), 400

    intervention = Intervention(
        student_id=student.id,
        guru_id=user_id,
        note=note
    )
    db.session.add(intervention)
    
    # Send Notification
    notif = Notification(
        student_id=student.id,
        sender_id=user_id,
        message=f"Guru {user.nama} menambahkan catatan untuk Anda.",
        type='intervention'
    )
    db.session.add(notif)
    db.session.commit()

    created_at_iso = notif.created_at.isoformat() if notif.created_at else ''

    socketio.emit('notification', {
        'id': notif.id,
        'message': notif.message,
        'type': notif.type,
        'created_at': created_at_iso
    }, room=student.id)

    return jsonify({'message': 'Intervensi disimpan'}), 201

@interventions_bp.route('/edit/<intervention_id>', methods=['PUT'])
@jwt_required()
def edit_intervention(intervention_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'guru':
        return jsonify({'message': 'Hanya guru yang dapat mengedit intervensi'}), 403

    intervention = Intervention.query.get(intervention_id)
    if not intervention:
        return jsonify({'message': 'Catatan tidak ditemukan'}), 404

    if intervention.guru_id != user_id:
        return jsonify({'message': 'Anda hanya dapat mengedit catatan Anda sendiri'}), 403

    data = request.get_json()
    note = data.get('note')
    if not note:
        return jsonify({'message': 'Catatan diperlukan'}), 400

    intervention.note = note
    db.session.commit()
    return jsonify({'message': 'Catatan berhasil diperbarui'}), 200

@interventions_bp.route('/delete/<intervention_id>', methods=['DELETE'])
@jwt_required()
def delete_intervention(intervention_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role != 'guru':
        return jsonify({'message': 'Hanya guru yang dapat menghapus intervensi'}), 403

    intervention = Intervention.query.get(intervention_id)
    if not intervention:
        return jsonify({'message': 'Catatan tidak ditemukan'}), 404

    if intervention.guru_id != user_id:
        return jsonify({'message': 'Anda hanya dapat menghapus catatan Anda sendiri'}), 403

    db.session.delete(intervention)
    db.session.commit()
    return jsonify({'message': 'Catatan berhasil dihapus'}), 200

@interventions_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_interventions(student_id):
    student = Student.query.get(student_id)
    if not student:
        student = Student.query.filter_by(user_id=student_id).first()
    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    interventions = Intervention.query.filter_by(student_id=student.id).order_by(Intervention.action_date.desc()).all()
    return jsonify([{
        'id': i.id,
        'guru': User.query.get(i.guru_id).nama if User.query.get(i.guru_id) else 'Guru',
        'guru_id': i.guru_id,
        'note': i.note,
        'date': i.action_date.isoformat() if i.action_date else ''
    } for i in interventions]), 200