"""
Google Gemini LLM generation service.
"""
import os
import time
from typing import Optional

import google.generativeai as genai

from src.models.query import QueryRequest, QueryResponse, Citation
from src.models.embedding import EmbeddingMetadata
from src.services.retriever import get_retriever


# System prompts for RAG by language
SYSTEM_PROMPTS = {
    "en": """You are a helpful assistant for the Physical AI & Humanoid Robotics textbook.
Answer questions ONLY based on the provided context from the textbook.
If the context doesn't contain relevant information to answer the question, say:
"I don't have information about that in this textbook."

Be concise and accurate. Always cite which section the information comes from.""",

    "ur": """آپ فزیکل اے آئی اور ہیومنائیڈ روبوٹکس نصابی کتاب کے لیے ایک مددگار اسسٹنٹ ہیں۔
سوالات کا جواب صرف نصابی کتاب سے فراہم کردہ متن کی بنیاد پر دیں۔
اگر متن میں سوال کا جواب دینے کے لیے متعلقہ معلومات نہیں ہیں، تو کہیں:
"اس نصابی کتاب میں اس کے بارے میں معلومات نہیں ہیں۔"

مختصر اور درست جواب دیں۔ ہمیشہ بتائیں کہ معلومات کس سیکشن سے ہے۔
جواب اردو میں دیں۔""",
}

# Acknowledgment responses by language
MODEL_ACKNOWLEDGMENTS = {
    "en": "I understand. I will only answer based on the provided textbook context and clearly indicate when I don't have relevant information.",
    "ur": "میں سمجھ گیا۔ میں صرف فراہم کردہ نصابی کتاب کے متن کی بنیاد پر جواب دوں گا اور واضح طور پر بتاؤں گا جب متعلقہ معلومات نہیں ہوں گی۔",
}

# No answer responses by language
NO_ANSWER_RESPONSES = {
    "en": "I don't have information about that in this textbook.",
    "ur": "اس نصابی کتاب میں اس کے بارے میں معلومات نہیں ہیں۔",
}


class GeneratorService:
    """Service for generating answers using Gemini."""

    def __init__(self):
        """Initialize Gemini client."""
        self.api_key = os.getenv("GEMINI_API_KEY")
        self._model = None

        if self.api_key:
            genai.configure(api_key=self.api_key)

    @property
    def model(self):
        """Lazy load Gemini model."""
        if self._model is None:
            self._model = genai.GenerativeModel("gemini-pro")
        return self._model

    def is_available(self) -> bool:
        """Check if Gemini API is configured."""
        return self.api_key is not None

    def generate_answer(
        self,
        request: QueryRequest,
        contexts: list[tuple[EmbeddingMetadata, float]],
    ) -> QueryResponse:
        """
        Generate an answer using RAG pipeline.

        Args:
            request: The query request
            contexts: Retrieved context chunks with scores

        Returns:
            QueryResponse with answer and citations
        """
        start_time = time.time()

        # Get language from request
        language = request.language if request.language in SYSTEM_PROMPTS else "en"

        # Handle case where no relevant content found
        if not contexts:
            return QueryResponse(
                answer=NO_ANSWER_RESPONSES.get(language, NO_ANSWER_RESPONSES["en"]),
                citations=[],
                has_answer=False,
                confidence=0.0,
                response_time_ms=int((time.time() - start_time) * 1000),
            )

        # Build context string
        context_parts = []
        citations = []

        for metadata, score in contexts:
            context_parts.append(
                f"[From: {metadata.chapter_title} > {metadata.section_title}]\n{metadata.text}"
            )
            citations.append(
                Citation(
                    section_id=metadata.section_id,
                    section_title=metadata.section_title,
                    chapter_title=metadata.chapter_title,
                    url=metadata.url or f"/docs/{metadata.section_id.replace('#', '/')}",
                    snippet=metadata.text[:300] if len(metadata.text) > 300 else metadata.text,
                    relevance_score=score,
                )
            )

        context_text = "\n\n".join(context_parts)

        # Build prompt
        user_prompt = f"""Context from textbook:
{context_text}

"""
        if request.selected_context:
            user_prompt += f"""User selected text for context:
{request.selected_context}

"""
        user_prompt += f"""Question: {request.question}

Answer based only on the context provided above. Be concise and cite the source section."""

        # Generate with Gemini
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["en"])
        model_ack = MODEL_ACKNOWLEDGMENTS.get(language, MODEL_ACKNOWLEDGMENTS["en"])

        try:
            response = self.model.generate_content(
                [
                    {"role": "user", "parts": [system_prompt]},
                    {"role": "model", "parts": [model_ack]},
                    {"role": "user", "parts": [user_prompt]},
                ]
            )
            answer = response.text
            has_answer = True
            confidence = max(score for _, score in contexts)
        except Exception as e:
            answer = f"I encountered an error while generating the answer. Please try again. Error: {str(e)}"
            has_answer = False
            confidence = 0.0
            citations = []

        response_time_ms = int((time.time() - start_time) * 1000)

        return QueryResponse(
            answer=answer,
            citations=citations,
            has_answer=has_answer,
            confidence=confidence,
            response_time_ms=response_time_ms,
        )


# Singleton instance
_generator: GeneratorService | None = None


def get_generator() -> GeneratorService:
    """Get singleton generator instance."""
    global _generator
    if _generator is None:
        _generator = GeneratorService()
    return _generator


async def process_query(request: QueryRequest) -> QueryResponse:
    """
    Full RAG pipeline: retrieve → generate.

    Args:
        request: The query request

    Returns:
        QueryResponse with answer and citations
    """
    # Get services
    retriever = get_retriever()
    generator = get_generator()

    # Retrieve relevant contexts
    contexts = retriever.search(
        query=request.question,
        top_k=5,
        score_threshold=0.5,
        language=request.language,
    )

    # Generate answer
    response = generator.generate_answer(request, contexts)

    return response
