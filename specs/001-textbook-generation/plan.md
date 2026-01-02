# Implementation Plan: AI-Native Textbook with RAG Chatbot

**Branch**: `001-textbook-generation` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-textbook-generation/spec.md`

## Summary

Build an AI-native educational textbook for Physical AI & Humanoid Robotics using Docusaurus for the frontend and a RAG-powered chatbot backend. The system will serve 6 chapters with semantic search, source citations, and a floating chat interface. All infrastructure must operate within free-tier limits.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11 (backend)
**Primary Dependencies**: Docusaurus 3.x, React 18, FastAPI, sentence-transformers, google-generativeai
**Storage**: Qdrant Cloud (vectors), Neon PostgreSQL (metadata), GitHub Pages (static)
**Testing**: Jest (frontend), pytest (backend), Playwright (E2E)
**Target Platform**: Web (GitHub Pages static + serverless API)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3s page load, <5s RAG response, <2min build
**Constraints**: Free-tier only ($0 infrastructure), <500KB bundle, 60 req/min LLM limit
**Scale/Scope**: 6 chapters, ~50 sections, ~200 embeddings, educational audience

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Simplicity First | ✅ PASS | Docusaurus provides out-of-box features; minimal custom code |
| II. Accuracy Over Comprehensiveness | ✅ PASS | RAG-only answers with citations; no hallucination by design |
| III. Free-Tier Architecture | ✅ PASS | Qdrant Cloud free, Neon free, Gemini free, GitHub Pages free |
| IV. Fast Builds | ✅ PASS | Docusaurus static build <2min; no heavy preprocessing |
| V. RAG Integrity | ✅ PASS | Embeddings from book only; explicit "I don't know" responses |
| VI. Clean User Experience | ✅ PASS | Floating chat button; 2-click navigation; minimal UI |

**Gate Status**: PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-textbook-generation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── rag-api.yaml     # OpenAPI spec for RAG service
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
# Frontend (Docusaurus site)
my-website/
├── docs/                    # Chapter content (MDX)
│   ├── intro.md
│   ├── chapter-1/
│   ├── chapter-2/
│   ├── chapter-3/
│   ├── chapter-4/
│   ├── chapter-5/
│   └── chapter-6/
├── src/
│   ├── components/
│   │   ├── ChatWidget/      # Floating chat button + panel
│   │   ├── TextSelector/    # Select-text → Ask AI
│   │   └── Citation/        # Citation link component
│   ├── theme/               # Docusaurus theme overrides
│   └── services/
│       └── ragClient.ts     # API client for RAG backend
├── static/                  # Static assets
└── docusaurus.config.js

# Backend (RAG API service)
backend/
├── src/
│   ├── main.py              # FastAPI entry point
│   ├── models/
│   │   ├── query.py         # Query/Response models
│   │   └── embedding.py     # Embedding metadata
│   ├── services/
│   │   ├── embedder.py      # Sentence-transformer embeddings
│   │   ├── retriever.py     # Qdrant vector search
│   │   ├── generator.py     # Gemini LLM generation
│   │   └── indexer.py       # Content indexing pipeline
│   └── api/
│       └── routes.py        # API endpoints
├── tests/
│   ├── unit/
│   └── integration/
├── requirements.txt
└── Dockerfile

# Shared
scripts/
├── index-content.py         # Build-time embedding generation
└── deploy.sh                # Deployment automation
```

**Structure Decision**: Web application pattern selected - separate frontend (Docusaurus) and backend (FastAPI) with clear API boundary. Frontend is static-hosted on GitHub Pages; backend is serverless on Railway/Render.

## Complexity Tracking

> No violations detected - all design decisions align with constitution principles.

| Decision | Justification |
|----------|---------------|
| Separate backend service | Required for RAG - cannot run Python/Qdrant in static site |
| Google Gemini API | Best free-tier option (60 req/min vs 3 req/min alternatives) |
| Sentence-transformers | Lightweight, runs on CPU, no GPU required |
