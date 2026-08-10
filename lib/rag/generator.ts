import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { retrieveRelevantChunks } from "./retriever";

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured."
  );
}

const model =
  new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    apiKey,
  });

export async function generateRAGAnswer(
  question: string,
  sessionId: string,
  documentType?: "resume" | "jd"
) {
  if (
    !question ||
    !question.trim()
  ) {
    throw new Error(
      "Question cannot be empty."
    );
  }

  if (
    !sessionId ||
    !sessionId.trim()
  ) {
    throw new Error(
      "Session ID is required."
    );
  }

  console.log(
    "=== RAG GENERATION STARTED ==="
  );

  console.log(
    "Session ID:",
    sessionId
  );

  // --------------------------------
  // 1. Retrieve context
  // --------------------------------

  let documents: string[] = [];
  let metadatas: any[] = [];

  if (documentType) {
    // --------------------------------
    // Retrieve specific document type
    // --------------------------------

    const results =
      await retrieveRelevantChunks(
        question,
        sessionId,
        documentType,
        5
      );

    documents =
      results?.documents?.[0] ??
      [];

    metadatas =
      results?.metadatas?.[0] ??
      [];
  } else {
    // --------------------------------
    // Retrieve Resume
    // --------------------------------

    console.log(
      "Retrieving resume context..."
    );

    const resumeResults =
      await retrieveRelevantChunks(
        question,
        sessionId,
        "resume",
        3
      );

    const resumeDocuments =
      resumeResults?.documents?.[0] ??
      [];

    const resumeMetadatas =
      resumeResults?.metadatas?.[0] ??
      [];

    console.log(
      "Resume chunks:",
      resumeDocuments.length
    );

    // --------------------------------
    // Retrieve JD
    // --------------------------------

    console.log(
      "Retrieving JD context..."
    );

    const jdResults =
      await retrieveRelevantChunks(
        question,
        sessionId,
        "jd",
        3
      );

    const jdDocuments =
      jdResults?.documents?.[0] ??
      [];

    const jdMetadatas =
      jdResults?.metadatas?.[0] ??
      [];

    console.log(
      "JD chunks:",
      jdDocuments.length
    );

    // --------------------------------
    // Combine
    // --------------------------------

    documents = [
      ...resumeDocuments,
      ...jdDocuments,
    ];

    metadatas = [
      ...resumeMetadatas,
      ...jdMetadatas,
    ];
  }

  console.log(
    "Total retrieved chunks:",
    documents.length
  );

  // --------------------------------
  // 2. No context
  // --------------------------------

  if (
    documents.length === 0
  ) {
    return {
      answer:
        "I couldn't find relevant information in the uploaded documents for this question.",
      sources: [],
    };
  }

  // --------------------------------
  // 3. Build context
  // --------------------------------

  const context =
    documents
      .map(
        (
          document: string,
          index: number
        ) => {
          const metadata =
            metadatas[index];

          return `
SOURCE ${index + 1}
Document Type: ${
            metadata?.documentType ??
            "unknown"
          }

Content:
${document}
`;
        }
      )
      .join("\n");

  console.log(
    "Retrieved context length:",
    context.length
  );

  // --------------------------------
  // 4. RAG Prompt
  // --------------------------------

  const prompt = `
You are SkillBridge AI, an intelligent
career assistant.

The user has uploaded a resume and/or
job description.

Use ONLY the provided uploaded
document context as the primary source
for answering the question.

IMPORTANT RULES:

1. Use the uploaded documents as the
   primary source of truth.

2. When both Resume and Job Description
   context are available, compare them
   when the question requires comparison.

3. Never claim that a Job Description
   was not provided if JD content exists
   in the context.

4. Never invent skills, experience,
   requirements, education, projects,
   or achievements.

5. Clearly distinguish between:
   - Resume information
   - Job Description requirements

6. For skill matching questions,
   identify:
   - Matching skills
   - Missing skills
   - Relevant strengths
   - Important gaps

7. If the documents genuinely do not
   contain enough information, explain
   what is missing.

8. Keep the answer clear, professional,
   and useful.

UPLOADED DOCUMENT CONTEXT:

${context}

USER QUESTION:

${question}

ANSWER:
`;

  // --------------------------------
  // 5. Generate answer
  // --------------------------------

  console.log(
    "Sending session-specific context to Gemini..."
  );

  const response =
    await model.invoke([
      new HumanMessage(
        prompt
      ),
    ]);

  const answer =
    typeof response.content ===
    "string"
      ? response.content
      : JSON.stringify(
          response.content
        );

  console.log(
    "=== RAG GENERATION COMPLETE ==="
  );

  // --------------------------------
  // 6. Return answer + sources
  // --------------------------------

  return {
    answer,

    sources: documents.map(
      (
        document: string,
        index: number
      ) => ({
        content: document,

        documentType:
          metadatas[index]
            ?.documentType ??
          "unknown",

        chunkIndex:
          metadatas[index]
            ?.chunkIndex ??
          index,

        sessionId:
          metadatas[index]
            ?.sessionId ??
          sessionId,
      })
    ),
  };
}