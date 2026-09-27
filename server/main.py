from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import traceback
from pydantic import BaseModel, EmailStr
from database import get_db_connection
from vector_store import search_medical_records
from rag import generate_answer
import bcrypt
import json
import os
import uuid

from ai_service.graph import analysis_graph
from typing import Optional
from fastapi.responses import JSONResponse
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends
)
from datetime import date

from fastapi.staticfiles import StaticFiles

from auth import (
    create_access_token,
    get_current_user
)

from pdf_reader import read_pdf

app = FastAPI(
    title="Medical RAG API",
    description="Backend API for the Medical RAG project",
    version="1.0.0"
)
PROFILE_UPLOAD_DIR = "uploads/profiles"

os.makedirs(
    PROFILE_UPLOAD_DIR,
    exist_ok=True
)


app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    question: str


class ChatRequest(BaseModel):
    question: str


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ConversationRequest(BaseModel):
    title: str = "New Chat"


class MessageRequest(BaseModel):

    conversation_id: int

    sender: str

    text: str

    file_name: Optional[str] = None

    sources: Optional[list] = None

class PatientCreate(BaseModel):
    name: str
    medical_record_number: Optional[str] = None

    date_of_birth: Optional[date] = None

    sex: Optional[str] = None

    phone: Optional[str] = None


class SessionCreate(BaseModel):
    doctor_notes: str
    session_summary: Optional[str] = None



class PatientAnalysisRequest(BaseModel):
    current_notes: str


@app.get("/")
def root():

    return {
        "message":
            "Medical RAG API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "ok"
    }


@app.post("/search")
def search(request: SearchRequest):

    results = search_medical_records(
        request.question
    )

    return {

        "question":
            request.question,

        "ids":
            results["ids"][0],

        "documents":
            results["documents"][0],

        "distances":
            results["distances"][0]

    }


@app.post("/chat")
async def chat(
    question: str = Form(""),
    file: Optional[UploadFile] = File(None),

    current_user = Depends(
        get_current_user
)):


    user_id = current_user

    print(
        "LOGGED IN USER:",
        user_id
    )

    try:

        print("\n========================")
        print("NEW CHAT REQUEST")
        print("========================")

        print("Question:")
        print(question)

        print("File:")
        print(
            file.filename
            if file
            else None
        )


        if (
            not question.strip()
            and
            file is None
        ):

            raise HTTPException(
                status_code=400,
                detail="Question or PDF is required"
            )


        if (
            not question.strip()
            and
            file is not None
        ):

            question = (
                "Summarize the medical information "
                "contained in this PDF."
            )


        pdf_text = ""


        # =====================================
        # PDF
        # =====================================

        if file is not None:

            print("Reading PDF...")


            pages = await read_pdf(
                file
            )


            print(
                "PDF pages:",
                len(pages)
            )


            pdf_parts = []


            for index, page in enumerate(
                pages
            ):

                pdf_parts.append(
                    f"""
PDF Page {index + 1}

{page.page_content}
"""
                )


            pdf_text = "\n\n".join(
                pdf_parts
            )


            print(
                "PDF text length:",
                len(pdf_text)
            )


            # TEMPORARY SAFETY LIMIT
            # to test whether the PDF makes
            # the Ollama prompt too large

            pdf_text = pdf_text[:12000]


            print(
                "PDF text sent to RAG:",
                len(pdf_text)
            )


        # =====================================
        # RAG
        # =====================================

        print("Calling RAG...")


        result = generate_answer(
            question,
            pdf_text
        )


        print("RAG completed")


        return result


    except HTTPException:

        raise


    except Exception as error:

        print("\nCHAT FAILED:")
        print(str(error))

        traceback.print_exc()


        return JSONResponse(
            status_code=500,
            content={
                "detail": str(error)
            }
        )

