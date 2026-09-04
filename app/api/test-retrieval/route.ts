import { retrieveRelevantChunks } from "@/lib/rag/retriever";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    console.log("=== RETRIEVAL TEST STARTED ===");

    const query =
      "What AI technologies and projects does Pushkar have experience with?";

    // Get the sessionId from the URL:
    // /api/test-retrieval?sessionId=YOUR_SESSION_ID
    const { searchParams } = new URL(request.url);

    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json(
        {
          success: false,
          message:
            "sessionId is required. Use /api/test-retrieval?sessionId=YOUR_SESSION_ID",
        },
        {
          status: 400,
        }
      );
    }

    console.log("Query:", query);
    console.log("Session ID:", sessionId);

    const results = await retrieveRelevantChunks(
      query,
      sessionId,
      "resume",
      3
    );

    console.log(
      "Retrieval results:",
      JSON.stringify(results, null, 2)
    );

    return Response.json({
      success: true,
      query,
      sessionId,
      results,
    });
  } catch (error) {
    console.error("=== RETRIEVAL TEST ERROR ===");
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