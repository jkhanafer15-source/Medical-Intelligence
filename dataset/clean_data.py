import pandas as pd

df = pd.read_csv("mtsamples.csv")


# =========================
# DROP USELESS INDEX COLUMN
# =========================

df = df.drop(columns=["Unnamed: 0"])


# =========================
# DROP DUPLICATES
# =========================

df = df.drop_duplicates()


# =========================
# REMOVE ROWS WITHOUT MEDICAL TEXT
# =========================

df = df.dropna(subset=["transcription"])


# =========================
# FILL OPTIONAL NULL VALUES
# =========================

df["keywords"] = df["keywords"].fillna("")


# =========================
# CHECK RESULT
# =========================

print("Shape:")
print(df.shape)

print("\nNull values:")
print(df.isnull().sum())

print("\nDuplicates:")
print(df.duplicated().sum())


# =========================
# SAVE
# =========================

df.to_csv(
    "medical_transcriptions_clean.csv",
    index=False
)

print("\nClean dataset saved.")