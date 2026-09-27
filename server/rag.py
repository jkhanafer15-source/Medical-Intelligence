import requests

from vector_store import search_medical_records
from reranker import rerank_results


OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "llama3.2:3b"


def generate_answer(question,pdf_text=""):

    # =========================================
    # 1. VECTOR SEARCH
    # =========================================

    results = search_medical_records(
        question,
        n_results=20
    )


    # =========================================
    # 2. RERANK RESULTS
    # =========================================

    ranked_results = rerank_results(
        question,
        results,
        top_k=5
    )


    # =========================================
    # 3. GET TOP 5 DOCUMENTS
    # =========================================

    documents = [

        result["document"]

        for result in ranked_results

    ]


    # =========================================
    # 4. BUILD CONTEXT
    # =========================================

    context = "\n\n".join(
        documents
    )

    
    if pdf_text:

        context += f"""

========================
UPLOADED PDF
========================

{pdf_text}

"""
    # =========================================
    # 5. SYSTEM PROMPT
    # =========================================

    system_prompt = """
You are a medical record retrieval assistant.

Your job is to answer questions using only the
medical transcription context provided to you.

Rules:

- Use only information supported by the provided records.
- Do not invent medical facts.
- Do not diagnose a patient.
- Do not recommend treatment or prescribe medication.
- If the answer is not supported by the records,
  clearly say that the available records do not
  contain enough information.
- Keep answers clear and evidence-grounded.
-write a full answer plus the resources that are related to the question
"""


    # =========================================
    # 6. USER PROMPT
    # =========================================

    user_prompt = f"""
    Medical Record Context:

    {context}



Question:

{question}
"""


    # =========================================
    # 7. CALL OLLAMA API
    # =========================================

    response = requests.post(

        OLLAMA_URL,

        json={

            "model": OLLAMA_MODEL,

            "messages": [

                {
                    "role": "system",
                    "content": system_prompt#tell the llm how to act
                },

                {
                    "role": "user",
                    "content": user_prompt#the insert question +related chunks which is context in the user prompt variable above 
                }

            ],

            "stream": False

        },

        timeout=120
    )


    # =========================================
    # 8. CHECK RESPONSE
    # =========================================

    response.raise_for_status()


    data = response.json()


    # =========================================
    # 9. GET LLM ANSWER
    # =========================================

    answer = data[
        "message"
    ][
        "content"
    ]


    # =========================================
    # 10. RETURN ANSWER + SOURCES
    # =========================================

    return {

        "answer": answer,

        "sources": ranked_results

    }