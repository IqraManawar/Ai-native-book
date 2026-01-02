"""
API routes for the RAG Chatbot.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException

from src.models.query import (
    QueryRequest,
    QueryResponse,
    HealthResponse,
    ErrorResponse,
)
from src.models.embedding import SectionsResponse, SectionSummary
from src.services.retriever import get_retriever
from src.services.generator import get_generator, process_query

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    retriever = get_retriever()
    generator = get_generator()

    return HealthResponse(
        status="healthy" if retriever.is_connected() and generator.is_available() else "degraded",
        qdrant_connected=retriever.is_connected(),
        gemini_available=generator.is_available(),
        version="1.0.0",
    )


@router.post(
    "/query",
    response_model=QueryResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
)
async def ask_question(request: QueryRequest):
    """
    Ask a question about textbook content.

    The system will:
    1. Embed the question using sentence-transformers
    2. Search Qdrant for relevant sections
    3. Generate an answer using Gemini with retrieved context
    4. Return answer with source citations
    """
    try:
        response = await process_query(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(
                error="SERVICE_UNAVAILABLE",
                message=f"Failed to process query: {str(e)}",
            ).model_dump(),
        )


@router.get("/sections", response_model=SectionsResponse)
async def list_sections(chapter_id: Optional[str] = None):
    """
    List all indexed sections.

    Args:
        chapter_id: Optional filter by chapter ID
    """
    retriever = get_retriever()

    try:
        sections_data = retriever.get_all_sections(chapter_id)
        sections = [SectionSummary(**s) for s in sections_data]
        return SectionsResponse(sections=sections, total=len(sections))
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(
                error="SERVICE_UNAVAILABLE",
                message=f"Failed to list sections: {str(e)}",
            ).model_dump(),
        )
