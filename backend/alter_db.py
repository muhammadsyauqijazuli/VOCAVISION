from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Alter the ENUM in predictions table to include 'Sangat Aman'
        db.session.execute(text("ALTER TABLE predictions MODIFY risk_status ENUM('Sangat Beresiko', 'Beresiko', 'Aman', 'Sangat Aman') NOT NULL;"))
        db.session.commit()
        print("Successfully updated predictions table!")
    except Exception as e:
        print(f"Failed to update predictions table: {e}")
