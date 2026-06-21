import sys
sys.path.insert(0, '.')
from app.services.ml_service import MLService

ml = MLService()
result = ml.predict({
    'jam_belajar_per_hari': 3,
    'screen_time': 4,
    'jam_tidur': 7,
    'presentase_kehadiran': 90,
    'skor_time_management': 60,
    'motivasi_akademik': 60,
    'study_environment': 'Kondusif',
    'kompetensi_skill_level': 'Menengah',
    'stress_level': 'Sedang',
    'kerja_sampingan': 'Tidak',
    'industry_readiness': 'Siap',
    'jurusan': 'TKJ',
    'nilai_rata_rata_raport': 85,
})

print('=== PREDICTION RESULT ===')
print(f"Score: {result['predicted_exam_score']}")
print(f"Risk: {result['risk_status']}")
print(f"Version: {result['model_version']}")
print(f"\nSHAP Top-5:")
for s in result['shap_analysis'][:5]:
    print(f"  {s['feature_name']}: {s['impact_value']:.4f}")
    print(f"    -> {s['suggestion_text'][:80]}...")
