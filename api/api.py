from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os

app = FastAPI(title="SmartMail ML API")

# Allow Chrome Extension to communicate with API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to trained model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "dataset", "smartmail_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "dataset", "tfidf_vectorizer.pkl")

print("Loading SmartMail model...")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
print("Model loaded successfully!")


class EmailRequest(BaseModel):
    subject: str = ""
    body: str = ""


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "SmartMail ML API is running"
    }


@app.post("/predict")
def predict(email: EmailRequest):

    # Combine subject and body exactly like training
    text = email.subject + " " + email.body

    # Convert text using the SAME TF-IDF vectorizer
    X = vectorizer.transform([text])

    # Predict category
    prediction = model.predict(X)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(X)[0]

    # Highest probability
    confidence = float(max(probabilities))

    return {
        "category": prediction,
        "confidence": round(confidence, 4)
    }