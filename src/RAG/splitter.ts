import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CHUNK_SIZE, CHUNK_OVERLAP } from "../../config";

export async function chunkDocs(
  rawDocuments: Document[]
): Promise<Document[]> {
  console.log("✂️  Dividing documents into searchable chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const documentChunks = await splitter.splitDocuments(rawDocuments);

  console.log(
    `🧩 Processed ${rawDocuments.length} files into ${documentChunks.length} chunks.`
  );

  return documentChunks;
}

