import PDFParser from "pdf2json";
import ai from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("=== ANALYZE API STARTED ===");

    // --------------------------------
    // STEP 1: Get uploaded file
    // --------------------------------

    const formData = await request.formData();

    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "Resume file is required.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        {
          success: false,
          message: "Only PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    console.log("File:", file.name);
    console.log("Size:", file.size);

    // --------------------------------
    // STEP 2: PDF → Buffer
    // --------------------------------

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer created.");

    // --------------------------------
    // STEP 3: Extract PDF Text
    // --------------------------------

    console.log("Extracting resume text...");

    const pdfParser = new PDFParser();

    const resumeText = await new Promise<string>(
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
                  /*
                   * Do NOT use decodeURIComponent().
                   *
                   * Some PDFs contain malformed encoded
                   * text which can cause URIError.
                   */
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

    console.log(
      "Extracted characters:",
      resumeText.length
    );

    if (!resumeText) {
      return Response.json(
        {
          success: false,
          message:
            "No text could be extracted from this PDF.",
        },
        { status: 400 }
      );
    }

    console.log(
      "=== TEXT EXTRACTION SUCCESS ==="
    );

    // --------------------------------
    // STEP 4: Prepare Gemini Prompt
    // --------------------------------

    const prompt = `
You are an expert ATS resume analyzer.

Analyze the following resume and return a structured analysis.

Return ONLY valid JSON with exactly these fields:

{
  "atsScore": number,
  "summary": string,
  "skills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}

Rules:

- atsScore must be between 0 and 100.
- Extract technical and professional skills from the resume.
- Keep the summary concise and professional.
- Identify realistic strengths based only on the resume.
- Identify weaknesses or areas that could be improved.
- Suggestions must be actionable.
- Do not invent experience, skills, education, or achievements.
- When evaluating dates, compare them with the current date.
- Do not flag completed past dates as future dates.
- Only identify a date as future if it is actually after the current date.
- Return ONLY valid JSON.
- Do not use markdown code blocks.

Current date:
August 2026

Resume:

${resumeText}
`;

    // --------------------------------
    // STEP 5: Send Resume to Gemini
    // --------------------------------

    console.log(
      "Sending resume to Gemini..."
    );

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

    console.log(
      "=== GEMINI RESPONSE RECEIVED ==="
    );

    const analysisText =
      response.text;

    if (!analysisText) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an empty response.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Gemini raw response:"
    );

    console.log(analysisText);

    // --------------------------------
    // STEP 6: Parse Gemini JSON
    // --------------------------------

    let analysis;

    try {
      analysis =
        JSON.parse(analysisText);
    } catch (error) {
      console.error(
        "Gemini returned invalid JSON:"
      );

      console.error(
        analysisText
      );

      return Response.json(
        {
          success: false,
          message:
            "Gemini returned invalid analysis data.",
        },
        { status: 500 }
      );
    }

    // --------------------------------
    // STEP 7: Validate Analysis
    // --------------------------------

    if (
      typeof analysis.atsScore !==
      "number"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an invalid ATS score.",
        },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(
        analysis.skills
      ) ||
      !Array.isArray(
        analysis.strengths
      ) ||
      !Array.isArray(
        analysis.weaknesses
      ) ||
      !Array.isArray(
        analysis.suggestions
      )
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an invalid analysis structure.",
        },
        { status: 500 }
      );
    }

    console.log(
      "=== ANALYSIS SUCCESS ==="
    );

    // --------------------------------
    // STEP 8: Return Analysis
    // --------------------------------

    return Response.json({
      success: true,

      fileName: file.name,

      analysis,
    });
  } catch (error) {
    console.error(
      "=== ANALYZE API ERROR ==="
    );

    console.error(error);

    console.error(
      "========================"
    );

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Resume analysis failed.",
      },
      { status: 500 }
    );
  }
}