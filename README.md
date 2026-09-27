# Medical Intelligence

Medical Intelligence is a clinician-focused AI platform designed to help healthcare professionals organize, retrieve, and analyze medical information.

The system combines **Retrieval-Augmented Generation (RAG)**, **vector search**, **reranking**, **Ollama LLMs**, and **LangGraph multi-agent workflows** to provide grounded medical-record assistance and longitudinal patient analysis.

> This project is designed as a clinical documentation and information-support system. It does not provide medical diagnoses, prescriptions, or treatment recommendations.

---

## Problem

Healthcare professionals often work with large amounts of medical documentation, including:

- Patient notes
- Previous clinical sessions
- Medical transcriptions
- Uploaded medical documents
- Longitudinal patient history

Finding relevant information manually can be time-consuming, especially when records become large.

Important information may also be spread across multiple previous sessions.

---

## Solution

Medical Intelligence provides a centralized platform where clinicians can:

- Search medical transcription records
- Chat with an AI assistant using medical context
- Upload PDF medical documents
- Retrieve relevant medical information using semantic search
- Manage patients
- Store clinical session notes
- Compare current and previous patient sessions
- Generate structured longitudinal analysis
- Maintain patient-specific history
- Manage clinician profiles

The platform uses a RAG pipeline to retrieve relevant medical context before sending information to the language model.

A LangGraph multi-agent workflow is also used for patient analysis.

---

# Main Features

## AI Medical Assistant

Clinicians can ask medical-record-related questions through the AI assistant.

The system:

1. Receives the clinician's question
2. Creates an embedding for the question
3. Searches ChromaDB
4. Retrieves relevant medical transcription chunks
5. Reranks the retrieved results
6. Sends the strongest context to the LLM
7. Generates a grounded response

---

## Retrieval-Augmented Generation

The project uses a medical transcription dataset containing thousands of medical records.

Medical documents are divided into chunks and converted into embeddings using:

```text
nomic-embed-text
