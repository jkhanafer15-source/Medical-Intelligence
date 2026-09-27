import requests

from ai_service.state import AnalysisState


OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "llama3.2:3b"


def comparison_agent(
    state: AnalysisState
):

    # =========================
    # GET CURRENT NOTES
    # =========================

    current_notes = (
        state.get(
            "current_notes",
            ""
        )
    )


    # =========================
    # GET PREVIOUS SESSION
    # =========================

    last_session = state.get(
        "last_session"
    )


    if not last_session:

        return {

            "longitudinal_analysis":
                """
No previous session exists for this patient.

This is the first available session,
so no longitudinal comparison can
be performed yet.
""".strip()

        }


    previous_notes = (
        last_session.get(
            "doctor_notes"
        )
        or ""
    )


    previous_summary = (
        last_session.get(
            "session_summary"
        )
        or ""
    )


    # =========================
    # SYSTEM PROMPT
    # =========================

    system_prompt = """
You are a clinical documentation comparison assistant.

Your job is to compare a patient's previous
documented session with the doctor's current
session notes.

Only use the information provided.

Identify:

- findings mentioned in both sessions
- newly mentioned findings
- findings from the previous session that are
  not mentioned in the current session
- documented changes
- unresolved or persistent information
- missing information that prevents comparison

Rules:

- Do not diagnose the patient.
- Do not prescribe medication.
- Do not recommend treatment.
- Do not invent information.
- Do not assume that something resolved simply
  because it was not mentioned again.
- Clearly distinguish documented facts from
  missing information.
"""


    # =========================
    # USER PROMPT
    # =========================

    user_prompt = f"""
PREVIOUS SESSION NOTES:

{previous_notes}


PREVIOUS SESSION SUMMARY:

{previous_summary}


CURRENT SESSION NOTES:

{current_notes}


Compare the previous session with the current session.
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


    analysis = (
        data["message"]["content"]
    )


    # =========================
    # UPDATE STATE
    # =========================

    return {

        "longitudinal_analysis":
            analysis

    }