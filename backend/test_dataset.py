from app import create_app, db
from app.routes.dataset import _process_dataset_job
from app.models import Dataset
import pandas as pd

app = create_app()
with app.app_context():
    df = pd.read_csv('backend/ml_model/data_advanced.csv')
    rows = df.to_dict(orient='records')
    d = Dataset(admin_id='admin', file_name='test.csv', status='processing')
    try:
        db.session.add(d)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        d = Dataset.query.first()
    print("Testing processing dataset...")
    _process_dataset_job(app, d.id, rows)
    d = Dataset.query.get(d.id)
    print("Completed rows:", d.row_count)
