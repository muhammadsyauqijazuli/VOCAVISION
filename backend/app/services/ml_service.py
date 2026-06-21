import os

import joblib
import numpy as np
import pandas as pd
import shap

# ============================================================
# PATH KE ARTEFAK MODEL
# ============================================================
_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_model')

CLASSIFIER_PATH = os.path.join(_MODEL_DIR, 'rf_classifier_final.pkl')
REGRESSOR_PATH = os.path.join(_MODEL_DIR, 'rf_regressor_final.pkl')
SCALER_PATH = os.path.join(_MODEL_DIR, 'scaler_final.pkl')
SELECTOR_PATH = os.path.join(_MODEL_DIR, 'selector_final.pkl')
FEATURE_NAMES_PATH = os.path.join(_MODEL_DIR, 'feature_names.pkl')
SELECTED_FEATURES_PATH = os.path.join(_MODEL_DIR, 'selected_feature_names.pkl')
ENCODERS_PATH = os.path.join(_MODEL_DIR, 'encoders.pkl')
THRESHOLDS_PATH = os.path.join(_MODEL_DIR, 'thresholds.pkl')

MODEL_VERSION = '3.0.0'

# ============================================================
# MAPPING NORMALISASI INPUT
# ============================================================
# Fitur alias: canonical_name -> tuple of accepted aliases
FEATURE_ALIAS_RULES = [
    ('jam_belajar_per_hari', ('jam_belajar_per_hari', 'jam_belajar_perhari', 'jam_belajar')),
    ('presentase_kehadiran', ('presentase_kehadiran', 'persentase_kehadiran', 'kehadiran_kelas', 'attendance')),
    ('nilai_rata_rata_raport', ('nilai_rata_rata_raport', 'nilai_rata_rata_rapor', 'raport', 'rapor')),
    ('skor_time_management', ('skor_time_management', 'skor_time', 'time_management')),
    ('jam_tidur', ('jam_tidur', 'tidur', 'sleep')),
    ('screen_time', ('screen_time', 'screen', 'layar')),
    ('motivasi_akademik', ('motivasi_akademik', 'motivasi')),
    ('rata_rata_pemasukan_keluarga', ('rata_rata_pemasukan_keluarga', 'pendapatan_keluarga', 'pemasukan_keluarga', 'income')),
    ('pendidikan_terakhir_orang_tua', ('pendidikan_terakhir_orang_tua', 'edukasi_ortu', 'pendidikan_orang_tua', 'education')),
    ('kerja_sampingan', ('kerja_sampingan', 'side_job', 'work')),
    ('study_environment', ('study_environment', 'lingkungan_belajar', 'environment')),
    ('kompetensi_skill_level', ('kompetensi_skill_level', 'skill_level', 'kompetensi', 'skill')),
    ('industry_readiness', ('industry_readiness', 'industry_ready', 'industry readiness', 'readiness')),
    ('stress_level', ('stress_level', 'stres', 'stress')),
    ('gender', ('gender',)),
    ('jurusan', ('jurusan', 'major', 'program')),
    ('ses_index', ('ses_index', 'ses')),
    ('deviasi_tidur', ('deviasi_tidur', 'sleep_deviation')),
    ('kehadiran_pelatihan_industry', ('kehadiran_pelatihan_industry', 'kehadiran_pelatihan_industri', 'pelatihan_industry')),
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
    'nilai_rata_rata_raport': {
        'label': 'Nilai rata-rata raport',
        'modifiable': True,
        'action': 'fokus pada remedial, latihan soal, dan evaluasi mata pelajaran yang paling lemah',
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
    'industry_readiness': {
        'label': 'Industry readiness',
        'modifiable': True,
        'action': 'mengikuti simulasi karier, project kecil, atau pelatihan yang relevan dengan dunia industri',
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
    'jurusan': {
        'label': 'Jurusan',
        'modifiable': False,
        'action': 'memaksimalkan peluang belajar di jurusan saat ini dengan mengikuti program pengayaan dan praktik tambahan',
    },
    'ses_index': {
        'label': 'Indeks sosial-ekonomi',
        'modifiable': False,
        'action': 'memanfaatkan sumber daya sekolah, beasiswa, dan program bantuan yang tersedia',
    },
    'deviasi_tidur': {
        'label': 'Deviasi jam tidur',
        'modifiable': True,
        'action': 'menjaga konsistensi jam tidur setiap malam agar tidak terlalu berfluktuasi',
    },
    # Engineered features
    'rasio_belajar_vs_layar': {
        'label': 'Rasio belajar vs screen time',
        'modifiable': True,
        'action': 'meningkatkan proporsi waktu belajar dibandingkan screen time hiburan',
    },
    'indeks_produktivitas': {
        'label': 'Indeks produktivitas',
        'modifiable': True,
        'action': 'meningkatkan kehadiran dan manajemen waktu secara bersamaan',
    },
    'sisa_waktu_aktif': {
        'label': 'Sisa waktu aktif',
        'modifiable': True,
        'action': 'mengoptimalkan penggunaan waktu luang untuk kegiatan produktif',
    },
    'default': {
        'label': 'Faktor ini',
        'modifiable': True,
        'action': 'meninjau ulang kebiasaan belajar, kehadiran, dan rutinitas harian yang paling dekat dengan faktor tersebut',
    },
}


class MLService:
    """
    Service ML untuk VOCAVISION v3.
    Pipeline: preprocess -> encode -> polynomial -> scale -> select -> predict
    Dual model: Classifier (risk class) + Regressor (predicted score)
    """

    def __init__(self):
        self.classifier = None
        self.regressor = None
        self.scaler = None
        self.selector = None
        self.feature_names = None
        self.selected_feature_names = None
        self.encoders = None
        self.thresholds = None
        self.explainer = None
        self.load_model()

    def load_model(self):
        """Muat semua artefak model dari file .pkl."""
        try:
            self.classifier = joblib.load(CLASSIFIER_PATH)
            self.regressor = joblib.load(REGRESSOR_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            self.selector = joblib.load(SELECTOR_PATH)
            self.feature_names = joblib.load(FEATURE_NAMES_PATH)
            self.selected_feature_names = joblib.load(SELECTED_FEATURES_PATH)
            self.encoders = joblib.load(ENCODERS_PATH)
            self.thresholds = joblib.load(THRESHOLDS_PATH)

            # Inisialisasi SHAP Explainer pada classifier
            self.explainer = shap.TreeExplainer(self.classifier)
            print(f"Model v{MODEL_VERSION} loaded successfully")
            print(f"  Classifier classes: {list(self.classifier.classes_)}")
            print(f"  Features: {len(self.feature_names)} -> selected {len(self.selected_feature_names)}")
        except Exception as e:
            print(f"Could not load model: {e}")
            self._init_dummy_model()

    def _init_dummy_model(self):
        """Fallback dummy model untuk development tanpa .pkl files."""
        from sklearn.ensemble import RandomForestClassifier as RFC
        from sklearn.ensemble import RandomForestRegressor as RFR

        print("Initializing dummy model for development...")
        X_dummy = np.random.rand(100, 12)
        y_cls_dummy = np.random.choice(['Sangat Beresiko', 'Beresiko', 'Aman'], 100)
        y_reg_dummy = np.random.rand(100) * 20 + 75

        self.classifier = RFC(n_estimators=10, random_state=42)
        self.classifier.fit(X_dummy, y_cls_dummy)

        self.regressor = RFR(n_estimators=10, random_state=42)
        self.regressor.fit(X_dummy, y_reg_dummy)

        self.scaler = None
        self.selector = None
        self.feature_names = None
        self.selected_feature_names = None
        self.encoders = None
        self.thresholds = {'low': 83.36, 'high': 85.0}
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
        """Map nama fitur (termasuk polynomial) ke guidance key."""
        lowered = str(feature_name).lower()

        for canonical_name, aliases in FEATURE_ALIAS_RULES:
            for alias in aliases:
                if alias in lowered:
                    return canonical_name

        # Untuk polynomial features (misal "jam_belajar_per_hari jam_tidur"),
        # coba match bagian pertama
        parts = lowered.split(' ')
        if len(parts) > 1:
            for canonical_name, aliases in FEATURE_ALIAS_RULES:
                for alias in aliases:
                    if alias in parts[0]:
                        return canonical_name

        return 'default'

    # ================================================================
    # PREPROCESSING PIPELINE
    # ================================================================
    def preprocess(self, data_dict):
        """
        Konversi payload API menjadi feature vector siap prediksi.
        Pipeline: normalize -> DataFrame -> ordinal encode -> onehot encode ->
                  polynomial features -> concat -> scale -> select
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
        skor_time_management = float(first_val('skor_time_management', default=0) or 0)
        motivasi_akademik = float(first_val('motivasi_akademik', default=0) or 0)
        ses_index = float(first_val('ses_index', default=6) or 6)
        deviasi_tidur = float(first_val('deviasi_tidur', default=2) or 2)

        # --- Kategorikal (ordinal) ---
        study_env = self._normalize_study_environment(
            first_val('study_environment', default='Cukup Kondusif')
        )
        skill_level = self._normalize_skill(
            first_val('kompetensi_skill_level', default='Menengah')
        )
        stress = self._normalize_stress(
            first_val('stress_level', default='Sedang')
        )

        # --- Kategorikal (nominal) ---
        kerja_sampingan = first_val('kerja_sampingan', default='Tidak')
        if str(kerja_sampingan).lower() in ('ya', 'true', '1'):
            kerja_sampingan = 'Ya'
        else:
            kerja_sampingan = 'Tidak'

        industry_readiness = first_val('industry_readiness', 'industry_ready', default='Belum Siap')
        if str(industry_readiness).lower() in ('siap', 'true', '1'):
            industry_readiness = 'Siap'
        else:
            industry_readiness = 'Belum Siap'

        jurusan = first_val('jurusan', default='TKJ')
        valid_jurusan = ['TKJ', 'TAV', 'TPTU', 'MULTIMEDIA']
        if jurusan not in valid_jurusan:
            jurusan = 'TKJ'

        # --- Feature Engineering (sama persis dengan training) ---
        rasio_belajar_vs_layar = jam_belajar / (screen_time + 1)
        indeks_produktivitas = (skor_time_management * presentase_kehadiran) / 100
        sisa_waktu_aktif = 24 - (jam_tidur + jam_belajar + screen_time)

        if self.encoders is None:
            # Dummy mode — return random features
            return pd.DataFrame(np.random.rand(1, 12))

        # --- Build DataFrame sesuai training pipeline ---
        numeric_data = {
            'ses_index': ses_index,
            'jam_belajar_per_hari': jam_belajar,
            'screen_time': screen_time,
            'jam_tidur': jam_tidur,
            'deviasi_tidur': deviasi_tidur,
            'presentase_kehadiran': presentase_kehadiran,
            'skor_time_management': skor_time_management,
            'motivasi_akademik': motivasi_akademik,
            'rasio_belajar_vs_layar': rasio_belajar_vs_layar,
            'indeks_produktivitas': indeks_produktivitas,
            'sisa_waktu_aktif': sisa_waktu_aktif,
        }

        ordinal_data = {
            'study_environment': study_env,
            'kompetensi_skill_level': skill_level,
            'stress_level': stress,
        }

        nominal_data = {
            'kerja_sampingan': kerja_sampingan,
            'industry_readiness': industry_readiness,
            'jurusan': jurusan,
        }

        # --- Ordinal Encoding ---
        ordinal_encoders = self.encoders.get('ordinal_encoders', {})
        ordinal_encoded = {}
        for col, val in ordinal_data.items():
            if col in ordinal_encoders:
                encoder = ordinal_encoders[col]
                try:
                    val_df = pd.DataFrame([[val]], columns=[col])
                    ordinal_encoded[col] = encoder.transform(val_df)[0][0]
                except ValueError:
                    # Jika kategori tidak dikenal, gunakan median (1)
                    ordinal_encoded[col] = 1
            else:
                ordinal_encoded[col] = 0

        # --- OneHot Encoding ---
        onehot_encoder = self.encoders.get('onehot_encoder')
        nominal_cols = self.encoders.get('nominal_cols', [])

        if onehot_encoder and nominal_cols:
            nominal_df = pd.DataFrame([{col: nominal_data.get(col, '') for col in nominal_cols}])
            onehot_encoded = onehot_encoder.transform(nominal_df)
            onehot_feature_names = onehot_encoder.get_feature_names_out(nominal_cols)
            df_onehot = pd.DataFrame(onehot_encoded, columns=onehot_feature_names)
        else:
            df_onehot = pd.DataFrame()

        # --- Polynomial Features ---
        poly = self.encoders.get('poly')
        numeric_cols_order = self.encoders.get('numeric_cols', list(numeric_data.keys()))

        # Pastikan urutan numerik sesuai training
        numeric_values = []
        for col in numeric_cols_order:
            numeric_values.append(numeric_data.get(col, 0.0))

        numeric_df = pd.DataFrame([numeric_values], columns=numeric_cols_order)

        if poly:
            poly_result = poly.transform(numeric_df)
            poly_feature_names = poly.get_feature_names_out(numeric_cols_order)
            df_poly = pd.DataFrame(poly_result, columns=poly_feature_names)
        else:
            df_poly = numeric_df

        # --- Concat: poly + ordinal + onehot ---
        df_ordinal = pd.DataFrame([ordinal_encoded])
        X = pd.concat([df_poly, df_ordinal, df_onehot], axis=1)

        # Pastikan kolom sesuai feature_names dari training
        if self.feature_names:
            for col in self.feature_names:
                if col not in X.columns:
                    X[col] = 0.0
            X = X[self.feature_names]

        # --- Scale ---
        if self.scaler:
            scaled = self.scaler.transform(X)
            X = pd.DataFrame(scaled, columns=X.columns)

        # --- Feature Selection ---
        if self.selector:
            selected = self.selector.transform(X.values)
            X = pd.DataFrame(selected, columns=self.selected_feature_names)

        return X

    # ================================================================
    # PREDIKSI
    # ================================================================
    def predict(self, features):
        """
        Prediksi risiko akademik dan skor ujian.
        Returns dict: predicted_exam_score, risk_status, shap_analysis, model_version
        """
        processed = self.preprocess(features)

        # Classifier -> risk status
        risk_status = self.classifier.predict(processed)[0]

        # Regressor -> predicted score
        predicted_score = float(self.regressor.predict(processed)[0])

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
        """Hitung SHAP values untuk satu sample. Fokus pada kelas 'Sangat Beresiko'."""
        if self.explainer is None:
            return np.random.randn(processed.shape[1]) * 2

        shap_result = self.explainer.shap_values(processed)

        # TreeExplainer returns list of arrays (one per class) or 3D array
        classes = list(self.classifier.classes_)
        target_class = 'Sangat Beresiko'
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
    @staticmethod
    def get_abs_category(score):
        """Legacy method — map skor ke kategori risiko."""
        if score <= 83.36:
            return 'Sangat Beresiko'
        elif score <= 85.0:
            return 'Beresiko'
        else:
            return 'Aman'