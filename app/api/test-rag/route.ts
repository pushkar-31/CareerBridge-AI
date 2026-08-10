import { generateRAGAnswer } from "@/lib/rag/generator";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log(
      "=== RAG TEST STARTED ==="
    );

    const question =
      "What AI technologies and projects does Pushkar have experience with?";

    const result =
      await generateRAGAnswer(
        question,
        "resume"
      );

    console.log(
      "=== RAG TEST SUCCESS ==="
    );

    return Response.json({
      success: true,
      question,
      result,
    });
  } catch (error) {
    console.error(
      "=== RAG TEST ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "RAG generation failed.",
      },
      {
        status: 500,
      }
    );
  }
}