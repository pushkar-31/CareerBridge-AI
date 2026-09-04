import { generateRAGAnswer } from "@/lib/rag/generator";

export const runtime = "nodejs";

type CareerChatRequest = {
  question: string;
  sessionId: string;
};

export async function POST(request: Request) {
  try {
    console.log(
      "=== CAREER CHAT API STARTED ==="
    );

    const body =
      (await request.json()) as CareerChatRequest;

    const question =
      body.question?.trim();

    const sessionId =
      body.sessionId?.trim();

    // --------------------------------
    // Validate Question
    // --------------------------------

    if (!question) {
      return Response.json(
        {
          success: false,
          message:
            "Question is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // Validate Session ID
    // --------------------------------

    if (!sessionId) {
      return Response.json(
        {
          success: false,
          message:
            "Session ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Question:",
      question
    );

    console.log(
      "Session ID:",
      sessionId
    );

    // --------------------------------
    // Generate RAG Answer
    // --------------------------------

    const result =
      await generateRAGAnswer(
        question,
        sessionId
      );

    console.log(
      "=== CAREER CHAT API SUCCESS ==="
    );

    return Response.json({
      success: true,

      question,

      sessionId,

      answer:
        result.answer,

      sources:
        result.sources,
    });
  } catch (error) {
    console.error(
      "=== CAREER CHAT API ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Career chat failed.",
      },
      {
        status: 500,
      }
    );
  }
}