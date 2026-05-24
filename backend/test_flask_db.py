#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

from app import create_app, db
from app.models import User

app = create_app()

with app.app_context():
    try:
        # Try to query the database
        user_count = db.session.query(User).count()
        print(f"SUCCESS: Found {user_count} users in database")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
