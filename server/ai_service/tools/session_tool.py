from database import get_db_connection


def get_last_session(
    doctor_id: int,
    patient_id: int
):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # =========================
        # VERIFY PATIENT
        # =========================

        cursor.execute(
            """
            SELECT id
            FROM patients
            WHERE id = %s
            AND doctor_id = %s
            """,
            (
                patient_id,
                doctor_id
            )
        )


        patient = cursor.fetchone()


        if not patient:

            return None


        # =========================
        # GET LAST SESSION
        # =========================

        cursor.execute(
            """
            SELECT
                id,
                patient_id,
                doctor_id,
                doctor_notes,
                session_summary,
                created_at
            FROM patient_sessions
            WHERE patient_id = %s
            AND doctor_id = %s
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """,
            (
                patient_id,
                doctor_id
            )
        )


        last_session = cursor.fetchone()


        return last_session


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()