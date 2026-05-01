# 🤖 AI Team Analyzer

> ML-powered team compatibility and performance analysis platform for academic environments.

AI Team Analyzer uses a **Random Forest** machine learning model to predict team compatibility, generate balanced project groups, and provide actionable growth insights — all through a modern, role-based dashboard.

---

## ✨ Features

### 👨‍🎓 Students
- **Personal Dashboard** — Skill scores, radar charts, and performance index
- **ML Compatibility Check** — Predict synergy with any classmate using the ML engine
- **Team ML Score** — View your team's AI-predicted compatibility score
- **Growth Suggestions** — AI-generated improvement plan based on weakest skills
- **Profile Management** — Update skills and attributes that feed the ML model

### 👩‍🏫 Teachers
- **AI Team Generation** — Algorithmic snake-draft distribution based on skill weights
- **Performance Feedback** — Submit scored evaluations that retrain the ML model
- **Team History** — Browse all generated team batches with detailed analytics
- **Model Accuracy** — Track prediction error rates and model performance
- **Compatibility Checker** — Check compatibility between any two students

### 🔐 Admin
- **System Overview** — Platform-wide stats (users, teams, feedback count)
- **User Management** — Ban/Unban users with confirmation flow
- **Model Monitoring** — Monitor ML prediction accuracy and trigger retraining

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS 3, Framer Motion, Recharts, Lucide Icons |
| **Backend** | FastAPI, Pydantic v2, Motor (async MongoDB driver) |
| **Database** | MongoDB Atlas |
| **ML Model** | scikit-learn (Random Forest Regressor) |
| **Auth** | JWT (python-jose) + bcrypt password hashing |
| **Architecture** | Role-based access control (Student / Teacher / Admin) |

---

## 📁 Project Structure

```
ai-team-analyzer/
├── app/                        # Backend (FastAPI)
│   ├── main.py                 # App entry point + lifespan
│   ├── config.py               # Environment settings (Pydantic)
│   ├── database.py             # MongoDB connection + indexes
│   ├── auth.py                 # JWT + password utilities
│   ├── dependencies.py         # Auth guards + ObjectId validation
│   ├── models.py               # Pydantic schemas (UserRole enum)
│   ├── ml_service.py           # Thread-safe ML model management
│   ├── compatibility.py        # Compatibility calculation engine
│   ├── create_admin.py         # CLI script to seed admin user
│   ├── routes/
│   │   ├── auth.py             # Login / Register endpoints
│   │   ├── profile.py          # Profile update
│   │   ├── student.py          # Student dashboard + team APIs
│   │   ├── teacher.py          # Team generation + feedback
│   │   └── admin.py            # Admin overview + user management
│   └── services/
│       └── team_service.py     # Team generation algorithm
├── ml/                         # ML artifacts
│   ├── team_model.pkl          # Trained model (auto-generated)
│   └── team_training_data.csv  # Training dataset
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance + interceptors
│   │   ├── context/            # AuthContext, SidebarContext
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Role-based page views
│   │   └── routes/             # AppRoutes with ProtectedRoute
│   ├── package.json
│   └── vite.config.js
├── .env.example                # Environment template
├── .gitignore
├── requirements.txt            # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **MongoDB Atlas** account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/jatinverma023/ai-team-analyzer.git
cd ai-team-analyzer
```

### 2. Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and a secure JWT secret
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend (from project root)
source venv/bin/activate
uvicorn app.main:app --reload
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

### 5. Create Admin User (Optional)

```bash
source venv/bin/activate
python -m app.create_admin
```

---

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `JWT_SECRET` | 64-char hex secret for token signing | `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `60` |

---

## 🧠 ML Pipeline

1. Teachers submit **performance feedback** (scored evaluations) for teams
2. Every **10 feedback entries**, the model auto-retrains in a background thread
3. The **Random Forest Regressor** learns from team skill averages → actual performance
4. Future team generations use the updated model for compatibility predictions

---

## 📄 License

This project is for educational purposes.

---

Built with ❤️ by [Jatin Verma](https://github.com/jatinverma023)
