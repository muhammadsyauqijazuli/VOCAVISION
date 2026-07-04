import os

import joblib
import numpy as np
import pandas as pd
import shap

# ============================================================
# PATH KE ARTEFAK MODEL
# ============================================================
_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_model')

CLASSIFIER_PATH = os.path.join(_MODEL_DIR, 'rf_classifier_best.pkl')
SCALER_PATH = os.path.join(_MODEL_DIR, 'scaler.pkl')
FEATURE_NAMES_PATH = os.path.join(_MODEL_DIR, 'feature_names.pkl')
TRAIN_COLUMNS_PATH = os.path.join(_MODEL_DIR, 'train_columns.pkl')

MODEL_VERSION = '3.0.0'

# Threshold kategorisasi (sesuai notebook)
SCORE_THRESHOLD_LOW = 82.5    # < 82.5 = Beresiko
SCORE_THRESHOLD_HIGH = 86.0   # >= 86.0 = Sangat Aman

# ============================================================
# MAPPING NORMALISASI INPUT
# ============================================================
FEATURE_ALIAS_RULES = [
    ('jam_belajar_per_hari', ('jam_belajar_per_hari', 'jam_belajar_perhari', 'jam_belajar')),
    ('presentase_kehadiran', ('presentase_kehadiran', 'persentase_kehadiran', 'kehadiran_kelas', 'attendance')),
    ('presentase_kehadiran_efektif', ('presentase_kehadiran_efektif', 'persentase_kehadiran_efektif', 'kehadiran_efektif')),
    ('nilai_rata_rata_raport', ('nilai_rata_rata_raport', 'nilai_rata_rata_rapor', 'raport', 'rapor')),
    ('skor_time_management', ('skor_time_management', 'skor_time', 'time_management')),
    ('jam_tidur', ('jam_tidur', 'tidur', 'sleep')),
    ('screen_time', ('screen_time', 'screen', 'layar')),
    ('motivasi_akademik', ('motivasi_akademik', 'motivasi')),
    ('industry_readiness', ('industry_readiness', 'industry_ready', 'readiness')),
    ('rata_rata_pemasukan_keluarga', ('rata_rata_pemasukan_keluarga', 'pendapatan_keluarga', 'pemasukan_keluarga', 'income')),
    ('pendidikan_terakhir_orang_tua', ('pendidikan_terakhir_orang_tua', 'edukasi_ortu', 'pendidikan_orang_tua', 'education')),
    ('kerja_sampingan', ('kerja_sampingan', 'side_job', 'work')),
    ('study_environment', ('study_environment', 'lingkungan_belajar', 'environment')),
    ('kompetensi_skill_level', ('kompetensi_skill_level', 'skill_level', 'kompetensi', 'skill')),
    ('stress_level', ('stress_level', 'stres', 'stress')),
    ('gender', ('gender',)),
]

