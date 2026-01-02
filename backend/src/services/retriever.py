"""
Qdrant vector retrieval service.
"""
import os
from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

from src.models.embedding import EmbeddingMetadata
from src.services.embedder import get_embedder


class RetrieverService:
    """Service for retrieving relevant content from Qdrant."""

    def __init__(self):
        """Initialize Qdrant client."""
        self.url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.api_key = os.getenv("QDRANT_API_KEY")
        self.collection_name = os.getenv("QDRANT_COLLECTION", "textbook_embeddings")
        self._client: QdrantClient | None = None

    @property
    def client(self) -> QdrantClient:
        """Lazy load Qdrant client."""
        if self._client is None:
            self._client = QdrantClient(
                url=self.url,
                api_key=self.api_key,
            )
        return self._client

    def is_connected(self) -> bool:
        """Check if Qdrant is accessible."""
        try:
            self.client.get_collections()
            return True
        except Exception:
            return False

    def search(
        self,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.5,
        language: str = "en",
    ) -> list[tuple[EmbeddingMetadata, float]]:
        """
        Search for relevant content.

        Args:
            query: Search query text
            top_k: Number of results to return
            score_threshold: Minimum similarity score
            language: Filter by content language

        Returns:
            List of (metadata, score) tuples
        """
        # Generate query embedding
        embedder = get_embedder()
        query_vector = embedder.embed_text(query)

        # Search without language filter (language field may not be indexed)
        # TODO: Re-enable language filter after re-indexing content with proper schema
        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=top_k,
            score_threshold=score_threshold,
            with_payload=True,
        )

        # Convert to metadata objects
        output = []
        for result in results.points:
            metadata = EmbeddingMetadata(**result.payload)
            output.append((metadata, result.score))

        return output

    def get_all_sections(
        self,
        chapter_id: Optional[str] = None,
    ) -> list[dict]:
        """Get all indexed sections, optionally filtered by chapter."""
        # Scroll through all points
        filter_conditions = None
        if chapter_id:
            filter_conditions = qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="section_id",
                        match=qdrant_models.MatchText(text=chapter_id),
                    )
                ]
            )

        sections = {}
        offset = None

        while True:
            results, offset = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_conditions,
                limit=100,
                offset=offset,
                with_payload=True,
            )

            for point in results:
                section_id = point.payload.get("section_id")
                if section_id and section_id not in sections:
                    sections[section_id] = {
                        "id": section_id,
                        "title": point.payload.get("section_title", ""),
                        "chapter_id": section_id.split("#")[0] if "#" in section_id else section_id,
                        "chapter_title": point.payload.get("chapter_title", ""),
                        "url": point.payload.get("url", ""),
                    }

            if offset is None:
                break

        return list(sections.values())


# Singleton instance
_retriever: RetrieverService | None = None


def get_retriever() -> RetrieverService:
    """Get singleton retriever instance."""
    global _retriever
    if _retriever is None:
        _retriever = RetrieverService()
    return _retriever
