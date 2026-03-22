import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

export const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-flash-latest",
});

export const embeddingLLM = new GoogleGenerativeAIEmbeddings({
  model: "models/gemini-embedding-2-preview",
  apiKey: process.env.GOOGLE_API_KEY,
});

export const pinecone = new Pinecone();

export const PINECONE_INDEX_NAME = "genai-docs";

export const BATCH_SIZE = 20;
export const RATE_LIMIT_DELAY_MS = 5000;
export const RETRIEVER_K = 10;
export const CHUNK_SIZE = 500;
export const CHUNK_OVERLAP = 100;

export const LANGCHAIN_DOCS_HOME = "https://lalitdhiman1.github.io/index.html";
export const LANGCHAIN_DOCS_PREFIX = "";
export const RAG_SYSTEM_PROMPT = `Help me turn this user's latest question into a standalone version! Using the chat history for context, rewrite the question so anyone could understand it without seeing the previous messages. If it’s already clear, no changes are needed. Just the reformulated text, please—no need to answer the question itself.`;