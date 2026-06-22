# VOCAVISION - Vocational Student Predictive Analytics

VOCAVISION is a full-stack vocational student predictive analytics platform designed for early risk detection, academic performance forecasting, and targeted intervention.

---

## Architecture Overview

This project consists of two main parts:
- **Frontend**: A modern UI built with Next.js, React, Tailwind CSS, and Recharts.
- **Backend**: A Machine Learning API built with Python (Flask) that powers predictive analytics using a Random Forest model and SHAP explainability. 

## Project Links

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🚀 Quick Start (Frontend)

You'll need Node.js installed. From the root directory:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Quick Start (Backend)

The backend handles the machine learning predictions, database integration (MySQL), and dataset management.

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Setup Virtual Environment & Install Dependencies**:
   ```bash
   python -m venv .venv
   .venv\Scripts\Activate.ps1  # Windows PowerShell
   pip install -r requirements.txt
   ```

3. **Configure Database**:
   Set up your MySQL database and copy the environment variables inside `backend/.env`.

4. **Run the Backend Server**:
   ```bash
   python run.py
   ```
   
> **Note:** For full backend API details, endpoints, and deployment instructions, see the [Backend README](./backend/README.md).

---

## 🔑 Demo Accounts

You can log in to test different role-based views and features:
- **Admin**: `admin@test.com` / `admin`
- **Guru**: `guru@test.com` / `guru`
- **Siswa**: `siswa@test.com` / `siswa`

---

## 🎯 Key Features

### 1. Admin Dashboard
- **User & Dataset Management**: Full CRUD operations for platform users and bulk `.csv`/`.xlsx` student dataset uploads.
- **EDA Analytics**: Real-time Exploratory Data Analysis (EDA) visualizations using interactive charts.

### 2. Teacher (Guru) Dashboard
- **Risk Monitoring**: Sorts and identifies students with high academic risk based on predictive modeling.
- **Targeted Interventions**: Teachers can review SHAP insights for individual students and record custom interventions.

### 3. Student (Siswa) Dashboard
- **Self-Assessment**: Students can update their lifestyle, academic, and behavioral data.
- **Live Prediction & Explanations**: Instant prediction of academic outcomes alongside feature-level insights showing what habits positively or negatively impacted their scores.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15+, React 19, Tailwind CSS v4, Recharts, BetterAuth
- **Backend**: Python 3.11+, Flask, Scikit-Learn (RandomForestClassifier), SHAP, SQLAlchemy
- **Database**: MySQL / MariaDB

---

## 📝 Recent Updates

- **Machine Learning Integration**: Replaced mock data with live Flask API predictions. Risk statuses synchronized to `Sangat Beresiko`, `Aman`, and `Sangat Aman`.
- **SHAP Explanations**: Added SHAP visualization charts for individual students to understand their risk drivers.
- **Repository Hygiene**: Completely cleaned up experimental test scripts, caches, and mock files.
