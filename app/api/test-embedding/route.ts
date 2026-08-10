import { embeddings } from "@/lib/rag/embeddings";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("=== EMBEDDING TEST STARTED ===");

    const vector = await embeddings.embedQuery(
      "I am a software developer with React and Node.js experience."
    );

    console.log("Embedding generated successfully.");
    console.log("Vector dimensions:", vector.length);

    return Response.json({
      success: true,
      message: "Embedding generated successfully.",
      dimensions: vector.length,
    });
  } catch (error) {
    console.error("=== EMBEDDING TEST ERROR ===");
    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Embedding generation failed.",
      },
      { status: 500 }
    );
  }
}