from pathlib import Path

import pandas as pd

from database import get_db_connection


# =========================================
# PATH
# =========================================

BASE_DIR = Path(
    __file__
).resolve().parent


CSV_PATH = (
    BASE_DIR.parent
    / "dataset"
    / "medical_transcriptions_clean.csv"
)


print("CSV PATH:")
print(CSV_PATH)

print("CSV EXISTS:")
print(CSV_PATH.exists())


# =========================================
# READ CSV
# =========================================

df = pd.read_csv(
    CSV_PATH
)


print("\nROWS IN CSV:")
print(len(df))


print("\nCOLUMNS:")
print(df.columns.tolist())


print("\nFIRST ROW:")
print(df.iloc[0])


# Replace NaN values
df = df.fillna("")


# =========================================
# DATABASE
# =========================================

connection = (
    get_db_connection()
)

cursor = (
    connection.cursor()
)


# Check which database
cursor.execute(
    "SELECT DATABASE()"
)

database_name = (
    cursor.fetchone()
)


print("\nCONNECTED DATABASE:")
print(database_name)


# =========================================
# COUNT BEFORE INSERT
# =========================================

cursor.execute(
    """
    SELECT COUNT(*)
    FROM transcriptions
    """
)

before_count = (
    cursor.fetchone()[0]
)


print("\nROWS BEFORE INSERT:")
print(before_count)


# =========================================
# INSERT
# =========================================

query = """
INSERT INTO transcriptions
(
    sample_name,
    medical_specialty,
    description,
    transcription,
    keywords
)
VALUES (%s, %s, %s, %s, %s)
"""


records = []


for _, row in df.iterrows():

    records.append(
        (
            str(row["sample_name"]),
            str(row["medical_specialty"]),
            str(row["description"]),
            str(row["transcription"]),
            str(row["keywords"])
        )
    )


print("\nRECORDS PREPARED:")
print(len(records))


batch_size = 100


for i in range(
    0,
    len(records),
    batch_size
):

    batch = records[
        i:i + batch_size
    ]


    cursor.executemany(
        query,
        batch
    )


    connection.commit()


    print(
        f"Inserted {min(i + batch_size, len(records))}"
        f" / {len(records)}"
    )


print("\nCOMMIT COMPLETE")


# =========================================
# COUNT AFTER INSERT
# =========================================

cursor.execute(
    """
    SELECT COUNT(*)
    FROM transcriptions
    """
)

after_count = (
    cursor.fetchone()[0]
)


print("\nROWS AFTER INSERT:")
print(after_count)


cursor.close()

connection.close()


print("\nIMPORT FINISHED")