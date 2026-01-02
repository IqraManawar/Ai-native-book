---
id: 001
title: Physical AI Textbook Constitution
stage: constitution
date: 2025-12-15
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: iqra
command: /sp.constitution
labels: ["constitution", "physical-ai", "docusaurus", "rag-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

```text
#Project Name: Physical AI & Humanoid Robotics Essentials
#Purpose:
Create a short, clean, professional AI-Native textbook based on the Physical AI & Humanoid Robotics course.
The book must serve as a fast, simple, high-quality learning resource built with a modern Docusaurus UI
and a fully integrated free-tier RAG chatbot.
#Scope:
- 6 short chapters:
  1. Introduction to Physical AI
  2. Basics of Humanoid Robotics
  3. ROS 2 Fundamentals
  4. Digital Twin Simulation (Gazebo + Isaac)
  5. Vision-Language-Action Systems
  6. Capstone: Simple AI-Robot Pipeline
- Clean UI
- Free-tier friendly
- Lightweight embeddings

#Core Principles:
- Simplicity
- Accuracy
- Minimalism
- Fast builds
- Free-tier architecture
- RAG answers ONLY from book text

#Key Features:
- Docusaurus textbook
- RAG chatbot (Qdrant + Neon + FastAPI)
- Select-text → Ask AI
- Optional Urdu / Personalize features

#Constraints:
- No heavy GPU usage
- Minimal embeddings

#Success Criteria:
- Build success
- Accurate chatbot
- Clean UI
- Smooth GitHub Pages deployment

#Generate full constitution.
```

## Response snapshot

Created initial constitution v1.0.0 for Physical AI & Humanoid Robotics Essentials project with 6 core principles:
1. Simplicity First - favor simplest working solutions
2. Accuracy Over Comprehensiveness - technical accuracy, no hallucination
3. Free-Tier Architecture - all infrastructure within free-tier limits
4. Fast Builds - sub-2-minute builds, optimized bundles
5. RAG Integrity - answers only from indexed book content with citations
6. Clean User Experience - minimalist, professional, mobile-first UI

Added Technical Constraints (stack definitions, content structure, performance budgets), Development Workflow (content, RAG pipeline, quality gates), and Governance sections.

## Outcome

- Impact: Created foundational project constitution defining all principles and constraints
- Tests: N/A (constitution document)
- Files: 1 file created (.specify/memory/constitution.md)
- Next prompts: /sp.specify to create feature specs, /sp.plan to create implementation plans
- Reflection: Successfully captured all user requirements into declarative, testable principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution against first feature spec
