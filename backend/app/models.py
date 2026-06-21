from . import db
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'guru', 'siswa'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    nisn = db.Column(db.String(20), unique=True, nullable=False)
    nama_siswa = db.Column(db.String(100), nullable=False)

    # Numerik
    jam_belajar_per_hari = db.Column(db.Float, nullable=True)
    presentase_kehadiran = db.Column(db.Float, nullable=True)
    nilai_rata_rata_raport = db.Column(db.Float, nullable=True)
    skor_time_management = db.Column(db.Integer, nullable=True)
    jam_tidur = db.Column(db.Float, nullable=True)
    screen_time = db.Column(db.Float, nullable=True)
    kehadiran_pelatihan_industry = db.Column(db.Float, nullable=True)
    motivasi_akademik = db.Column(db.Integer, nullable=True)
    exam_score = db.Column(db.Float, nullable=True)

    # Kategorikal
    gender = db.Column(db.Enum('Laki-laki', 'Perempuan'), nullable=True)
    rata_rata_pemasukan_keluarga = db.Column(db.Enum('< 2 Juta', '2 - 5 Juta', '5 - 10 Juta', '> 10 Juta'), nullable=True)
    pendidikan_terakhir_orang_tua = db.Column(db.Enum('SD', 'SMP', 'SMA/SMK', 'Diploma', 'Sarjana'), nullable=True)
    kerja_sampingan = db.Column(db.Enum('Ya', 'Tidak'), nullable=True)
    study_environment = db.Column(db.Enum('Kondusif', 'Cukup Kondusif', 'Kurang Kondusif'), nullable=True)
    kompetensi_skill_level = db.Column(db.Enum('Rendah', 'Menengah', 'Tinggi'), nullable=True)
    industry_readiness = db.Column(db.Enum('Siap', 'Belum Siap'), nullable=True)
    stress_level = db.Column(db.Enum('Rendah', 'Sedang', 'Berat'), nullable=True)
    jurusan = db.Column(db.Enum('TKJ', 'TAV', 'TPTU', 'MULTIMEDIA'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    student_id = db.Column(db.String(36), db.ForeignKey('students.id'), nullable=False)
    predicted_exam_score = db.Column(db.Float, nullable=False)
    risk_status = db.Column(db.Enum('Sangat Beresiko', 'Beresiko', 'Aman'), nullable=False)
    model_version = db.Column(db.String(20), default='1.0.0')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SHAPAnalysis(db.Model):
    __tablename__ = 'shap_analysis'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    prediction_id = db.Column(db.String(36), db.ForeignKey('predictions.id'), nullable=False)
    feature_name = db.Column(db.String(50), nullable=False)
    impact_value = db.Column(db.Float, nullable=False)
    suggestion_text = db.Column(db.Text, nullable=True)

class Intervention(db.Model):
    __tablename__ = 'interventions'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    student_id = db.Column(db.String(36), db.ForeignKey('students.id'), nullable=False)
    guru_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    note = db.Column(db.Text, nullable=False)
    action_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Dataset(db.Model):
    __tablename__ = 'datasets'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    admin_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    row_count = db.Column(db.Integer, nullable=True)
    status = db.Column(db.Enum('pending', 'processing', 'completed', 'failed'), default='pending')
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    student_id = db.Column(db.String(36), db.ForeignKey('students.id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    type = db.Column(db.String(50), default='intervention')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)