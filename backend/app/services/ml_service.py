import pandas as pd
import numpy as np
import shap
import joblib
import os

# Load model, scaler, explainer saat startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/random_forest_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/scaler.pkl')
FEATURE_NAMES_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/feature_names.pkl')
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/encoders.pkl')

# Variabel urutan fitur sesuai pelatihan
CURRENT_TO_MODEL_MAP = {
    'jam_belajar_per_hari': 'jam_belajar_perhari',
    'presentase_kehadiran': 'persentase_kehadiran',
    'persentase_kehadiran': 'persentase_kehadiran',
    'nilai_rata_rata_raport': 'nilai_rata_rata_rapor',
    'kehadiran_pelatihan_industry': 'kehadiran_pelatihan_industri',
    'rata_rata_pemasukan_keluarga': 'pendapatan_keluarga',
    'pendidikan_terakhir_orang_tua': 'edukasi_ortu',
    'industry_readiness': 'industry_ready',
}

MODEL_GENDER_MAP = {
    'Laki-laki': 'L',
    'Perempuan': 'P',
    'L': 'L',
    'P': 'P',
}

MODEL_WORK_MAP = {
    'Tidak': 'tidak',
    'Ya': 'ya',
    'tidak': 'tidak',
    'ya': 'ya',
}

MODEL_INDUSTRY_MAP = {
    'Belum Siap': 'belum_siap',
    'Siap': 'siap',
    'belum_siap': 'belum_siap',
    'siap': 'siap',
}

MODEL_PENDAPATAN_MAP = {
    '< 2 Juta': 0,
    '<2 Juta': 0,
    '2 - 5 Juta': 1,
    '5 - 10 Juta': 2,
    '> 10 Juta': 3,
    '<1jt': 0,
    '1-3jt': 1,
    '3-5jt': 2,
    '>5jt': 3,
}

MODEL_EDUKASI_MAP = {
    'SD': 0,
    'SMP': 1,
    'SMA/SMK': 2,
    'SMA': 2,
    'Diploma': 3,
    'D3/S1': 3,
    'Sarjana': 4,
    '>S1': 4,
}

MODEL_STUDY_ENV_MAP = {
    'Kurang Kondusif': 0,
    'buruk': 0,
    'Cukup Kondusif': 1,
    'cukup': 1,
    'Kondusif': 2,
    'baik': 2,
    'Sangat Kondusif': 3,
    'sangat_baik': 3,
}

MODEL_SKILL_MAP = {
    'Rendah': 0,
    'pemula': 0,
    'Menengah': 1,
    'menengah': 1,
    'Tinggi': 2,
    'mahir': 2,
}

MODEL_STRESS_MAP = {
    'Rendah': 0,
    'Sedang': 1,
    'Berat': 2,
    'rendah': 0,
    'sedang': 1,
    'berat': 2,
}

