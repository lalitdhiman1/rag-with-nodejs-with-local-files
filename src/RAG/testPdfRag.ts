import { createRetriever } from "./retriever.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "@langchain/classic/util/document";
import { llm } from "../../config.js";

async function testPdfRag() {
  console.log("🔍 Testing PDF RAG...");
  
  const retriever = await createRetriever();
  const outputParser = new StringOutputParser();

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    Context: {context} 
    `,
    ],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.invoke(input.question);
        console.log(`📚 Retrieved ${docs.length} documents.`);
        docs.forEach((doc, idx) => {
          console.log(`- Source ${idx + 1}: ${doc.metadata.source} (${doc.pageContent.substring(0, 50)}...)`);
        });
        return formatDocumentsAsString(docs);
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    llm,
    outputParser,
  ]);

  const question = "What are the key responsibilities of a software architect according to the local files?";
  console.log(`❓ Question: ${question}`);
  
  const response = await chain.invoke({ question });
  console.log(`\n🤖 AI Response: ${response}`);
}

testPdfRag().catch(console.error);
