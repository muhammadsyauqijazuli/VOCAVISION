from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inisialisasi ekstensi
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

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

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(predictions_bp, url_prefix='/api/predict')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(interventions_bp, url_prefix='/api/interventions')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(dataset_bp, url_prefix='/api/dataset')

    return app