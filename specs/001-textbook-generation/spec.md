# Feature Specification: AI-Native Textbook with RAG Chatbot

**Feature Branch**: `001-textbook-generation`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "Build AI-native textbook with RAG chatbot for Physical AI & Humanoid Robotics course"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Chapter Content (Priority: P1)

As a student, I want to browse the textbook chapters sequentially so that I can learn Physical AI and Humanoid Robotics concepts in a structured manner.

**Why this priority**: Core value proposition - without readable content, nothing else matters.

**Independent Test**: Can be fully tested by navigating through all 6 chapters and verifying content displays correctly. Delivers immediate learning value.

**Acceptance Scenarios**:

1. **Given** I am on the homepage, **When** I click on "Introduction to Physical AI", **Then** I see the chapter content with proper formatting, headings, and any diagrams.
2. **Given** I am reading Chapter 2, **When** I click "Next" or navigate to Chapter 3, **Then** I am taken to "ROS 2 Fundamentals" with smooth transition.
3. **Given** I am on any chapter page, **When** I view the sidebar, **Then** I see all 6 chapters listed with current chapter highlighted.

---

### User Story 2 - Ask AI About Content (Priority: P1)

As a student, I want to ask questions about the textbook content and receive accurate answers sourced only from the book so that I can clarify concepts without leaving the platform.

**Why this priority**: Core differentiator - the RAG chatbot is the key feature that makes this an "AI-native" textbook.

**Independent Test**: Can be tested by asking questions covered in the book and verifying answers cite the correct source sections.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I open the chatbot and ask "What is Physical AI?", **Then** I receive an answer derived from Chapter 1 with a citation link to the source section.
2. **Given** I ask a question not covered in the book, **When** the system processes my query, **Then** it responds with "I don't have information about that in this textbook" rather than making up an answer.
3. **Given** I receive an answer, **When** I click the citation link, **Then** I am taken directly to the relevant section in the textbook.

---

### User Story 3 - Select Text to Ask AI (Priority: P2)

As a student, I want to select text in the book and ask the AI about it so that I can get contextual explanations without retyping.

**Why this priority**: Enhances the core AI experience but not essential for MVP.

**Independent Test**: Can be tested by selecting text, triggering the "Ask AI" action, and verifying the query uses the selected text as context.

**Acceptance Scenarios**:

1. **Given** I am reading a chapter, **When** I select a paragraph of text, **Then** a tooltip or button appears offering "Ask AI about this".
2. **Given** I click "Ask AI about this" after selecting text, **When** the chatbot opens, **Then** my selection is pre-filled as context for the query.
3. **Given** I ask a follow-up question, **When** the AI responds, **Then** it considers both my selected text and my question.

---

### User Story 4 - Search Textbook Content (Priority: P2)

As a student, I want to search for specific terms or topics across all chapters so that I can quickly find relevant information.

**Why this priority**: Standard textbook functionality that improves usability.

**Independent Test**: Can be tested by searching for terms that appear in multiple chapters and verifying results link to correct locations.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I type "ROS 2" in the search bar, **Then** I see a list of all sections mentioning ROS 2 with preview snippets.
2. **Given** search results are displayed, **When** I click a result, **Then** I am taken to that exact location in the textbook with the term highlighted.

---

### User Story 5 - View in Urdu (Priority: P3 - Optional)

As an Urdu-speaking student, I want to read chapter content in Urdu so that I can learn in my native language.

**Why this priority**: Optional feature for broader accessibility, not required for initial launch.

**Independent Test**: Can be tested by switching language and verifying translated content displays correctly.

**Acceptance Scenarios**:

1. **Given** I am reading any chapter, **When** I click the language toggle and select "Urdu", **Then** the chapter content displays in Urdu.
2. **Given** I am viewing Urdu content, **When** I ask the chatbot a question in Urdu, **Then** I receive a response in Urdu sourced from the Urdu content.

---

### User Story 6 - Personalized Learning Path (Priority: P3 - Optional)

As a student, I want to receive personalized chapter recommendations based on my progress so that I can focus on areas needing improvement.

**Why this priority**: Nice-to-have feature for enhanced engagement, not core functionality.

**Independent Test**: Can be tested by completing some chapters and verifying recommendations change based on progress.

**Acceptance Scenarios**:

1. **Given** I have completed Chapters 1-3, **When** I visit the homepage, **Then** I see a "Recommended Next" section suggesting Chapter 4.
2. **Given** I frequently ask questions about ROS 2, **When** I view my progress dashboard, **Then** I see "ROS 2 Fundamentals" highlighted as an area of interest.

---

### Edge Cases

