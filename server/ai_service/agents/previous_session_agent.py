from ai_service.state import AnalysisState

from ai_service.tools.session_tool import (
    get_last_session
)


def previous_session_agent(
    state: AnalysisState
):

    # =========================
    # GET VALUES FROM STATE
    # =========================

    doctor_id = state[
        "doctor_id"
    ]

    patient_id = state[
        "patient_id"
    ]


    # =========================
    # GET LAST SESSION
    # =========================

    last_session = get_last_session(
        doctor_id=doctor_id,
        patient_id=patient_id
    )


    # =========================
    # NO PREVIOUS SESSION
    # =========================

    if not last_session:

        return {

            "last_session": None,

            "session_recall_analysis":
                "No previous session was found for this patient."

        }


    # =========================
    # PREVIOUS SESSION EXISTS
    # =========================

    doctor_notes = (
        last_session.get(
            "doctor_notes"
        )
        or ""
    )


    session_summary = (
        last_session.get(
            "session_summary"
        )
        or ""
    )


    recall_text = f"""
Previous session notes:
{doctor_notes}

Previous session summary:
{session_summary}
""".strip()


    # =========================
    # RETURN STATE UPDATE
    # =========================

    return {

        "last_session":
            last_session,

        "session_recall_analysis":
            recall_text

    }