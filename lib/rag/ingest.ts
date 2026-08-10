import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "./embeddings";
import {
  getCareerCollection,
  addToCareerCollection,
} from "./vectorStore";

const splitter =
  new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

export async function ingestDocument(
  text: string,
  documentType: "resume" | "jd",
  sessionId: string
) {
  if (!text || !text.trim()) {
    throw new Error(
      `No text provided for ${documentType}.`
    );
  }

  if (!sessionId || !sessionId.trim()) {
    throw new Error(
      "Session ID is required for document ingestion."
    );
  }

  console.log(
    `=== INGESTING ${documentType.toUpperCase()} ===`
  );

  console.log(
    "Session ID:",
    sessionId
  );

  // --------------------------------
  // 1. Split document into chunks
  // --------------------------------

  const documents =
    await splitter.createDocuments([text]);

  console.log(
    `Chunks created: ${documents.length}`
  );

  const texts = documents.map(
    (document) => document.pageContent
  );

  // --------------------------------
  // 2. Generate Gemini embeddings
  // --------------------------------

  console.log(
    "Generating embeddings..."
  );

  const vectors =
    await embeddings.embedDocuments(
      texts
    );

  console.log(
    `Embeddings generated: ${vectors.length}`
  );

  // --------------------------------
  // 3. Get Chroma collection
  // --------------------------------

  console.log(
    "Connecting to ChromaDB..."
  );

  const collection =
    await getCareerCollection();

  // --------------------------------
  // 4. Generate unique IDs
  // --------------------------------

  const timestamp = Date.now();

  const ids = documents.map(
    (_, index) =>
      `${documentType}-${sessionId}-${timestamp}-${index}`
  );

  // --------------------------------
  // 5. Create metadata
  // --------------------------------

  const metadatas =
    documents.map((_, index) => ({
      documentType,
      chunkIndex: index,
      sessionId,
    }));

  // --------------------------------
  // 6. Store in ChromaDB
  // --------------------------------

  await addToCareerCollection(
    collection.id,
    ids,
    texts,
    vectors,
    metadatas
  );

  console.log(
    `=== ${documentType.toUpperCase()} INGESTION COMPLETE ===`
  );

  return {
    documentType,
    chunks: documents.length,
    collectionId: collection.id,
    sessionId,
  };
}