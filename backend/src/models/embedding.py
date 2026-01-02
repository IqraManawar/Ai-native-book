"""
Pydantic models for embedding metadata.
"""
from typing import Optional
from pydantic import BaseModel, Field


class EmbeddingMetadata(BaseModel):
    """Metadata stored with each embedding in Qdrant."""

    section_id: str = Field(
        ...,
        description="Unique section identifier (chapter_id#anchor)"
    )
    chunk_index: int = Field(
        ...,
        ge=0,
        description="Position within section"
    )
    text: str = Field(
        ...,
        description="Original text content"
    )
    token_count: int = Field(
        ...,
        ge=0,
        description="Token count for chunking"
    )
    chapter_title: str = Field(
        ...,
        description="Parent chapter title"
    )
    section_title: str = Field(
        ...,
        description="Section heading"
    )
    url: Optional[str] = Field(
        None,
        description="URL path to section"
    )
    language: str = Field(
        default="en",
        description="Content language"
    )


class SectionSummary(BaseModel):
    """Summary of an indexed section."""

    id: str = Field(..., description="Section identifier")
    title: str = Field(..., description="Section title")
    chapter_id: str = Field(..., description="Parent chapter ID")
    chapter_title: Optional[str] = Field(None, description="Chapter title")
    url: Optional[str] = Field(None, description="URL to section")


class SectionsResponse(BaseModel):
    """Response for listing sections."""

    sections: list[SectionSummary] = Field(default_factory=list)
    total: int = Field(..., description="Total number of sections")


class IndexResponse(BaseModel):
    """Response for indexing operations."""

    status: str = Field(..., description="Indexing status")
    sections_indexed: Optional[int] = Field(None)
    embeddings_created: Optional[int] = Field(None)
    duration_ms: Optional[int] = Field(None)
