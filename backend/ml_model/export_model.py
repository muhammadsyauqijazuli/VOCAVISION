# -*- coding: utf-8 -*-
"""
EXPORT MODEL ARTIFACTS untuk Website VOCAVISION
================================================
Script ini mereplikasi pipeline training dari notebook
Random_Forest_Model_SMK_final.ipynb dan mengekspor semua
artefak .pkl yang dibutuhkan oleh Flask backend.

Jalankan: python export_model.py
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
import warnings

from sklearn.model_selection import StratifiedShuffleSplit, GridSearchCV
from sklearn.preprocessing import StandardScaler, OrdinalEncoder, OneHotEncoder, PolynomialFeatures
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_selection import SelectKBest, mutual_info_classif

warnings.filterwarnings('ignore')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, 'data_advanced.csv')

# ============================================================
# 1. BACA & PREPROCESSING DATA
# ============================================================
print("Memulai proses preprocessing data...")
df = pd.read_csv(INPUT_FILE)

# Drop kolom pemicu Data Leakage & Identitas
cols_to_drop = ['nisn', 'nama_siswa', 'email', 'gender', 'nilai_raport_zscore_jurusan']
df = df.drop(columns=[c for c in cols_to_drop if c in df.columns], errors='ignore')
target_col = 'nilai_rata_rata_raport'

for col in df.columns:
    if df[col].isnull().any():
        if df[col].dtype == 'object':
            df[col].fillna(df[col].mode()[0], inplace=True)
        else:
            df[col].fillna(df[col].median(), inplace=True)

# Feature Engineering
df['rasio_belajar_vs_layar'] = df['jam_belajar_per_hari'] / (df['screen_time'] + 1)
df['indeks_produktivitas'] = (df['skor_time_management'] * df['presentase_kehadiran']) / 100
df['sisa_waktu_aktif'] = 24 - (df['jam_tidur'] + df['jam_belajar_per_hari'] + df['screen_time'])

# Numerik
numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
if target_col in numeric_cols:
    numeric_cols.remove(target_col)

for col in numeric_cols:
    lower = df[col].quantile(0.01)
    upper = df[col].quantile(0.99)
    df[col] = np.clip(df[col], lower, upper)

# Ordinal & Nominal
ordinal_mappings = {
    'study_environment': ['Kurang Kondusif', 'Cukup Kondusif', 'Kondusif'],
    'kompetensi_skill_level': ['Rendah', 'Menengah', 'Tinggi'],
    'stress_level': ['Rendah', 'Sedang', 'Berat']
}
nominal_cols = ['kerja_sampingan', 'industry_readiness', 'jurusan']

# Simpan ordinal encoders yang sudah fit
ordinal_encoders_fitted = {}
for col, cats in ordinal_mappings.items():
    if col in df.columns:
        oe = OrdinalEncoder(categories=[cats], dtype=int)
        df[col] = oe.fit_transform(df[[col]])
        ordinal_encoders_fitted[col] = oe

nominal_cols_exist = [c for c in nominal_cols if c in df.columns]
if nominal_cols_exist:
    onehot_encoder = OneHotEncoder(sparse_output=False, drop=None)
    onehot_encoded = onehot_encoder.fit_transform(df[nominal_cols_exist])
    onehot_feature_names = onehot_encoder.get_feature_names_out(nominal_cols_exist)
    df_onehot = pd.DataFrame(onehot_encoded, columns=onehot_feature_names, index=df.index)
else:
    onehot_encoder = None
    df_onehot = pd.DataFrame(index=df.index)

# Polynomial Interactions
poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
poly_numeric = poly.fit_transform(df[numeric_cols])
poly_feature_names = poly.get_feature_names_out(numeric_cols)

df_poly = pd.DataFrame(poly_numeric, columns=poly_feature_names, index=df.index)
df_ordinal = df[[c for c in ordinal_mappings.keys() if c in df.columns]].copy()

X = pd.concat([df_poly, df_ordinal, df_onehot], axis=1)
feature_names = X.columns.tolist()
y_reg = df[target_col].values

print(f"  Features: {len(feature_names)}, Samples: {len(X)}")

# ============================================================
# 2. TARGET ENGINEERING (3 CLASS TERTILES)
# ============================================================
low_3 = df[target_col].quantile(0.33)
high_3 = df[target_col].quantile(0.67)

print(f"  Tertile thresholds: low={low_3:.2f}, high={high_3:.2f}")

def get_3class(score):
    if score <= low_3: return 'Sangat Beresiko'
    elif score <= high_3: return 'Beresiko'
    else: return 'Aman'

y_3class = np.array([get_3class(s) for s in df[target_col]])

# ============================================================
# 3. TRAINING (Skenario Scaler + 3 Class — terbaik)
# ============================================================
print("\nMelatih model (Scaler + 3 Class)...")

# Split Data
sss = StratifiedShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
train_idx, test_idx = next(sss.split(X, y_3class))
X_train, X_test = X.iloc[train_idx].reset_index(drop=True), X.iloc[test_idx].reset_index(drop=True)
y_train_cls, y_test_cls = y_3class[train_idx], y_3class[test_idx]
y_train_reg, y_test_reg = y_reg[train_idx], y_reg[test_idx]

# Scaling
scaler = StandardScaler()
X_train_proc = scaler.fit_transform(X_train)
X_test_proc = scaler.transform(X_test)

# Feature Selection (12 Fitur Terbaik)
selector = SelectKBest(mutual_info_classif, k=12)
X_train_sel = selector.fit_transform(X_train_proc, y_train_cls)
X_test_sel = selector.transform(X_test_proc)
selected_features = np.array(feature_names)[selector.get_support()]

print(f"  Selected features ({len(selected_features)}): {list(selected_features)}")

# KLASIFIKASI (Random Forest)
class_weight_options = [
    {'Sangat Beresiko': 1.0, 'Beresiko': 2.5, 'Aman': 1.5},
    {'Sangat Beresiko': 1.0, 'Beresiko': 3.0, 'Aman': 1.0}
]

rf_cls = RandomForestClassifier(random_state=42, criterion='entropy', n_jobs=-1)
param_grid_cls = {
    'class_weight': class_weight_options,
    'n_estimators': [200, 300],
    'max_depth': [5, 7],
    'min_samples_leaf': [1, 2]
}
grid_cls = GridSearchCV(rf_cls, param_grid_cls, cv=5, scoring='f1_macro', n_jobs=-1)
grid_cls.fit(X_train_sel, y_train_cls)
best_cls = grid_cls.best_estimator_

print(f"  Best Classifier Params: {grid_cls.best_params_}")

# REGRESI (Random Forest Regressor)
rf_reg = RandomForestRegressor(random_state=42, n_jobs=-1)
param_grid_reg = {'n_estimators': [200], 'max_depth': [5, 7], 'min_samples_leaf': [2]}
grid_reg = GridSearchCV(rf_reg, param_grid_reg, cv=5, scoring='neg_mean_absolute_error', n_jobs=-1)
grid_reg.fit(X_train_sel, y_train_reg)
best_reg = grid_reg.best_estimator_

print(f"  Best Regressor Params: {grid_reg.best_params_}")

# ============================================================
# 4. EXPORT ARTEFAK
# ============================================================
print("\nMengekspor artefak model...")

artifacts = {
    'rf_classifier_final.pkl': best_cls,
    'rf_regressor_final.pkl': best_reg,
    'scaler_final.pkl': scaler,
    'selector_final.pkl': selector,
    'feature_names.pkl': feature_names,
    'selected_feature_names.pkl': list(selected_features),
    'encoders.pkl': {
        'ordinal_encoders': ordinal_encoders_fitted,
        'ordinal_mappings': ordinal_mappings,
        'onehot_encoder': onehot_encoder,
        'nominal_cols': nominal_cols_exist,
        'poly': poly,
        'numeric_cols': numeric_cols,
    },
    'thresholds.pkl': {
        'low': float(low_3),
        'high': float(high_3),
    },
}

for filename, obj in artifacts.items():
    path = os.path.join(SCRIPT_DIR, filename)
    joblib.dump(obj, path)
    size_kb = os.path.getsize(path) / 1024
    print(f"  [OK] {filename} ({size_kb:.1f} KB)")

print(f"\n{'='*60}")
print(f"Export selesai! {len(artifacts)} artefak disimpan di:")
print(f"  {SCRIPT_DIR}")
print(f"{'='*60}")
print(f"\nRingkasan:")
print(f"  - Classifier classes: {list(best_cls.classes_)}")
print(f"  - Regressor best MAE: {-grid_reg.best_score_:.4f}")
print(f"  - Tertile thresholds: <={low_3:.2f} (Sangat Beresiko), <={high_3:.2f} (Beresiko), >{high_3:.2f} (Aman)")
print(f"  - Selected {len(selected_features)} of {len(feature_names)} features")
print(f"  - Numeric cols: {len(numeric_cols)}")
print(f"  - Nominal cols (OneHot): {nominal_cols_exist}")
print(f"  - Ordinal cols: {list(ordinal_mappings.keys())}")
