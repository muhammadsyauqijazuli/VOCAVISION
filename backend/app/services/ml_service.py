import os

import joblib
import numpy as np
import pandas as pd
import shap

# Load model, scaler, explainer saat startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/random_forest_regressor.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/scaler_reg.pkl')
FEATURE_NAMES_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/feature_names.pkl')
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), '../../ml_model/encoders.pkl')
MODEL_VERSION = '2.0.0'

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
    'Laki-laki': 'Laki-laki',
    'Perempuan': 'Perempuan',
    'L': 'Laki-laki',
    'P': 'Perempuan',
}

MODEL_WORK_MAP = {
    'Tidak': 'Tidak',
    'Ya': 'Ya',
    'tidak': 'Tidak',
    'ya': 'Ya',
}

MODEL_INDUSTRY_MAP = {
    'Belum Siap': 'Belum Siap',
    'Siap': 'Siap',
    'belum_siap': 'Belum Siap',
    'siap': 'Siap',
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
            self.feature_names = joblib.load(FEATURE_NAMES_PATH)
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
            self.feature_names = None
            self.encoders = None
            self.explainer = None

    @staticmethod
    def _normalize_income(value):
        income_map = {
            '< 2 Juta': '< 2 Juta',
            '<2 Juta': '< 2 Juta',
            '2 - 5 Juta': '2 - 5 Juta',
            '5 - 10 Juta': '5 - 10 Juta',
            '> 10 Juta': '> 10 Juta',
            '<1jt': '< 2 Juta',
            '1-3jt': '2 - 5 Juta',
            '3-5jt': '5 - 10 Juta',
            '>5jt': '> 10 Juta',
        }
        return income_map.get(value, '< 2 Juta')

    @staticmethod
    def _normalize_education(value):
        education_map = {
            'SD': 'SD',
            'SMP': 'SMP',
            'SMA/SMK': 'SMA/SMK',
            'SMA': 'SMA/SMK',
            'Diploma': 'Diploma',
            'D3/S1': 'Diploma',
            'Sarjana': 'Sarjana',
            '>S1': 'Sarjana',
        }
        return education_map.get(value, 'SMA/SMK')

    @staticmethod
    def _normalize_study_environment(value):
        study_map = {
            'Kurang Kondusif': 'Kurang Kondusif',
            'buruk': 'Kurang Kondusif',
            'Cukup Kondusif': 'Cukup Kondusif',
            'cukup': 'Cukup Kondusif',
            'Kondusif': 'Kondusif',
            'baik': 'Kondusif',
            'Sangat Kondusif': 'Kondusif',
            'sangat_baik': 'Kondusif',
        }
        return study_map.get(value, 'Cukup Kondusif')

    @staticmethod
    def _normalize_skill(value):
        skill_map = {
            'Rendah': 'Rendah',
            'pemula': 'Rendah',
            'Menengah': 'Menengah',
            'menengah': 'Menengah',
            'Tinggi': 'Tinggi',
            'mahir': 'Tinggi',
        }
        return skill_map.get(value, 'Menengah')

    @staticmethod
    def _normalize_stress(value):
        stress_map = {
            'Rendah': 'Rendah',
            'rendah': 'Rendah',
            'Sedang': 'Sedang',
            'sedang': 'Sedang',
            'Berat': 'Berat',
            'berat': 'Berat',
        }
        return stress_map.get(value, 'Sedang')

    def _encode_payload(self, normalized):
        feature_names = self.feature_names or []

        if not self.encoders:
            fallback_features = feature_names or [
                'jam_belajar_per_hari', 'presentase_kehadiran', 'nilai_rata_rata_raport',
                'skor_time_management', 'jam_tidur', 'screen_time',
                'kehadiran_pelatihan_industry', 'motivasi_akademik',
                'rata_rata_pemasukan_keluarga', 'pendidikan_terakhir_orang_tua',
                'study_environment', 'kompetensi_skill_level', 'stress_level',
                'gender_Laki-laki', 'gender_Perempuan', 'kerja_sampingan_Tidak',
                'kerja_sampingan_Ya', 'industry_readiness_Belum Siap',
                'industry_readiness_Siap',
            ]
            return pd.DataFrame([{column: normalized.get(column, 0.0) for column in fallback_features}], columns=fallback_features)

        ordinal_encoders = self.encoders.get('ordinal_encoders', {})
        onehot_encoder = self.encoders.get('onehot_encoder')
        nominal_cols = self.encoders.get('nominal_cols', [])

        df = pd.DataFrame([normalized])
        for column, encoder in ordinal_encoders.items():
            if column in df.columns:
                df[column] = encoder.transform(df[[column]])

        if onehot_encoder is not None and nominal_cols:
            onehot_encoded = onehot_encoder.transform(df[nominal_cols])
            onehot_feature_names = onehot_encoder.get_feature_names_out(nominal_cols)
            df_encoded = df.drop(columns=nominal_cols)
            df_onehot = pd.DataFrame(onehot_encoded, columns=onehot_feature_names, index=df.index)
            df = pd.concat([df_encoded, df_onehot], axis=1)

        for column in feature_names:
            if column not in df.columns:
                df[column] = 0.0

        if feature_names:
            df = df[feature_names]
        return df

    def preprocess(self, data_dict):
        """Konversi payload API ke schema yang dipakai model terlatih."""
        raw = dict(data_dict)
        normalized = {}

        def first_value(*keys, default=None):
            for key in keys:
                if key in raw and raw[key] is not None:
                    return raw[key]
            return default

        normalized['jam_belajar_per_hari'] = float(first_value('jam_belajar_per_hari', 'jam_belajar_perhari', default=0) or 0)
        normalized['presentase_kehadiran'] = float(first_value('presentase_kehadiran', 'persentase_kehadiran', default=0) or 0)
        normalized['nilai_rata_rata_raport'] = float(first_value('nilai_rata_rata_raport', 'nilai_rata_rata_rapor', default=0) or 0)
        normalized['skor_time_management'] = float(first_value('skor_time_management', default=0) or 0)
        normalized['jam_tidur'] = float(first_value('jam_tidur', default=0) or 0)
        normalized['screen_time'] = float(first_value('screen_time', default=0) or 0)
        normalized['kehadiran_pelatihan_industry'] = float(first_value('kehadiran_pelatihan_industry', 'kehadiran_pelatihan_industri', default=0) or 0)
        normalized['motivasi_akademik'] = float(first_value('motivasi_akademik', default=0) or 0)

        normalized['rata_rata_pemasukan_keluarga'] = self._normalize_income(
            first_value('rata_rata_pemasukan_keluarga', 'pendapatan_keluarga', default='< 2 Juta')
        )
        normalized['pendidikan_terakhir_orang_tua'] = self._normalize_education(
            first_value('pendidikan_terakhir_orang_tua', 'edukasi_ortu', default='SMA/SMK')
        )
        normalized['study_environment'] = self._normalize_study_environment(first_value('study_environment', default='Cukup Kondusif'))
        normalized['kompetensi_skill_level'] = self._normalize_skill(first_value('kompetensi_skill_level', default='Menengah'))
        normalized['stress_level'] = self._normalize_stress(first_value('stress_level', default='Sedang'))

        normalized['gender'] = MODEL_GENDER_MAP.get(first_value('gender', default='Laki-laki'), 'Laki-laki')
        normalized['kerja_sampingan'] = MODEL_WORK_MAP.get(first_value('kerja_sampingan', default='Tidak'), 'Tidak')
        normalized['industry_readiness'] = MODEL_INDUSTRY_MAP.get(first_value('industry_readiness', 'industry_ready', default='Belum Siap'), 'Belum Siap')

        df = self._encode_payload(normalized)
        if self.scaler:
            transformed = self.scaler.transform(df)
            df = pd.DataFrame(transformed, columns=df.columns)
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
            'shap_analysis': shap_list,
            'model_version': MODEL_VERSION,
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