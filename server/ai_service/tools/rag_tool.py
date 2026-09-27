from vector_store import (
    search_medical_records
)

from reranker import (
    rerank_results
)


def get_medical_evidence(
    query: str,
    n_results: int = 20,
    top_k: int = 5
):

    # =========================================
    # CHECK QUERY
    # =========================================

    if not query:

        return []


    # =========================================
    # 1. SEARCH CHROMA
    # =========================================

    results = search_medical_records(
        query,
        n_results=n_results
    )


    # =========================================
    # 2. RERANK RESULTS
    # =========================================

    ranked_results = rerank_results(
        query,
        results,
        top_k=top_k
    )


    # =========================================
    # 3. RETURN MEDICAL EVIDENCE
    # =========================================

    return ranked_results