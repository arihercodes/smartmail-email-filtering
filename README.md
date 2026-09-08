# SmartMail – Email Filtering

SmartMail is an AI-powered Chrome extension that classifies Gmail emails into meaningful categories and displays the predicted category directly inside the Gmail inbox.

The project combines **Machine Learning, FastAPI, and Chrome Extension APIs** to provide real-time email classification and inbox organization.

---

## Features

* AI-based email classification
* Automatic Gmail inbox scanning
* Category labels displayed directly before the sender
* Different colors for different email categories
* Real-time predictions through a FastAPI backend
* Automatically detects newly loaded Gmail emails
* TF-IDF based text feature extraction
* Logistic Regression classification model
* Chrome Extension + FastAPI integration

### Supported Categories

SmartMail currently classifies emails into 9 categories:

| Category      | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| 💼 Career     | Jobs, interviews, recruitment and career opportunities      |
| 🎓 Education  | Courses, academic content and learning                      |
| 💰 Finance    | Banking, payments and financial notifications               |
| 📰 Newsletter | Newsletters and informational subscriptions                 |
| 📌 Other      | Emails that do not fit another category                     |
| 📢 Promotion  | Marketing and promotional emails                            |
| 🔐 Security   | Login alerts, security notifications and account protection |
| 🛒 Shopping   | Orders, deliveries and shopping-related emails              |
| 👥 Social     | Social networking and social communications                 |

---

## System Architecture

```text
                Gmail Inbox
                    │
                    ▼
          Chrome Extension
             content.js
                    │
                    │ Subject + Sender + Preview
                    ▼
             FastAPI Backend
                /predict
                    │
                    ▼
             TF-IDF Vectorizer
                    │
                    ▼
          Logistic Regression
                    │
                    ▼
          Category + Confidence
                    │
                    ▼
          Gmail Category Label
```

---

## Machine Learning Pipeline

The machine learning component uses the following pipeline:

```text
Enron Email Dataset
        ↓
Email preprocessing
        ↓
Rule-based weak labeling
        ↓
TF-IDF feature extraction
        ↓
Train/Test split
        ↓
Logistic Regression
        ↓
Model evaluation
        ↓
Saved model + vectorizer
        ↓
FastAPI inference API
```

### Feature Extraction

TF-IDF is used to convert email text into numerical features.

Configuration:

```python
TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    max_features=100000,
    ngram_range=(1, 2),
    min_df=2
)
```

### Classification Model

The classifier is a Logistic Regression model with balanced class weights:

```python
LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)
```

---

## Model Performance

The model was evaluated on a held-out test set containing **103,481 emails**.

| Metric      |      Score |
| ----------- | ---------: |
| Accuracy    | **86.56%** |
| Macro F1    |   **0.84** |
| Weighted F1 |   **0.87** |

The training dataset contains **517,401 Enron emails**.

### Classification Report

| Category   | Precision | Recall | F1 Score |
| ---------- | --------: | -----: | -------: |
| Career     |      0.75 |   0.95 |     0.84 |
| Education  |      0.71 |   0.95 |     0.81 |
| Finance    |      0.81 |   0.90 |     0.85 |
| Newsletter |      0.78 |   0.96 |     0.86 |
| Other      |      0.97 |   0.82 |     0.89 |
| Promotion  |      0.74 |   0.92 |     0.82 |
| Security   |      0.75 |   0.97 |     0.84 |
| Shopping   |      0.65 |   0.95 |     0.77 |
| Social     |      0.81 |   0.94 |     0.87 |

> **Note:** The Enron dataset does not originally contain these nine categories. The categories were generated using rule-based weak labeling. Therefore, the reported evaluation measures performance against these generated labels rather than independently human-annotated email categories.

---

## Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* TF-IDF
* Logistic Regression
* Joblib

### Backend

* FastAPI
* Uvicorn
* Python

### Browser Extension

* JavaScript
* HTML
* CSS
* Chrome Extension Manifest V3
* Gmail DOM integration

---

## Project Structure