- What happens when the chatbot service is unavailable? → Display friendly error message with retry option; textbook reading remains functional.
- What happens when a chapter has no content yet? → Display placeholder message "Content coming soon" with link to available chapters.
- What happens when search returns no results? → Display "No results found" with suggestions to try different terms.
- What happens when embedding/indexing fails? → Admin notification; chatbot degrades gracefully to "Search functionality temporarily limited".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display 6 chapters in a sequential, navigable structure with auto-generated sidebar.
- **FR-002**: System MUST provide a chatbot interface accessible from any page via a floating button (bottom-right) with expandable chat panel.
- **FR-003**: Chatbot MUST generate answers ONLY from indexed textbook content (no external knowledge).
- **FR-004**: Chatbot MUST include source citations with every answer linking to the relevant textbook section.
- **FR-005**: Chatbot MUST explicitly state when it cannot answer a question from available content.
- **FR-006**: System MUST support text selection triggering an "Ask AI" action.
- **FR-007**: System MUST provide full-text search across all chapters.
- **FR-008**: System MUST be deployable to GitHub Pages (static hosting).
- **FR-009**: System MUST work within free-tier limits of Qdrant, Neon PostgreSQL, and hosting providers.
- **FR-010**: (Optional) System SHOULD support Urdu translation of chapter content.
- **FR-011**: (Optional) System SHOULD track user progress and provide personalized recommendations.

### Key Entities

- **Chapter**: Represents a unit of content with title, body (Markdown/MDX), order, and optional Urdu translation.
- **Section**: Sub-division of a chapter used for navigation and citation granularity.
- **Embedding**: Vector representation of a section-level text chunk (~300-500 tokens) stored in Qdrant for semantic search.
- **Query**: User question submitted to the chatbot with timestamp and optional selected text context.
- **Citation**: Link between a chatbot answer and source section(s) in the textbook.
- **UserProgress**: (Optional) Tracks chapters viewed, questions asked, and completion status per user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate through all 6 chapters and reach any section within 2 clicks from homepage.
- **SC-002**: Chatbot answers 90% of questions about book content with accurate source citations (validated against test question set).
- **SC-003**: Chatbot correctly refuses to answer 100% of questions about topics not in the book (no hallucination).
- **SC-004**: Site loads initial page in under 3 seconds on standard broadband connection.
- **SC-005**: Chatbot returns answers within 5 seconds of query submission.
- **SC-006**: Site passes accessibility audit with score > 90 (Lighthouse).
- **SC-007**: Full site build completes in under 2 minutes.
- **SC-008**: All infrastructure costs remain $0 (free-tier only).
- **SC-009**: Search returns relevant results for known terms within 1 second.
- **SC-010**: (Optional) Urdu content displays correctly with proper RTL formatting when enabled.

## Clarifications

### Session 2025-12-15

- Q: Which LLM service should power the chatbot's answer generation? → A: Google Gemini API (free tier: 60 req/min, no credit card required)
- Q: How should the chatbot be presented in the UI? → A: Floating button (bottom-right) with expandable chat panel
- Q: What size should content chunks be for embedding and retrieval? → A: Section-level (~300-500 tokens per chunk)

## Assumptions

- Chapter content will be written in Markdown/MDX format.
- Embedding model will be a lightweight sentence-transformer (e.g., all-MiniLM-L6-v2) to stay within free-tier constraints.
- LLM for answer generation will use Google Gemini API free tier (60 requests/minute, no credit card required).
- GitHub Pages will serve the static Docusaurus site; RAG backend will be hosted on a free-tier service (Railway, Render, or Vercel).
- Urdu translations will be provided as separate content files, not auto-translated.
- User authentication is NOT required for MVP (anonymous usage).
- Analytics/tracking is out of scope for initial release.

## Content Structure

The textbook comprises 6 chapters:

1. **Introduction to Physical AI** - Foundations and concepts of AI in physical systems
2. **Basics of Humanoid Robotics** - Anatomy, kinematics, and control of humanoid robots
3. **ROS 2 Fundamentals** - Robot Operating System 2 architecture, nodes, topics, services
4. **Digital Twin Simulation (Gazebo + Isaac)** - Simulation environments for robotics development
5. **Vision-Language-Action Systems** - Multimodal AI for robot perception and action
6. **Capstone: Simple AI-Robot Pipeline** - End-to-end project integrating all concepts

## Out of Scope

- User accounts and authentication
- Payment/subscription features
- Content authoring/editing interface
- Mobile native applications (web responsive only)
- Offline mode
- Video content embedding
- Interactive code execution environments
- Certificate generation
