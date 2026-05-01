import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# ----------------------------
# Shared hyperparameters (keep in sync with ml_service.py RF_PARAMS)
# ----------------------------
RF_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "random_state": 42
}

# ----------------------------
# STEP 1: Load dataset
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # points to ml/ folder
DATA_PATH = os.path.join(BASE_DIR, "team_training_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "team_random_forest.pkl")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

data = pd.read_csv(DATA_PATH)

REQUIRED_COLUMNS = [
    "avg_team_strength", "coding_avg", "design_avg",
    "communication_avg", "leadership_avg", "reliability_avg",
    "actual_performance_score"
]

missing = [col for col in REQUIRED_COLUMNS if col not in data.columns]
if missing:
    raise ValueError(f"Missing columns in training data: {missing}")

# ----------------------------
# STEP 2: Prepare features & target
# ----------------------------
X = data[[
    "avg_team_strength",
    "coding_avg",
    "design_avg",
    "communication_avg",
    "leadership_avg",
    "reliability_avg"
]]

# Scale target to 0–1 (must match retrain logic in ml_service.py)
y = data["actual_performance_score"] / 10

# ----------------------------
# STEP 3: Split data
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ----------------------------
# STEP 4: Train model
# ----------------------------
model = RandomForestRegressor(**RF_PARAMS)
model.fit(X_train, y_train)

# ----------------------------
# STEP 5: Evaluate
# ----------------------------
y_pred = model.predict(X_test)
y_pred = np.clip(y_pred, 0, 1)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"✅ Training complete")
print(f"   MAE  : {mae:.4f}")
print(f"   R²   : {r2:.4f}")

# ----------------------------
# STEP 6: Save model
# ----------------------------
joblib.dump(model, MODEL_PATH)
print(f"✅ Model saved to {MODEL_PATH}")