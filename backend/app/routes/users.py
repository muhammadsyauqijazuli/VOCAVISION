from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from ..models import User
from .. import db
from ..utils import role_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_users():
    # Fitur filter & pencarian
    role_filter = request.args.get('role')
    search = request.args.get('search')
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    if search:
        query = query.filter(User.nama.ilike(f'%{search}%') | User.email.ilike(f'%{search}%'))
    users = query.all()
    return jsonify([{
        'id': u.id,
        'nama': u.nama,
        'email': u.email,
        'role': u.role
    } for u in users]), 200

@users_bp.route('/', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_user():
    data = request.get_json()
    if not data or not all(k in data for k in ('nama', 'email', 'password', 'role')):
        return jsonify({'message': 'Data tidak lengkap'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email sudah digunakan'}), 409

    user = User(
        nama=data['nama'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({
        'id': user.id,
        'nama': user.nama,
        'email': user.email,
        'role': user.role
    }), 201

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User tidak ditemukan'}), 404
    data = request.get_json()
    if 'nama' in data:
        user.nama = data['nama']
    if 'email' in data:
        # Cek duplikasi
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({'message': 'Email sudah digunakan'}), 409
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    if 'password' in data:
        user.password_hash = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'message': 'User diperbarui'}), 200

@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User tidak ditemukan'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User dihapus'}), 200