import pandas as pd
import re

print("Loading Enron dataset...")

# =========================================================
# 1. LOAD DATA
# =========================================================

df = pd.read_csv("enron.csv")

print(f"Total emails: {len(df)}")

df["Subject"] = df["Subject"].fillna("").astype(str)
df["Message"] = df["Message"].fillna("").astype(str)
df["From"] = df["From"].fillna("").astype(str)

df["text"] = (
    df["Subject"] + " " + df["Message"]
).str.lower()

df["subject_lower"] = df["Subject"].str.lower()
df["sender_lower"] = df["From"].str.lower()


# =========================================================
# 2. CATEGORY RULES
# =========================================================
#
# Strong phrase = 5 points
# Normal phrase = 2 points
#
# We deliberately avoid very generic words such as:
# "account", "order", "job", "market", etc. unless
# accompanied by stronger context.
# =========================================================

RULES = {

    "Career": {
        "strong": [
            "job interview",
            "interview invitation",
            "interview schedule",
            "interview process",
            "job offer",
            "employment offer",
            "job application",
            "career opportunity",
            "career opportunities",
            "job opening",
            "employment opportunity",
            "recruiting",
            "recruitment",
            "hiring process",
            "hiring manager",
            "candidate for",
            "resume attached",
            "cv attached",
            "internship opportunity",
            "internship position"
        ],
        "normal": [
            "interview",
            "recruiter",
            "recruitment",
            "hiring",
            "career",
            "employment",
            "candidate",
            "applicant",
            "resume",
            "curriculum vitae",
            "internship",
            "vacancy",
            "job opening",
            "job posting"
        ]
    },

    "Education": {
        "strong": [
            "course registration",
            "course enrollment",
            "class schedule",
            "exam schedule",
            "exam results",
            "assignment deadline",
            "lecture notes",
            "university admission",
            "college admission",
            "student registration",
            "academic year",
            "academic program",
            "degree program",
            "school admission"
        ],
        "normal": [
            "university",
            "college",
            "student",
            "professor",
            "teacher",
            "course",
            "class",
            "lecture",
            "exam",
            "assignment",
            "homework",
            "grade",
            "grades",
            "academic",
            "semester",
            "campus",
            "tuition",
            "scholarship",
            "admission",
            "enrollment"
        ]
    },

    "Finance": {
        "strong": [
            "bank statement",
            "credit card statement",
            "account statement",
            "wire transfer",
            "bank transfer",
            "payment confirmation",
            "payment received",
            "payment due",
            "invoice",
            "financial statement",
            "stock market",
            "stock price",
            "share price",
            "investment account",
            "transaction alert",
            "account balance",
            "fund transfer",
            "financial report",
            "quarterly earnings",
            "profit and loss"
        ],
        "normal": [
            "banking",
            "bank",
            "invoice",
            "billing",
            "credit card",
            "debit card",
            "transaction",
            "transfer",
            "investment",
            "investor",
            "stock",
            "stocks",
            "financial",
            "finance",
            "loan",
            "tax",
            "budget",
            "revenue",
            "profit",
            "earnings"
        ]
    },

    "Shopping": {
        "strong": [
            "order confirmation",
            "order shipped",
            "order has shipped",
            "shipping confirmation",
            "delivery confirmation",
            "track your order",
            "order status",
            "purchase confirmation",
            "shopping cart",
            "tracking number",
            "your package",
            "package delivery"
        ],
        "normal": [
            "shipping",
            "shipped",
            "delivery",
            "delivered",
            "package",
            "tracking number",
            "purchase",
            "purchased",
            "shopping",
            "shopping cart",
            "checkout",
            "retailer",
            "retail store",
            "product catalog"
        ]
    },

    "Promotion": {
        "strong": [
            "limited time offer",
            "special offer",
            "exclusive offer",
            "exclusive deal",
            "limited time",
            "huge savings",
            "free shipping",
            "buy one get one",
            "discount code",
            "promo code",
            "coupon code",
            "sale ends",
            "flash sale",
            "special promotion",
            "save up to"
        ],
        "normal": [
            "offer",
            "deal",
            "discount",
            "coupon",
            "promo",
            "promotion",
            "sale",
            "savings",
            "special offer",
            "exclusive",
            "percent off",
            "% off",
            "marketing",
            "advertising",
            "advertisement"
        ]
    },

    "Newsletter": {
        "strong": [
            "weekly newsletter",
            "monthly newsletter",
            "daily newsletter",
            "newsletter",
            "news digest",
            "weekly digest",
            "monthly digest",
            "unsubscribe from this",
            "unsubscribe here"
        ],
        "normal": [
            "newsletter",
            "digest",
            "unsubscribe",
            "news update",
            "news updates",
            "weekly report",
            "monthly report",
            "daily news",
            "bulletin",
            "edition"
        ]
    },

    "Security": {
        "strong": [
            "security alert",
            "security warning",
            "suspicious login",
            "suspicious activity",
            "unusual activity",
            "new login",
            "new sign in",
            "password reset",
            "password changed",
            "account compromised",
            "verify your account",
            "two factor authentication",
            "two-factor authentication",
            "two step verification",
            "unauthorized access",
            "security notification"
        ],
        "normal": [
            "security",
            "login",
            "sign in",
            "password",
            "authentication",
            "verification",
            "verify your account",
            "suspicious",
            "unauthorized",
            "privacy",
            "credentials",
            "phishing",
            "account security",
            "security update"
        ]
    },

    "Social": {
        "strong": [
            "birthday party",
            "birthday invitation",
            "party invitation",
            "social event",
            "wedding invitation",
            "dinner invitation",
            "lunch invitation",
            "happy birthday",
            "happy anniversary",
            "let's party",
            "girls' weekend",
            "boys' weekend"
        ],
        "normal": [
            "party",
            "birthday",
            "wedding",
            "invitation",
            "dinner",
            "lunch",
            "celebration",
            "celebrate",
            "congratulations",
            "congrats",
            "weekend",
            "vacation",
            "holiday",
            "friends",
            "family",
            "gathering"
        ]
    }
}


