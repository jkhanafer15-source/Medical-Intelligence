import requests

from ai_service.state import AnalysisState


OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "llama3.2:3b"


def summary_agent(
    state: AnalysisState
):

    patient_name = state.get(
        "patient_name",
        ""
    )


    current_notes = state.get(
        "current_notes",
        ""
    )


    session_recall = state.get(
        "session_recall_analysis",
        ""
    )


    longitudinal_analysis = (
        state.get(
            "longitudinal_analysis",
            ""
        )
    )


    system_prompt = """
You are a clinical documentation summarization assistant.

Create a concise structured summary from the
provided patient session information.

Use only the provided information.

Organize the summary into:

1. Previous documented information
2. Current documented information
3. Important changes
4. Persistent information
5. Information requiring clinician review

Rules:

- Do not diagnose.
- Do not recommend treatment.
- Do not prescribe medication.
- Do not invent medical information.
- If information is missing, say that it is missing.
"""


    user_prompt = f"""
PATIENT:

{patient_name}


PREVIOUS SESSION INFORMATION:

{session_recall}


CURRENT SESSION NOTES:

{current_notes}


SESSION COMPARISON:

{longitudinal_analysis}


Create a structured clinical documentation summary.
"""


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


    summary = (
        data["message"]["content"]
    )


    return {

        "summary_analysis":
            summary

    }