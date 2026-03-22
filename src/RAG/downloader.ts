import { Document } from "@langchain/core/documents";
import { crawlUrls } from "./crawler";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import cliProgress from "cli-progress";

const progressBar = new cliProgress.SingleBar({});
import * as cheerio from "cheerio";

export async function downloadDocs(): Promise<Document[]> {
  const langchainDocsUrls = await crawlUrls();

  console.log(
    `📥 Starting document download (${langchainDocsUrls.length} files found).`
  );

  const rawDocuments: Document[] = [];

  for (const url of langchainDocsUrls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Basic text extraction from body or article
      const content = $("body").text().trim();
      
      if (content.length > 0) {
        console.log(`📄 Content length: ${content.length} characters.`);
        rawDocuments.push(new Document({
          pageContent: content,
          metadata: { source: url, title: $("title").text() }
        }));
      }
    } catch (error) {
       console.error(`Error downloading ${url}:`, error);
    }
  }

  console.log(`✅ ${rawDocuments.length} documents successfully loaded.`);
  return rawDocuments;
}

