from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from ..models import User
from .. import db
import logging
import traceback

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"Login attempt for email: {email}")

        # Demo accounts
        demo = {
            'admin@test.com': ('admin', 'admin'),
            'guru@test.com': ('guru', 'guru'),
            'siswa@test.com': ('siswa', 'siswa')
        }
        if email in demo and password == demo[email][1]:
            role = demo[email][0]
            logger.info(f"Demo account detected for {email}, role: {role}")
            
            # Buat user jika belum ada (untuk demo)
            try:
                logger.info(f"Querying database for user: {email}")
                user = User.query.filter_by(email=email).first()
                logger.info(f"Query result: {user}")
            except Exception as e:
                logger.error(f"Database error during query: {str(e)}", exc_info=True)
                raise
                
            if not user:
                logger.info(f"User {email} not found, creating demo user")
                user = User(
                    email=email,
                    nama=email.split('@')[0].capitalize(),
                    password_hash=generate_password_hash(password),
                    role=role
                )
                db.session.add(user)
                db.session.commit()
                logger.info(f"Demo user created with ID: {user.id}")
                
            access_token = create_access_token(identity=user.id, additional_claims={'role': role})
            logger.info(f"Login successful for {email}, token created")
            return jsonify(access_token=access_token, role=role), 200

        # Non-demo login
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'message': 'Email atau password salah'}), 401

        access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
        return jsonify(access_token=access_token, role=user.role), 200
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        'id': user.id,
        'nama': user.nama,
        'email': user.email,
        'role': user.role
    }), 200