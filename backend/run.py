from app import create_app
import logging
import sys

app = create_app()

# Logging configuration — INFO level for app, WARNING for noisy libraries
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)

# Suppress noisy library loggers
for noisy_logger in [
    'sqlalchemy.engine.Engine',
    'sqlalchemy.orm',
    'sqlalchemy.pool',
    'flask_cors',
    'werkzeug',
]:
    logging.getLogger(noisy_logger).setLevel(logging.WARNING)

# Keep app-level loggers at INFO
logging.getLogger('app').setLevel(logging.INFO)

print(f"Flask app database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
logger.info("Flask app initialized successfully")

from app import socketio

if __name__ == '__main__':
    logger.info("Starting Flask-SocketIO development server...")
    socketio.run(app, debug=False, use_reloader=False, port=5000, allow_unsafe_werkzeug=True)