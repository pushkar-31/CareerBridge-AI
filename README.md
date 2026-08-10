🚀 SkillBridge AI

An AI-powered career assistant that understands your Resume, JobDescription, and helps you bridge the gap between them.

SkillBridge AI combines Retrieval-Augmented Generation (RAG),Gemini embeddings, Chroma Cloud, and LangChain to providepersonalized career guidance based on the documents you upload.

✨ What Makes SkillBridge AI Different?

Instead of sending your entire resume directly to an LLM and hoping fora useful answer, SkillBridge AI builds a searchable knowledge base fromyour documents.

🔥 Key Features

Feature                             Description

📄 Resume Upload                Upload a PDF resume andautomatically extract its content

💼 Job Description Upload       Upload a target JD and ingest itsrequirements

🧠 RAG-powered Career Chat      Ask questions using your actualresume + JD context

🔎 Semantic Search              Retrieve the most relevant documentchunks using vector embeddings

🤝 Resume ↔ JD Matching         Identify matching skills andmissing requirements

⚡ Gemini AI                    Generate contextual career answers

🗄️ Chroma Cloud                 Store and search documentembeddings

🔐 Session Isolation            Uploaded documents are associatedwith a unique Career Chat session

🧹 Automatic Cleanup            Session vectors are deleted whenthe Career Chat page is left

📝 Resume Analyzer              Analyze resume quality, ATS score,skills, strengths, weaknesses, andsuggestions

🧠 How It Works

                    ┌─────────────────┐
                    │   Resume PDF    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  PDF Extraction │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Text Chunking   │
                    │ LangChain       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Gemini Embedding│
                    └────────┬────────┘
                             │
                             ▼
┌───────────────┐    ┌─────────────────┐
│   Job PDF     │───►│  Chroma Cloud   │
└───────────────┘    │ Vector Database │
                     └────────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
             Resume Retrieval      JD Retrieval
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────┐
                    │ Combined Context│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Gemini LLM    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Career Answer   │
                    └─────────────────┘

💬 Example

Upload:

Your Resume

The Job Description

Then ask:

"What skills does Pushkar have that match this job?"

SkillBridge AI retrieves relevant chunks from both documents,compares them, and generates a contextual response.

Example output:

✅ AI / RAG skills
✅ Python / Java
✅ TypeScript / JavaScript
✅ React / Next.js
✅ Node.js / Express.js
✅ SQL

⚠️ Potential gap:
Oracle Cloud

🛠️ Tech Stack

Frontend

Next.js 16

React

TypeScript

Tailwind CSS

AI / RAG

Google Gemini

LangChain

Google Generative AI Embeddings

Retrieval-Augmented Generation (RAG)

Vector Database

Chroma Cloud

Vector similarity search

Session-based metadata filtering

Document Processing

pdf2json

Recursive Character Text Splitter

Development

Node.js

Git / GitHub

VS Code

📁 Project Structure

skillbridge-ai/
│
├── app/
│   ├── api/
│   │   ├── career-chat/
│   │   │   ├── route.ts
│   │   │   ├── cleanup/
│   │   │   │   └── route.ts
│   │   │   ├── upload-resume/
│   │   │   │   └── route.ts
│   │   │   └── upload-jd/
│   │   │       └── route.ts
│   │   │
│   │   └── ...
│   │
│   ├── career-chat/
│   │   └── page.tsx
│   │
│   └── resume-analyzer/
│       └── page.tsx
│
├── components/
│   └── career-assistant/
│       └── CareerAssistant.tsx
│
├── lib/
│   └── rag/
│       ├── embeddings.ts
│       ├── generator.ts
│       ├── ingest.ts
│       ├── retriever.ts
│       └── vectorStore.ts
│
├── .env.local
├── package.json
└── README.md

🔄 RAG Pipeline

SkillBridge AI follows a complete document-to-answer pipeline:

1️⃣ Upload

The user uploads a Resume and Job Description PDF.

2️⃣ Extract

PDF content is extracted into plain text.

3️⃣ Chunk

