#!/usr/bin/env python
from app import create_app
import os

print(f"Current directory: {os.getcwd()}")
print(f".env exists: {os.path.exists('.env')}")

app = create_app()
print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

# Try to connect
try:
    with app.app_context():
        from app import db
        from sqlalchemy import text
        # Try a simple query
        result = db.session.execute(text("SELECT 1"))
        print(f"Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")
    import traceback
    traceback.print_exc()
