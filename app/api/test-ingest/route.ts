import { ingestDocument } from "@/lib/rag/ingest";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log(
      "=== TEST INGEST STARTED ==="
    );

    // --------------------------------
    // Test document
    // --------------------------------

    const testText = `
Pushkar Shelke is a software developer.

He has experience with React.js,
Next.js, Node.js, Express.js,
TypeScript, Java, Python and SQL.

He has also worked with AI technologies
including LangChain, RAG, vector embeddings,
LLM integration and AI-powered applications.

He has solved more than 250 Data Structures
and Algorithms problems.
`;

    // --------------------------------
    // Generate test session
    // --------------------------------

    const sessionId =
      crypto.randomUUID();

    console.log(
      "Test Session ID:",
      sessionId
    );

    // --------------------------------
    // Ingest document
    // --------------------------------

    const result =
      await ingestDocument(
        testText,
        "resume",
        sessionId
      );

    console.log(
      "=== TEST INGEST SUCCESS ==="
    );

    return Response.json({
      success: true,

      message:
        "Test document ingested successfully.",

      sessionId,

      result,
    });
  } catch (error) {
    console.error(
      "=== TEST INGEST ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Test ingestion failed.",
      },
      {
        status: 500,
      }
    );
  }
}