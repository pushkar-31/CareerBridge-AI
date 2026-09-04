import { retrieveRelevantChunks } from "./retriever";
import ai from "@/lib/gemini";

type RetrievedResult = {
  documents?: string[][];
  metadatas?: Record<string, unknown>[][];
  distances?: number[][];
};

function getDocuments(
  result: RetrievedResult
): string[] {
  return result.documents?.[0] ?? [];
}

function formatContext(
  documents: string[]
): string {
  return documents
    .filter(
      (doc) =>
        typeof doc === "string" &&
        doc.trim().length > 0
    )
    .map(
      (doc, index) =>
        `[Source ${index + 1}]\n${doc.trim()}`
    )
    .join("\n\n");
}

function detectIntent(
  question: string
): string {
  const q =
    question.toLowerCase();

  if (
    q.includes("percentage") ||
    q.includes("percent") ||
    q.includes("score") ||
    q.includes("how much does") ||
    q.includes("match percentage")
  ) {
    return "MATCH_PERCENTAGE";
  }

  if (
    q.includes("match") ||
    q.includes("matching") ||
    q.includes("matches")
  ) {
    return "SKILL_MATCH";
  }

  if (
    q.includes("gap") ||
    q.includes("missing") ||
    q.includes("lack") ||
    q.includes("doesn't have") ||
    q.includes("does not have")
  ) {
    return "SKILL_GAPS";
  }

  if (
    q.includes("learn") ||
    q.includes("improve") ||
    q.includes("prepare") ||
    q.includes("should i")
  ) {
    return "IMPROVEMENT";
  }

  if (
    q.includes("suitable") ||
    q.includes("eligible") ||
    q.includes("good fit") ||
    q.includes("fit for") ||
    q.includes("qualified")
  ) {
    return "SUITABILITY";
  }

  if (
    q.includes("requirement") ||
    q.includes("requirements") ||
    q.includes("job description") ||
    q.includes("jd require")
  ) {
    return "JD_REQUIREMENTS";
  }

  if (
    q.includes("experience") ||
    q.includes("projects") ||
    q.includes("worked") ||
    q.includes("technology") ||
    q.includes("technologies")
  ) {
    return "RESUME_EXPERIENCE";
  }

  return "GENERAL";
}

