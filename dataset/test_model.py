import joblib


# Load trained model
model = joblib.load(
    "smartmail_model.pkl"
)

vectorizer = joblib.load(
    "tfidf_vectorizer.pkl"
)


print("SmartMail ML classifier")
print("========================")


while True:

    subject = input(
        "\nEnter email subject (or 'exit'): "
    )

    if subject.lower() == "exit":
        break

    body = input(
        "Enter email body: "
    )

    text = subject + " " + body

    features = vectorizer.transform(
        [text]
    )

    prediction = model.predict(
        features
    )[0]

    probabilities = model.predict_proba(
        features
    )[0]

    classes = model.classes_

    confidence = max(probabilities)

    print("\nPredicted category:", prediction)

    print(
        f"Confidence: {confidence * 100:.2f}%"
    )