from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inisialisasi ekstensi
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}, r"/socket.io/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins="http://localhost:3000")

    # SocketIO events
    @socketio.on('join')
    def on_join(data):
        user_id = data.get('user_id')
        if user_id:
            from .models import Student
            with app.app_context():
                student = Student.query.filter_by(user_id=user_id).first()
                if student:
                    join_room(student.id)
                    print(f"Socket: Client joined room {student.id}")

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.predictions import predictions_bp
    from .routes.students import students_bp
    from .routes.interventions import interventions_bp
    from .routes.dashboard import dashboard_bp
    from .routes.dataset import dataset_bp
    from .routes.export import export_bp
    from .routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(predictions_bp, url_prefix='/api/predict')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(interventions_bp, url_prefix='/api/interventions')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(dataset_bp, url_prefix='/api/dataset')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    return app