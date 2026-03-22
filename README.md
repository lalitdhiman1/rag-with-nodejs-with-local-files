# 🚀 Rag Nodejs with Local Files

A high-performance RAG (Retrieval-Augmented Generation) architecture built using **Node.js, TypeScript, Google Gemini, and Pinecone**. This system allows you to chat with your local documents or crawl any web documentation in real-time.

---

## 📁 Local Data Support

The system is designed to pick up all files from the `data/` folder automatically.

### 📄 Supported File Types:
-   **PDF (`.pdf`)**: Scientific papers, resumes, documentation, etc.
*   **Text (`.txt`)**: Plain text notes and logs.
*   **Markdown (`.md`)**: Project documentation and READMEs.

### 📥 How to Add Your Own Files:
1.  Navigate to the `data/` folder in the root of the project.
2.  Drop your documents directly into this folder.
3.  **Examples currently included:** 
    -   `frontend.pdf`
    -   `ios.pdf`
    -   `software-architect.pdf`

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following:
- **Node.js**: v18.0.0 or higher
- **Pinecone Account**: A Pinecone index with **768 dimensions** (required for Google Gemini `text-embedding-004`).
- **Google AI Studio Key**: API key for Gemini models (`gemini-flash-latest` and `gemini-embedding-004`).

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
---

## 🚀 How to Run

### Step 1: Index Your Local Files
To process and vectorize all files in the `data/` folder:
```bash
npm run pdf-vectorize
```

### Step 2: Start Chatting
Launch the terminal-based chat application:
```bash
npm start
```
- **🤖 Context Aware**: The system uses chat history to understand follow-up questions.
- **📚 Multi-Source**: It can retrieve answers from multiple files simultaneously (e.g., asking about shared skills between iOS and Frontend).
- **🚪 Exit**: Type `exit` to close.

---

## 📁 Project Structure

- `src/RAG/`:
    - `pdfIngest.ts**: Automates scanning and indexing for all files in the `data/` folder.
    - `chatApp.ts`: Entry point for the interactive chat interface.
    - `splitter.ts`: Chunks your documents into searchable fragments.
- `data/`: Your local documents knowledge base.

---

## 🧹 Maintenance
The project uses `tsx` to run TypeScript files directly for the best development experience.
```bash
# To build to JS
npm run build
```

