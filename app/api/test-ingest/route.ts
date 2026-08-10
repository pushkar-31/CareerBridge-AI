import { ingestDocument } from "@/lib/rag/ingest";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log(
      "=== INGESTION TEST STARTED ==="
    );

    const sampleResume = `
      Pushkar Shelke is a software developer
      with experience in React.js, Next.js,
      Node.js, Express.js, TypeScript, Java,
      Python, SQL and AI technologies.

      He has built full-stack applications
      and AI-powered projects involving
      LangChain, RAG, vector embeddings
      and modern web technologies.

      He has solved more than 250 Data Structures
      and Algorithms problems across LeetCode
      and GeeksforGeeks.
    `;

    const result = await ingestDocument(
      sampleResume,
      "resume"
    );

    console.log(
      "=== INGESTION TEST SUCCESS ==="
    );

    return Response.json({
      success: true,
      message:
        "Document ingested successfully.",
      result,
    });
  } catch (error) {
    console.error(
      "=== INGESTION TEST ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Document ingestion failed.",
      },
      {
        status: 500,
      }
    );
  }
}