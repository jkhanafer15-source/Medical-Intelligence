import pandas as pd
import ollama
import json
import numpy as np

# =========================
# LOAD DATA
# =========================

df = pd.read_csv("medical_transcriptions_clean.csv")


# =========================
# CREATE DOCUMENTS
# =========================

documents = []

for index, row in df.iterrows():

    document = f"""
Title: {row['sample_name']}

Medical Specialty:
{row['medical_specialty']}

Description:
{row['description']}

Medical Transcription:
{row['transcription']}

Keywords:
{row['keywords']}
"""

    documents.append(document)


# =========================
# CHUNK FUNCTION
# =========================

def chunk_text(text, chunk_size=1000, overlap=200):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end]

        chunks.append(chunk)

        start = end - overlap

    return chunks


# =========================
# CHUNK ALL DOCUMENTS
# =========================

all_chunks = []

for document in documents:

    chunks = chunk_text(document)

    all_chunks.extend(chunks)#if appends then nb of chunks=nb of documents where the document first chunk is all_chunks[0][0] but with extend the first chunk of the first document is all_chunks[0]



#EMBEDDING CHUNKS

all_embeddings = []

batch_size = 100

for i in range(0, len(all_chunks), batch_size):

    batch = all_chunks[i:i + batch_size]

    response = ollama.embed(
        model="nomic-embed-text",
        input=batch
    )

    all_embeddings.extend(response.embeddings)

    print(
        "Embedded:",
        min(i + batch_size, len(all_chunks)),
        "/",
        len(all_chunks)
    )


# =========================
# SAVE CHUNKS
# =========================

with open("chunks.json", "w") as file:
    json.dump(all_chunks, file) 


# =========================
# SAVE EMBEDDINGS
# =========================

np.save(
    "embeddings.npy",
    np.array(all_embeddings)
)

print("Chunks and embeddings saved.")

print("\nTotal chunks:", len(all_chunks))
print("Total embeddings:", len(all_embeddings))
print("Embedding dimension:", len(all_embeddings[0]))

print("Total documents:", len(documents))
print("Total chunks:", len(all_chunks))

print("\nFirst chunk:")
print(all_chunks[0])