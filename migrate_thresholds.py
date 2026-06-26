import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models import Prediction

def update_predictions():
    app = create_app()
    with app.app_context():
        predictions = Prediction.query.all()
        updated_count = 0
        
        for pred in predictions:
            score = pred.predicted_exam_score
            if score is None:
                continue
                
            # New thresholds
            if score <= 82.57:
                new_status = 'Beresiko'
            elif score <= 85.75:
                new_status = 'Aman'
            else:
                new_status = 'Sangat Aman'
                
            if pred.risk_status != new_status:
                pred.risk_status = new_status
                updated_count += 1
                
        db.session.commit()
        print(f"Successfully updated {updated_count} predictions with new risk status thresholds.")

if __name__ == '__main__':
    update_predictions()
