from app import create_app
import logging
import sys

app = create_app()

# Enable detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)

print(f"Flask app database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
logger.info("Flask app initialized successfully")

# Enable propagate for all loggers
logging.getLogger().setLevel(logging.DEBUG)
for logger_name in logging.root.manager.loggerDict:
    logging.getLogger(logger_name).setLevel(logging.DEBUG)
    logging.getLogger(logger_name).propagate = True

if __name__ == '__main__':
    logger.info("Starting Flask development server...")
    app.run(debug=False, use_reloader=False, port=5000)