# ============================================================
# PANDUAN REKOMENDASI PER FITUR
# ============================================================
FEATURE_GUIDANCE = {
    'jam_belajar_per_hari': {
        'label': 'Jam belajar per hari',
        'modifiable': True,
        'action': 'menambah 1-2 jam belajar terstruktur per hari dan memecah materi menjadi sesi fokus',
    },
    'presentase_kehadiran': {
        'label': 'Kehadiran kelas',
        'modifiable': True,
        'action': 'meningkatkan kehadiran kelas dan mengejar materi yang tertinggal secara rutin',
    },
    'presentase_kehadiran_efektif': {
        'label': 'Kehadiran efektif',
        'modifiable': True,
        'action': 'meningkatkan kehadiran efektif dengan mengurangi ketidakhadiran tanpa izin (alpha)',
    },
    'skor_time_management': {
        'label': 'Time management',
        'modifiable': True,
        'action': 'membuat jadwal harian, menentukan prioritas tugas, dan membatasi distraksi',
    },
    'jam_tidur': {
        'label': 'Jam tidur',
        'modifiable': True,
        'action': 'menjaga tidur 7-8 jam per malam dan membangun rutinitas malam yang konsisten',
    },
    'screen_time': {
        'label': 'Screen time',
        'modifiable': True,
        'action': 'membatasi screen time sebelum tidur dan mengurangi distraksi digital saat belajar',
    },
    'motivasi_akademik': {
        'label': 'Motivasi akademik',
        'modifiable': True,
        'action': 'menetapkan target belajar harian kecil, lalu mengevaluasi progres secara berkala',
    },
    'industry_readiness': {
        'label': 'Industry readiness',
        'modifiable': True,
        'action': 'mengikuti simulasi karier, project kecil, atau pelatihan yang relevan dengan dunia industri',
    },
    'rata_rata_pemasukan_keluarga': {
        'label': 'Pemasukan keluarga',
        'modifiable': False,
        'action': 'memanfaatkan beasiswa, sumber belajar gratis, atau dukungan sekolah untuk menutup hambatan',
    },
    'pendidikan_terakhir_orang_tua': {
        'label': 'Pendidikan orang tua',
        'modifiable': False,
        'action': 'menguatkan dukungan belajar melalui guru, mentor, atau materi tambahan yang terarah',
    },
    'kerja_sampingan': {
        'label': 'Kerja sampingan',
        'modifiable': True,
        'action': 'mengatur ulang beban kerja agar tidak mengganggu jam belajar utama dan waktu istirahat',
    },
    'study_environment': {
        'label': 'Lingkungan belajar',
        'modifiable': True,
        'action': 'mencari ruang belajar yang lebih kondusif dan meminimalkan gangguan di sekitar',
    },
    'kompetensi_skill_level': {
        'label': 'Kompetensi skill',
        'modifiable': True,
        'action': 'melatih skill dasar secara bertahap melalui modul, latihan praktik, dan umpan balik guru',
    },
    'stress_level': {
        'label': 'Stress level',
        'modifiable': True,
        'action': 'mengelola stres dengan istirahat terjadwal, teknik relaksasi, dan dukungan konseling bila perlu',
    },
    'gender': {
        'label': 'Gender',
        'modifiable': False,
        'action': 'memusatkan intervensi pada faktor yang dapat diubah seperti jam belajar, kehadiran, tidur, dan stres',
    },
    'default': {
        'label': 'Faktor ini',
        'modifiable': True,
        'action': 'meninjau ulang kebiasaan belajar, kehadiran, dan rutinitas harian yang paling dekat dengan faktor tersebut',
    },
}

# Kolom numerik yang masuk ke model (sesuai notebook: setelah drop nisn, nama, email, gender, nilai_raport)
NUMERIC_FEATURES = [
    'jam_belajar_per_hari',
    'screen_time',
    'jam_tidur',
    'presentase_kehadiran',
    'presentase_kehadiran_efektif',
    'industry_readiness',
    'skor_time_management',
    'motivasi_akademik',
]

# Kolom kategorikal yang di-one-hot-encode
CATEGORICAL_FEATURES = [
    'kerja_sampingan',
    'rata_rata_pemasukan_keluarga',
    'pendidikan_terakhir_orang_tua',
    'study_environment',
    'kompetensi_skill_level',
    'stress_level',
]

# Nilai valid per kolom kategorikal
CATEGORICAL_VALUES = {
    'kerja_sampingan': ['Ya', 'Tidak'],
    'rata_rata_pemasukan_keluarga': ['< 2 Juta', '2 - 5 Juta', '5 - 10 Juta', '> 10 Juta'],
    'pendidikan_terakhir_orang_tua': ['SD', 'SMP', 'SMA/SMK', 'Diploma', 'Sarjana'],
    'study_environment': ['Kondusif', 'Cukup Kondusif', 'Kurang Kondusif'],
    'kompetensi_skill_level': ['Rendah', 'Menengah', 'Tinggi'],
    'stress_level': ['Rendah', 'Sedang', 'Berat'],
}