Large documents are divided into smaller overlapping chunks usingLangChain's RecursiveCharacterTextSplitter.

4️⃣ Embed

Each chunk is converted into a vector using Google's embedding model.

5️⃣ Store

Vectors are stored in Chroma Cloud together with metadata:

{
  "documentType": "resume",
  "chunkIndex": 0,
  "sessionId": "unique-session-id"
}

6️⃣ Retrieve

When the user asks a question, the question is embedded and relevantchunks are retrieved.

The retrieval is session-aware:

sessionId = current session
        +
documentType = resume / jd

7️⃣ Generate

Relevant Resume and JD context is combined and sent to Gemini.

8️⃣ Respond

Gemini generates a grounded career-focused answer.

🔐 Privacy-Oriented Session Design

Uploaded career documents are not intended to become permanent userdata.

Each Career Chat session receives a unique:

sessionId

Documents are stored with that identifier.

When the user leaves the Career Chat page, the frontend requests:

POST /api/career-chat/cleanup

The cleanup API removes vectors belonging to that session.

User Session
     │
     ├── Resume vectors
     │
     └── JD vectors
            │
            ▼
       Session ends
            │
            ▼
       Cleanup API
            │
            ▼
      ChromaDB deletion

Note: Browser page-exit cleanup is best-effort. A productiondeployment should also use a server-side expiration/cleanup mechanismas a safety net for crashes, forced shutdowns, or network failures.

⚙️ Getting Started

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/skillbridge-ai.git
cd skillbridge-ai

2. Install dependencies

npm install

3. Configure environment variables

Create:

.env.local

Add:

GEMINI_API_KEY=your_gemini_api_key

CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database

Never commit .env.local or expose API keys publicly.

4. Start the development server

npm run dev

Open:

http://localhost:3000

🧪 Core Test Flow

Test the embedding system

GET /api/test-embedding

Expected result:

{
  "success": true
}

Test Chroma

GET /api/test-chroma

Test document ingestion

GET /api/test-ingest

Test RAG

GET /api/test-rag

Test Career Chat

POST /api/career-chat

Example:

{
  "question": "What skills does Pushkar have that match this job?",
  "sessionId": "your-session-id"
}

📊 Current Capabilities

SkillBridge AI can currently:

✅ Extract Resume PDFs

✅ Extract Job Description PDFs

✅ Split documents into semantic chunks

✅ Generate vector embeddings

✅ Store vectors in Chroma Cloud

✅ Retrieve relevant Resume context

✅ Retrieve relevant JD context

✅ Compare Resume and JD information

✅ Generate grounded AI responses

✅ Maintain session-specific document retrieval

✅ Delete session vectors during normal Career Chat exit

✅ Provide resume analysis data including ATS score and improvementsuggestions

🚧 Roadmap

Phase 1 --- AI Foundation

Gemini integration

Embeddings

Chroma Cloud

LangChain text splitting

RAG pipeline

Phase 2 --- Career Intelligence

Resume upload

JD upload

Resume/JD retrieval

Career Chat

Resume ↔ JD comparison

Session isolation

Session cleanup

Phase 3 --- Product Polish

Advanced job-match scoring

Skill-gap visualization

Better source/citation display

Suggested career questions

Improved streaming responses

Stronger production error handling

Phase 4 --- Production

Authentication

User profiles

Saved analyses

Server-side document expiration

Rate limiting

Production deployment

Monitoring and analytics

🎯 Vision

SkillBridge AI is designed to become more than a resume analyzer.

The goal is to create an intelligent career companion that can answer:

"Where am I right now, where does this job require me to be, andexactly what should I do next?"

From resume analysis to skill-gap identification and personalized careerguidance, SkillBridge aims to bridge the gap between what you knowand what your target role requires.

⭐ If You Find This Project Interesting

Give the repository a ⭐ on GitHub and follow the development ofSkillBridge AI.

👨‍💻 Author

Pushkar Shelke

Built with:

Next.js · TypeScript · LangChain · Gemini · ChromaDB · RAG

📄 License

This project is currently intended as a personal/portfolio project.
