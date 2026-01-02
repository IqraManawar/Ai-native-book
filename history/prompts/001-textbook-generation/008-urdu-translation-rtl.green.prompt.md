---
id: 008
title: Urdu Translation with RTL Support
stage: green
date: 2025-12-18
surface: agent
model: claude-opus-4-5-20251101
feature: 001-textbook-generation
branch: 001-textbook-generation
user: iqra
command: claude --continue
labels: ["i18n", "urdu", "rtl", "translation", "multilingual"]
links:
  spec: specs/001-textbook-generation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - my-website/docusaurus.config.ts
  - my-website/src/css/custom.css
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/intro.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-1-physical-ai/index.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-2-humanoid-robotics/index.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-3-ros2/index.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-4-digital-twin/index.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-5-vla-systems/index.md
  - my-website/i18n/ur/docusaurus-plugin-content-docs/current/chapter-6-capstone/index.md
  - backend/src/services/generator.py
  - backend/src/services/indexer.py
  - scripts/index-content.py
  - specs/001-textbook-generation/tasks.md
tests:
  - npm run build (both en and ur locales)
---

## Prompt

Would you like me to continue with:
1. Phase 7 - Urdu Translation (User Story 5: T042-T047)

User selected: Phase 7 - Urdu Translation

## Response snapshot

Implemented complete Urdu translation support with RTL (Right-to-Left) layout:

**Frontend (Docusaurus):**
- Updated `docusaurus.config.ts` with i18n configuration for English and Urdu locales
- Added locale dropdown to navbar for language switching
- Created comprehensive RTL CSS support in `custom.css` (~100 lines)
- Created all 7 Urdu translation files covering intro and all 6 chapters
- RTL styles handle: markdown content, sidebar, navbar, tables, code blocks (kept LTR), blockquotes

**Backend (FastAPI):**
- Added multilingual system prompts in `generator.py` with Urdu-specific instructions
- Added no-answer responses in both languages
- Updated `indexer.py` to support language parameter with language-prefixed chunk IDs
- Modified indexing script to accept `--language` argument (en, ur, all)

**Build Verification:**
- Both English and Urdu locales build successfully
- Static files generated in `build/` (English) and `build/ur/` (Urdu)

## Outcome

- ✅ Impact: User Story 5 complete - Urdu readers can now access full translated content with proper RTL layout
- 🧪 Tests: Build passes for both locales (en, ur)
- 📁 Files: 13 files modified/created
- 🔁 Next prompts: Phase 8 - Personalized Learning Path (T048-T051)
- 🧠 Reflection: Used Docusaurus native i18n system for maintainability; RTL CSS requires explicit overrides for many elements but keeps code blocks LTR for readability

## Evaluation notes (flywheel)

- Failure modes observed: None - implementation successful on first attempt
- Graders run and results (PASS/FAIL): Build PASS for both locales
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Test Urdu content with native speakers for translation quality
