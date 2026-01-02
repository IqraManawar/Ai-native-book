"""
Pydantic models for RAG query requests and responses.
"""
from typing import Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request model for RAG queries."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="The user's question about textbook content"
    )
    selected_context: Optional[str] = Field(
        None,
        max_length=2000,
        description="Optional text selected by user before asking"
    )
    language: str = Field(
        default="en",
        pattern="^(en|ur)$",
        description="Response language preference"
    )


class Citation(BaseModel):
    """Citation model for source references."""

    section_id: str = Field(..., description="Unique section identifier")
    section_title: str = Field(..., description="Section heading")
    chapter_title: str = Field(..., description="Parent chapter title")
    url: str = Field(..., description="Direct link to section in textbook")
    snippet: Optional[str] = Field(
        None,
        max_length=300,
        description="Relevant excerpt from section"
    )
    relevance_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Semantic similarity score"
    )


class QueryResponse(BaseModel):
    """Response model for RAG queries."""

    answer: str = Field(..., description="Generated answer from RAG pipeline")
    citations: list[Citation] = Field(
        default_factory=list,
        description="Source sections used to generate the answer"
    )
    has_answer: bool = Field(
        ...,
        description="Whether the system found relevant content"
    )
    confidence: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Retrieval confidence score"
    )
    response_time_ms: Optional[int] = Field(
        None,
        description="Processing time in milliseconds"
    )


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str = Field(..., description="Service health status")
    qdrant_connected: bool = Field(default=False)
    gemini_available: bool = Field(default=False)
    version: str = Field(default="1.0.0")


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable error message")
    retry_after: Optional[int] = Field(
        None,
        description="Seconds to wait before retrying"
    )
