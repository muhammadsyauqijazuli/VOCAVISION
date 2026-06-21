ALTER TABLE students ADD COLUMN jurusan ENUM('TKJ','TAV','TPTU','MULTIMEDIA') DEFAULT NULL;
ALTER TABLE predictions MODIFY risk_status ENUM('Sangat Beresiko','Beresiko','Aman') NOT NULL;
ALTER TABLE predictions ALTER COLUMN model_version SET DEFAULT '3.0.0';
ALTER TABLE shap_analysis MODIFY feature_name VARCHAR(100) NOT NULL;
