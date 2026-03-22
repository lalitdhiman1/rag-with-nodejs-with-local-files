# 🚀 Langchain Gemini RAG Chatbot

A high-performance RAG (Retrieval-Augmented Generation) chatbot built with Node.js, TypeScript, Google Gemini, and Pinecone. This project supports two modes:
1. **Web Crawler RAG**: Crawls online documentation.
2. **Local Folder RAG**: Processes PDFs, TXT, and MD files from a local `data/` folder.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following:
- **Node.js**: v18.0.0 or higher
- **Pinecone Account**: A Pinecone index with **768 dimensions** (required for Google Gemini `text-embedding-004` or similar). 
- **Google AI Studio Key**: An API key for Gemini models (`gemini-flash-latest` and `gemini-embedding-001`).

---

## 📦 Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Create a `.env` file in the root directory and add your credentials:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```
4. Ensure you have a `data/` folder in the root for local files.

---

## ⚙️ Configuration

Tune the system by editing `config.ts`:
- `BATCH_SIZE`: Documents processed per batch (Default: 20).
- `RATE_LIMIT_DELAY_MS`: Pause between batches (Default: 5s).
- `RETRIEVER_K`: context fragments to retrieve (Default: 10).
- `LANGCHAIN_DOCS_HOME`: URL for web crawling.

---

## 🚀 How to Run

### Option A: Local Folder RAG (Recommended)
Place your `.pdf`, `.txt`, or `.md` files in the `data/` folder, then run:
```bash
npm run pdf-vectorize
```

### Option B: Web Crawler RAG
Crawl the URL specified in `config.ts`:
```bash
npm run vectorize
```

### 2. Start Chatting
Launch the terminal-based chat application:
```bash
npm start
```
- **🤖 Standalone Questioning**: Reformulates follow-up questions using chat history.
- **📚 Streaming Response**: Answers are streamed in real-time.
- **🚪 Exit**: Type `exit` to close.

---

## 📁 Project Structure

- `src/RAG/`:
    - `chatApp.ts`: Main application entry point.
    - `pdfIngest.ts**: Script for indexing the local `data/` folder.
    - `ingest.ts**: Script for web crawling and vectorizing.
    - `splitter.ts`: Logic for chunking documents (Generic and HTML).
    - `retriever.ts`: Pinecone retrieval configuration.
- `data/`: Place your local PDF/Text documents here.

---

## 🧹 Maintenance
The project uses `tsx` to run TypeScript files directly for the best development experience.
```bash
# To build to JS
npm run build
```

