# Quickstart: AI-Native Textbook Development

**Feature**: 001-textbook-generation
**Date**: 2025-12-15

## Prerequisites

- Node.js 18+ (for Docusaurus)
- Python 3.11+ (for backend)
- Git

## 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd Hackhaton-4

# Checkout feature branch
git checkout 001-textbook-generation
```

## 2. Frontend Setup (Docusaurus)

```bash
cd my-website

# Install dependencies
npm install

# Start development server
npm run start
```

The site will be available at `http://localhost:3000`.

### Add Chapter Content

Create MDX files in `docs/`:

```
docs/
├── intro.md                    # Landing page
├── chapter-1-physical-ai/
│   ├── index.md               # Chapter intro
│   ├── what-is-physical-ai.md
│   └── applications.md
├── chapter-2-humanoid-robotics/
│   └── ...
└── ...
```

Sidebar is auto-generated from folder structure.

## 3. Backend Setup (FastAPI + RAG)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

Create `backend/.env`:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Qdrant Cloud
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# Neon PostgreSQL (optional, for query logging)
DATABASE_URL=postgresql://user:pass@host/db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-github-pages-url
```

### Start Backend

```bash
# Run development server
uvicorn src.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`.

## 4. Index Content

Before the chatbot works, you must index the textbook content:

```bash
# From backend directory
python scripts/index-content.py --content-dir ../my-website/docs
```

This will:
1. Parse all MDX files
2. Chunk content into sections (~300-500 tokens)
3. Generate embeddings using sentence-transformers
4. Upload vectors to Qdrant

## 5. Test the Chatbot

With both frontend and backend running:

1. Open `http://localhost:3000`
2. Click the chat button (bottom-right)
3. Ask: "What is Physical AI?"
4. Verify you get an answer with citations

## 6. Build for Production

### Frontend

```bash
cd my-website
npm run build
```

Output in `build/` folder, ready for GitHub Pages.

### Backend

```bash
cd backend
docker build -t textbook-rag .
```

Deploy to Railway/Render using the Dockerfile.

## Common Issues

### "No embeddings found"
- Run `index-content.py` first
- Check Qdrant connection in `.env`

### "Gemini rate limit"
- Free tier is 60 req/min
- Wait a minute and retry
- Consider adding request queuing

### "CORS error"
- Add your frontend URL to `ALLOWED_ORIGINS`
- Restart backend after changing `.env`

### "Slow responses"
- First request after idle wakes up Railway/Render (cold start)
- Subsequent requests will be faster
- Consider implementing a keep-alive ping

## Development Workflow

1. **Write content**: Add/edit MDX in `my-website/docs/`
2. **Preview**: `npm run start` shows changes instantly
3. **Re-index**: Run `index-content.py` after content changes
4. **Test RAG**: Verify chatbot answers reflect new content
5. **Deploy**: Push to GitHub → Actions build and deploy

## Next Steps

- Run `/sp.tasks` to generate implementation tasks
- Start with P1 user stories (Browse Content, Ask AI)
- Add ChatWidget component to Docusaurus theme
