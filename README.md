# 🏥 MediCare – Advanced University Medical & Emergency Management System

MediCare is a comprehensive, enterprise-level medical center management system designed for universities and large healthcare facilities. It features a modern SaaS-style UI with a "military-medical" glassmorphism theme, built to handle everything from student registrations to AI-powered diagnosis.

## ✨ Features

- **🛡️ Multi-Portal Access**: Dedicated portals for Admins, Doctors, Students, and Pharmacists.
- **🧠 AI Diagnostic Assistant**: Python-powered disease prediction using RandomForest regression and fuzzy symptom matching.
- **📅 Appointment Management**: Real-time scheduling and tracking of medical consultations.
- **💊 Pharmacy & Inventory**: Comprehensive medicine inventory tracking with demand prediction.
- **🚑 Emergency Services**: Ambulance tracking and emergency alert system.
- **📊 Health Analytics**: Real-time trends and risk assessment dashboards.
- **🔒 Secure Auth**: JWT-based authentication with role-based access control.

## 🏗️ Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Radix UI.
- **Backend**: Node.js, Express.
- **Database**: MongoDB.
- **ML Service**: Python, Flask, Scikit-learn, Pandas.
- **Utilities**: Axios, Mongoose, JWT, FuzzyWuzzy.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally on port 27017)

### Installation

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd MediCare
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Configure .env with your MONGO_URI and JWT_SECRET
   npm run dev
   ```

3. **Setup ML Service**:
   ```bash
   cd ml-service
   # Create and activate a virtual environment
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

4. **Setup Frontend**:
   ```bash
   # From the root directory
   npm install
   npm run dev
   ```

## 🎥 Demo Access

For demonstration purposes, you can use the built-in demo buttons on the login page:
- **Student Dashboard**: Access medical records, appointments, and AI diagnostics.
- **Doctor Portal**: Manage consultations and prescriptions.
- **Admin Panel**: System-wide oversight and analytics.

---

*Developed for Advanced University Medical & Emergency Management.*