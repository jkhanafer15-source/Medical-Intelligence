import requests

from ai_service.state import AnalysisState


OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "llama3.2:3b"


def supervisor_agent(
    state: AnalysisState
):

    patient_name = state.get(
        "patient_name",
        ""
    )


    patient_context = state.get(
        "patient_context"
    )


    current_notes = state.get(
        "current_notes",
        ""
    )


    previous_session = state.get(
        "session_recall_analysis",
        ""
    )


    comparison = state.get(
        "longitudinal_analysis",
        ""
    )


    summary = state.get(
        "summary_analysis",
        ""
    )


    # =========================
    # SYSTEM PROMPT
    # =========================

    system_prompt = """
You are the supervisor of a clinical documentation
analysis system.

You receive outputs from several specialized agents.

Your job is to review their outputs and create one
final clinician-facing analysis.

Check that:

- statements are supported by the provided notes
- previous and current sessions are not confused
- missing information is clearly identified
- unsupported conclusions are removed
- contradictions are highlighted
- no medical information is invented

The final analysis should contain:

1. Patient context
2. Previous session summary
3. Current session summary
4. Changes since previous session
5. Persistent documented findings
6. Newly documented findings
7. Missing or unclear information
8. Final clinician review summary

Important rules:

- Do not diagnose.
- Do not prescribe medication.
- Do not recommend treatment.
- Do not claim that a condition resolved unless
  the provided documentation explicitly says so.
- Use only the provided information.
- This output supports clinician review and does
  not replace clinical judgment.
"""


    # =========================
    # USER PROMPT
    # =========================

    user_prompt = f"""
PATIENT NAME:

{patient_name}


PATIENT CONTEXT:

{patient_context}


PREVIOUS SESSION:

{previous_session}


CURRENT SESSION NOTES:

{current_notes}


COMPARISON AGENT RESULT:

{comparison}


SUMMARY AGENT RESULT:

{summary}


Review all agent outputs and produce the final
grounded patient analysis.
"""


    # =========================
    # CALL OLLAMA
    # =========================

    response = requests.post(

        OLLAMA_URL,

        json={

            "model":
                OLLAMA_MODEL,

            "messages": [

                {
                    "role": "system",
                    "content":
                        system_prompt
                },

                {
                    "role": "user",
                    "content":
                        user_prompt
                }

            ],

            "stream": False

        },

        timeout=120
    )


    response.raise_for_status()


    data = response.json()


    final_analysis = (
        data["message"]["content"]
    )


    # =========================
    # FINAL STATE UPDATE
    # =========================

    return {

        "final_analysis":
            final_analysis

    }