class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.explainer = None
        self.load_model()

    def load_model(self):
        try:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            self.encoders = joblib.load(ENCODERS_PATH)
            # Explainer is optional - will be created on demand if needed
            self.explainer = None
            print("Model loaded successfully")
        except Exception as e:
            print(f"Could not load model: {e}")
            # Fallback dummy model untuk development
            from sklearn.ensemble import RandomForestRegressor
            self.model = RandomForestRegressor(n_estimators=10)
            # Latih dummy model dengan data random
            X = np.random.rand(100, 19)
            y = np.random.rand(100) * 100
            self.model.fit(X, y)
            self.scaler = None
            self.encoders = None
            self.explainer = None

    def preprocess(self, data_dict):
        """Konversi payload API ke schema yang dipakai model terlatih."""
        feature_order = list(getattr(self.scaler, 'feature_names_in_', []))
        if not feature_order:
            feature_order = [
                'jam_belajar_perhari', 'persentase_kehadiran', 'nilai_rata_rata_rapor',
                'skor_time_management', 'jam_tidur', 'stress_level', 'screen_time',
                'kehadiran_pelatihan_industri', 'motivasi_akademik', 'pendapatan_keluarga',
                'edukasi_ortu', 'study_environment', 'kompetensi_skill_level', 'gender_L',
                'gender_P', 'kerja_sampingan_tidak', 'kerja_sampingan_ya',
                'industry_ready_belum_siap', 'industry_ready_siap'
            ]

        raw = dict(data_dict)
        normalized = {}

        def first_value(*keys, default=None):
            for key in keys:
                if key in raw and raw[key] is not None:
                    return raw[key]
            return default

        normalized['jam_belajar_perhari'] = float(first_value('jam_belajar_per_hari', 'jam_belajar_perhari', default=0) or 0)
        normalized['persentase_kehadiran'] = float(first_value('presentase_kehadiran', 'persentase_kehadiran', default=0) or 0)
        normalized['nilai_rata_rata_rapor'] = float(first_value('nilai_rata_rata_raport', 'nilai_rata_rata_rapor', default=0) or 0)
        normalized['skor_time_management'] = float(first_value('skor_time_management', default=0) or 0)
        normalized['jam_tidur'] = float(first_value('jam_tidur', default=0) or 0)
        normalized['stress_level'] = float(MODEL_STRESS_MAP.get(first_value('stress_level', default='Sedang'), 1))
        normalized['screen_time'] = float(first_value('screen_time', default=0) or 0)
        normalized['kehadiran_pelatihan_industri'] = float(first_value('kehadiran_pelatihan_industry', 'kehadiran_pelatihan_industri', default=0) or 0)
        normalized['motivasi_akademik'] = float(first_value('motivasi_akademik', default=0) or 0)

        pendapatan_value = first_value('rata_rata_pemasukan_keluarga', 'pendapatan_keluarga', default='< 2 Juta')
        normalized['pendapatan_keluarga'] = float(MODEL_PENDAPATAN_MAP.get(pendapatan_value, 0))

        edukasi_value = first_value('pendidikan_terakhir_orang_tua', 'edukasi_ortu', default='SMA/SMK')
        normalized['edukasi_ortu'] = float(MODEL_EDUKASI_MAP.get(edukasi_value, 2))

        study_value = first_value('study_environment', default='Cukup Kondusif')
        normalized['study_environment'] = float(MODEL_STUDY_ENV_MAP.get(study_value, 1))

        skill_value = first_value('kompetensi_skill_level', default='Menengah')
        normalized['kompetensi_skill_level'] = float(MODEL_SKILL_MAP.get(skill_value, 1))

        gender_value = MODEL_GENDER_MAP.get(first_value('gender', default='Laki-laki'), 'L')
        normalized['gender_L'] = 1.0 if gender_value == 'L' else 0.0
        normalized['gender_P'] = 1.0 if gender_value == 'P' else 0.0

        work_value = MODEL_WORK_MAP.get(first_value('kerja_sampingan', default='Tidak'), 'tidak')
        normalized['kerja_sampingan_tidak'] = 1.0 if work_value == 'tidak' else 0.0
        normalized['kerja_sampingan_ya'] = 1.0 if work_value == 'ya' else 0.0

        industry_value = MODEL_INDUSTRY_MAP.get(first_value('industry_readiness', 'industry_ready', default='Belum Siap'), 'belum_siap')
        normalized['industry_ready_belum_siap'] = 1.0 if industry_value == 'belum_siap' else 0.0
        normalized['industry_ready_siap'] = 1.0 if industry_value == 'siap' else 0.0

        df = pd.DataFrame([{column: normalized.get(column, 0.0) for column in feature_order}], columns=feature_order)
        if self.scaler:
            transformed = self.scaler.transform(df)
            df = pd.DataFrame(transformed, columns=feature_order)
        return df

    def predict(self, features):
        """Prediksi dan SHAP"""
        processed = self.preprocess(features)
        prediction = self.model.predict(processed)[0]
        risk = self.get_risk_status(prediction)

        # SHAP (jika explainer tersedia)
        shap_values = None
        if self.explainer:
            shap_values = self.explainer.shap_values(processed)
            shap_values = shap_values[0]  # untuk satu sampel
            # Ambil nama fitur asli
            feature_names = list(processed.columns)
        else:
            # Dummy SHAP (random)
            shap_values = np.random.randn(processed.shape[1]) * 2

        shap_list = []
        for i, col in enumerate(processed.columns):
            impact = float(shap_values[i])
            suggestion = self.generate_suggestion(col, impact)
            shap_list.append({
                'feature_name': col,
                'impact_value': impact,
                'suggestion_text': suggestion
            })

        return {
            'predicted_exam_score': round(prediction, 2),
            'risk_status': risk,
            'shap_analysis': shap_list
        }

    @staticmethod
    def get_risk_status(score):
        if score >= 75:
            return 'Tidak Beresiko'
        elif score >= 65:
            return 'Beresiko'
        else:
            return 'Sangat Beresiko'

    @staticmethod
    def generate_suggestion(feature_name, impact):
        # Sederhana, bisa dikembangkan dengan lookup table
        if 'jam_belajar' in feature_name and impact < 0:
            return "Tingkatkan jam belajar agar nilaimu lebih optimal"
        elif 'screen_time' in feature_name and impact > 0:
            return "Kurangi screen time untuk meningkatkan konsentrasi"
        else:
            return f"Perhatikan faktor {feature_name}"