# Legal AI - Multilingual Document Simplification & Interactive Analysis System

## Project Overview

A complete AI-powered system that simplifies complex legal documents, extracts legal entities, translates to regional languages, and answers questions using **Retrieval-Augmented Generation (RAG)** to prevent hallucinations.

### Key Features
-  PDF/DOCX/TXT document upload
-  Legal text simplification (complex → plain English)
-  Legal Named Entity Recognition (Acts, Sections, Parties, Courts, Dates)
-  Multilingual translation (9 Indian languages)
-  Document-grounded Q&A (RAG-based, no hallucinations)
-  Professional React dashboard with tab-based workflow
-  JWT authentication

---

##  How It Works 

### 1. **Document Upload**
User uploads a legal document → Backend extracts text → Stores in MongoDB

### 2. **Simplification**
Complex legal text → Groq API (LLM) → Plain English explanation

### 3. **Entity Extraction**
Regex patterns identify legal terms (Acts, Sections, Parties, etc.)

### 4. **Translation**
Simplified text → Groq API → Regional language (cached in MongoDB)

### 5. **Q&A (RAG Pipeline)**
**WHY RAG?** LLMs "hallucinate" (make up facts). RAG forces them to answer ONLY from the document.

**HOW:**
1. Document is split into chunks (paragraphs)
2. Each chunk is converted to an "embedding" (vector representation)
3. Embeddings stored in MongoDB
4. When user asks a question:
   - Question is converted to embedding
   - System finds most similar document chunks (cosine similarity)
   - ONLY those chunks are sent to LLM as context
   - LLM answers from provided context
5. Source paragraph is shown to user for verification

---

##  Tech Stack

### Backend
- Node.js + Express
- MongoDB Atlas (database)
- Groq API (LLM for simplification, translation, Q&A)
- @xenova/transformers (embeddings)
- JWT authentication

### Frontend
- React + Vite
- Tailwind CSS
- Axios
- Context API (state management)

---

##  Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Groq API key (free at https://console.groq.com)

### Step 1: Clone & Install

```bash
cd Legal

# Backend
cd backend
npm install

# Frontend (in new terminal)
cd ../frontend
npm install
```

### Step 2: Configure Backend

1. Create `.env` file in `backend/` folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/legalai
JWT_SECRET=your_random_secret_key_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

2. Get MongoDB URI:
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<username>` and `<password>`

3. Get Groq API Key:
   - Go to https://console.groq.com
   - Sign up (free)
   - Create API key
   - Copy to `.env`

### Step 3: Run the System

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Access:** http://localhost:3000

---

##  User Guide

### First Time Setup
1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter name, email, password
4. Login

### Using the System

#### Tab 1: Upload
1. Click "Choose File"
2. Select PDF/DOCX/TXT (max 10MB)
3. Click "Upload Document"
4. Wait for processing

#### Tab 2: Simplification
1. Click "Simplify Document"
2. Wait 10-20 seconds
3. View original vs simplified side-by-side

#### Tab 3: Entities
1. Click "Extract Entities"
2. View grouped legal terms:
   - Acts & Laws
   - Sections
   - Parties
   - Courts
   - Dates

#### Tab 4: Translation
1. Select language (Hindi, Bengali, etc.)
2. Click "Translate"
3. View English vs translated text
4. Switch languages (translations are cached)

#### Tab 5: Q&A
1. Click "Prepare for Q&A" (generates embeddings)
2. Type question in input box
3. Press Enter or click "Ask"
4. View answer with:
   - ✓ Found/✗ Not found badge
   - Confidence score
   - Source paragraph (click "Show source")

---

##  Concepts Explained (For Viva)

### What is RAG?
**Retrieval-Augmented Generation** = Retrieve relevant document parts → Send to LLM → Generate answer

**Why?** LLMs have knowledge cutoff and hallucinate. RAG grounds them in YOUR document.

### What are Embeddings?
Mathematical representations of text (arrays of numbers). Similar meanings = similar vectors.

**Example:**
- "Supreme Court" → [0.2, 0.8, 0.1, ...]
- "High Court" → [0.3, 0.7, 0.2, ...] (similar)
- "Pizza" → [0.9, 0.1, 0.8, ...] (different)

### Cosine Similarity
Measures how similar two vectors are (0 = different, 1 = identical).

Used to find document chunks most relevant to user's question.

### Why Groq?
- Fast inference (low latency)
- Free tier available
- Good for demos
- Uses Llama 3.1 (open-source model)

---

##  Architecture Diagram

```
User → React Frontend → Express Backend → MongoDB
                              ↓
                         Groq API (LLM)
                              ↓
                    Xenova Transformers (Embeddings)
```

**Data Flow:**
1. Upload → Extract text → Store in MongoDB
2. Simplify → Send to Groq → Store result
3. Entities → Regex extraction → Store
4. Translate → Send to Groq → Cache in MongoDB
5. Q&A → Generate embeddings → Find similar chunks → Send to Groq → Return answer

---

##  Common Issues & Solutions

### Backend won't start
- Check `.env` file exists
- Verify MongoDB URI is correct
- Ensure port 5000 is free

### Frontend shows "Network Error"
- Check backend is running on port 5000
- Verify CORS is enabled

### "Invalid token" error
- Logout and login again
- Clear localStorage

### Simplification/Translation fails
- Check Groq API key is valid
- Check API rate limits

### Q&A not working
- Click "Prepare for Q&A" first
- Wait for embedding generation
- Check document has text

---

##  Project Structure

```
Legal/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Document.js       # Document schema (stores everything)
│   ├── routes/
│   │   ├── auth.js           # Login/signup
│   │   ├── document.js       # Upload, simplify, entities, translate
│   │   └── qa.js             # Question answering
│   ├── services/
│   │   ├── textExtractor.js  # PDF/DOCX parsing
│   │   ├── simplifier.js     # Groq simplification
│   │   ├── nerExtractor.js   # Entity extraction
│   │   ├── translator.js     # Groq translation
│   │   ├── embeddingService.js # Vector generation
│   │   └── qaService.js      # RAG implementation
│   ├── middleware/auth.js    # JWT verification
│   └── server.js             # Express app
└── frontend/
    ├── src/
    │   ├── components/       # React components (tabs)
    │   ├── context/          # State management
    │   ├── App.jsx           # Main app
    │   └── main.jsx          # Entry point
    └── index.html
```

---

##  Demo Flow (For Presentation)

1. **Login** → Show authentication
2. **Upload** → Upload sample legal document
3. **Simplification** → Show original vs simplified
4. **Entities** → Highlight extracted legal terms
5. **Translation** → Switch between languages
6. **Q&A** → Ask questions, show source verification
7. **Explain RAG** → Show how it prevents hallucinations

---

##  Security Features

- Password hashing (bcrypt)
- JWT authentication
- File type validation
- File size limits
- User-specific document access

---

##  Future Enhancements (Optional)

-  PDF highlighting of entities
-  Export simplified documents
-  Batch document processing
-  Admin dashboard
-  Document comparison
-  Citation extraction
-  Legal precedent search

---

##  License

Academic/Educational Use

---

##  Author

Built as an academic project demonstrating:
- NLP in legal domain
- RAG implementation
- Full-stack development
- AI system design

---

##  Acknowledgments

- Groq for fast LLM inference
- Hugging Face for transformer models
- MongoDB Atlas for database
- React + Vite for frontend

---

**Questions? Issues? Check the troubleshooting section or review the code comments.**
