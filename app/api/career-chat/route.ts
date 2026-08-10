import { generateRAGAnswer } from "@/lib/rag/generator";

export const runtime = "nodejs";

type CareerChatRequest = {
  question: string;
  sessionId: string;
  documentType?: "resume" | "jd";
};

export async function POST(
  request: Request
) {
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

    const documentType =
      body.documentType;

    // --------------------------------
    // Validate question
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
    // Validate session
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

    // --------------------------------
    // Validate document type
    // --------------------------------

    if (
      documentType &&
      documentType !== "resume" &&
      documentType !== "jd"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid document type.",
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

    console.log(
      "Document type:",
      documentType ?? "all"
    );

    // --------------------------------
    // Generate RAG answer
    // --------------------------------

    const result =
      await generateRAGAnswer(
        question,
        sessionId,
        documentType
      );

    console.log(
      "=== CAREER CHAT API SUCCESS ==="
    );

    // --------------------------------
    // Return response
    // --------------------------------

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