# =========================================================
# 3. SENDER SIGNALS
# =========================================================

def get_sender_boost(sender):

    boosts = {
        "Career": 0,
        "Education": 0,
        "Finance": 0,
        "Shopping": 0,
        "Promotion": 0,
        "Newsletter": 0,
        "Security": 0,
        "Social": 0
    }

    # Career
    if any(x in sender for x in [
        "recruiter",
        "recruiting",
        "recruitment",
        "recruit",
        "hr@",
        "humanresources"
    ]):
        boosts["Career"] += 4

    # Finance
    if any(x in sender for x in [
        "bank",
        "financial",
        "finance",
        "billing",
        "accounting"
    ]):
        boosts["Finance"] += 4

    # Shopping
    if any(x in sender for x in [
        "amazon",
        "ebay",
        "walmart",
        "orders@",
        "shipping"
    ]):
        boosts["Shopping"] += 4

    # Newsletter
    if any(x in sender for x in [
        "newsletter",
        "digest",
        "news"
    ]):
        boosts["Newsletter"] += 4

    # Security
    if any(x in sender for x in [
        "security",
        "alert"
    ]):
        boosts["Security"] += 4

    # Social
    if any(x in sender for x in [
        "linkedin",
        "facebook",
        "twitter",
        "instagram"
    ]):
        boosts["Social"] += 4

    return boosts


# =========================================================
# 4. CLASSIFY EMAIL
# =========================================================

def classify_email(text, subject, sender):

    scores = {
        category: 0
        for category in RULES
    }

    # -----------------------------------------------------
    # Keyword scoring
    # -----------------------------------------------------

    for category, rules in RULES.items():

        # Strong phrases
        for phrase in rules["strong"]:
            if phrase in text:
                scores[category] += 5

        # Normal phrases
        for phrase in rules["normal"]:

            # Use word boundaries for short words
            if len(phrase) <= 5:

                if re.search(
                    r"\b" + re.escape(phrase) + r"\b",
                    text
                ):
                    scores[category] += 2

            else:

                if phrase in text:
                    scores[category] += 2

    # -----------------------------------------------------
    # Sender information
    # -----------------------------------------------------

    sender_boosts = get_sender_boost(sender)

    for category, boost in sender_boosts.items():
        scores[category] += boost

    # -----------------------------------------------------
    # SUBJECT BOOST
    # -----------------------------------------------------
    #
    # Subject is generally more informative than body text.
    # Give an additional point when a strong phrase appears
    # directly in the subject.
    # -----------------------------------------------------

    for category, rules in RULES.items():

        for phrase in rules["strong"]:
            if phrase in subject:
                scores[category] += 2

    # -----------------------------------------------------
    # SPECIAL SECURITY OVERRIDE
    # -----------------------------------------------------

    security_terms = [
        "password reset",
        "password changed",
        "suspicious login",
        "suspicious activity",
        "unauthorized access",
        "security alert",
        "security warning",
        "new login",
        "new sign in",
        "verify your account"
    ]

    if any(term in text for term in security_terms):
        scores["Security"] += 5

    # -----------------------------------------------------
    # SPECIAL NEWSLETTER OVERRIDE
    # -----------------------------------------------------

    newsletter_terms = [
        "newsletter",
        "unsubscribe",
        "weekly digest",
        "monthly digest",
        "news digest"
    ]

    if any(term in text for term in newsletter_terms):
        scores["Newsletter"] += 3

    # -----------------------------------------------------
    # SPECIAL SOCIAL OVERRIDE
    # -----------------------------------------------------

    social_terms = [
        "birthday party",
        "birthday invitation",
        "party invitation",
        "wedding invitation",
        "girls' weekend",
        "boys' weekend",
        "let's party"
    ]

    if any(term in text for term in social_terms):
        scores["Social"] += 4

    # -----------------------------------------------------
    # SELECT CATEGORY
    # -----------------------------------------------------

    sorted_scores = sorted(
        scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    best_category, best_score = sorted_scores[0]
    second_category, second_score = sorted_scores[1]

    # -----------------------------------------------------
    # FALLBACK TO OTHER
    # -----------------------------------------------------

    # Almost no evidence
    if best_score < 2:
        return "Other"

    # If evidence is weak and categories are tied/close,
    # avoid forcing a category.
    if best_score <= 4 and best_score - second_score <= 1:
        return "Other"

    return best_category


# =========================================================
# 5. CREATE LABELS
# =========================================================

print("Creating improved labels...")

df["category"] = [
    classify_email(text, subject, sender)
    for text, subject, sender in zip(
        df["text"],
        df["subject_lower"],
        df["sender_lower"]
    )
]


# =========================================================
# 6. SAVE
# =========================================================

output_columns = [
    "Message-ID",
    "Date",
    "From",
    "To",
    "Subject",
    "Message",
    "Cc",
    "Bcc",
    "category"
]

df[output_columns].to_csv(
    "enron_labeled.csv",
    index=False
)


# =========================================================
# 7. DISPLAY RESULTS
# =========================================================

print("\nDone!")
print("Created: enron_labeled.csv")

print("\nCategory distribution:")
print(df["category"].value_counts())

print("\nPercentage distribution:")
print(
    (df["category"].value_counts(normalize=True) * 100)
    .round(2)
)