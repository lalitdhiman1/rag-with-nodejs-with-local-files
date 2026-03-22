import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { PineconeStore } from "@langchain/pinecone";
import { embeddingLLM, PINECONE_INDEX_NAME, pinecone, RETRIEVER_K } from "../../config";

export async function createRetriever(): Promise<VectorStoreRetriever> {

  
  const pineconeIndex = pinecone.index(PINECONE_INDEX_NAME);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddingLLM, {
    pineconeIndex,
  });

  const retriever = vectorStore.asRetriever(RETRIEVER_K);

  return retriever;
}
