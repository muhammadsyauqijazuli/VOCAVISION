"""
=============================================================================
VOCAVISION - Master Data Preprocessing & Converter Pipeline
Menggabungkan:
1. fill_email.py       : Imputasi format email siswa (namapertama_nisn@student.smk.ac.id)
2. Data Normalization  : Normalisasi numerik (jam belajar, tidur, screen time max 24 jam)
                         serta skoring kuesioner psikososial SEBELUM imputasi mean/mode
3. fill_missing_data.py: Imputasi nilai kosong berbasis Class Mean (Numerik) dan Mode (Kategorik)
                         berdasarkan segmentasi nilai raport (P10 & P80)
4. konverter_data.py   : Ekspor data siap latih ke data_clean.csv
=============================================================================
"""

import pandas as pd
import numpy as np
import re
import os
import sys

# =============================================================================
# KONFIGURASI PATH
# =============================================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Prioritas file input: data mentah_backup.csv jika ada (original raw), fallback ke data mentah.csv
if os.path.exists(os.path.join(SCRIPT_DIR, 'data mentah_backup.csv')):
    INPUT_FILE = os.path.join(SCRIPT_DIR, 'data mentah_backup.csv')
else:
    INPUT_FILE = os.path.join(SCRIPT_DIR, 'data mentah.csv')

OUTPUT_CLEAN = os.path.join(SCRIPT_DIR, 'data_clean.csv')
OUTPUT_RAW_SYNC = os.path.join(SCRIPT_DIR, 'data mentah.csv')


