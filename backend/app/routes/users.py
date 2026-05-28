from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from ..models import User, Student
from .. import db
from ..utils import role_required

users_bp = Blueprint('users', __name__)


def normalize_nisn(nisn):
    if nisn is None:
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
    if not normalized_nisn:
        return None
    return f'{normalized_nisn}@siswa.local'


def sync_student_account(student):
    normalized_nisn = normalize_nisn(student.nisn)
    if not normalized_nisn:
        raise ValueError('NISN tidak valid')

    email = build_student_email(normalized_nisn)
    password_hash = generate_password_hash(normalized_nisn)
    student_name = student.nama_siswa or f'Siswa {normalized_nisn}'

    user = User.query.get(student.user_id) if student.user_id else None
    if not user:
        user = User.query.filter_by(email=email).first()

    created_user = False
    if not user:
        user = User(
            nama=student_name,
            email=email,
            password_hash=password_hash,
            role='siswa',
        )
        db.session.add(user)
        db.session.flush()
        created_user = True
    else:
        user.nama = student_name
        user.email = email
        user.password_hash = password_hash
        user.role = 'siswa'

    student.user_id = user.id
    student.nama_siswa = student_name
    return created_user


def get_student_sync_summary():
    students = Student.query.all()
    linked_students = 0
    orphan_students = 0

    for student in students:
        user_exists = bool(student.user_id and User.query.get(student.user_id))
        if user_exists:
            linked_students += 1
        else:
            orphan_students += 1

    return {
        'total_students': len(students),
        'linked_students': linked_students,
        'orphan_students': orphan_students,
    }

@users_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_users():
    action = request.args.get('action')
    if action == 'student-sync-summary':
        return jsonify(get_student_sync_summary()), 200

    # Fitur filter, pencarian, dan pagination
    role_filter = request.args.get('role')
    search = request.args.get('search')
    # pagination params
    try:
        page = int(request.args.get('page') or 1)
    except Exception:
        page = 1
    try:
        page_size = int(request.args.get('page_size') or request.args.get('limit') or 25)
    except Exception:
        page_size = 25

    # sanitize page_size: treat negatives as default and cap to a reasonable maximum
    if page_size < 0:
        page_size = 25
    page_size = min(page_size, 1000)

    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    if search:
        query = query.filter(User.nama.ilike(f'%{search}%') | User.email.ilike(f'%{search}%'))

    # Ensure deterministic ordering for pagination (newest users first)
    query = query.order_by(User.created_at.desc())

    total = query.count()

    # If page_size <= 0 treat as 'all'
    if page_size and page_size > 0:
        offset = (max(page, 1) - 1) * page_size
        users_q = query.offset(offset).limit(page_size).all()
    else:
        users_q = query.all()

    return jsonify({
        'items': [{
            'id': u.id,
            'nama': u.nama,
            'email': u.email,
            'role': u.role
        } for u in users_q],
        'total': total,
        'page': page,
        'page_size': page_size,
    }), 200

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


@users_bp.route('/sync/student-summary', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def student_sync_summary():
    return jsonify(get_student_sync_summary()), 200


@users_bp.route('/sync/students', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def sync_students():
    students = Student.query.all()
    created_users = 0
    linked_students = 0
    skipped_students = 0
    errors = []

    for student in students:
        try:
            user_exists = bool(student.user_id and User.query.get(student.user_id))
            if user_exists:
                linked_students += 1
                continue

            created_users += 1 if sync_student_account(student) else 0
            linked_students += 1
        except Exception as error:
            skipped_students += 1
            errors.append({
                'student_id': student.id,
                'nisn': student.nisn,
                'error': str(error),
            })

    db.session.commit()

    return jsonify({
        'message': 'Sinkronisasi akun siswa selesai',
        'total_students': len(students),
        'linked_students': linked_students,
        'created_users': created_users,
        'skipped_students': skipped_students,
        'errors': errors,
        'login_note': 'Email akun siswa: NISN@siswa.local, password default: NISN.',
    }), 200

