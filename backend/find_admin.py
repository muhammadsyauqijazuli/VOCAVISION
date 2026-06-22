import os
import sys

# Add backend directory to sys.path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    admin = User.query.filter_by(role='admin').first()
    if admin:
        print(f"Admin email: {admin.email}")
        admin.password_hash = "$2b$12$D2M6qT5O0vD0h4O10p0y7O.m1o1wO6z0l1m2h8n1e10X2b1k11g1W" # not important to reset, wait let's just create an admin user or set password.