@app.post("/read-pdf")
async def read_pdf_endpoint(
    file: UploadFile = File(...)
):

    pages = await read_pdf(file)

    return {
        "filename": file.filename,
        "number_of_pages": len(pages),

        "pages": [
            {
                "page": index + 1,
                "text": page.page_content
            }

            for index, page
            in enumerate(pages)
        ]
    }   


@app.get("/db-test")
def test_database():

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )


        cursor = (
            connection.cursor()
        )


        cursor.execute(
            "SELECT DATABASE()"
        )


        result = cursor.fetchone()


        return {
            "status":
                "connected",

            "database":
                result[0]
        }


    except Exception as error:

        return {
            "status":
                "error",

            "message":
                str(error)
        }


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.post("/register")
def register(
    request: RegisterRequest
):

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # =========================
        # CHECK EMAIL
        # =========================

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (
                request.email,
            )
        )


        existing_user = (
            cursor.fetchone()
        )


        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )


        # =========================
        # HASH PASSWORD
        # =========================

        password_hash = (
            bcrypt.hashpw(
                request.password.encode(
                    "utf-8"
                ),
                bcrypt.gensalt()
            )
        )


        password_hash = (
            password_hash.decode(
                "utf-8"
            )
        )


        # =========================
        # INSERT USER
        # =========================

        cursor.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                password_hash
            )
            VALUES (%s, %s, %s)
            """,
            (
                request.name,
                request.email,
                password_hash
            )
        )


        connection.commit()


        user_id = (
            cursor.lastrowid
        )


        return {

            "success":
                True,

            "message":
                "User registered successfully",

            "user": {

                "id":
                    user_id,

                "name":
                    request.name,

                "email":
                    request.email

            }

        }


    except HTTPException:

        raise


    except Exception as error:

        if connection:

            connection.rollback()


        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.post("/login")
def login(
    request: LoginRequest
):

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # =========================
        # FIND USER BY EMAIL
        # =========================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                password_hash
            FROM users
            WHERE email = %s
            """,
            (
                request.email,
            )
        )


        user = cursor.fetchone()


        # =========================
        # USER DOES NOT EXIST
        # =========================

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = (
    create_access_token(
        user["id"]
    )
)
        # =========================
        # CHECK PASSWORD
        # =========================

        password_correct = (
            bcrypt.checkpw(

                request.password.encode(
                    "utf-8"
                ),

                user[
                    "password_hash"
                ].encode(
                    "utf-8"
                )

            )
        )


        if not password_correct:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )


        # =========================
        # LOGIN SUCCESS
        # =========================

        return {

            "success":
                True,

            "message":
                "Login successful",

            "access_token":
                access_token,

            "token_type":
                "bearer",

            "user": {

                "id":
                    user["id"],

                "name":
                    user["name"],

                "email":
                    user["email"]

            }

        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.post("/conversations")
def create_conversation(
    request: ConversationRequest,
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user#current_user=Depends(...) is the code that get the userid 

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            INSERT INTO conversations
            (
                user_id,
                title
            )
            VALUES (%s, %s)
            """,
            (
                user_id,
                request.title
            )
        )


        connection.commit()


        conversation_id = (
            cursor.lastrowid
        )


        return {
            "success": True,

            "conversation": {
                "id":
                    conversation_id,

                "user_id":
                    user_id,

                "title":
                    request.title
            }
        }


    except Exception as error:

        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.post("/messages")
def create_message(
    request: MessageRequest,
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # CHECK CONVERSATION BELONGS TO USER
        # ==================================

        cursor.execute(
            """
            SELECT id
            FROM conversations
            WHERE id = %s
            AND user_id = %s
            """,
            (
                request.conversation_id,
                user_id
            )
        )


        conversation = (
            cursor.fetchone()
        )


        if not conversation:

            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )


        # ==================================
        # CHECK SENDER
        # ==================================

        if request.sender not in [
            "user",
            "assistant"
        ]:

            raise HTTPException(
                status_code=400,
                detail="Invalid sender"
            )


        # ==================================
        # CONVERT SOURCES TO JSON
        # ==================================

        sources_json = None


        if request.sources is not None:

            sources_json = json.dumps(
                request.sources
            )


        # ==================================
        # INSERT MESSAGE
        # ==================================

        cursor.execute(
            """
            INSERT INTO messages
            (
                conversation_id,
                sender,
                text,
                file_name,
                sources
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                request.conversation_id,
                request.sender,
                request.text,
                request.file_name,
                sources_json
            )
        )


        connection.commit()


        message_id = (
            cursor.lastrowid
        )


        return {

            "success": True,

            "message": {

                "id":
                    message_id,

                "conversation_id":
                    request.conversation_id,

                "sender":
                    request.sender,

                "text":
                    request.text

            }

        }


    except HTTPException:

        raise


    except Exception as error:

        if connection:

            connection.rollback()


        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.get("/conversations")
def get_conversations(
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                title,
                created_at,
                updated_at
            FROM conversations
            WHERE user_id = %s
            ORDER BY updated_at DESC
            """,
            (
                user_id,
            )
        )


        conversations = (
            cursor.fetchall()
        )


        return {
            "conversations":
                conversations
        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.get(
    "/conversations/{conversation_id}/messages"
)
def get_conversation_messages(
    conversation_id: int,
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # CHECK CONVERSATION OWNERSHIP
        # ==================================

        cursor.execute(
            """
            SELECT id
            FROM conversations
            WHERE id = %s
            AND user_id = %s
            """,
            (
                conversation_id,
                user_id
            )
        )


        conversation = (
            cursor.fetchone()
        )


        if not conversation:

            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )


        # ==================================
        # GET MESSAGES
        # ==================================

        cursor.execute(
            """
            SELECT
                id,
                sender,
                text,
                file_name,
                sources,
                created_at
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at ASC
            """,
            (
                conversation_id,
            )
        )


        messages = (
            cursor.fetchall()
        )


        return {
            "conversation_id":
                conversation_id,

            "messages":
                messages
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.get("/transcriptions")
def get_transcriptions(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    current_user = Depends(
        get_current_user
    )
):

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        offset = (
            page - 1
        ) * limit


        search_value = (
            f"%{search.strip()}%"
        )


        # =================================
        # COUNT ALL MATCHING RECORDS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM transcriptions
            WHERE sample_name LIKE %s
            """,
            (
                search_value,
            )
        )


        total = (
            cursor.fetchone()[
                "total"
            ]
        )


        # =================================
        # SEARCH ENTIRE TABLE
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                sample_name,
                medical_specialty,
                description,
                keywords
            FROM transcriptions
            WHERE sample_name LIKE %s
            ORDER BY sample_name ASC
            LIMIT %s OFFSET %s
            """,
            (
                search_value,
                limit,
                offset
            )
        )


        transcriptions = (
            cursor.fetchall()
        )


        return {

            "page":
                page,

            "limit":
                limit,

            "search":
                search,

            "total":
                total,

            "transcriptions":
                transcriptions

        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.get("/transcriptions/{transcription_id}")
def get_transcription(
    transcription_id: int,
    current_user = Depends(
        get_current_user
    )
):

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                sample_name,
                medical_specialty,
                description,
                transcription,
                keywords
            FROM transcriptions
            WHERE id = %s
            """,
            (
                transcription_id,
            )
        )


        transcription = (
            cursor.fetchone()
        )


        if not transcription:

            raise HTTPException(
                status_code=404,
                detail="Transcription not found"
            )


        return {
            "transcription":
                transcription
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.get("/dashboard")
def get_dashboard(
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # TOTAL TRANSCRIPTIONS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM transcriptions
            """
        )

        total_transcriptions = (
            cursor.fetchone()[
                "total"
            ]
        )


        # =================================
        # TOTAL SPECIALTIES
        # =================================

        cursor.execute(
            """
            SELECT
                COUNT(
                    DISTINCT medical_specialty
                ) AS total
            FROM transcriptions
            """
        )

        total_specialties = (
            cursor.fetchone()[
                "total"
            ]
        )


        # =================================
        # USER CONVERSATIONS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM conversations
            WHERE user_id = %s
            """,
            (
                user_id,
            )
        )

        total_conversations = (
            cursor.fetchone()[
                "total"
            ]
        )


        # =================================
        # USER MESSAGES
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM messages m
            JOIN conversations c
                ON m.conversation_id = c.id
            WHERE c.user_id = %s
            """,
            (
                user_id,
            )
        )

        total_messages = (
            cursor.fetchone()[
                "total"
            ]
        )


        # =================================
        # TOP SPECIALTIES
        # =================================

        cursor.execute(
            """
            SELECT
                medical_specialty,
                COUNT(*) AS total
            FROM transcriptions
            WHERE medical_specialty IS NOT NULL
            AND medical_specialty != ''
            GROUP BY medical_specialty
            ORDER BY total DESC
            LIMIT 6
            """
        )

        specialties = (
            cursor.fetchall()
        )


        # =================================
        # RECENT USER QUESTIONS
        # =================================

        cursor.execute(
            """
            SELECT
                m.id,
                m.text AS question,
                m.created_at
            FROM messages m
            JOIN conversations c
                ON m.conversation_id = c.id
            WHERE c.user_id = %s
            AND m.sender = 'user'
            ORDER BY m.created_at DESC
            LIMIT 3
            """,
            (
                user_id,
            )
        )

        recent_questions = (
            cursor.fetchall()
        )


        return {

            "total_transcriptions":
                total_transcriptions,

            "total_specialties":
                total_specialties,

            "total_conversations":
                total_conversations,

            "total_messages":
                total_messages,

            "specialties":
                specialties,

            "recent_questions":
                recent_questions

        }


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.post("/patients")
def create_patient(
    patient: PatientCreate,
    current_user = Depends(
        get_current_user
    )
):

    doctor_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor()


        cursor.execute(
            """
            INSERT INTO patients
            (
                doctor_id,
                name,
                medical_record_number,
                date_of_birth,
                sex,
                phone
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                doctor_id,
                patient.name,
                patient.medical_record_number,
                patient.date_of_birth,
                patient.sex,
                patient.phone
            )
        )


        connection.commit()


        patient_id = (
            cursor.lastrowid
        )


        return {

            "message":
                "Patient created successfully",

            "patient_id":
                patient_id

        }


    except Exception as error:

        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()

