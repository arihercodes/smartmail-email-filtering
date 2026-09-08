import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score


INPUT_FILE = "enron_labeled.csv"

print("Loading labeled dataset...")

df = pd.read_csv(INPUT_FILE)

df["Subject"] = df["Subject"].fillna("")
df["Message"] = df["Message"].fillna("")

# Combine subject + body
df["text"] = (
    df["Subject"].astype(str)
    + " "
    + df["Message"].astype(str)
)

X = df["text"]
y = df["category"]


# --------------------------------------------------
# Train / test split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining emails:", len(X_train))
print("Testing emails:", len(X_test))


# --------------------------------------------------
# TF-IDF
# --------------------------------------------------

print("\nCreating TF-IDF features...")

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    max_features=100000,
    ngram_range=(1, 2),
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print(
    "Training feature matrix:",
    X_train_tfidf.shape
)


# --------------------------------------------------
# Logistic Regression
# --------------------------------------------------

print("\nTraining Logistic Regression...")

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(
    X_train_tfidf,
    y_train
)


# --------------------------------------------------
# Evaluation
# --------------------------------------------------

predictions = model.predict(
    X_test_tfidf
)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n==============================")
print("MODEL PERFORMANCE")
print("==============================")

print(
    f"\nAccuracy: {accuracy:.4f}"
)

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# --------------------------------------------------
# Save model
# --------------------------------------------------

joblib.dump(
    model,
    "smartmail_model.pkl"
)

joblib.dump(
    vectorizer,
    "tfidf_vectorizer.pkl"
)

print("\nModel saved:")
print("smartmail_model.pkl")
print("tfidf_vectorizer.pkl")