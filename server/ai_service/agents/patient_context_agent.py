from ai_service.state import AnalysisState

from ai_service.tools.patient_tool import (
    get_patient_context
)


def patient_context_agent(
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
    # CALL PATIENT TOOL
    # =========================

    patient = get_patient_context(
        doctor_id=doctor_id,
        patient_id=patient_id
    )


    # =========================
    # PATIENT NOT FOUND
    # =========================

    if not patient:

        return {

            "patient_context": None,

            "context_analysis":
                "Patient information could not be found."

        }


    # =========================
    # RETURN STATE UPDATE
    # =========================

    return {

        "patient_context":
            patient,

        "patient_name":
            patient["name"],

        "context_analysis":
            "Patient information loaded successfully."

    }