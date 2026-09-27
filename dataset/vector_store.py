import json
import numpy as np
import chromadb


# =========================
# LOAD CHUNKS
# =========================

with open("chunks.json", "r") as file:
    all_chunks = json.load(file)


# =========================
# LOAD EMBEDDINGS
# =========================

all_embeddings = np.load(
    "embeddings.npy"
)


print("Total chunks:", len(all_chunks))
print("Total embeddings:", len(all_embeddings))


# =========================
# CREATE VECTOR DATABASE
# =========================

client = chromadb.PersistentClient(
    path="./vector_db"
)


# =========================
# CREATE COLLECTION
# =========================

collection = client.get_or_create_collection(
    name="medical_transcriptions"
)


# =========================
# INSERT IN BATCHES
# =========================

batch_size = 100

for i in range(
    0,
    len(all_chunks),
    batch_size
):

    batch_chunks = all_chunks[
        i:i + batch_size
    ]

    batch_embeddings = all_embeddings[
        i:i + batch_size
    ]


    batch_ids = [
        f"chunk_{j}"
        for j in range(#this loop is for every chunk till we reach the last chunk in all_chunks which is 24130 and min function (min(i+batch_size,len(all_chunks)) will be lastly (24200,24130)at the last iteration so he take the min which is 24130 instead of keeping going for 24200)
            i,
            min(
                i + batch_size,
                len(all_chunks)
            )
        )
    ]


    collection.upsert(
        ids=batch_ids,
        documents=batch_chunks,
        embeddings=batch_embeddings.tolist()
    )


    print(
        "Stored:",
        min(
            i + batch_size,
            len(all_chunks)
        ),
        "/",
        len(all_chunks)
    )


print("\nTotal records in Chroma:")
print(collection.count())