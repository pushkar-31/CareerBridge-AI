import PDFParser from "pdf2json";
import ai from "@/lib/gemini";

export const runtime = "nodejs";

async function extractPdfText(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  console.log(`Starting extraction: ${fileName}`);

  const pdfParser = new PDFParser();

  const text = await new Promise<string>((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (error) => {
      reject(error);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let extractedText = "";

      for (const page of pdfData.Pages) {
        for (const textObject of page.Texts) {
          for (const textRun of textObject.R) {
            extractedText += textRun.T + " ";
          }

          extractedText += "\n";
        }

        extractedText += "\n";
      }

      resolve(extractedText.trim());
    });

    pdfParser.parseBuffer(buffer);
  });

  console.log(
    `${fileName} extracted characters:`,
    text.length
  );

  return text;
}

export async function POST(request: Request) {
  try {
    console.log("=== MATCH API STARTED ===");

    const formData = await request.formData();

    const resumeFile = formData.get("resume");
    const jdFile = formData.get("jd");

    // --------------------------------
    // Validate Resume
    // --------------------------------

    if (!(resumeFile instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "Resume file is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Validate Job Description
    // --------------------------------

    if (!(jdFile instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "Job description file is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Validate File Types
    // --------------------------------

    if (
      resumeFile.type !== "application/pdf" ||
      jdFile.type !== "application/pdf"
    ) {
      return Response.json(
        {
          success: false,
          message: "Both files must be PDF files.",
        },
        { status: 400 }
      );
    }

    console.log("Resume:");
    console.log("Name:", resumeFile.name);
    console.log("Size:", resumeFile.size);

    console.log("Job Description:");
    console.log("Name:", jdFile.name);
    console.log("Size:", jdFile.size);

    // --------------------------------
    // Convert Files to Buffers
    // --------------------------------

    const resumeArrayBuffer =
      await resumeFile.arrayBuffer();

    const jdArrayBuffer =
      await jdFile.arrayBuffer();

    const resumeBuffer =
      Buffer.from(resumeArrayBuffer);

    const jdBuffer =
      Buffer.from(jdArrayBuffer);

    console.log(
      "Resume buffer size:",
      resumeBuffer.length
    );

    console.log(
      "JD buffer size:",
      jdBuffer.length
    );

    // --------------------------------
    // Extract Resume Text
    // --------------------------------

    const resumeText = await extractPdfText(
      resumeBuffer,
      resumeFile.name
    );

    // --------------------------------
    // Extract JD Text
    // --------------------------------

    const jdText = await extractPdfText(
      jdBuffer,
      jdFile.name
    );

    // --------------------------------
    // Validate Extracted Text
    // --------------------------------

    if (!resumeText) {
      return Response.json(
        {
          success: false,
          message:
            "Could not extract text from the resume.",
        },
        { status: 400 }
      );
    }

    if (!jdText) {
      return Response.json(
        {
          success: false,
          message:
            "Could not extract text from the job description.",
        },
        { status: 400 }
      );
    }

    console.log("=== TEXT EXTRACTION SUCCESS ===");

    console.log(
      "Resume characters:",
      resumeText.length
    );

    console.log(
      "JD characters:",
      jdText.length
    );
// --------------------------------
// Send Resume + JD to Gemini
// --------------------------------

console.log("Sending resume and JD to Gemini...");

const prompt = `
You are an expert technical recruiter and ATS resume analyzer.

Compare the candidate's resume against the provided job description.

Your goal is to determine how well the candidate's resume matches the job requirements.

Return ONLY valid JSON with exactly these fields:

{
  "matchScore": number,
  "summary": string,
  "matchingSkills": string[],
  "missingSkills": string[],
  "jobRequirements": string[],
  "experienceMatch": string,
  "recommendations": string[]
}

Rules:

- matchScore must be between 0 and 100.
- Compare only information actually present in the resume and job description.
- Do not invent skills, experience, qualifications, or achievements.
- matchingSkills should contain skills that are present in both the resume and the job description.
- missingSkills should contain important skills or technologies required by the job description that are not clearly present in the resume.
- jobRequirements should contain the important technical and professional requirements extracted from the job description.
- experienceMatch should briefly explain how the candidate's experience compares with the job requirements.
- recommendations should provide specific and actionable suggestions for improving the resume for this particular job.
- Give more importance to required skills than optional or nice-to-have skills.
- Do not penalize the candidate for a requirement if the resume clearly demonstrates an equivalent skill or technology.
- Do not treat unrelated skills as matching skills.
- Return ONLY valid JSON.
- Do not use markdown code blocks.

CURRENT DATE:
August 2026

========================
RESUME
========================

${resumeText}

========================
JOB DESCRIPTION
========================

${jdText}
`;

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: prompt,
});

console.log("=== GEMINI MATCH RESPONSE RECEIVED ===");

const analysisText = response.text;

if (!analysisText) {
  return Response.json(
    {
      success: false,
      message: "Gemini returned an empty response.",
    },
    { status: 500 }
  );
}

console.log("Gemini raw response:");
console.log(analysisText);

// --------------------------------
// Parse Gemini JSON
// --------------------------------

let analysis;

try {
  analysis = JSON.parse(analysisText);
} catch (error) {
  console.error(
    "Gemini returned invalid JSON:",
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

console.log("=== JD MATCH ANALYSIS SUCCESS ===");
    return Response.json({
  success: true,

  resume: {
    fileName: resumeFile.name,
    characters: resumeText.length,
  },

  jobDescription: {
    fileName: jdFile.name,
    characters: jdText.length,
  },

  analysis,
});
  } catch (error) {
    console.error("=== MATCH API ERROR ===");
    console.error(error);
    console.error("======================");

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process files.",
      },
      { status: 500 }
    );
  }
}