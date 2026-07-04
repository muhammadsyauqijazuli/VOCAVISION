"""
Konverter Data Real Siswa SMK - Versi 1 (Baseline)
Pipeline: CSV Raw → Normalisasi → Konversi → data_15_variabel.csv
"""

import pandas as pd
import numpy as np
import re
import os

# ============================================================
# KONFIGURASI
# ============================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, 'Book1.csv')
OUTPUT_FILE = os.path.join(SCRIPT_DIR, 'data_15_variabel_new2.csv')

# ============================================================
# 1. BACA DATA
# ============================================================
for enc in ['utf-8-sig', 'utf-8', 'latin-1', 'cp1252']:
    try:
        with open(INPUT_FILE, 'r', encoding=enc) as f:
            first_line = f.readline()
        break
    except:
        enc = 'utf-8'

sep = ';' if first_line.count(';') > first_line.count(',') else ','
df = pd.read_csv(INPUT_FILE, sep=sep, encoding=enc)
print(f"Data dibaca: {len(df)} baris, {len(df.columns)} kolom")

# ============================================================
# 2. DETEKSI KOLOM (spesifik dulu, lalu umum)
# ============================================================
col_map = {}
for col in df.columns:
    cl = col.lower().strip()
    if 'nisn' in cl:
        col_map['nisn'] = col
    elif 'nama lengkap' in cl or 'nama siswa' in cl:
        col_map['nama'] = col
    elif 'email' in cl:
        col_map['email'] = col
    elif 'jenis kelamin' in cl or 'gender' in cl:
        col_map['gender'] = col
    elif ('avg' in cl or 'rata' in cl) and 'raport' in cl:
        col_map['nilai_raport'] = col
    elif 'persentase kehadiran efektif' in cl:
        col_map['kehadiran_efektif'] = col
    elif 'kehadiran' in cl and 'pelatihan' not in cl and 'industri' not in cl and 'industry' not in cl:
        col_map['kehadiran'] = col
    elif 'pendidikan terakhir ayah' in cl:
        col_map['pend_ayah'] = col
    elif 'pendidikan terakhir ibu' in cl:
        col_map['pend_ibu'] = col
    elif 'pemasukan keluarga' in cl or 'pendapatan' in cl:
        col_map['pendapatan'] = col
    elif 'pekerjaan sampingan' in cl:
        col_map['kerja_sampingan'] = col
    elif 'waktu yang kamu habiskan untuk belajar' in cl:
        col_map['jam_belajar'] = col
    elif 'jam tidur' in cl or 'tidur per malam' in cl:
        col_map['jam_tidur'] = col
    elif 'bermain hp' in cl or 'screen' in cl:
        col_map['screen_time'] = col
    elif 'masalah aneh' in cl:
        col_map['q9'] = col
    elif 'supervisor' in cl or 'aplikasi atau alat brand baru' in cl:
        col_map['q10'] = col
    elif 'kemampuan keahlian praktik' in cl:
        col_map['kompetensi'] = col
    elif 'konsentrasi penuh' in cl:
        col_map['q11'] = col
    elif 'posisi hp' in cl or 'smartphone' in cl:
        col_map['q12'] = col
    elif 'ujian teori besok' in cl:
        col_map['q13'] = col
    elif 'grup whatsapp' in cl or 'mabar' in cl:
        col_map['q14'] = col
    elif 'titik jenuh' in cl or 'pikiran realistis' in cl:
        col_map['q15'] = col
    elif 'fisik sudah cukup lelah' in cl or 'refleks pertamamu' in cl:
        col_map['q16'] = col
    elif 'kritikan tajam' in cl or 'omelan' in cl:
        col_map['q17'] = col
    elif 'teman-teman di sekitarmu' in cl or 'suara batin' in cl:
        col_map['q18'] = col

# ============================================================
# 3. FUNGSI PEMBANTU & PEMBERSIHAN NUMERIK
# ============================================================
def clean_num(val):
    if isinstance(val, str):
        val = val.replace(',', '.').replace('%', '').strip()
        val = re.sub(r'\s+', '', val)
        try:
            return float(val)
        except:
            return np.nan
    return float(val) if pd.notna(val) else np.nan

