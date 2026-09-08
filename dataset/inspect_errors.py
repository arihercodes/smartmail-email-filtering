import pandas as pd

# Load original labeled dataset
df = pd.read_csv("enron_labeled.csv")

# Load errors
errors = pd.read_csv("classification_errors.csv")

# Merge errors with original email data
merged = errors.merge(
    df[[
        "Message-ID",
        "Subject",
        "From",
        "Message",
        "category"
    ]],
    on="category",
    how="left"
)

# The above merge isn't sufficient to uniquely identify emails,
# so instead inspect category pairs directly from the original dataset.

pairs = [
    ("Finance", "Shopping"),
    ("Career", "Other"),
    ("Shopping", "Promotion"),
    ("Finance", "Promotion"),
    ("Finance", "Other")
]

print("\nTOP ERROR CATEGORIES")
print("====================")

for actual, predicted in pairs:

    print("\n" + "=" * 70)
    print(f"ACTUAL: {actual}  →  PREDICTED: {predicted}")
    print("=" * 70)

    # Load predictions again
    # This will be handled in the next improved evaluator.