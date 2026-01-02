"""
Sentence-transformer embedding service.
"""
import os
from functools import lru_cache

from sentence_transformers import SentenceTransformer

# Default model - lightweight and efficient
DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


class EmbedderService:
    """Service for generating text embeddings."""

    def __init__(self, model_name: str | None = None):
        """Initialize the embedder with specified model."""
        self.model_name = model_name or os.getenv("EMBEDDING_MODEL", DEFAULT_MODEL)
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        """Lazy load the model."""
        if self._model is None:
            print(f"Loading embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

    @property
    def dimension(self) -> int:
        """Get the embedding dimension."""
        return self.model.get_sentence_embedding_dimension()


# Singleton instance
_embedder: EmbedderService | None = None


def get_embedder() -> EmbedderService:
    """Get singleton embedder instance."""
    global _embedder
    if _embedder is None:
        _embedder = EmbedderService()
    return _embedder
