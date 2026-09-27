from typing import (
    TypedDict,
    Optional,
    List,
    Dict,
    Any
)


class AnalysisState(TypedDict):

    # =========================
    # IDENTIFIERS
    # =========================

    doctor_id: int

    patient_id: int

    patient_name: str


    # =========================
    # CURRENT SESSION
    # =========================

    current_notes: str


    # =========================
    # DATABASE CONTEXT
    # =========================

    patient_context: Optional[
        Dict[str, Any]
    ]

    last_session: Optional[
        Dict[str, Any]
    ]


    # =========================
    # RAG / MEDICAL EVIDENCE
    # =========================

    medical_evidence: List[
        Dict[str, Any]
    ]


    # =========================
    # AGENT RESULTS
    # =========================

    context_analysis: str

    session_recall_analysis: str

    evidence_analysis: str

    longitudinal_analysis: str

    summary_analysis: str
    # =========================
    # SUPERVISOR RESULT
    # =========================

    final_analysis: str