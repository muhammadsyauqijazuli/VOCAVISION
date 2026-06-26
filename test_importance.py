import sys
import os
import joblib
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.services.ml_service import MLService

def test_importances():
    ml = MLService()
    clf = ml.classifier
    if hasattr(clf, 'feature_importances_'):
        importances = clf.feature_importances_
        # We need the feature names. 
        # ML pipeline: one_hot encodes categorical, then passes to model along with numeric.
        # But wait, in our script we just load pre_info.
        pre_info = ml.preprocessing_info
        print("Numeric:", pre_info.get('numeric_cols'))
        print("Features used by model in order:", pre_info.get('selected_features'))
        
        # Zip them
        if pre_info.get('selected_features'):
            features = pre_info['selected_features']
            if len(features) == len(importances):
                res = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)
                for f, imp in res:
                    print(f"{f}: {imp:.4f}")
            else:
                print(f"Len mismatch: {len(features)} vs {len(importances)}")

if __name__ == '__main__':
    test_importances()
