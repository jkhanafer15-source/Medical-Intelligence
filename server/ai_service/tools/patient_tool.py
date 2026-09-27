from database import get_db_connection


def get_patient_context(
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


        cursor.execute(
            """
            SELECT
                id,
                doctor_id,
                name,
                created_at
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


        return patient


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()