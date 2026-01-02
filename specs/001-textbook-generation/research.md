# Research: AI-Native Textbook with RAG Chatbot

**Feature**: 001-textbook-generation
**Date**: 2025-12-15
**Status**: Complete

## Technology Decisions

### 1. Frontend Framework: Docusaurus 3.x

**Decision**: Use Docusaurus 3.x for the textbook frontend

**Rationale**:
- Purpose-built for documentation sites with built-in MDX support
- Auto-generated sidebar from folder structure (FR-001)
- Built-in search (Algolia DocSearch or local) satisfies FR-007
- React-based allows custom components (ChatWidget, TextSelector)
- Static site generation fits GitHub Pages deployment (FR-008)
- Active maintenance and large community

**Alternatives Considered**:
- **Next.js**: More flexible but requires more configuration for docs
- **VitePress**: Vue-based, smaller ecosystem for React components
- **GitBook**: Less customizable for embedded chat features

### 2. RAG Backend: FastAPI + Qdrant + Gemini

**Decision**: FastAPI service with Qdrant vector store and Google Gemini for generation

**Rationale**:
- FastAPI: Lightweight, async, automatic OpenAPI docs, Python ecosystem
- Qdrant Cloud: 1GB free tier sufficient for ~200 embeddings, REST API
- Google Gemini: 60 req/min free tier (best among free options), no credit card

**Alternatives Considered**:
- **LangChain**: Added complexity, not needed for simple RAG pipeline
- **Pinecone**: Free tier more restrictive (100K vectors but slower)
- **OpenAI**: $5 credits expire, requires payment method
- **Groq**: 30 req/min limit (half of Gemini)

### 3. Embedding Model: all-MiniLM-L6-v2

**Decision**: Use sentence-transformers/all-MiniLM-L6-v2 for embeddings

**Rationale**:
- 384 dimensions (efficient storage in Qdrant free tier)
- 80MB model size (runs on CPU, no GPU required)
- Good semantic similarity performance for English text
- Can run locally during build or on serverless functions

**Alternatives Considered**:
- **text-embedding-ada-002**: Requires OpenAI API, paid after credits
- **all-mpnet-base-v2**: Better quality but 768 dims (2x storage)
- **bge-small-en**: Similar performance, less community adoption

### 4. Backend Hosting: Railway or Render

**Decision**: Deploy FastAPI backend to Railway (primary) or Render (fallback)

**Rationale**:
- Railway: $5 free credits/month, sleeps after 5min idle (acceptable for educational use)
- Render: Free tier with 750 hours/month, 15min cold start on free tier
- Both support Docker deployment and environment variables
- CORS configuration straightforward for GitHub Pages origin

**Alternatives Considered**:
- **Vercel Serverless**: 10s timeout may be insufficient for RAG queries
- **AWS Lambda**: Free tier complex to configure, cold starts
- **Heroku**: No longer has free tier

### 5. Metadata Storage: Neon PostgreSQL

**Decision**: Use Neon PostgreSQL free tier for citation metadata

**Rationale**:
- Track section → embedding mappings for accurate citations
- Free tier: 0.5GB storage, sufficient for metadata
- Serverless Postgres, auto-scales to zero
- Familiar SQL interface for queries

**Alternatives Considered**:
- **Supabase**: Good but adds unnecessary auth features
- **PlanetScale**: MySQL-based, less Python ecosystem support
- **SQLite in Qdrant payload**: Limited query capability

### 6. Chatbot UI Pattern: Floating Widget

**Decision**: Bottom-right floating button with expandable chat panel

**Rationale**:
- Non-intrusive: doesn't block content reading
- Familiar pattern (Intercom, Drift, Zendesk)
- Works on mobile with full-screen expansion
- Can be minimized while browsing

**Implementation Approach**:
- React component with portal rendering
- State management via React Context
- CSS transitions for smooth expand/collapse
- Z-index layering above content

### 7. Text Selection Feature

**Decision**: Custom TextSelector component with tooltip trigger

**Rationale**:
- Native `window.getSelection()` API for text detection
- Tooltip appears near selection with "Ask AI" button
- Passes selected text as context to chatbot
- Clears selection after action to avoid confusion

**Implementation Approach**:
- `mouseup` event listener on document
- Check if selection is within content area
- Position tooltip relative to selection bounds
- Pass text to ChatWidget via context/callback

## Free-Tier Limits Summary

| Service | Free Tier Limit | Our Usage Estimate |
|---------|-----------------|-------------------|
| Qdrant Cloud | 1GB storage | ~50MB (200 embeddings × 384 dims × 4 bytes) |
| Neon PostgreSQL | 0.5GB storage | ~10MB metadata |
| Google Gemini | 60 req/min | Educational use, well under limit |
| GitHub Pages | 1GB storage, 100GB bandwidth | <100MB site, moderate traffic |
| Railway | $5 credits/month | ~150 hours runtime |

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Gemini rate limit hit | Implement client-side rate limiting, queue requests |
| Railway credits exhausted | Backend sleeps when idle; monitor usage |
| Cold start latency | Show loading indicator; cache common queries |
| Embedding drift | Version embedding model; re-index on model change |

## Next Steps

1. Generate data-model.md with entity schemas
2. Create OpenAPI contract for RAG API
3. Write quickstart.md for local development