# =============================================================================
# FUNGSI PEMBANTU PEMBERSIHAN & PARSING
# =============================================================================
def detect_separator_and_encoding(filepath):
    """Mendeteksi encoding dan delimiter file CSV secara otomatis."""
    for enc in ['utf-8-sig', 'utf-8', 'latin-1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                first_line = f.readline()
            sep = ';' if first_line.count(';') > first_line.count(',') else ','
            return enc, sep
        except Exception:
            continue
    return 'utf-8', ','

def clean_num(val):
    """Membersihkan nilai numerik dari string persentase, koma desimal, dll."""
    if isinstance(val, str):
        val = val.replace(',', '.').replace('%', '').strip()
        val = re.sub(r'\s+', '', val)
        if val.lower() in ['(data kosong)', '-', 'nan', '', 'none', 'null']:
            return np.nan
        try:
            return float(val)
        except:
            return np.nan
    return float(val) if pd.notna(val) else np.nan

def is_hhmm_format(val):
    """Mendeteksi jika siswa menginput jam dalam format jam malam 24-jam (misal 2200 untuk jam 10 malam)."""
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

def map_pendidikan(text):
    """Memetakan string pendidikan orang tua ke kategori standar."""
    if pd.isna(text):
        return np.nan
    t = str(text).lower()
    if any(w in t for w in ['sarjana', 's1', 'master', 's2', 'doctor', 's3']):
        return 'Sarjana'
    if 'diploma' in t or 'd3' in t or 'd4' in t:
        return 'Diploma'
    if 'sma' in t or 'smk' in t or 'slta' in t:
        return 'SMA/SMK'
    if 'smp' in t or 'sltp' in t:
        return 'SMP'
    if 'sd' in t:
        return 'SD'
    return np.nan

def normalize_text(t):
    """Normalisasi teks string untuk pencocokan kata kunci jawaban kuesioner."""
    if not isinstance(t, str):
        return ""
    return re.sub(r'\s+', ' ', t.lower()).replace('\n', ' ').strip()

def get_score(ans, a_word, b_word, c_word, a_val, b_val, c_val):
    """Menghitung skor pertanyaan kuesioner berdasarkan pencocokan kata kunci."""
    if pd.isna(ans) or str(ans).strip() == '':
        return np.nan
    t = normalize_text(ans)
    if a_word in t:
        return a_val
    if b_word in t:
        return b_val
    if c_word in t:
        return c_val
    return (a_val + b_val + c_val) / 3.0


# =============================================================================
# PIPELINE UTAMA
# =============================================================================
def run_pipeline():
    print("=" * 70)
    print("MEMULAI PIPELINE TERPADU PREPROCESSING & KONVERSI DATA ML VOCAVISION")
    print("=" * 70)
    
    # 1. BACA DATA MENTAH
    enc, sep = detect_separator_and_encoding(INPUT_FILE)
    df_raw = pd.read_csv(INPUT_FILE, sep=sep, encoding=enc)
    print(f"[*] Data mentah dibaca dari: {os.path.basename(INPUT_FILE)}")
    print(f"    Jumlah baris: {len(df_raw)}, Jumlah kolom: {len(df_raw.columns)}")

    # 2. PEMETAAN NAMA KOLOM SECARA FLEKSIBEL
    col_map = {}
    for col in df_raw.columns:
        cl = col.lower().strip()
        if 'nisn' in cl: col_map['nisn'] = col
        elif 'nama lengkap' in cl or 'nama siswa' in cl: col_map['nama'] = col
        elif 'email' in cl: col_map['email'] = col
        elif 'jenis kelamin' in cl or 'gender' in cl: col_map['gender'] = col
        elif 'jurusan' in cl: col_map['jurusan'] = col
        elif ('avg' in cl or 'rata' in cl) and 'raport' in cl: col_map['nilai_raport'] = col
        elif 'persentase kehadiran efektif' in cl: col_map['kehadiran_efektif'] = col
        elif 'kehadiran' in cl and 'pelatihan' not in cl and 'industri' not in cl and 'industry' not in cl: col_map['kehadiran'] = col
        elif 'keahlian skill' in cl or 'skor skill' in cl: col_map['skor_skill'] = col
        elif 'pendidikan terakhir ayah' in cl: col_map['pend_ayah'] = col
        elif 'pendidikan terakhir ibu' in cl: col_map['pend_ibu'] = col
        elif 'pemasukan keluarga' in cl or 'pendapatan' in cl: col_map['pendapatan'] = col
        elif 'pekerjaan sampingan' in cl: col_map['kerja_sampingan'] = col
        elif 'waktu yang kamu habiskan untuk belajar' in cl: col_map['jam_belajar'] = col
        elif 'jam tidur' in cl or 'tidur per malam' in cl: col_map['jam_tidur'] = col
        elif 'bermain hp' in cl or 'screen' in cl: col_map['screen_time'] = col
        elif 'masalah aneh' in cl: col_map['q9'] = col
        elif 'supervisor' in cl or 'aplikasi atau alat brand baru' in cl: col_map['q10'] = col
        elif 'kemampuan keahlian praktik' in cl: col_map['kompetensi'] = col
        elif 'konsentrasi penuh' in cl: col_map['q11'] = col
        elif 'posisi hp' in cl or 'smartphone' in cl: col_map['q12'] = col
        elif 'ujian teori besok' in cl: col_map['q13'] = col
        elif 'grup whatsapp' in cl or 'mabar' in cl: col_map['q14'] = col
        elif 'titik jenuh' in cl or 'pikiran realistis' in cl: col_map['q15'] = col
        elif 'fisik sudah cukup lelah' in cl or 'refleks pertamamu' in cl: col_map['q16'] = col
        elif 'kritikan tajam' in cl or 'omelan' in cl: col_map['q17'] = col
        elif 'teman-teman di sekitarmu' in cl or 'suara batin' in cl: col_map['q18'] = col

    def safe_get(row, key, default=np.nan):
        if key in col_map and col_map[key] in row:
            return row[col_map[key]]
        return default

    # 3. TAHAP 1: NORMALISASI EMAIL & PARSING DATA INDIVIDUAL
    print("\n[*] Tahap 1: Normalisasi format email & parsing data individual...")
    rows = []
    order_pend = {'SD': 1, 'SMP': 2, 'SMA/SMK': 3, 'Diploma': 4, 'Sarjana': 5}

    for idx, r in df_raw.iterrows():
        # NISN & Nama
        nisn_val = safe_get(r, 'nisn')
        nisn_str = str(int(nisn_val)) if pd.notna(nisn_val) and str(nisn_val).replace('.','').isdigit() else str(nisn_val).strip()
        nama = str(safe_get(r, 'nama', '')).strip()
        
        # Email (Generate jika kosong)
        email = safe_get(r, 'email')
        if pd.isna(email) or str(email).strip() == '':
            first_n = re.sub(r'[^a-z0-9]', '', nama.split()[0].lower()) if nama else 'siswa'
            email = f"{first_n}_{nisn_str}@student.smk.ac.id"
        else:
            email = str(email).strip()

        # Gender
        gender_raw = str(safe_get(r, 'gender', '')).strip().lower()
        gender = 'Perempuan' if any(w in gender_raw for w in ['perempuan', 'wanita', 'p']) else 'Laki-laki'

        # Jurusan
        jurusan_raw = str(safe_get(r, 'jurusan', '')).strip().upper()
        if 'TKJ' in jurusan_raw: jurusan = 'TKJ'
        elif 'TAV' in jurusan_raw: jurusan = 'TAV'
        elif 'TPTU' in jurusan_raw: jurusan = 'TPTU'
        elif 'DPIB' in jurusan_raw: jurusan = 'DPIB'
        elif 'TKR' in jurusan_raw: jurusan = 'TKR'
        elif 'TITL' in jurusan_raw: jurusan = 'TITL'
        elif 'DKV' in jurusan_raw: jurusan = 'DKV'
        elif 'RPL' in jurusan_raw: jurusan = 'RPL'
        else: jurusan = str(safe_get(r, 'jurusan', 'TKJ')).strip()

        # Numerik Akademik
        nilai_raport = clean_num(safe_get(r, 'nilai_raport'))
        kehadiran = clean_num(safe_get(r, 'kehadiran'))
        kehadiran_efektif = clean_num(safe_get(r, 'kehadiran_efektif'))
        skor_skill = clean_num(safe_get(r, 'skor_skill'))

        # Numerik Waktu (Jam Belajar, Tidur, Screen Time)
        j_belajar = clean_num(safe_get(r, 'jam_belajar'))
        j_tidur = clean_num(safe_get(r, 'jam_tidur'))
        s_time = clean_num(safe_get(r, 'screen_time'))

        # Filter format aneh / outlier ekstrem pada waktu
        if is_hhmm_format(j_belajar) or (pd.notna(j_belajar) and j_belajar > 12): j_belajar = np.nan
        if is_hhmm_format(j_tidur) or (pd.notna(j_tidur) and j_tidur > 12): j_tidur = np.nan
        if is_hhmm_format(s_time) or (pd.notna(s_time) and s_time > 12): s_time = np.nan

        # Pendidikan Orang Tua (Tertinggi Ayah / Ibu)
        p_ayah = map_pendidikan(safe_get(r, 'pend_ayah'))
        p_ibu = map_pendidikan(safe_get(r, 'pend_ibu'))
        if pd.isna(p_ayah) and pd.isna(p_ibu):
            pend_ortu = np.nan
        else:
            rank_a = order_pend.get(p_ayah, 0)
            rank_i = order_pend.get(p_ibu, 0)
            pend_ortu = p_ayah if rank_a >= rank_i else p_ibu

        # Pendapatan Keluarga
        pend_raw = str(safe_get(r, 'pendapatan', '')).strip().lower()
        if pd.isna(safe_get(r, 'pendapatan')) or pend_raw == '':
            pemasukan = np.nan
        elif 'kurang' in pend_raw or '<' in pend_raw or '1.000.000' in pend_raw or ('2.000.000' in pend_raw and 'sampai' not in pend_raw):
            pemasukan = '< 2 Juta'
        elif '2.000.000' in pend_raw or '2 - 5' in pend_raw:
            pemasukan = '2 - 5 Juta'
        elif '5.000.000' in pend_raw or '5 - 10' in pend_raw:
            pemasukan = '5 - 10 Juta'
        elif '10.000.000' in pend_raw or '> 10' in pend_raw or 'lebih' in pend_raw:
            pemasukan = '> 10 Juta'
        else:
            pemasukan = np.nan

        # Pekerjaan Sampingan
        ks_raw = str(safe_get(r, 'kerja_sampingan', '')).strip().lower()
        if pd.isna(safe_get(r, 'kerja_sampingan')) or ks_raw == '':
            kerja_sampingan = np.nan
        elif 'ya' in ks_raw:
            kerja_sampingan = 'Ya'
        elif 'tidak' in ks_raw:
            kerja_sampingan = 'Tidak'
        else:
            kerja_sampingan = np.nan

        # Kompetensi Kejuruan
        komp_raw = str(safe_get(r, 'kompetensi', '')).strip().lower()
        if pd.isna(safe_get(r, 'kompetensi')) or komp_raw == '':
            kompetensi = np.nan
        elif 'sangat menguasai' in komp_raw or 'siap menerima project' in komp_raw or 'tinggi' in komp_raw:
            kompetensi = 'Tinggi'
        elif 'mandiri' in komp_raw or 'menengah' in komp_raw or 'standar' in komp_raw:
            kompetensi = 'Menengah'
        elif 'bingung' in komp_raw or 'bergantung' in komp_raw or 'rendah' in komp_raw:
            kompetensi = 'Rendah'
        else:
            kompetensi = np.nan

        # Skoring Kuesioner Psikososial
        q9 = get_score(safe_get(r, 'q9'), 'segera melepaskan', 'pesan error', 'cara cepat', 30, 50, 10)
        q10 = get_score(safe_get(r, 'q10'), 'tutorial dasar', 'di sekolah saja', 'mencontohkan langkah', 50, 10, 30)
        ind_readiness = (q9 + q10) if (pd.notna(q9) and pd.notna(q10)) else np.nan

        q11 = get_score(safe_get(r, 'q11'), 'ruang keluarga', 'sudut ruangan', 'kasur', 30, 50, 10)
        q12 = get_score(safe_get(r, 'q12'), 'menghadap ke atas', 'dalam laci', 'dibalik', 10, 50, 30)
        env_score = (q11 + q12) if (pd.notna(q11) and pd.notna(q12)) else np.nan
        study_env = ('Kondusif' if env_score >= 80 else ('Cukup Kondusif' if env_score >= 50 else 'Kurang Kondusif')) if pd.notna(env_score) else np.nan

        q13 = get_score(safe_get(r, 'q13'), 'sekarang juga', 'memaksakan diri', 'buku catatan', 10, 30, 50)
        q14 = get_score(safe_get(r, 'q14'), 'multitasking', 'membalas obrolan', 'dijauhkan', 10, 30, 50)
        time_mgmt = (q13 + q14) if (pd.notna(q13) and pd.notna(q14)) else np.nan

        q15 = get_score(safe_get(r, 'q15'), 'tunda', 'finansial', 'sensasi', 20, 60, 100)
        motivasi = q15 if pd.notna(q15) else np.nan

        q16 = get_score(safe_get(r, 'q16'), 'toilet', 'menyiapkan alat', 'acak', 30, 5, 15)
        q17 = get_score(safe_get(r, 'q17'), 'mengiyakan', 'simulasi tekanan', 'berlebihan', 20, 10, 35)
        q18 = get_score(safe_get(r, 'q18'), 'menghibur diri', 'salah jurusan', 'referensi', 20, 35, 10)
        stress_sum = (q16 + q17 + q18) if (pd.notna(q16) and pd.notna(q17) and pd.notna(q18)) else np.nan
        stress_lvl = ('Berat' if stress_sum >= 80 else ('Sedang' if stress_sum >= 50 else 'Rendah')) if pd.notna(stress_sum) else np.nan

        rows.append({
            'nisn': nisn_str,
            'nama_siswa': nama,
            'email': email,
            'gender': gender,
            'jurusan': jurusan,
            'nilai_rata_rata_raport': nilai_raport,
            'presentase_kehadiran': kehadiran,
            'libur_tanpa_keterangan': kehadiran_efektif,
            'skor_skill_level': skor_skill,
            'jam_belajar_per_hari': j_belajar,
            'jam_tidur': j_tidur,
            'screen_time': s_time,
            'pendidikan_terakhir_orang_tua': pend_ortu,
            'rata_rata_pemasukan_keluarga': pemasukan,
            'kerja_sampingan': kerja_sampingan,
            'kompetensi_skill_level': kompetensi,
            'industry_readiness': ind_readiness,
            'study_environment': study_env,
            'skor_time_management': time_mgmt,
            'motivasi_akademik': motivasi,
            'stress_level': stress_lvl
        })

    df_clean = pd.DataFrame(rows)

    # Drop baris yang tidak memiliki target raport
    df_clean = df_clean.dropna(subset=['nilai_rata_rata_raport']).reset_index(drop=True)

    # 4. TAHAP 2: NORMALISASI WAKTU 24 JAM PADA DATA TERISI
    print("\n[*] Tahap 2: Normalisasi waktu (jam belajar + tidur + screen time <= 24 jam)...")
    for tcol in ['jam_belajar_per_hari', 'jam_tidur', 'screen_time']:
        med_val = df_clean[tcol].median()
        # Jika responden mengisi kuesioner tapi ada 1 kolom waktu kosong, isi median
        mask = df_clean['industry_readiness'].notna() & df_clean[tcol].isna()
        df_clean.loc[mask, tcol] = med_val

    # Penskalaan proporsional jika total waktu > 24 jam
    for idx in df_clean.index:
        jb = df_clean.at[idx, 'jam_belajar_per_hari']
        jt = df_clean.at[idx, 'jam_tidur']
        st = df_clean.at[idx, 'screen_time']
        if pd.notna(jb) and pd.notna(jt) and pd.notna(st):
            tot = jb + jt + st
            if tot > 24 and tot > 0:
                scale = 24.0 / tot
                df_clean.at[idx, 'jam_belajar_per_hari'] = round(jb * scale, 2)
                df_clean.at[idx, 'jam_tidur'] = round(jt * scale, 2)
                df_clean.at[idx, 'screen_time'] = round(st * scale, 2)

    # 5. TAHAP 3: SEGMENTASI KELAS TARGET (P10 & P80)
    print("\n[*] Tahap 3: Menghitung persentil target (P10 & P80) untuk pembagian kelas...")
    p10 = np.percentile(df_clean['nilai_rata_rata_raport'], 10)
    p80 = np.percentile(df_clean['nilai_rata_rata_raport'], 80)
    print(f"    - Threshold Beresiko (P10)    : {p10:.2f}")
    print(f"    - Threshold Sangat Aman (P80) : {p80:.2f}")

    def assign_class(score):
        if score <= p10:
            return 'Beresiko'
        elif score >= p80:
            return 'Sangat Aman'
        else:
            return 'Aman'

    df_clean['_class'] = df_clean['nilai_rata_rata_raport'].apply(assign_class)
    print(f"    - Distribusi Kelas:\n{df_clean['_class'].value_counts().to_string()}")

    # 6. TAHAP 4: HITUNG MEAN & MODE DARI DATA YANG SUDAH DINORMALISASI
    print("\n[*] Tahap 4: Menghitung statistik Mean & Mode per kelas dari data bersih...")
    num_cols = [
        'jam_belajar_per_hari', 'jam_tidur', 'screen_time',
        'presentase_kehadiran', 'libur_tanpa_keterangan',
        'industry_readiness', 'skor_time_management',
        'motivasi_akademik', 'skor_skill_level'
    ]
    cat_cols = [
        'pendidikan_terakhir_orang_tua', 'rata_rata_pemasukan_keluarga',
        'kerja_sampingan', 'kompetensi_skill_level',
        'study_environment', 'stress_level'
    ]

    class_stats = {}
    for cls in ['Beresiko', 'Aman', 'Sangat Aman']:
        cls_df = df_clean[df_clean['_class'] == cls]
        stats = {'num': {}, 'cat': {}}
        for col in num_cols:
            valid_s = cls_df[col].dropna()
            stats['num'][col] = valid_s.mean() if len(valid_s) > 0 else df_clean[col].dropna().mean()
        for col in cat_cols:
            valid_s = cls_df[col].dropna()
            stats['cat'][col] = valid_s.mode()[0] if len(valid_s) > 0 else df_clean[col].dropna().mode()[0]
        class_stats[cls] = stats

    for cls in class_stats:
        print(f"\n    [+] Kelas: {cls}")
        print(f"        Jam Belajar: {class_stats[cls]['num']['jam_belajar_per_hari']:.2f} jam | Tidur: {class_stats[cls]['num']['jam_tidur']:.2f} jam | Screen: {class_stats[cls]['num']['screen_time']:.2f} jam")
        print(f"        Industry Readiness: {class_stats[cls]['num']['industry_readiness']:.2f} | Time Mgmt: {class_stats[cls]['num']['skor_time_management']:.2f}")
        print(f"        Kerja Sampingan: {class_stats[cls]['cat']['kerja_sampingan']} | Study Env: {class_stats[cls]['cat']['study_environment']}")

    # 7. TAHAP 5: IMPUTASI MISSING DATA BERBASIS CLASS MEAN & MODE
    print("\n[*] Tahap 5: Mengisi missing data kuesioner dengan Mean & Mode per kelas...")
    missing_count = 0
    for idx in df_clean.index:
        cls = df_clean.at[idx, '_class']
        is_missing_row = False
        for col in num_cols:
            if pd.isna(df_clean.at[idx, col]):
                df_clean.at[idx, col] = round(class_stats[cls]['num'][col], 2)
                is_missing_row = True
        for col in cat_cols:
            if pd.isna(df_clean.at[idx, col]):
                df_clean.at[idx, col] = class_stats[cls]['cat'][col]
                is_missing_row = True
        if is_missing_row:
            missing_count += 1

    print(f"    - Berhasil mengimputasi {missing_count} baris data yang memiliki nilai kuesioner kosong.")

    # Re-verifikasi constraint 24 jam setelah imputasi
    for idx in df_clean.index:
        jb = df_clean.at[idx, 'jam_belajar_per_hari']
        jt = df_clean.at[idx, 'jam_tidur']
        st = df_clean.at[idx, 'screen_time']
        tot = jb + jt + st
        if tot > 24:
            scale = 24.0 / tot
            df_clean.at[idx, 'jam_belajar_per_hari'] = round(jb * scale, 2)
            df_clean.at[idx, 'jam_tidur'] = round(jt * scale, 2)
            df_clean.at[idx, 'screen_time'] = round(st * scale, 2)

    df_clean = df_clean.drop(columns=['_class'])

    # 8. TAHAP 6: SIMPAN OUTPUT KE data_clean.csv
    print(f"\n[*] Tahap 6: Menyimpan hasil data bersih ke: {OUTPUT_CLEAN}")
    df_clean.to_csv(OUTPUT_CLEAN, index=False)
    print(f"    - Dimensi Data Bersih: {df_clean.shape[0]} baris x {df_clean.shape[1]} kolom")
    print(f"    - Sisa Missing Values: {df_clean.isna().sum().sum()} (100% Bersih & Valid)")

    print("\n" + "=" * 70)
    print("PIPELINE SELESAI DENGAN SUKSES!")
    print("=" * 70)
    return df_clean

if __name__ == '__main__':
    run_pipeline()