@app.get("/patients")
def get_patients(
    search: str = "",
    current_user = Depends(
        get_current_user
    )
):

    print("1 - ENDPOINT START")

    doctor_id = current_user

    print(
        "2 - DOCTOR ID:",
        doctor_id
    )

    connection = None
    cursor = None

    try:

        print(
            "3 - BEFORE DATABASE"
        )

        connection = (
            get_db_connection()
        )

        print(
            "4 - DATABASE CONNECTED"
        )


        cursor = connection.cursor(
            dictionary=True
        )


        search_value = (
            f"%{search.strip()}%"
        )


        print(
            "5 - BEFORE SELECT"
        )


        cursor.execute(
            """
            SELECT
                id,
                name,
                medical_record_number,
                date_of_birth,
                sex,
                phone,
                created_at
            FROM patients
            WHERE doctor_id = %s
            AND (
                name LIKE %s
                OR medical_record_number LIKE %s
            )
            ORDER BY name ASC
            """,
            (
                doctor_id,
                search_value,
                search_value
            )
        )


        print(
            "6 - SELECT DONE"
        )


        patients = (
            cursor.fetchall()
        )


        print(
            "7 - PATIENTS:",
            patients
        )


        return {
            "patients":
                patients
        }


    except Exception as error:

        print(
            "PATIENT ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        print(
            "8 - FINALLY"
        )

        if cursor:
            cursor.close()

        if connection:
            connection.close()





