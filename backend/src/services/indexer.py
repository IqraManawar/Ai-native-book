"""
Content indexer service for chunking and embedding textbook content.
"""
import os
import re
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from .embedder import embedder


@dataclass
class ContentChunk:
    """Represents a chunk of content from the textbook."""
    chunk_id: str
    chapter_id: str
    chapter_title: str
    section_title: str
    content: str
    url_path: str
    language: str = "en"


class IndexerService:
    """Service for indexing textbook content into Qdrant vector database."""

    def __init__(self):
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
        self.collection_name = os.getenv("QDRANT_COLLECTION", "textbook_chunks")
        self.vector_size = 384  # all-MiniLM-L6-v2 dimension

        self.client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key if self.qdrant_api_key else None
        )

    def ensure_collection(self) -> None:
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        collection_names = [c.name for c in collections]

        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )
            print(f"Created collection: {self.collection_name}")
        else:
            print(f"Collection already exists: {self.collection_name}")

    def parse_markdown_file(self, file_path: Path, language: str = "en") -> list[ContentChunk]:
        """Parse a markdown file into content chunks.

        Args:
            file_path: Path to the markdown file
            language: Language code for the content

        Returns:
            List of ContentChunk objects
        """
        chunks = []

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract frontmatter
        frontmatter = {}
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter_text = parts[1]
                content = parts[2]

                for line in frontmatter_text.strip().split("\n"):
                    if ":" in line:
                        key, value = line.split(":", 1)
                        frontmatter[key.strip()] = value.strip().strip('"\'')

        # Determine chapter info from path
        chapter_id = file_path.parent.name
        chapter_title = frontmatter.get("title", chapter_id)

        # Build URL path - different for Urdu locale
        if language == "ur":
            url_path = f"/ur/docs/{chapter_id}"
        else:
            url_path = f"/docs/{chapter_id}"

        # Split content by sections (## headers)
        sections = re.split(r'^## ', content, flags=re.MULTILINE)

        for i, section in enumerate(sections):
            if not section.strip():
                continue

            # First section is intro (before any ## header)
            if i == 0:
                section_title = "Introduction" if language == "en" else "تعارف"
                section_content = section.strip()
            else:
                # Extract section title from first line
                lines = section.split("\n", 1)
                section_title = lines[0].strip()
                section_content = lines[1].strip() if len(lines) > 1 else ""

            # Skip empty sections
            if not section_content or len(section_content) < 50:
                continue

            # Create chunk with language-prefixed ID to avoid collisions
            chunk_id = f"{language}_{chapter_id}_{i}"
            chunk = ContentChunk(
                chunk_id=chunk_id,
                chapter_id=chapter_id,
                chapter_title=chapter_title,
                section_title=section_title,
                content=section_content[:2000],  # Limit chunk size
                url_path=url_path,
                language=language
            )
            chunks.append(chunk)

        return chunks

    def index_chunks(self, chunks: list[ContentChunk]) -> int:
        """Embed and index chunks into Qdrant."""
        if not chunks:
            return 0

        points = []
        for i, chunk in enumerate(chunks):
            # Create embedding
            text_to_embed = f"{chunk.chapter_title}: {chunk.section_title}\n{chunk.content}"
            embedding = embedder.embed_text(text_to_embed)

            # Create point
            point = PointStruct(
                id=hash(chunk.chunk_id) % (2**63),  # Convert to int64
                vector=embedding,
                payload={
                    "chunk_id": chunk.chunk_id,
                    "chapter_id": chunk.chapter_id,
                    "chapter_title": chunk.chapter_title,
                    "section_title": chunk.section_title,
                    "content": chunk.content,
                    "url_path": chunk.url_path,
                    "language": chunk.language
                }
            )
            points.append(point)

            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1}/{len(chunks)} chunks")

        # Upsert points in batches
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.client.upsert(
                collection_name=self.collection_name,
                points=batch
            )

        print(f"Indexed {len(points)} chunks into {self.collection_name}")
        return len(points)

    def index_docs_directory(self, docs_path: str, language: str = "en") -> int:
        """Index all markdown files in the docs directory.

        Args:
            docs_path: Path to the docs directory
            language: Language code for the content (en, ur)

        Returns:
            Number of chunks indexed
        """
        docs_dir = Path(docs_path)
        all_chunks = []

        # Find all index.md files in chapter directories
        for chapter_dir in sorted(docs_dir.iterdir()):
            if chapter_dir.is_dir() and chapter_dir.name.startswith("chapter-"):
                index_file = chapter_dir / "index.md"
                if index_file.exists():
                    print(f"Parsing: {index_file}")
                    chunks = self.parse_markdown_file(index_file, language=language)
                    all_chunks.extend(chunks)
                    print(f"  Found {len(chunks)} sections")

        # Also index intro.md
        intro_file = docs_dir / "intro.md"
        if intro_file.exists():
            print(f"Parsing: {intro_file}")
            chunks = self.parse_markdown_file(intro_file, language=language)
            all_chunks.extend(chunks)
            print(f"  Found {len(chunks)} sections")

        print(f"\nTotal chunks to index for {language.upper()}: {len(all_chunks)}")

        # Index all chunks
        self.ensure_collection()
        return self.index_chunks(all_chunks)

    def clear_collection(self) -> None:
        """Delete all points from the collection."""
        try:
            self.client.delete_collection(self.collection_name)
            print(f"Deleted collection: {self.collection_name}")
        except Exception as e:
            print(f"Collection may not exist: {e}")


# Singleton instance
indexer = IndexerService()