```text
smartmail-email-filtering/
│
├── api/
│   └── api.py
│
├── dataset/
│   ├── create_labels.py
│   ├── evaluate_model.py
│   ├── inspect_errors.py
│   ├── sample_enron.py
│   ├── test_model.py
│   └── train_model.py
│
├── classifier.js
├── content.js
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
├── .gitignore
└── README.md
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/arihercodes/smartmail-email-filtering.git
cd smartmail-email-filtering
```

### 2. Install Python dependencies

```bash
pip install fastapi uvicorn pandas numpy scikit-learn joblib
```

### 3. Prepare the dataset

Place the Enron dataset inside:

```text
dataset/
```

The dataset is intentionally **not included in this repository** because of its size.

### 4. Generate labels

```bash
python dataset/create_labels.py
```

### 5. Train the model

```bash
python dataset/train_model.py
```

This generates:

```text
smartmail_model.pkl
tfidf_vectorizer.pkl
```

inside the `dataset` directory.

### 6. Evaluate the model

```bash
python dataset/evaluate_model.py
```

---

## Running the FastAPI Backend

From the project root:

```bash
cd api
uvicorn api:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

You can verify that the server is running by opening:

```text
http://127.0.0.1:8000/
```

The prediction endpoint is:

```text
POST /predict
```

Example request:

```json
{
  "subject": "Interview Invitation",
  "body": "We would like to invite you for an interview."
}
```

Example response:

```json
{
  "category": "Career",
  "confidence": 0.99
}
```

---

## Loading the Chrome Extension

1. Start the FastAPI backend.

2. Open Google Chrome.

3. Navigate to:

```text
chrome://extensions/
```

4. Enable **Developer mode**.

5. Click **Load unpacked**.

6. Select the project folder:

```text
smartmail-email-filtering/
```

7. Open Gmail.

SmartMail automatically scans the Gmail inbox and sends email information to the FastAPI backend for classification.

The predicted category is displayed directly in the Gmail inbox.

---

## Gmail Integration

SmartMail displays category labels before the sender.

Example:

```text
[CAREER]    Google Careers       Interview invitation
[FINANCE]   HDFC Bank             Payment confirmation
[SECURITY]  Microsoft             New login detected
[SHOPPING]  Amazon                Your order has been shipped
```

Each category uses a different color to make the inbox easier to scan visually.

---

## Privacy

SmartMail is currently designed as a local prototype.

Email classification requests are sent to a locally running FastAPI server:

```text
127.0.0.1:8000
```

No external email-processing server is required for the current implementation.

The Enron dataset and generated model artifacts are excluded from the GitHub repository using `.gitignore`.

---

## Current Limitations

* The current Gmail integration uses the email subject, sender and inbox preview.
* Full email-body classification is not yet implemented.
* The model is trained using weakly generated labels.
* Gmail DOM selectors may require updates if Gmail changes its interface.
* The FastAPI backend currently needs to be running locally.
* The trained model files are generated locally rather than distributed through the repository.

---

## Future Improvements

* [ ] Classify complete email bodies
* [ ] Improve Gmail-native label styling
* [ ] Add email priority/importance detection
* [ ] Add confidence threshold and "Uncertain" category
* [ ] Batch API predictions for faster inbox processing
* [ ] Improve classification using stronger NLP models
* [ ] Add personalized classification
* [ ] Add inbox filtering and sorting
* [ ] Deploy the backend
* [ ] Add automated tests
* [ ] Add project demo/screenshots

---

## Project Status

**Current Status: Active Development**

The current version successfully demonstrates an end-to-end pipeline:

```text
Dataset
   ↓
Weak Labeling
   ↓
Machine Learning
   ↓
Model Evaluation
   ↓
FastAPI API
   ↓
Chrome Extension
   ↓
Gmail Inbox Classification
```

---

## Author

**Ariana Rahman**

Computer Science Engineering
BITS Pilani

GitHub: [@arihercodes](https://github.com/arihercodes)

---

## Acknowledgements

The initial dataset used for experimentation is based on the **Enron Email Dataset**, which is widely used for research and experimentation in email analysis and natural language processing.
