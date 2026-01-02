<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution creation)

Modified principles: N/A (initial creation)

Added sections:
- Core Principles (6 principles)
- Technical Constraints
- Development Workflow
- Governance

Removed sections: N/A (initial creation)

Templates requiring updates:
- .specify/templates/plan-template.md ✅ No updates needed (generic)
- .specify/templates/spec-template.md ✅ No updates needed (generic)
- .specify/templates/tasks-template.md ✅ No updates needed (generic)

Follow-up TODOs: None
-->

# Physical AI & Humanoid Robotics Essentials Constitution

## Core Principles

### I. Simplicity First
All implementations MUST favor the simplest working solution. Code, documentation, and architecture MUST be understandable by intermediate learners. No unnecessary abstractions, patterns, or indirection. If a feature can be implemented in fewer lines without sacrificing clarity, it MUST be. Every component MUST justify its existence with a clear purpose.

### II. Accuracy Over Comprehensiveness
Content MUST be technically accurate even if brief. RAG chatbot MUST only answer from book text - no hallucination or external knowledge injection. All code examples MUST be tested and runnable. Diagrams and explanations MUST reflect actual system behavior. When in doubt, omit rather than include unverified information.

### III. Free-Tier Architecture
All infrastructure MUST operate within free-tier limits of cloud providers. No heavy GPU usage required for any feature. Embeddings MUST be lightweight (avoid large transformer models). Database operations MUST stay within Neon free-tier constraints. Qdrant usage MUST fit free-tier memory limits. Build and deploy pipelines MUST work on GitHub Pages free hosting.

### IV. Fast Builds
Build time for the Docusaurus site MUST remain under 2 minutes. No heavy preprocessing or compile-time operations. Static generation preferred over dynamic rendering. Bundle size MUST be optimized - no unnecessary dependencies. CI/CD pipeline MUST complete in under 5 minutes for standard deployments.

### V. RAG Integrity
The chatbot MUST answer ONLY from indexed book content. No external API calls for answer generation beyond the embedding and LLM inference. Source citations MUST accompany every answer. When content is insufficient to answer a query, the system MUST explicitly state this rather than fabricate information. Embedding pipeline MUST be reproducible and deterministic.

### VI. Clean User Experience
UI MUST be minimalist, professional, and distraction-free. Typography MUST prioritize readability. Navigation MUST be intuitive - users should find content in 2 clicks or less. Select-text → Ask AI feature MUST be non-intrusive. Optional features (Urdu translation, personalization) MUST not clutter the default experience. Mobile responsiveness MUST be first-class.

## Technical Constraints

**Frontend Stack**: Docusaurus 3.x with React, deployed to GitHub Pages
**Backend Stack**: FastAPI for RAG service, Qdrant for vector storage, Neon PostgreSQL for metadata
**Embedding Model**: Lightweight model compatible with free-tier (e.g., sentence-transformers/all-MiniLM-L6-v2)
**LLM Integration**: Free-tier compatible API (OpenAI free credits, or local small model)

**Content Structure**:
- Chapter 1: Introduction to Physical AI
- Chapter 2: Basics of Humanoid Robotics
- Chapter 3: ROS 2 Fundamentals
- Chapter 4: Digital Twin Simulation (Gazebo + Isaac)
- Chapter 5: Vision-Language-Action Systems
- Chapter 6: Capstone: Simple AI-Robot Pipeline

**Performance Budgets**:
- Initial page load: < 3 seconds on 3G
- RAG query response: < 5 seconds
- Build time: < 2 minutes
- Bundle size: < 500KB gzipped (excluding images)

**Deployment Constraints**:
- Primary: GitHub Pages (static)
- RAG API: Free-tier hosting (Railway, Render, or Vercel serverless)
- Vector DB: Qdrant Cloud free tier
- Metadata DB: Neon PostgreSQL free tier

## Development Workflow

**Content Development**:
1. Write chapter content in Markdown with MDX support
2. Include runnable code examples where applicable
3. Add diagrams using Mermaid or static images
4. Review for accuracy before merge

**RAG Pipeline**:
1. Chunk content at semantic boundaries (sections, paragraphs)
2. Generate embeddings using lightweight model
3. Store in Qdrant with metadata linking to source
4. Test retrieval accuracy before deployment

**Quality Gates**:
- All builds MUST pass before merge
- Chatbot accuracy MUST be validated against test queries
- UI MUST pass Lighthouse accessibility audit (score > 90)
- No console errors in production build

**Testing Requirements**:
- E2E tests for critical user flows (navigation, search, chatbot)
- Unit tests for RAG retrieval logic
- Visual regression tests for UI components (optional)

## Governance

This constitution is the authoritative source for project decisions. All PRs and code reviews MUST verify compliance with these principles. Amendments require:
1. Written proposal with rationale
2. Impact assessment on existing implementation
3. Approval and documentation of changes
4. Migration plan if breaking changes introduced

Complexity additions MUST be justified against the Simplicity First principle. Free-tier violations are blocking issues and MUST be resolved before merge.

For runtime development guidance, refer to `.specify/` templates and CLAUDE.md.

**Version**: 1.0.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-15
