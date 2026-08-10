import { retrieveRelevantChunks } from "@/lib/rag/retriever";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log(
      "=== RETRIEVAL TEST STARTED ==="
    );

    const query =
      "What AI technologies and projects does Pushkar have experience with?";

    const results =
      await retrieveRelevantChunks(
        query,
        "resume",
        3
      );

    console.log(
      "Retrieval results:",
      JSON.stringify(
        results,
        null,
        2
      )
    );

    return Response.json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error(
      "=== RETRIEVAL TEST ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Retrieval failed.",
      },
      {
        status: 500,
      }
    );
  }
}