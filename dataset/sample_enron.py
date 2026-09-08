import pandas as pd
import json

# Load Enron dataset
df = pd.read_csv("enron.csv")

print("Total emails:", len(df))

# Take 100 random emails
sample = df.sample(
    n=min(100, len(df)),
    random_state=42
)

# Convert Enron format to SmartMail format
emails = []

for _, row in sample.iterrows():

    emails.append({
        "sender": str(row.get("From", "")),
        "subject": str(row.get("Subject", "")),
        "body": str(row.get("Message", ""))
    })


# Save as JSON
with open("emails.json", "w", encoding="utf-8") as f:

    json.dump(
        emails,
        f,
        indent=2,
        ensure_ascii=False
    )


print("Created emails.json")
print("Emails converted:", len(emails))