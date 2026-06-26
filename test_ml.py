import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.ml_service import MLService

def test():
    try:
        print("Initializing MLService...")
        ml = MLService()
        
        test_payload = {
            'jam_belajar_per_hari': 4,
            'screen_time': 2,
            'jam_tidur': 8,
            'presentase_kehadiran': 95,
            'skor_time_management': 80,
            'motivasi_akademik': 85,
            'ses_index': 5,
            'deviasi_tidur': 1,
            'study_environment': 'Kondusif',
            'kompetensi_skill_level': 'Tinggi',
            'stress_level': 'Rendah',
            'kerja_sampingan': 'Tidak',
            'industry_readiness': 'Siap',
            'jurusan': 'TKJ'
        }
        
        print("Running prediction...")
        result = ml.predict(test_payload)
        print("Prediction result:", result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test()
