from app import create_app, db
from sqlalchemy import text

def main():
    app = create_app()
    with app.app_context():
        try:
            # 1. Expand the ENUM to allow both old and new values so we can update them
            db.session.execute(text("ALTER TABLE predictions MODIFY COLUMN risk_status ENUM('Sangat Beresiko', 'Beresiko', 'Tidak Beresiko', 'Rendah', 'Netral', 'Tinggi')"))
            db.session.commit()
            print("Expanded ENUM.")

            # 2. Update the rows
            db.session.execute(text("UPDATE predictions SET risk_status = 'Rendah' WHERE risk_status = 'Sangat Beresiko'"))
            db.session.execute(text("UPDATE predictions SET risk_status = 'Netral' WHERE risk_status = 'Beresiko'"))
            db.session.execute(text("UPDATE predictions SET risk_status = 'Tinggi' WHERE risk_status = 'Tidak Beresiko'"))
            db.session.commit()
            print("Rows updated.")

            # 3. Restrict the ENUM to only the new values
            db.session.execute(text("ALTER TABLE predictions MODIFY COLUMN risk_status ENUM('Rendah', 'Netral', 'Tinggi')"))
            db.session.commit()
            print("Restricted ENUM.")

            print("Database Migration Complete!")
        except Exception as e:
            db.session.rollback()
            print("Error:", e)

if __name__ == '__main__':
    main()
