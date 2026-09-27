import chromadb
import ollama

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

VECTOR_DB_PATH = (
    BASE_DIR.parent
    / "dataset"
    / "vector_db"
)

# =========================================
# CONNECT TO CHROMA
# =========================================

client = chromadb.PersistentClient(
    path=str(VECTOR_DB_PATH)
)


# =========================================
# GET EXISTING COLLECTION
# =========================================

collection = client.get_collection(
    name="medical_transcriptions"
)


# =========================================
# SEARCH FUNCTION
# =========================================

def search_medical_records(
    question,
    n_results=20
):

    # Embed the user's question
    response = ollama.embed(
        model="nomic-embed-text",
        input=question
    )


    query_embedding = (
        response.embeddings[0]
    )


    # Search Chroma
    results = collection.query(

        query_embeddings=[
            query_embedding
        ],

        n_results=n_results

    )


    return results