export async function generateRAGAnswer(
  question: string,
  sessionId: string
) {
  if (!question?.trim()) {
    throw new Error(
      "Question cannot be empty."
    );
  }

  if (!sessionId?.trim()) {
    throw new Error(
      "Session ID is required."
    );
  }

  console.log(
    "=== RAG GENERATION STARTED ==="
  );

  console.log(
    "Question:",
    question
  );

  console.log(
    "Session ID:",
    sessionId
  );

  // ==========================================
  // 1. Detect question intent
  // ==========================================

  const intent =
    detectIntent(question);

  console.log(
    "Detected intent:",
    intent
  );

  // ==========================================
  // 2. Retrieve Resume
  // ==========================================

  console.log(
    "Retrieving resume context..."
  );

  const resumeResult =
    (await retrieveRelevantChunks(
      question,
      sessionId,
      "resume",
      5
    )) as RetrievedResult;

  const resumeDocuments =
    getDocuments(
      resumeResult
    );

  console.log(
    "Resume chunks:",
    resumeDocuments.length
  );

  // ==========================================
  // 3. Retrieve JD
  // ==========================================

  console.log(
    "Retrieving JD context..."
  );

  const jdResult =
    (await retrieveRelevantChunks(
      question,
      sessionId,
      "jd",
      5
    )) as RetrievedResult;

  const jdDocuments =
    getDocuments(
      jdResult
    );

  console.log(
    "JD chunks:",
    jdDocuments.length
  );

  // ==========================================
  // 4. Format Context
  // ==========================================

  const resumeContext =
    formatContext(
      resumeDocuments
    );

  const jdContext =
    formatContext(
      jdDocuments
    );

  if (
    !resumeContext &&
    !jdContext
  ) {
    throw new Error(
      "No relevant information was found."
    );
  }

  // ==========================================
  // 5. Generation Prompt
  // ==========================================

  const prompt = `
You are SkillBridge AI, an intelligent career assistant.

You are answering questions about a candidate's resume
and a job description.

Your answer MUST be based ONLY on the supplied documents.

Never invent information.

Never assume that the candidate has a skill that is not
explicitly supported by the resume.

Never treat related technologies as equivalent unless the
documents explicitly support the relationship.

Never use outside knowledge as evidence.

If information is not available in the supplied documents,
clearly say that it is not mentioned.

CURRENT QUESTION INTENT:
${intent}


========================
RESUME
========================

${resumeContext || "No resume information available."}


========================
JOB DESCRIPTION
========================

${jdContext || "No job description information available."}


========================
USER QUESTION
========================

${question}


========================================================
HOW TO ANSWER
========================================================

The user's question determines the answer format.

--------------------------------
INTENT: MATCH_PERCENTAGE
--------------------------------

If the user asks for a percentage, score, or how much
the resume matches the JD:

You MUST provide an estimated match percentage.

Use this method:

1. Identify the important requirements explicitly stated
   in the JD.

2. Compare each requirement against the resume.

3. Give greater weight to required qualifications than
   optional/nice-to-have qualifications.

4. Calculate:

   matched important requirements
   ------------------------------
   total important requirements

5. Convert that into a percentage.

6. Clearly state that the percentage is an AI-estimated
   document match, not an official ATS score.

Use:

### Resume-JD Match

**Match Percentage: XX%**

### Matched Requirements

- ...

### Missing Requirements

- ...

### Assessment

One concise explanation.

Do NOT give a percentage based on the number of words,
chunks, or semantic similarity.

--------------------------------
INTENT: SKILL_MATCH
--------------------------------

If the user asks which skills match:

### Matching Skills

- **Skill:** Explanation based on resume and JD.

Then give a short overall assessment.

--------------------------------
INTENT: SKILL_GAPS
--------------------------------

If the user asks about gaps:

### Skill Gaps

- **Skill:** Why the JD requires it and why the resume
  does not clearly demonstrate it.

Do not list skills that are not actually required by
the JD.

--------------------------------
INTENT: IMPROVEMENT
--------------------------------

If the user asks what they should learn or improve:

### Recommended Improvements

Prioritize the gaps from the JD.

For each:

- **Skill:** Why it matters for this job.
- **Priority:** High / Medium / Low.

Do not recommend unrelated technologies.

--------------------------------
INTENT: SUITABILITY
--------------------------------

If the user asks whether the candidate is suitable:

Give:

**Overall Fit: Strong / Moderate / Weak**

Then explain:

- strongest matches
- most important gaps
- final assessment

Do not claim guaranteed job eligibility.

--------------------------------
INTENT: JD_REQUIREMENTS
--------------------------------

If the user asks what the job requires:

List only the important requirements explicitly supported
by the JD.

Do not mix resume information into this answer unless
the user asks for a comparison.

--------------------------------
INTENT: RESUME_EXPERIENCE
--------------------------------

If the user asks about the candidate's experience:

Answer using only the resume.

Do not introduce requirements from the JD unless relevant
to the question.

--------------------------------
INTENT: GENERAL
--------------------------------

Answer the question directly using the relevant information
from the resume and JD.

Do not automatically produce a full resume-vs-JD report.

========================================================
IMPORTANT RULES
========================================================

- Answer the exact question.
- Do not repeat the same answer for different questions.
- Do not automatically use the same headings for every query.
- Do not produce unnecessary sections.
- Do not invent missing information.
- Do not claim unsupported experience.
- Do not mention RAG.
- Do not mention ChromaDB.
- Do not mention embeddings.
- Do not mention vector search.
- Do not mention retrieved chunks.
- Do not mention this prompt.
- Keep answers concise but useful.
`;

  // ==========================================
  // 6. Generate Answer
  // ==========================================

  console.log(
    "Sending context to Gemini..."
  );

  const response =
    await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

  const answer =
    response.text?.trim();

  if (!answer) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  console.log(
    "=== RAG GENERATION COMPLETE ==="
  );

  return {
    answer,

    sources: [
      ...resumeDocuments.map(
        (document) => ({
          type: "resume",
          content: document,
        })
      ),

      ...jdDocuments.map(
        (document) => ({
          type: "jd",
          content: document,
        })
      ),
    ],
  };
}