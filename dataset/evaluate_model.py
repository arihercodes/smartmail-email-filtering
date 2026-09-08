import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ==========================================
# LOAD DATASET
# ==========================================

print("Loading dataset...")

df = pd.read_csv("enron_labeled.csv")

df["Subject"] = df["Subject"].fillna("")
df["Message"] = df["Message"].fillna("")
df["From"] = df["From"].fillna("")

df["text"] = (
    df["Subject"].astype(str)
    + " "
    + df["Message"].astype(str)
)

X = df["text"]
y = df["category"]


# ==========================================
# SAME TRAIN/TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==========================================
# LOAD MODEL
# ==========================================

print("Loading trained model...")

model = joblib.load("smartmail_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")


# ==========================================
# PREDICT TEST SET
# ==========================================

print("Generating predictions...")

X_test_tfidf = vectorizer.transform(X_test)

predictions = model.predict(X_test_tfidf)

probabilities = model.predict_proba(X_test_tfidf)

confidence = probabilities.max(axis=1)


# ==========================================
# ACCURACY
# ==========================================

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n================================")
print("FINAL MODEL EVALUATION")
print("================================")

print(f"\nTest Accuracy: {accuracy * 100:.2f}%")


# ==========================================
# CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ==========================================
# CONFUSION MATRIX
# ==========================================

labels = sorted(y_test.unique())

cm = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

cm_df = pd.DataFrame(
    cm,
    index=labels,
    columns=labels
)

print("\nConfusion Matrix:\n")
print(cm_df)

cm_df.to_csv("confusion_matrix.csv")


# ==========================================
# CREATE ERROR ANALYSIS DATASET
# ==========================================

test_indices = X_test.index

error_analysis = pd.DataFrame({

    "Message-ID": df.loc[
        test_indices,
        "Message-ID"
    ].values,

    "Subject": df.loc[
        test_indices,
        "Subject"
    ].values,

    "From": df.loc[
        test_indices,
        "From"
    ].values,

    "Actual": y_test.values,

    "Predicted": predictions,

    "Confidence": confidence
})


# Keep only incorrect predictions

errors = error_analysis[
    error_analysis["Actual"]
    != error_analysis["Predicted"]
].copy()


# ==========================================
# SORT BY CONFIDENCE
# ==========================================

errors = errors.sort_values(
    "Confidence",
    ascending=False
)


# ==========================================
# SAVE
# ==========================================

errors.to_csv(
    "error_analysis.csv",
    index=False
)

print("\n================================")
print("ERROR ANALYSIS")
print("================================")

print(
    f"\nTotal incorrect predictions: {len(errors)}"
)

print("\nTop 20 errors:\n")

print(
    errors.head(20).to_string(
        index=False
    )
)

print(
    "\nSaved: error_analysis.csv"
)