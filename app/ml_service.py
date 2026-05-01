import joblib
import numpy as np
import os
import threading
from bson import ObjectId
from sklearn.ensemble import RandomForestRegressor

# ----------------------------
# Hyperparameters (shared between initial train & retrain)
# ----------------------------
RF_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "random_state": 42
}

# ----------------------------
# Thread-safe model management
# ----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "team_random_forest.pkl")

_model_lock = threading.Lock()
_model = None
_last_model_mtime = 0


def _load_initial_model():
    """Load the model on first import. Falls back to a dummy model."""
    global _model, _last_model_mtime
    try:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
            _last_model_mtime = os.path.getmtime(MODEL_PATH)
        else:
            print(f"⚠️ Model not found at {MODEL_PATH}. Using fallback.")
            _model = RandomForestRegressor(**RF_PARAMS)
            _model.fit(np.zeros((1, 6)), np.zeros(1))
    except Exception as e:
        print(f"❌ Error loading model: {e}. Using fallback.")
        _model = RandomForestRegressor(**RF_PARAMS)
        _model.fit(np.zeros((1, 6)), np.zeros(1))


_load_initial_model()


# ----------------------------
# Get model with hot-reload support (thread-safe)
# ----------------------------
def _get_current_model():
    """Return the current model, reloading from disk if the file changed."""
    global _model, _last_model_mtime
    with _model_lock:
        try:
            if os.path.exists(MODEL_PATH):
                current_mtime = os.path.getmtime(MODEL_PATH)
                if current_mtime > _last_model_mtime:
                    _model = joblib.load(MODEL_PATH)
                    _last_model_mtime = current_mtime
        except Exception as e:
            print(f"Error checking model reload: {e}")
    return _model


# ----------------------------
# Predict team performance score
# ----------------------------
def predict_team_score(team_data: dict) -> float:
    current_model = _get_current_model()
    features = np.array([[
        team_data["avg_team_strength"],
        team_data["coding_avg"],
        team_data["design_avg"],
        team_data["communication_avg"],
        team_data["leadership_avg"],
        team_data["reliability_avg"],
    ]])

    prediction = current_model.predict(features)[0]
    prediction = max(0.0, min(1.0, float(prediction)))
    return round(prediction, 3)


# ----------------------------
# Retrain model after feedback accumulation (called as background task)
# ----------------------------
async def retrain_model(feedback_collection, teams_collection):
    global _model

    feedbacks = await feedback_collection.find().to_list(1000)

    if len(feedbacks) < 10:
        return "Not enough data to retrain (minimum 10 required)"

    X = []
    y = []

    for fb in feedbacks:
        try:
            team_doc = await teams_collection.find_one({
                "_id": ObjectId(fb["team_id"])
            })
        except Exception:
            continue

        if not team_doc:
            continue

        team = next(
            (t for t in team_doc.get("teams", [])
             if t["team_number"] == fb["team_number"]),
            None
        )

        if not team:
            continue

        features = [
            team.get("avg_team_strength", 0),
            team.get("coding_avg", 0),
            team.get("design_avg", 0),
            team.get("communication_avg", 0),
            team.get("leadership_avg", 0),
            team.get("reliability_avg", 0),
        ]

        X.append(features)
        # Scale target to 0–1 to match prediction output range
        y.append(fb["performance_score"] / 10)

    if len(X) < 10:
        return "Insufficient matched data (minimum 10 required)"

    X = np.array(X)
    y = np.array(y)

    new_model = RandomForestRegressor(**RF_PARAMS)
    new_model.fit(X, y)

    with _model_lock:
        joblib.dump(new_model, MODEL_PATH)
        _model = new_model

    return "Model retrained successfully"