import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { chunkDocs } from "./splitter.js";
import { pinecone, PINECONE_INDEX_NAME, BATCH_SIZE, RATE_LIMIT_DELAY_MS, embeddingLLM } from "../../config.js";
import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { Document } from "@langchain/core/documents";
import path from "path";
import fs from "fs";

dotenv.config();

async function ingestLocalFolder() {
  const dataPath = path.resolve("data");
  console.log(`📁 Scanning folder: ${dataPath}`);

  const files = fs.readdirSync(dataPath).filter(file => !file.startsWith('.'));
  console.log(`🔍 Found ${files.length} files to process.`);

  const allDocuments: Document[] = [];

  for (const file of files) {
    const filePath = path.join(dataPath, file);
    const extension = path.extname(file).toLowerCase();
    
    console.log(`📄 Loading file: ${file} (${extension})`);

    try {
      if (extension === '.pdf') {
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        docs.forEach((doc: Document) => {
          doc.metadata.source = file;
          doc.metadata.title = file;
        });
        allDocuments.push(...docs);
      } else if (extension === '.txt' || extension === '.md') {
        const content = fs.readFileSync(filePath, "utf8");
        allDocuments.push(new Document({
          pageContent: content,
          metadata: { source: file, title: file }
        }));
      } else {
        console.log(`⚠️  Skipping unsupported file type: ${file}`);
        continue;
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }

  if (allDocuments.length === 0) {
    console.log("⚠️  No documents were loaded. Exiting.");
    return;
  }

  console.log(`📥 Loaded ${allDocuments.length} total pages/sections from all files.`);

  const chunkedDocuments = (await chunkDocs(allDocuments)).filter(
    (doc: Document) => doc.pageContent.trim().length > 0
  );

  const pineconeIndex = pinecone.index(PINECONE_INDEX_NAME);

  console.log(`🚀 Initializing vectorization process for ${chunkedDocuments.length} chunks...`);
  const progressBar = new cliProgress.SingleBar({});
  progressBar.start(chunkedDocuments.length, 0);

  for (let i = 0; i < chunkedDocuments.length; i += BATCH_SIZE) {
    const batch = chunkedDocuments.slice(i, i + BATCH_SIZE);

    if (batch.length === 0) continue;

    console.log(`\n📤 Embedding and indexing batch starting at ${i}...`);
    try {
      const texts = batch.map(doc => doc.pageContent);
      const vectors = await embeddingLLM.embedDocuments(texts);
      
      if (vectors.length === 0 || vectors[0].length === 0) {
          throw new Error("Failed to generate embeddings!");
      }

      const records = batch.map((doc, idx) => {
        return {
          id: `local-${path.basename(doc.metadata.source)}-${Date.now()}-${i + idx}`, 
          values: vectors[idx],
          metadata: {
            text: doc.pageContent,
            source: doc.metadata.source,
            title: doc.metadata.title
          }
        };
      });

      // @ts-ignore
      await pineconeIndex.upsert({ records });
    } catch (error) {
      console.error(`❌ Error in batch ${i}:`, error);
      throw error;
    }

    progressBar.increment(batch.length);

    if (i + BATCH_SIZE < chunkedDocuments.length) {
      console.log(`⏳ Cooling down for ${RATE_LIMIT_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  progressBar.stop();
  console.log("🌲 Folder data successfully synchronized with Pinecone!");
}

ingestLocalFolder().catch(console.error);


