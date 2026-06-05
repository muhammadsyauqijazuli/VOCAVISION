from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Notification, Student
from .. import db

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first()
    
    if not student:
        return jsonify([]), 200

    notifs = Notification.query.filter_by(student_id=student.id).order_by(Notification.created_at.desc()).limit(20).all()
    
    return jsonify([{
        'id': n.id,
        'message': n.message,
        'is_read': n.is_read,
        'type': n.type,
        'created_at': n.created_at.isoformat()
    } for n in notifs]), 200

@notifications_bp.route('/read/<notif_id>', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first()
    
    if not student:
        return jsonify({'message': 'Siswa tidak ditemukan'}), 404

    notif = Notification.query.filter_by(id=notif_id, student_id=student.id).first()
    if notif:
        notif.is_read = True
        db.session.commit()
        return jsonify({'message': 'Notifikasi ditandai dibaca'}), 200
        
    return jsonify({'message': 'Notifikasi tidak ditemukan'}), 404