@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    current_user = Depends(get_current_user)
):

    doctor_id = current_user

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


        if not patient:

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )


        return {
            "patient": patient
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.post(
    "/patients/{patient_id}/sessions"
)
def create_patient_session(
    patient_id: int,
    session: SessionCreate,
    current_user = Depends(
        get_current_user
    )
):

    doctor_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # Verify that this patient
        # belongs to this doctor

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

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )


        # Create session

        cursor.execute(
            """
            INSERT INTO patient_sessions
            (
                patient_id,
                doctor_id,
                doctor_notes,
                session_summary
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                patient_id,
                doctor_id,
                session.doctor_notes,
                session.session_summary
            )
        )


        connection.commit()


        session_id = (
            cursor.lastrowid
        )


        return {
            "message":
                "Session saved successfully",

            "session_id":
                session_id
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.get(
    "/patients/{patient_id}/sessions"
)
def get_patient_sessions(
    patient_id: int,
    current_user = Depends(
        get_current_user
    )
):

    doctor_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # Verify patient ownership

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

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )


        # Get patient sessions

        cursor.execute(
            """
            SELECT
                id,
                patient_id,
                doctor_notes,
                session_summary,
                created_at
            FROM patient_sessions
            WHERE patient_id = %s
            AND doctor_id = %s
            ORDER BY created_at DESC
            """,
            (
                patient_id,
                doctor_id
            )
        )


        sessions = cursor.fetchall()


        return {
            "sessions": sessions
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.get(
    "/patients/{patient_id}/last-session"#get one last session of the patient by created at desc +limit 1 in the ssql query
)
def get_last_patient_session(
    patient_id: int,
    current_user = Depends(
        get_current_user
    )
):

    doctor_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # Verify patient

        cursor.execute(
            """
            SELECT
                id,
                name
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

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )


        # Get most recent session

        cursor.execute(
            """
            SELECT
                id,
                patient_id,
                doctor_notes,
                session_summary,
                created_at
            FROM patient_sessions
            WHERE patient_id = %s
            AND doctor_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (
                patient_id,
                doctor_id
            )
        )


        last_session = (
            cursor.fetchone()
        )


        return {

            "patient":
                patient,

            "last_session":
                last_session

        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.post(
    "/patients/{patient_id}/analysis"
)
def analyze_patient(
    patient_id: int,
    request: PatientAnalysisRequest,
    current_user = Depends(
        get_current_user
    )
):

    doctor_id = current_user

    connection = None
    cursor = None

    try:

        # =====================================
        # 1. VERIFY PATIENT
        # =====================================

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                name
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

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )


        # =====================================
        # 2. CREATE INITIAL LANGGRAPH STATE
        # =====================================

        initial_state = {

            "doctor_id":
                doctor_id,

            "patient_id":
                patient_id,

            "patient_name":
                patient["name"],

            "current_notes":
                request.current_notes,

            "patient_context":
                None,

            "last_session":
                None,

            "medical_evidence":
                [],

            "context_analysis":
                "",

            "session_recall_analysis":
                "",

            "evidence_analysis":
                "",

            "longitudinal_analysis":
                "",

            "summary_analysis":
                "",

            "final_analysis":
                ""

        }


        # =====================================
        # 3. RUN LANGGRAPH
        # =====================================

        result = (
            analysis_graph.invoke(
                initial_state
            )
        )


        # =====================================
        # 4. SAVE CURRENT SESSION
        # =====================================

        cursor.execute(
            """
            INSERT INTO patient_sessions
            (
                patient_id,
                doctor_id,
                doctor_notes,
                session_summary
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                patient_id,
                doctor_id,
                request.current_notes,
                result.get(
                    "summary_analysis",
                    ""
                )
            )
        )


        session_id = (
            cursor.lastrowid
        )


        # =====================================
        # 5. SAVE ANALYSIS
        # =====================================

        patient_context_json = (
            json.dumps(
                result.get(
                    "patient_context"
                ),
                default=str
            )
        )


        cursor.execute(
            """
            INSERT INTO patient_analyses
            (
                patient_id,
                session_id,
                patient_context,
                previous_session_analysis,
                evidence_analysis,
                longitudinal_analysis,
                final_analysis
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                patient_id,

                session_id,

                patient_context_json,

                result.get(
                    "session_recall_analysis",
                    ""
                ),

                result.get(
                    "evidence_analysis",
                    ""
                ),

                result.get(
                    "longitudinal_analysis",
                    ""
                ),

                result.get(
                    "final_analysis",
                    ""
                )
            )
        )


        connection.commit()


        # =====================================
        # 6. RETURN RESULT
        # =====================================

        return {

            "message":
                "Patient analysis completed successfully",

            "patient_id":
                patient_id,

            "session_id":
                session_id,

            "patient_name":
                result.get(
                    "patient_name"
                ),

            "previous_session":
                result.get(
                    "last_session"
                ),

            "comparison":
                result.get(
                    "longitudinal_analysis"
                ),

            "summary":
                result.get(
                    "summary_analysis"
                ),

            "final_analysis":
                result.get(
                    "final_analysis"
                )

        }


    except HTTPException:

        if connection:
            connection.rollback()

        raise


    except Exception as error:

        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.get("/profile")
def get_profile(
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                profile_image,
                created_at
            FROM users
            WHERE id = %s
            """,
            (
                user_id,
            )
        )


        user = cursor.fetchone()


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )


        return {
            "user": user
        }


    except HTTPException:

        raise


    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()



