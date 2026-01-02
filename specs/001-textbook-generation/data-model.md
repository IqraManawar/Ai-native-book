# Data Model: AI-Native Textbook with RAG Chatbot

**Feature**: 001-textbook-generation
**Date**: 2025-12-15

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Chapter   │──1:N──│   Section   │──1:N──│  Embedding  │
└─────────────┘       └─────────────┘       └─────────────┘
                            │
                            │ cited_in
                            ▼
┌─────────────┐       ┌─────────────┐
│    Query    │──1:N──│  Citation   │
└─────────────┘       └─────────────┘
```

## Entities

### Chapter

Represents a top-level unit of textbook content.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, format: `chapter-{n}` | Unique identifier |
| title | string | required, max 200 chars | Chapter title |
| slug | string | required, unique, kebab-case | URL-friendly identifier |
| order | integer | required, 1-6 | Display order |
| description | string | optional, max 500 chars | Brief summary |
| content_path | string | required | Path to MDX file |
| urdu_content_path | string | optional | Path to Urdu MDX file |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last modification timestamp |

**Validation Rules**:
- `order` must be unique across chapters
- `slug` must match `^[a-z0-9-]+$` pattern
- `content_path` must end with `.md` or `.mdx`

### Section

Represents a sub-division of a chapter (H2/H3 heading).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, format: `{chapter_id}#{anchor}` | Composite identifier |
| chapter_id | string | FK → Chapter.id | Parent chapter |
| title | string | required, max 200 chars | Section heading text |
| anchor | string | required | HTML anchor ID |
| level | integer | required, 2-3 | Heading level (H2=2, H3=3) |
| order | integer | required | Position within chapter |
| content_preview | string | max 300 chars | First paragraph preview |

**Validation Rules**:
- `anchor` must be unique within a chapter
- `level` determines nesting in navigation

### Embedding

Vector representation of a content chunk for semantic search.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| section_id | string | FK → Section.id | Source section |
| chunk_index | integer | required | Position within section |
| text | string | required, 300-500 tokens | Original text content |
| vector | float[384] | required | Embedding vector |
| token_count | integer | required | Token count for chunking |
| created_at | datetime | auto | Indexing timestamp |

**Stored in**: Qdrant Cloud (vector + payload)

**Payload Schema** (Qdrant):
```json
{
  "section_id": "chapter-1#what-is-physical-ai",
  "chunk_index": 0,
  "text": "Physical AI refers to...",
  "token_count": 342,
  "chapter_title": "Introduction to Physical AI",
  "section_title": "What is Physical AI?"
}
```

### Query

User question submitted to the chatbot.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| question | string | required, max 1000 chars | User's question text |
| selected_context | string | optional, max 2000 chars | Text selected before asking |
| answer | string | required | Generated response |
| confidence | float | 0.0-1.0 | Retrieval confidence score |
| created_at | datetime | auto | Query timestamp |
| response_time_ms | integer | required | Processing duration |

**Stored in**: Neon PostgreSQL (for analytics, optional)

### Citation

Link between an answer and its source section(s).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| query_id | uuid | FK → Query.id | Parent query |
| section_id | string | FK → Section.id | Cited section |
| relevance_score | float | 0.0-1.0 | Similarity score |
| snippet | string | max 300 chars | Relevant excerpt |

**Relationship**: Query 1:N Citation (multiple sources per answer)

## State Transitions

### Embedding Lifecycle

```
[Content Created] → [Chunked] → [Embedded] → [Indexed in Qdrant]
                                     ↓
                              [Queryable]
                                     ↓
                    [Content Updated] → [Re-indexed]
```

### Query Lifecycle

```
[User Submits Question]
        ↓
[Embed Question] → [Search Qdrant] → [Retrieve Top-K Sections]
        ↓
[Build Prompt with Context]
        ↓
[Generate Answer via Gemini]
        ↓
[Return Answer + Citations]
```

## Indexes

### Qdrant Collection: `textbook_embeddings`

- **Vector Index**: HNSW (default)
- **Payload Index**: `section_id` (keyword), `chapter_title` (keyword)

### PostgreSQL Indexes (if storing queries)

- `queries_created_at_idx` on `created_at` (for analytics)
- `citations_query_id_idx` on `query_id` (for joins)

## Data Volume Estimates

| Entity | Count | Storage |
|--------|-------|---------|
| Chapters | 6 | Negligible (MDX files) |
| Sections | ~50 | ~10KB (Neon) |
| Embeddings | ~200 | ~50MB (Qdrant: 200 × 384 × 4 bytes + payloads) |
| Queries | Unbounded | ~1KB each (optional logging) |

## Constraints from Spec

- **FR-003**: Embeddings derived ONLY from textbook content
- **FR-004**: Every answer MUST include Citation records
- **SC-002**: 90% of questions must return accurate citations
- **SC-003**: Unknown questions must return zero citations + explicit "I don't know"
