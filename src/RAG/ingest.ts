import { downloadDocs } from "./downloader.js";
import { chunkDocs } from "./splitter.js";
import { pinecone, PINECONE_INDEX_NAME, BATCH_SIZE, RATE_LIMIT_DELAY_MS, embeddingLLM } from "../../config.js";
import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { Document } from "@langchain/core/documents";

dotenv.config();

const rawDocuments = await downloadDocs();

const chunkedDocuments = (await chunkDocs(rawDocuments)).filter(
  (doc: Document) => doc.pageContent.trim().length > 0
);


const pineconeIndex = pinecone.index(PINECONE_INDEX_NAME);

console.log("🚀 Initializing vectorization process...");
const progressBar = new cliProgress.SingleBar({});
progressBar.start(chunkedDocuments.length, 0);

for (let i = 0; i < chunkedDocuments.length; i += BATCH_SIZE) {
  const batch = chunkedDocuments.slice(i, i + BATCH_SIZE);

  if (batch.length === 0) continue;

  console.log(`📤 Embedding and indexing batch ${i}...`);
  try {
    const texts = batch.map(doc => doc.pageContent);
    const vectors = await embeddingLLM.embedDocuments(texts);
    
    if (vectors.length === 0 || vectors[0].length === 0) {
        throw new Error("Failed to generate embeddings!");
    }

    const records = batch.map((doc, idx) => {
      const flatMetadata: any = {
        text: doc.pageContent,
        source: doc.metadata.source,
        title: doc.metadata.title
      };
      
      return {
        id: `${Date.now()}-${i + idx}`, 
        values: vectors[idx],
        metadata: flatMetadata
      };
    });

    // @ts-ignore
    await pineconeIndex.upsert({ records });
    console.log(`✅ Indexed ${batch.length} documents.`);
  } catch (error) {
    console.error(`❌ Error in batch ${i}:`, error);
    throw error;
  }

  progressBar.increment(batch.length);

  if (i + BATCH_SIZE < chunkedDocuments.length) {
    console.log(`\n⏳ Cooling down for ${RATE_LIMIT_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }
}

progressBar.stop();
console.log("🌲 Data successfully synchronized with Pinecone!");
