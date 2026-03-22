import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetriever } from "./retriever";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "@langchain/classic/util/document";
import { ChatHandler, chat } from "../utils/chat";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { llm, RAG_SYSTEM_PROMPT } from "../../config";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
  Context: {context} 
  `,
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);


const outputParser = new StringOutputParser();

const retriever = await createRetriever();

const retrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  (docs) => {
    console.log(`📚 Retrieved ${docs.length} relevant context fragments.`);
    return formatDocumentsAsString(docs);
  },
]);

const generationChain = RunnableSequence.from([
  {
    question: (input: any) => input.question,
    context: retrievalChain,
    chat_history: (input: any) => input.chat_history,
  },
  (input: any) => {
    console.log(`🔗 Passing to prompt. Context length: ${input.context.length} chars.`);
    return input;
  },
  prompt,
  (input: any) => {
    console.log("🤖 Calling LLM...");
    return input;
  },
  llm,
  outputParser,
]);

const standaloneQuestionPrompt = ChatPromptTemplate.fromMessages([
  ["system", RAG_SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const standaloneQuestionChain = RunnableSequence.from([standaloneQuestionPrompt, llm, outputParser]);

const chatHistory: BaseMessage[] = [];

const chatHandler: ChatHandler = async (question: string) => {
  if (!question.trim()) {
    return {
      answer: Promise.resolve("Please provide a valid question."),
    };
  }
  let contextualizedQuestion = null;

  if (chatHistory.length > 0) {
    contextualizedQuestion = await standaloneQuestionChain.invoke({
      question,
      chat_history: chatHistory,
    });
    console.log(`🔍 Standalone Question: ${contextualizedQuestion}`);
  }

  return {
    answer: generationChain.stream({
      question: contextualizedQuestion || question,
      chat_history: chatHistory,
    }),
    answerCallBack: async (answerText: string) => {
      chatHistory.push(new HumanMessage(contextualizedQuestion || question));
      chatHistory.push(new AIMessage(answerText));
    },
  };
};

chat(chatHandler).catch(console.error);
