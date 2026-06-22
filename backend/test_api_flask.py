import os
import sys
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    admin = User.query.filter_by(role='admin').first()
    print(f"Admin email: {admin.email}")
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity=admin.id)

with app.test_client() as client:
    res = client.get('/api/students?page_size=2', headers={'Authorization': f'Bearer {token}'})
    print("Status:", res.status_code)
    print(json.dumps(res.json, indent=2))