def is_hhmm_format(val):
    if pd.isna(val):
        return False
    try:
        s = str(int(val)).strip()
        if re.match(r'^\d{3,4}$', s):
            num = int(s)
            if 0 <= (num // 100) <= 23 and 0 <= (num % 100) <= 59:
                return True
    except:
        pass
    return False

# Terapkan pembersihan numerik jika kolom tersedia
for c in ['jam_tidur', 'screen_time', 'jam_belajar']:
    if c in col_map:
        df[col_map[c]] = df[col_map[c]].apply(clean_num)

if 'jam_tidur' in col_map:
    mask_hhmm = df[col_map['jam_tidur']].apply(is_hhmm_format)
    df.loc[mask_hhmm | (df[col_map['jam_tidur']] > 12), col_map['jam_tidur']] = np.nan

if 'screen_time' in col_map:
    df.loc[df[col_map['screen_time']] > 12, col_map['screen_time']] = np.nan

if 'jam_belajar' in col_map:
    df.loc[df[col_map['jam_belajar']] > 12, col_map['jam_belajar']] = np.nan

for c in ['jam_tidur', 'screen_time', 'jam_belajar']:
    if c in col_map:
        median_val = df[col_map[c]].median()
        df[col_map[c]] = df[col_map[c]].fillna(median_val).clip(0, 12)

# ============================================================
# 4. FUNGSI PEMETAAN & SKORING
# ============================================================
def map_pendidikan(text):
    t = str(text).lower()
    if any(w in t for w in ['sarjana', 's1', 'master', 'doctor']):
        return 'Sarjana'
    if 'diploma' in t:
        return 'Diploma'
    if 'sma' in t:
        return 'SMA/SMK'
    if 'smp' in t:
        return 'SMP'
    if 'sd' in t:
        return 'SD'
    return text

def normalize_text(t):
    if not isinstance(t, str):
        return ""
    return re.sub(r'\s+', ' ', t.lower()).replace('\n', ' ').strip()

def get_score(ans, a_word, b_word, c_word, a_val, b_val, c_val):
    t = normalize_text(ans)
    if a_word in t:
        return a_val
    if b_word in t:
        return b_val
    if c_word in t:
        return c_val
    return (a_val + b_val + c_val) / 3

def safe_get(row, key, default=np.nan):
    """Mengambil nilai dari kolom yang sudah dipetakan, fallback ke default jika tidak ada."""
    if key in col_map:
        return row[col_map[key]]
    return default

# ============================================================
# 5. PROSES KONVERSI PER BARIS
# ============================================================
output = []
order_pend = {'SD': 1, 'SMP': 2, 'SMA/SMK': 3, 'Diploma': 4, 'Sarjana': 5}

for idx, row in df.iterrows():
    # ID & Demografi
    nisn = str(safe_get(row, 'nisn', '')).strip()
    nama = str(safe_get(row, 'nama', '')).strip()
    email = str(safe_get(row, 'email', '')).strip()
    gender_raw = str(safe_get(row, 'gender', '')).strip().lower()
    gender = 'Laki-laki' if 'laki' in gender_raw else 'Perempuan'

    # Numerik inti
    jam_belajar = clean_num(safe_get(row, 'jam_belajar'))
    jam_tidur = clean_num(safe_get(row, 'jam_tidur'))
    screen_time = clean_num(safe_get(row, 'screen_time'))
    nilai_raport = clean_num(safe_get(row, 'nilai_raport'))

    # Kehadiran (total & efektif – alpha saja)
    kehadiran = clean_num(safe_get(row, 'kehadiran'))
    kehadiran_efektif = clean_num(safe_get(row, 'kehadiran_efektif'))

    # Pendidikan orang tua (tertinggi)
    p_ayah = map_pendidikan(safe_get(row, 'pend_ayah', ''))
    p_ibu = map_pendidikan(safe_get(row, 'pend_ibu', ''))
    pend_tertinggi = p_ayah if order_pend.get(p_ayah, 0) >= order_pend.get(p_ibu, 0) else p_ibu

    # Pendapatan
    pend_raw = str(safe_get(row, 'pendapatan', '')).strip().lower()
    if 'kurang dari' in pend_raw or '<' in pend_raw:
        pendapatan = '< 2 Juta'
    elif '2.000.000' in pend_raw:
        pendapatan = '2 - 5 Juta'
    elif '5.000.000' in pend_raw:
        pendapatan = '5 - 10 Juta'
    elif '> 10' in pend_raw or 'lebih' in pend_raw:
        pendapatan = '> 10 Juta'
    else:
        pendapatan = pend_raw

    # Pekerjaan sampingan
    kerja_sampingan = 'Ya' if 'ya' in str(safe_get(row, 'kerja_sampingan', '')).lower() else 'Tidak'

    # Kompetensi kejuruan
    komp_raw = str(safe_get(row, 'kompetensi', '')).lower()
    if 'sangat menguasai' in komp_raw or 'siap menerima project' in komp_raw:
        kompetensi = 'Tinggi'
    elif 'masih kesulitan' in komp_raw or 'bisa mengerjakan tugas praktik standar' in komp_raw:
        kompetensi = 'Menengah'
    elif 'bingung' in komp_raw or 'bergantung' in komp_raw:
        kompetensi = 'Rendah'
    else:
        kompetensi = 'Menengah'

    # Skoring survei psikososial
    q9  = get_score(safe_get(row, 'q9', ''), 'segera melepaskan', 'pesan error', 'cara cepat', 30, 50, 10)
    q10 = get_score(safe_get(row, 'q10', ''), 'tutorial dasar', 'di sekolah saja', 'mencontohkan langkah', 50, 10, 30)
    ind_readiness = q9 + q10

    q11 = get_score(safe_get(row, 'q11', ''), 'ruang keluarga', 'sudut ruangan', 'kasur', 30, 50, 10)
    q12 = get_score(safe_get(row, 'q12', ''), 'menghadap ke atas', 'dalam laci', 'dibalik', 10, 50, 30)
    env_score = q11 + q12
    if env_score >= 80:
        study_env = 'Kondusif'
    elif env_score >= 50:
        study_env = 'Cukup Kondusif'
    else:
        study_env = 'Kurang Kondusif'

    q13 = get_score(safe_get(row, 'q13', ''), 'sekarang juga', 'memaksakan diri', 'buku catatan', 10, 30, 50)
    q14 = get_score(safe_get(row, 'q14', ''), 'multitasking', 'membalas obrolan', 'dijauhkan', 10, 30, 50)
    time_mgmt = q13 + q14

    q15 = get_score(safe_get(row, 'q15', ''), 'tunda', 'finansial', 'sensasi', 20, 60, 100)
    motivasi = q15

    q16 = get_score(safe_get(row, 'q16', ''), 'toilet', 'menyiapkan alat', 'acak', 30, 5, 15)
    q17 = get_score(safe_get(row, 'q17', ''), 'mengiyakan', 'simulasi tekanan', 'berlebihan', 20, 10, 35)
    q18 = get_score(safe_get(row, 'q18', ''), 'menghibur diri', 'salah jurusan', 'referensi', 20, 35, 10)
    stress_sum = q16 + q17 + q18
    if stress_sum >= 80:
        stress_level = 'Berat'
    elif stress_sum >= 50:
        stress_level = 'Sedang'
    else:
        stress_level = 'Rendah'

    # Susun output
    output.append({
        'nisn': nisn,
        'nama_siswa': nama,
        'email': email,
        'gender': gender,
        'kerja_sampingan': kerja_sampingan,
        'rata_rata_pemasukan_keluarga': pendapatan,
        'pendidikan_terakhir_orang_tua': pend_tertinggi,
        'jam_belajar_per_hari': jam_belajar,
        'screen_time': screen_time,
        'jam_tidur': jam_tidur,
        'presentase_kehadiran': kehadiran,                     # total (izin, sakit, alpha)
        'presentase_kehadiran_efektif': kehadiran_efektif,      # hanya alpha (tanpa izin/sakit)
        'industry_readiness': ind_readiness,
        'study_environment': study_env,
        'skor_time_management': time_mgmt,
        'motivasi_akademik': motivasi,
        'kompetensi_skill_level': kompetensi,
        'stress_level': stress_level,
        'nilai_rata_rata_raport': nilai_raport
    })

# ============================================================
# 6. SIMPAN KE CSV
# ============================================================
df_out = pd.DataFrame(output)
df_out.to_csv(OUTPUT_FILE, index=False)
print(f"Konversi Selesai! Output (V1) disimpan ke {OUTPUT_FILE}")
print(f"Bentuk data: {df_out.shape[0]} baris x {df_out.shape[1]} kolom")