class MLService:
    """
    Service ML untuk VOCAVISION v3.
    Pipeline: preprocess -> one-hot encode -> scale -> predict
    Model: RandomForestClassifier (3-class: Beresiko, Aman, Sangat Aman)
    """

    def __init__(self):
        self.classifier = None
        self.scaler = None
        self.feature_names = None
        self.train_columns = None
        self.explainer = None
        self.load_model()

    def load_model(self):
        """Muat semua artefak model dari file .pkl."""
        try:
            self.classifier = joblib.load(CLASSIFIER_PATH)

            if os.path.exists(SCALER_PATH):
                self.scaler = joblib.load(SCALER_PATH)

            if os.path.exists(FEATURE_NAMES_PATH):
                self.feature_names = joblib.load(FEATURE_NAMES_PATH)

            if os.path.exists(TRAIN_COLUMNS_PATH):
                self.train_columns = joblib.load(TRAIN_COLUMNS_PATH)

            # Inisialisasi SHAP Explainer pada classifier
            self.explainer = shap.TreeExplainer(self.classifier)
            print(f"Model v{MODEL_VERSION} loaded successfully")
            print(f"  Classifier classes: {list(self.classifier.classes_)}")
            if self.train_columns is not None:
                print(f"  Train columns: {len(self.train_columns)} features")
        except Exception as e:
            print(f"Could not load model: {e}")
            self._init_dummy_model()

    def _init_dummy_model(self):
        """Fallback dummy model untuk development tanpa .pkl files."""
        from sklearn.ensemble import RandomForestClassifier as RFC

        print("Initializing dummy model for development...")
        X_dummy = np.random.rand(100, 12)
        y_cls_dummy = np.random.choice(['Beresiko', 'Aman', 'Sangat Aman'], 100)

        self.classifier = RFC(n_estimators=10, random_state=42)
        self.classifier.fit(X_dummy, y_cls_dummy)

        self.scaler = None
        self.feature_names = None
        self.train_columns = None
        self.explainer = None

    # ================================================================
    # NORMALISASI INPUT
    # ================================================================
    @staticmethod
    def _normalize_study_environment(value):
        mapping = {
            'Kurang Kondusif': 'Kurang Kondusif',
            'buruk': 'Kurang Kondusif',
            'Cukup Kondusif': 'Cukup Kondusif',
            'cukup': 'Cukup Kondusif',
            'Kondusif': 'Kondusif',
            'baik': 'Kondusif',
            'Sangat Kondusif': 'Kondusif',
            'sangat_baik': 'Kondusif',
        }
        return mapping.get(value, 'Cukup Kondusif')

    @staticmethod
    def _normalize_skill(value):
        mapping = {
            'Rendah': 'Rendah',
            'pemula': 'Rendah',
            'Menengah': 'Menengah',
            'menengah': 'Menengah',
            'Tinggi': 'Tinggi',
            'mahir': 'Tinggi',
        }
        return mapping.get(value, 'Menengah')

    @staticmethod
    def _normalize_stress(value):
        mapping = {
            'Rendah': 'Rendah',
            'rendah': 'Rendah',
            'Sedang': 'Sedang',
            'sedang': 'Sedang',
            'Berat': 'Berat',
            'berat': 'Berat',
        }
        return mapping.get(value, 'Sedang')

    @staticmethod
    def _normalize_income(value):
        mapping = {
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
        return mapping.get(value, '< 2 Juta')

    @staticmethod
    def _normalize_education(value):
        mapping = {
            'SD': 'SD',
            'SMP': 'SMP',
            'SMA/SMK': 'SMA/SMK',
            'SMA': 'SMA/SMK',
            'Diploma': 'Diploma',
            'D3/S1': 'Diploma',
            'Sarjana': 'Sarjana',
            '>S1': 'Sarjana',
        }
        return mapping.get(value, 'SMA/SMK')

    @staticmethod
    def _resolve_feature_key(feature_name):
        """Map nama fitur (termasuk one-hot encoded) ke guidance key."""
        lowered = str(feature_name).lower()

        for canonical_name, aliases in FEATURE_ALIAS_RULES:
            for alias in aliases:
                if alias in lowered:
                    return canonical_name

        # Untuk one-hot encoded features (misal "kerja_sampingan_Ya"),
        # coba match bagian awal
        parts = lowered.split('_')
        if len(parts) > 1:
            for canonical_name, aliases in FEATURE_ALIAS_RULES:
                for alias in aliases:
                    if alias in '_'.join(parts[:-1]):
                        return canonical_name

        return 'default'

    # ================================================================
    # PREPROCESSING PIPELINE
    # ================================================================
    def preprocess(self, data_dict):
        """
        Konversi payload API menjadi feature vector siap prediksi.
        Pipeline sesuai notebook: DataFrame -> drop kolom non-fitur ->
                                   one-hot encode -> scale
        """
        raw = dict(data_dict)

        def first_val(*keys, default=None):
            for k in keys:
                if k in raw and raw[k] is not None:
                    return raw[k]
            return default

        # --- Numerik ---
        jam_belajar = float(first_val('jam_belajar_per_hari', 'jam_belajar_perhari', default=0) or 0)
        screen_time = float(first_val('screen_time', default=0) or 0)
        jam_tidur = float(first_val('jam_tidur', default=0) or 0)
        presentase_kehadiran = float(first_val('presentase_kehadiran', 'persentase_kehadiran', default=0) or 0)
        presentase_kehadiran_efektif = float(first_val('presentase_kehadiran_efektif', 'persentase_kehadiran_efektif', default=0) or 0)
        industry_readiness = float(first_val('industry_readiness', 'industry_ready', default=0) or 0)
        skor_time_management = float(first_val('skor_time_management', default=0) or 0)
        motivasi_akademik = float(first_val('motivasi_akademik', default=0) or 0)

        # --- Kategorikal ---
        kerja_sampingan = first_val('kerja_sampingan', default='Tidak')
        if str(kerja_sampingan).lower() in ('ya', 'true', '1'):
            kerja_sampingan = 'Ya'
        else:
            kerja_sampingan = 'Tidak'

        rata_rata_pemasukan = self._normalize_income(
            first_val('rata_rata_pemasukan_keluarga', default='< 2 Juta')
        )
        pendidikan_ortu = self._normalize_education(
            first_val('pendidikan_terakhir_orang_tua', default='SMA/SMK')
        )
        study_env = self._normalize_study_environment(
            first_val('study_environment', default='Cukup Kondusif')
        )
        skill_level = self._normalize_skill(
            first_val('kompetensi_skill_level', default='Menengah')
        )
        stress = self._normalize_stress(
            first_val('stress_level', default='Sedang')
        )

        # --- Build DataFrame ---
        data = {
            'jam_belajar_per_hari': jam_belajar,
            'screen_time': screen_time,
            'jam_tidur': jam_tidur,
            'presentase_kehadiran': presentase_kehadiran,
            'presentase_kehadiran_efektif': presentase_kehadiran_efektif,
            'industry_readiness': industry_readiness,
            'skor_time_management': skor_time_management,
            'motivasi_akademik': motivasi_akademik,
            'kerja_sampingan': kerja_sampingan,
            'rata_rata_pemasukan_keluarga': rata_rata_pemasukan,
            'pendidikan_terakhir_orang_tua': pendidikan_ortu,
            'study_environment': study_env,
            'kompetensi_skill_level': skill_level,
            'stress_level': stress,
        }

        df = pd.DataFrame([data])

        # --- One-Hot Encoding (sesuai notebook: pd.get_dummies, drop_first=True) ---
        df = pd.get_dummies(df, columns=CATEGORICAL_FEATURES, drop_first=True)

        # --- Align kolom ke training columns ---
        if self.train_columns is not None:
            train_cols = list(self.train_columns)
            # Add missing columns with 0
            for col in train_cols:
                if col not in df.columns:
                    df[col] = 0
            # Remove extra columns
            df = df[train_cols]
        elif self.feature_names is not None:
            feat_list = list(self.feature_names)
            for col in feat_list:
                if col not in df.columns:
                    df[col] = 0
            df = df[feat_list]

        # --- Scale ---
        if self.scaler:
            try:
                if hasattr(self.scaler, 'feature_names_in_'):
                    # Ensure column order matches scaler
                    df = df[self.scaler.feature_names_in_]
                scaled = self.scaler.transform(df)
                df = pd.DataFrame(scaled, columns=df.columns)
            except Exception as e:
                print("Warning in scaler transform:", e)
                try:
                    scaled = self.scaler.transform(df.values)
                    df = pd.DataFrame(scaled, columns=df.columns)
                except Exception as e2:
                    print("Scaler transform fallback also failed:", e2)

        return df

    # ================================================================
    # PREDIKSI
    # ================================================================
    def predict(self, features):
        """
        Prediksi risiko akademik dan skor ujian.
        Returns dict: predicted_exam_score, risk_status, shap_analysis, model_version
        """
        processed = self.preprocess(features)

        # Classifier -> risk status & probability
        risk_status = str(self.classifier.predict(processed)[0])

        # Estimate predicted score using class probabilities and thresholds
        try:
            proba = self.classifier.predict_proba(processed)[0]
            classes = list(self.classifier.classes_)

            p_beresiko = proba[classes.index('Beresiko')] if 'Beresiko' in classes else 0
            p_aman = proba[classes.index('Aman')] if 'Aman' in classes else 0
            p_sangat_aman = proba[classes.index('Sangat Aman')] if 'Sangat Aman' in classes else 0

            if risk_status == 'Beresiko':
                # Map from (SCORE_THRESHOLD_LOW - 5) to SCORE_THRESHOLD_LOW
                predicted_score = (SCORE_THRESHOLD_LOW - 5) + (5 * (1 - p_beresiko))
            elif risk_status == 'Aman':
                # Map from SCORE_THRESHOLD_LOW to SCORE_THRESHOLD_HIGH
                range_val = SCORE_THRESHOLD_HIGH - SCORE_THRESHOLD_LOW
                predicted_score = SCORE_THRESHOLD_LOW + (range_val * p_sangat_aman)
            else:
                # Map from SCORE_THRESHOLD_HIGH to (SCORE_THRESHOLD_HIGH + 5)
                predicted_score = SCORE_THRESHOLD_HIGH + (5 * p_sangat_aman)

            predicted_score = float(np.clip(predicted_score, 0, 100))
        except Exception as e:
            print("Error computing synthetic score:", e)
            # Fallback
            mapping = {
                'Beresiko': SCORE_THRESHOLD_LOW - 2,
                'Aman': (SCORE_THRESHOLD_LOW + SCORE_THRESHOLD_HIGH) / 2,
                'Sangat Aman': SCORE_THRESHOLD_HIGH + 2,
            }
            predicted_score = mapping.get(risk_status, 80.0)

        # SHAP Analysis (pada classifier)
        shap_values = self._compute_shap(processed)

        # Build SHAP list dengan suggestions
        feature_cols = list(processed.columns)
        shap_list = []
        for i, col in enumerate(feature_cols):
            impact = float(shap_values[i])
            suggestion = self.generate_suggestion(col, impact)
            shap_list.append({
                'feature_name': col,
                'impact_value': impact,
                'suggestion_text': suggestion,
            })

        # Sort by absolute impact (descending)
        shap_list.sort(key=lambda x: abs(x['impact_value']), reverse=True)

        return {
            'predicted_exam_score': round(predicted_score, 2),
            'risk_status': risk_status,
            'shap_analysis': shap_list,
            'model_version': MODEL_VERSION,
        }

    def _compute_shap(self, processed):
        """Hitung SHAP values untuk satu sample. Fokus pada kelas 'Beresiko'."""
        if self.explainer is None:
            return np.random.randn(processed.shape[1]) * 2

        shap_result = self.explainer.shap_values(processed)

        # TreeExplainer returns list of arrays (one per class) or 3D array
        classes = list(self.classifier.classes_)
        target_class = 'Beresiko'
        target_idx = classes.index(target_class) if target_class in classes else 0

        if isinstance(shap_result, list):
            shap_target = shap_result[target_idx]
        elif len(shap_result.shape) == 3:
            shap_target = shap_result[:, :, target_idx]
        else:
            shap_target = shap_result

        # Flatten ke 1D (single sample)
        if len(shap_target.shape) > 1:
            return shap_target[0]
        return shap_target

    # ================================================================
    # SUGGESTION / RECOMMENDATION
    # ================================================================
    @staticmethod
    def generate_suggestion(feature_name, impact):
        """Generate rekomendasi berdasarkan nama fitur dan SHAP impact."""
        try:
            abs_imp = abs(float(impact))
        except Exception:
            abs_imp = 0.0

        if abs_imp >= 2.0:
            severity = 'high'
        elif abs_imp >= 0.5:
            severity = 'medium'
        else:
            severity = 'low'

        positive = impact > 0

        guidance = FEATURE_GUIDANCE.get(
            MLService._resolve_feature_key(feature_name),
            FEATURE_GUIDANCE['default'],
        )

        label = guidance['label']
        action = guidance['action']
        modifiable = guidance['modifiable']

        if positive:
            if modifiable:
                return f"{label} berkontribusi positif terhadap skor prediksi. Pertahankan kebiasaan ini dan ulangi pola yang sama secara konsisten."
            return f"{label} saat ini menjadi sinyal penjelas yang mendukung prediksi. Fokus intervensi tetap pada faktor yang dapat diubah seperti jam belajar, kehadiran, tidur, dan stres."

        if modifiable:
            if severity == 'high':
                return f"{label} menurunkan skor secara signifikan. Disarankan {action}."
            if severity == 'medium':
                return f"{label} masih menekan skor. Cobalah {action}."
            return f"{label} memberi tekanan ringan pada prediksi. Mulai dengan {action}."

        if severity == 'high':
            return f"{label} menunjukkan sinyal risiko yang cukup besar. Karena faktor ini tidak mudah diubah, fokuskan intervensi pada kebiasaan belajar, kehadiran, dan istirahat yang lebih bisa dikendalikan."
        if severity == 'medium':
            return f"{label} ikut memengaruhi prediksi. Intervensi paling efektif tetap diarahkan ke faktor yang dapat diubah, sambil memanfaatkan {action}."
        return f"{label} memberi pengaruh ringan pada prediksi. Fokus utama tetap pada perbaikan rutinitas yang lebih langsung berdampak pada hasil belajar."

    # ================================================================
    # BACKWARD COMPATIBILITY
    # ================================================================
    def get_abs_category(self, score):
        """Legacy method — map skor ke kategori risiko menggunakan thresholds."""
        if score < SCORE_THRESHOLD_LOW:
            return 'Beresiko'
        elif score < SCORE_THRESHOLD_HIGH:
            return 'Aman'
        else:
            return 'Sangat Aman'