import PDFParser from "pdf2json";
import { ingestDocument } from "@/lib/rag/ingest";

export const runtime = "nodejs";

async function extractPdfText(
  buffer: Buffer
): Promise<string> {
  const pdfParser = new PDFParser();

  return new Promise<string>(
    (resolve, reject) => {
      pdfParser.on(
        "pdfParser_dataError",
        (error) => {
          reject(error);
        }
      );

      pdfParser.on(
        "pdfParser_dataReady",
        (pdfData) => {
          let text = "";

          for (const page of pdfData.Pages) {
            for (const textObject of page.Texts) {
              for (const textRun of textObject.R) {
                // Do not use decodeURIComponent().
                // pdf2json already provides the text.
                text += textRun.T + " ";
              }

              text += "\n";
            }

            text += "\n";
          }

          resolve(text.trim());
        }
      );

      pdfParser.parseBuffer(buffer);
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    console.log(
      "=== CAREER CHAT JD UPLOAD ==="
    );

    const formData =
      await request.formData();

    // --------------------------------
    // Get JD
    // --------------------------------

    const file =
      formData.get("jd");

    // --------------------------------
    // Get Session ID
    // --------------------------------

    const sessionIdValue =
      formData.get("sessionId");

    if (
      typeof sessionIdValue !==
      "string" ||
      !sessionIdValue.trim()
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Session ID is required.",
        },
        { status: 400 }
      );
    }

    const sessionId =
      sessionIdValue.trim();

    // --------------------------------
    // Validate JD
    // --------------------------------

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message:
            "Job description file is required.",
        },
        { status: 400 }
      );
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Only PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    console.log(
      "JD:",
      file.name
    );

    console.log(
      "Size:",
      file.size
    );

    console.log(
      "Session ID:",
      sessionId
    );

    // --------------------------------
    // STEP 1: PDF → Buffer
    // --------------------------------

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    console.log(
      "Buffer created."
    );

    // --------------------------------
    // STEP 2: Extract PDF Text
    // --------------------------------

    console.log(
      "Extracting JD text..."
    );

    const jdText =
      await extractPdfText(
        buffer
      );

    console.log(
      "Extracted characters:",
      jdText.length
    );

    if (!jdText) {
      return Response.json(
        {
          success: false,
          message:
            "No text could be extracted from the job description.",
        },
        { status: 400 }
      );
    }

    console.log(
      "=== TEXT EXTRACTION SUCCESS ==="
    );

    // --------------------------------
    // STEP 3: Ingest into RAG
    // --------------------------------

    console.log(
      "Ingesting JD into RAG..."
    );

    const ingestion =
      await ingestDocument(
        jdText,
        "jd",
        sessionId
      );

    console.log(
      "=== JD INGESTION SUCCESS ==="
    );

    console.log(
      "Chunks:",
      ingestion.chunks
    );

    console.log(
      "Collection:",
      ingestion.collectionId
    );

    console.log(
      "Session:",
      ingestion.sessionId
    );

    // --------------------------------
    // STEP 4: Return Result
    // --------------------------------

    return Response.json({
      success: true,

      documentType: "jd",

      fileName: file.name,

      chunks: ingestion.chunks,

      collectionId:
        ingestion.collectionId,

      sessionId:
        ingestion.sessionId,

      message:
        "Job description uploaded and added to Career AI.",
    });
  } catch (error) {
    console.error(
      "=== JD UPLOAD ERROR ==="
    );

    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Job description upload failed.",
      },
      { status: 500 }
    );
  }
}