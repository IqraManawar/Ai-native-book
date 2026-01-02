#!/usr/bin/env python3
"""
Content Indexing Script for AI-Native Textbook

This script indexes all textbook content from the Docusaurus docs directory
into Qdrant vector database for RAG retrieval.

Usage:
    python scripts/index-content.py [--clear] [--docs-path PATH]

Options:
    --clear         Clear existing collection before indexing
    --docs-path     Path to docs directory (default: my-website/docs)
"""

import argparse
import os
import sys
from pathlib import Path

# Add backend src to path for imports
backend_path = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / "backend" / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    # Try .env.example as fallback for development
    env_example = Path(__file__).parent.parent / "backend" / ".env.example"
    if env_example.exists():
        load_dotenv(env_example)
        print("Warning: Using .env.example - copy to .env and configure for production")


def main():
    parser = argparse.ArgumentParser(
        description="Index textbook content into Qdrant vector database"
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing collection before indexing"
    )
    parser.add_argument(
        "--docs-path",
        type=str,
        default="my-website/docs",
        help="Path to docs directory (default: my-website/docs)"
    )
    parser.add_argument(
        "--language",
        type=str,
        choices=["en", "ur", "all"],
        default="all",
        help="Language to index: en, ur, or all (default: all)"
    )
    args = parser.parse_args()

    # Resolve docs path
    docs_path = Path(args.docs_path)
    if not docs_path.is_absolute():
        docs_path = Path(__file__).parent.parent / docs_path

    if not docs_path.exists():
        print(f"Error: Docs path does not exist: {docs_path}")
        sys.exit(1)

    print("=" * 60)
    print("AI-Native Textbook Content Indexer")
    print("=" * 60)
    print(f"\nDocs path: {docs_path}")
    print(f"Qdrant URL: {os.getenv('QDRANT_URL', 'http://localhost:6333')}")
    print(f"Collection: {os.getenv('QDRANT_COLLECTION', 'textbook_chunks')}")
    print()

    # Import indexer after environment is loaded
    try:
        from services.indexer import indexer
    except ImportError as e:
        print(f"Error importing indexer: {e}")
        print("Make sure you're running from the project root directory")
        sys.exit(1)

    # Clear collection if requested
    if args.clear:
        print("Clearing existing collection...")
        indexer.clear_collection()
        print()

    # Build list of paths to index based on language
    paths_to_index = []

    if args.language in ["en", "all"]:
        paths_to_index.append(("en", docs_path))

    if args.language in ["ur", "all"]:
        # Urdu docs are in i18n/ur/docusaurus-plugin-content-docs/current/
        urdu_docs = Path(__file__).parent.parent / "my-website" / "i18n" / "ur" / "docusaurus-plugin-content-docs" / "current"
        if urdu_docs.exists():
            paths_to_index.append(("ur", urdu_docs))
        else:
            print(f"Warning: Urdu docs path does not exist: {urdu_docs}")

    # Index content for each language
    total_chunks = 0
    print("Indexing content...")
    print("-" * 40)

    try:
        for lang, path in paths_to_index:
            print(f"\nIndexing {lang.upper()} content from: {path}")
            num_chunks = indexer.index_docs_directory(str(path), language=lang)
            total_chunks += num_chunks
            print(f"  → Indexed {num_chunks} chunks for {lang.upper()}")

        print("-" * 40)
        print(f"\nSuccess! Indexed {total_chunks} total chunks into Qdrant.")
        print("\nNext steps:")
        print("1. Start the backend: cd backend && uvicorn src.main:app --reload")
        print("2. Test with: curl http://localhost:8000/v1/health")
        print("3. Query (EN): curl -X POST http://localhost:8000/v1/query -H 'Content-Type: application/json' -d '{\"question\": \"What is Physical AI?\"}'")
        print("4. Query (UR): curl -X POST http://localhost:8000/v1/query -H 'Content-Type: application/json' -d '{\"question\": \"فزیکل اے آئی کیا ہے؟\", \"language\": \"ur\"}'")
    except Exception as e:
        print(f"\nError during indexing: {e}")
        print("\nTroubleshooting:")
        print("1. Check QDRANT_URL and QDRANT_API_KEY in .env")
        print("2. Ensure Qdrant is running and accessible")
        print("3. Check network connectivity to Qdrant Cloud")
        sys.exit(1)


if __name__ == "__main__":
    main()
