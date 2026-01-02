# Tasks: AI-Native Textbook with RAG Chatbot

**Input**: Design documents from `/specs/001-textbook-generation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `my-website/src/`, `my-website/docs/`
- **Backend**: `backend/src/`
- **Scripts**: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md in backend/
- [x] T002 Initialize Python project with requirements.txt in backend/requirements.txt
- [x] T003 [P] Create FastAPI entry point in backend/src/main.py
- [x] T004 [P] Configure CORS and environment variables in backend/src/main.py
- [x] T005 [P] Create .env.example with required environment variables in backend/.env.example
- [x] T006 [P] Create Dockerfile for backend deployment in backend/Dockerfile

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Query and Response Pydantic models in backend/src/models/query.py
- [x] T008 [P] Create Embedding metadata model in backend/src/models/embedding.py
- [x] T009 Implement sentence-transformer embedder service in backend/src/services/embedder.py
- [x] T010 Implement Qdrant retriever service in backend/src/services/retriever.py
- [x] T011 Implement Gemini generator service in backend/src/services/generator.py
- [x] T012 Create health check endpoint in backend/src/api/routes.py
- [x] T013 [P] Create RAG API client service in my-website/src/services/ragClient.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Chapter Content (Priority: P1)

**Goal**: Display 6 chapters with auto-generated sidebar and sequential navigation

**Independent Test**: Navigate through all 6 chapters, verify sidebar highlights current chapter, verify Next/Previous links work

### Implementation for User Story 1

- [x] T014 [P] [US1] Create Chapter 1 content structure in my-website/docs/chapter-1-physical-ai/index.md
- [x] T015 [P] [US1] Create Chapter 2 content structure in my-website/docs/chapter-2-humanoid-robotics/index.md
- [x] T016 [P] [US1] Create Chapter 3 content structure in my-website/docs/chapter-3-ros2/index.md
- [x] T017 [P] [US1] Create Chapter 4 content structure in my-website/docs/chapter-4-digital-twin/index.md
- [x] T018 [P] [US1] Create Chapter 5 content structure in my-website/docs/chapter-5-vla-systems/index.md
- [x] T019 [P] [US1] Create Chapter 6 content structure in my-website/docs/chapter-6-capstone/index.md
- [x] T020 [US1] Configure sidebar auto-generation in my-website/sidebars.ts
- [x] T021 [US1] Update docusaurus.config.ts for chapter navigation in my-website/docusaurus.config.ts
- [x] T022 [US1] Create landing page with chapter overview in my-website/docs/intro.md

**Checkpoint**: User Story 1 complete - textbook is browsable with 6 chapters

---

## Phase 4: User Story 2 - Ask AI About Content (Priority: P1)

**Goal**: RAG chatbot with floating UI, answers from book content only, with citations

**Independent Test**: Open chatbot, ask "What is Physical AI?", verify answer has citation linking to Chapter 1

### Implementation for User Story 2

- [x] T023 [US2] Implement content indexer service in backend/src/services/indexer.py
- [x] T024 [US2] Create /query endpoint in backend/src/api/routes.py
- [x] T025 [US2] Create /sections endpoint in backend/src/api/routes.py
- [x] T026 [US2] Implement RAG pipeline orchestration (embed → retrieve → generate) in backend/src/services/generator.py
- [x] T027 [US2] Add "I don't know" response logic when no relevant content found in backend/src/services/generator.py
- [x] T028 [P] [US2] Create ChatWidget component (floating button) in my-website/src/components/ChatWidget/index.tsx
- [x] T029 [P] [US2] Create ChatWidget styles in my-website/src/components/ChatWidget/styles.module.css
- [x] T030 [US2] Create Citation component for clickable source links in my-website/src/components/Citation/index.tsx
- [x] T031 [US2] Integrate ChatWidget into Docusaurus theme in my-website/src/theme/Root.tsx
- [x] T032 [US2] Create content indexing script in scripts/index-content.py
- [x] T033 [US2] Index all chapter content and upload embeddings to Qdrant using scripts/index-content.py

**Checkpoint**: User Story 2 complete - chatbot answers questions with citations

---

## Phase 5: User Story 3 - Select Text to Ask AI (Priority: P2)

**Goal**: Select text in book, trigger "Ask AI about this" tooltip, pre-fill chatbot

**Independent Test**: Select paragraph text, see tooltip, click it, verify chatbot opens with selected text as context

### Implementation for User Story 3

- [x] T034 [US3] Create TextSelector component with selection detection in my-website/src/components/TextSelector/index.tsx
- [x] T035 [P] [US3] Create TextSelector tooltip styles in my-website/src/components/TextSelector/styles.module.css
- [x] T036 [US3] Add selected_context support to ChatWidget state in my-website/src/components/ChatWidget/index.tsx
- [x] T037 [US3] Integrate TextSelector into Root.tsx theme wrapper in my-website/src/theme/Root.tsx
- [x] T038 [US3] Update ragClient to pass selected_context in queries in my-website/src/services/ragClient.ts

**Checkpoint**: User Story 3 complete - text selection triggers contextual AI queries

---

## Phase 6: User Story 4 - Search Textbook Content (Priority: P2)

**Goal**: Full-text search across all chapters with highlighted results

**Independent Test**: Search for "ROS 2", verify results show sections from Chapter 3 with snippets

### Implementation for User Story 4

- [x] T039 [US4] Configure Docusaurus local search plugin in my-website/docusaurus.config.ts
- [x] T040 [US4] Search results display handled by @easyops-cn/docusaurus-search-local plugin
- [x] T041 [US4] Add search highlighting CSS in my-website/src/css/custom.css

**Checkpoint**: User Story 4 complete - search works across all chapters

---

## Phase 7: User Story 5 - View in Urdu (Priority: P3 - Optional)

**Goal**: Language toggle to display Urdu translations of chapter content

**Independent Test**: Toggle to Urdu, verify content displays in RTL format

### Implementation for User Story 5

- [x] T042 [P] [US5] Create Urdu translation files for Chapter 1 in my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-1-physical-ai/
- [x] T043 [P] [US5] Create Urdu translation files for remaining chapters in my-website/i18n/ur/docusaurus-plugin-content-docs/current/
- [x] T044 [US5] Configure i18n for Urdu locale in my-website/docusaurus.config.ts
- [x] T045 [US5] Add RTL CSS support in my-website/src/css/custom.css
- [x] T046 [US5] Add language parameter support to /query endpoint and generator in backend/src/services/generator.py
- [x] T047 [US5] Index Urdu content embeddings separately in scripts/index-content.py

**Checkpoint**: User Story 5 complete - Urdu translation available

---

## Phase 8: User Story 6 - Personalized Learning Path (Priority: P3 - Optional)

**Goal**: Track progress and recommend next chapters

**Independent Test**: View some chapters, return to homepage, see "Recommended Next" suggestion

### Implementation for User Story 6

- [x] T048 [US6] Create UserProgress localStorage service in my-website/src/services/progressTracker.ts
- [x] T049 [US6] Create ProgressDashboard component in my-website/src/components/ProgressDashboard/index.tsx
- [x] T050 [US6] Add "Recommended Next" section to homepage in my-website/src/pages/index.tsx
- [x] T051 [US6] Track chapter views on navigation in my-website/src/theme/DocItem/Layout/index.tsx

**Checkpoint**: User Story 6 complete - personalized recommendations available

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T052 [P] Add error handling for chatbot service unavailable in my-website/src/components/ChatWidget/index.tsx
- [x] T053 [P] Add loading states to ChatWidget in my-website/src/components/ChatWidget/index.tsx
- [x] T054 [P] Optimize bundle size, remove unused dependencies in my-website/package.json
- [x] T055 Create deployment script for GitHub Pages in scripts/deploy.sh
- [x] T056 [P] Create GitHub Actions workflow for CI/CD in .github/workflows/deploy.yml
- [x] T057 Run Lighthouse accessibility audit and fix issues
- [x] T058 Verify all success criteria from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - content browsing
- **User Story 2 (Phase 4)**: Depends on Phase 2 + Phase 3 (needs content to index)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (extends chatbot)
- **User Story 4 (Phase 6)**: Depends on Phase 3 (needs content)
- **User Story 5 (Phase 7)**: Depends on Phase 3 + Phase 4 (optional)
- **User Story 6 (Phase 8)**: Depends on Phase 3 (optional)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Creates content for all other stories
- **User Story 2 (P1)**: Depends on US1 (needs content to index) - Core AI feature
- **User Story 3 (P2)**: Depends on US2 (extends chatbot) - Enhancement
- **User Story 4 (P2)**: Depends on US1 (needs content) - Independent of US2/US3
- **User Story 5 (P3)**: Depends on US1 + US2 - Optional
- **User Story 6 (P3)**: Depends on US1 - Optional, independent of AI features

### Parallel Opportunities

**Within Phase 1 (Setup)**:
```
T003, T004, T005, T006 can run in parallel after T001, T002
```

**Within Phase 2 (Foundational)**:
```
T008 can run parallel with T007
T013 can run parallel with backend tasks
```

**Within Phase 3 (US1 - Content)**:
```
T014, T015, T016, T017, T018, T019 can ALL run in parallel (independent chapter files)
```

**Within Phase 4 (US2 - Chatbot)**:
```
T028, T029 can run parallel with backend tasks T023-T027
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Browse Content)
4. Complete Phase 4: User Story 2 (Ask AI)
5. **STOP and VALIDATE**: Test browsing and chatbot independently
6. Deploy MVP to GitHub Pages + Railway

### Incremental Delivery

1. **MVP**: US1 + US2 → Browsable textbook with working chatbot
2. **Enhancement**: US3 → Text selection feature
3. **Enhancement**: US4 → Full-text search
4. **Optional**: US5 → Urdu translations
5. **Optional**: US6 → Personalization

### Parallel Team Strategy

With 2 developers:
- **Developer A**: Frontend (Docusaurus, components)
- **Developer B**: Backend (FastAPI, RAG pipeline)

Both can work in parallel after Foundational phase, with sync points at:
- T013 (ragClient) ↔ T024 (API endpoint)
- T031 (theme integration) ↔ T033 (content indexing)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP scope: Phase 1 + Phase 2 + Phase 3 + Phase 4 (58 tasks total, 33 for MVP)