@app.put("/profile")
def update_profile(
    name: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    current_user = Depends(
        get_current_user
    )
):

    user_id = current_user

    connection = None
    cursor = None

    try:

        connection = (
            get_db_connection()
        )

        cursor = connection.cursor(
            dictionary=True
        )


        # =====================================
        # GET CURRENT USER
        # =====================================

        cursor.execute(
            """
            SELECT
                id,
                profile_image
            FROM users
            WHERE id = %s
            """,
            (
                user_id,
            )
        )


        user = cursor.fetchone()


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )


        # Keep old image by default
        image_path = (
            user["profile_image"]
        )


        # =====================================
        # SAVE NEW PROFILE IMAGE
        # =====================================

        if profile_image:

            if not (
                profile_image
                .content_type
                .startswith("image/")
            ):

                raise HTTPException(
                    status_code=400,
                    detail=
                    "Profile file must be an image"
                )


            extension = (
                os.path.splitext(
                    profile_image.filename
                )[1]
            )


            filename = (
                f"{uuid.uuid4()}"
                f"{extension}"
            )


            file_path = (
                os.path.join(
                    PROFILE_UPLOAD_DIR,
                    filename
                )
            )


            with open(
                file_path,
                "wb"
            ) as buffer:

                buffer.write(
                    profile_image
                    .file
                    .read()
                )


            image_path = (
                f"/uploads/profiles/"
                f"{filename}"
            )


        # =====================================
        # UPDATE USER
        # =====================================

        cursor.execute(
            """
            UPDATE users
            SET
                name = %s,
                profile_image = %s
            WHERE id = %s
            """,
            (
                name,
                image_path,
                user_id
            )
        )


        connection.commit()


        # =====================================
        # GET UPDATED USER
        # =====================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                profile_image,
                created_at
            FROM users
            WHERE id = %s
            """,
            (
                user_id,
            )
        )


        updated_user = (
            cursor.fetchone()
        )


        return {

            "message":
                "Profile updated successfully",

            "user":
                updated_user

        }


    except HTTPException:

        raise


    except Exception as error:

        if connection:
            connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()