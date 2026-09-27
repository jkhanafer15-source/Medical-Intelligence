from sentence_transformers import CrossEncoder


reranker = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)


def rerank_results(
    question,
    results,
    top_k=5
):

    documents = (
        results["documents"][0]
    )

    ids = (
        results["ids"][0]
    )

    distances = (
        results["distances"][0]
    )


    pairs = [

        [question, document]

        for document
        in documents

    ]


    scores = reranker.predict(
        pairs
    )


    ranked_results = []


    for i in range(
        len(documents)
    ):

        ranked_results.append({

            "id":
                ids[i],

            "document":
                documents[i],

            "vector_distance":
                distances[i],

            "reranker_score":
                float(scores[i])

        })


    ranked_results.sort(
        key=lambda item:
            item["reranker_score"],

        reverse=True
    )


    return ranked_results[:top_k]