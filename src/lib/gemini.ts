import type {
  InterviewQuestion,
  CandidateAnswerEvaluation,
  FinalInterviewReport,
  SeniorityLevel,
  InterviewCategory,
} from "@/types/interview";
import type { ResumeAnalysisResult } from "@/types/resume";

const STORAGE_KEY = "hiremind_gemini_api_key";
const MODEL_STORAGE_KEY = "hiremind_gemini_model";

/**
 * Retrieve active Gemini API Key from localStorage or environment variable
 */
export function getStoredGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.trim().length > 5) {
      return localKey.trim();
    }
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return "";
}

/**
 * Persist Gemini API Key to localStorage
 */
export function setStoredGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

/**
 * Get the active verified model name
 */
export function getStoredGeminiModel(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved) return saved;
  }
  return "gemini-3.6-flash";
}

/**
 * Check if a valid Gemini API Key is available
 */
export function hasGeminiApiKey(): boolean {
  return getStoredGeminiApiKey().length > 5;
}

/**
 * Helper to clean JSON string returned from LLM
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Fetch list of valid models directly from Google's ModelService API
 */
export async function getAvailableModelsFromGoogle(apiKey: string): Promise<{
  success: boolean;
  models: string[];
  error?: string;
}> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        models: [],
        error: data?.error?.message || `Google API Error (${res.status}: ${res.statusText})`,
      };
    }

    const data = await res.json();
    if (Array.isArray(data.models)) {
      const generateModels = data.models
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent")
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => m.name.replace(/^models\//, ""));

      return {
        success: true,
        models: generateModels,
      };
    }

    return {
      success: true,
      models: ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    };
  } catch (err: unknown) {
    return {
      success: false,
      models: [],
      error: err instanceof Error ? err.message : "Network error reaching Google API",
    };
  }
}

/**
 * Test a Gemini API key using dynamic model discovery and probing
 */
export async function testGeminiConnection(apiKey: string): Promise<{
  success: boolean;
  model?: string;
  error?: string;
}> {
  const discovery = await getAvailableModelsFromGoogle(apiKey);
  if (!discovery.success) {
    return {
      success: false,
      error: discovery.error || "Failed to authenticate with Google Gemini API.",
    };
  }

  const preferredOrder = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash-002",
  ];

  // Sort discovered models so preferred ones are probed first
  const modelsToProbe = [
    ...preferredOrder.filter((m) => discovery.models.includes(m)),
    ...discovery.models.filter((m) => !preferredOrder.includes(m)),
    "gemini-3.6-flash",
    "gemini-1.5-flash",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastProbeError = "";

  for (const model of modelsToProbe) {
    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const probeRes = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the word OK" }] }],
        }),
      });

      if (probeRes.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem(MODEL_STORAGE_KEY, model);
        }
        return { success: true, model };
      } else {
        const errData = await probeRes.json().catch(() => ({}));
        lastProbeError = errData?.error?.message || `Probe failed on model ${model}`;
      }
    } catch (err) {
      lastProbeError = err instanceof Error ? err.message : "Network probe failed";
    }
  }

  return {
    success: false,
    error: lastProbeError || "No working Gemini model could be verified for this key.",
  };
}

/**
 * Generic caller to execute prompt with Gemini REST API
 */
async function callGemini(
  prompt: string,
  systemInstruction?: string,
  forceJson = false
): Promise<string> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please enter your API key.");
  }

  const activeModel = getStoredGeminiModel();
  const modelsToTry = [
    activeModel,
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const payload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: forceJson ? "application/json" : undefined,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const data = await res.json().catch(() => ({}));
        lastError = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : "Network error calling Gemini API";
    }
  }

  throw new Error(lastError || "Failed to generate response from Gemini AI.");
}

/**
 * 1. Live Gemini Resume Deep Semantic Critique
 */
export async function analyzeResumeWithGemini(
  resumeText: string,
  fileName: string,
  fileSize: string,
  targetRole: string,
  customJD?: string
): Promise<ResumeAnalysisResult> {
  const prompt = `
Analyze the following candidate resume for the target role: "${targetRole}".
${customJD ? `\nTarget Job Description to compare against:\n"""\n${customJD}\n"""` : ""}

Candidate Resume Content:
"""
${resumeText}
"""

You must respond with a STRICT, VALID JSON object following this exact schema:
{
  "targetRole": "${targetRole}",
  "scores": {
    "overallScore": number (30 to 98),
    "keywordScore": number (30 to 100),
    "impactScore": number (30 to 100),
    "structureScore": number (40 to 100),
    "skillsScore": number (30 to 100)
  },
  "matchedKeywords": [
    {
      "keyword": string,
      "category": "languages" | "frameworks" | "tools" | "concepts",
      "found": true,
      "frequency": number,
      "importance": "critical" | "recommended"
    }
  ],
  "missingKeywords": [
    {
      "keyword": string,
      "category": "languages" | "frameworks" | "tools" | "concepts",
      "found": false,
      "frequency": 0,
      "importance": "critical" | "recommended"
    }
  ],
  "sections": [
    {
      "name": "Contact Information" | "Professional Summary" | "Work Experience" | "Technical Skills" | "Education" | "Projects",
      "found": boolean,
      "status": "good" | "warning" | "error",
      "feedback": string
    }
  ],
  "bulletPoints": [
    {
      "original": string (extracted verbatim or paraphrased from actual resume bullets),
      "improved": string (rewritten with powerful action verb, STAR method, and quantified metrics),
      "reason": string (explanation of why the rewrite boosts executive impact),
      "impactScoreBefore": number (30 to 60),
      "impactScoreAfter": number (85 to 98)
    }
  ],
  "topRecommendations": [
    string (specific, highly prioritized actionable tips for this candidate)
  ]
}
`;

  const rawJson = await callGemini(
    prompt,
    "You are an expert Technical Hiring Bar Raiser and ATS Optimization Architect. Analyze resumes rigorously and output valid JSON only.",
    true
  );

  const parsed = JSON.parse(cleanJsonString(rawJson));
  const words = resumeText.trim().split(/\s+/).filter(Boolean);

  return {
    fileName,
    fileSize,
    wordCount: words.length,
    readingTimeMinutes: Math.max(1, Math.round(words.length / 200)),
    targetRole: parsed.targetRole || targetRole,
    scores: parsed.scores,
    matchedKeywords: parsed.matchedKeywords || [],
    missingKeywords: parsed.missingKeywords || [],
    sections: parsed.sections || [],
    bulletPoints: parsed.bulletPoints || [],
    topRecommendations: parsed.topRecommendations || [],
    analyzedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

/**
 * 2. Instant STAR Bullet Point Rewriter
 */
export async function rewriteBulletPointWithGemini(
  originalBullet: string,
  targetRole = "Software Engineer",
  context?: string
): Promise<{
  variations: {
    title: string;
    text: string;
    impactScore: number;
    highlight: string;
  }[];
  critique: string;
}> {
  const prompt = `
Transform this weak/plain resume bullet point into 3 high-impact STAR variations for a ${targetRole} position:

Original Bullet:
"${originalBullet}"

${context ? `Additional Context/Metrics: ${context}` : ""}

Provide 3 distinct styles:
1. Metric-Driven (heavy emphasis on % increase, latency reduction, user scale)
2. Architecture & Leadership-Driven (emphasis on system design, best practices, mentoring)
3. Full-Stack / End-to-End Delivery (emphasis on rapid shipping, cross-functional collaboration)

Respond in STRICT JSON:
{
  "critique": "Brief assessment of what was weak in the original statement",
  "variations": [
    {
      "title": "Metric-Driven",
      "text": "Rewritten STAR bullet point",
      "impactScore": number (90-99),
      "highlight": "What makes this version stand out"
    },
    {
      "title": "Architecture & Leadership",
      "text": "Rewritten STAR bullet point",
      "impactScore": number (90-99),
      "highlight": "What makes this version stand out"
    },
    {
      "title": "Full-Stack Delivery",
      "text": "Rewritten STAR bullet point",
      "impactScore": number (90-99),
      "highlight": "What makes this version stand out"
    }
  ]
}
`;

  const raw = await callGemini(
    prompt,
    "You are an executive resume writer for elite tech companies. Output JSON only.",
    true
  );

  return JSON.parse(cleanJsonString(raw));
}

/**
 * 3. Generate Role-Tailored Interview Questions
 */
export async function generateInterviewQuestionsWithGemini(
  roleTitle: string,
  level: SeniorityLevel,
  category: InterviewCategory,
  count = 3,
  customJD?: string
): Promise<InterviewQuestion[]> {
  const prompt = `
Generate ${count} realistic, challenging interview questions for:
- Role: ${roleTitle}
- Seniority Level: ${level}
- Interview Category: ${category}
${customJD ? `- Target Job Description:\n"""\n${customJD}\n"""` : ""}

Ensure the questions test deep conceptual understanding, practical edge cases, and real-world system decision making (not generic trivia).

Respond in STRICT JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "The interview question text",
      "category": "${category}",
      "context": "Why interviewers ask this and what signals they look for",
      "hints": ["Hint 1", "Hint 2"],
      "keyTopics": ["Topic A", "Topic B"]
    }
  ]
}
`;

  const raw = await callGemini(
    prompt,
    "You are a Principal Engineer and Hiring Bar Raiser creating rigorous interview questions. Output JSON only.",
    true
  );

  const parsed = JSON.parse(cleanJsonString(raw));
  return parsed.questions || [];
}

/**
 * 4. Evaluate Candidate's Answer in Real-Time
 */
export async function evaluateInterviewAnswerWithGemini(
  question: string,
  roleTitle: string,
  level: SeniorityLevel,
  candidateAnswer: string
): Promise<CandidateAnswerEvaluation> {
  const prompt = `
You are evaluating a candidate's answer during a live technical interview.

- Role: ${roleTitle} (${level} Level)
- Interview Question: "${question}"
- Candidate's Response:
"""
${candidateAnswer}
"""

Evaluate this response objectively against standard FAANG/Top Tech bar benchmarks.

Respond in STRICT JSON:
{
  "score": number (0 to 10, e.g. 7.5),
  "starRating": number (1 to 5),
  "summary": "Concise 1-2 sentence executive verdict",
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    "Specific missing nuance or mistake 1",
    "Specific missing nuance or mistake 2"
  ],
  "idealModelAnswer": "A comprehensive, high-scoring model answer using the STAR method that demonstrates senior engineering depth",
  "technicalAccuracyScore": number (0 to 100),
  "communicationScore": number (0 to 100)
}
`;

  const raw = await callGemini(
    prompt,
    "You are an interview interviewer evaluating candidates with constructive, actionable feedback. Output JSON only.",
    true
  );

  return JSON.parse(cleanJsonString(raw));
}

/**
 * 5. Generate Final Comprehensive Interview Scorecard
 */
export async function generateInterviewFinalReportWithGemini(
  roleTitle: string,
  level: SeniorityLevel,
  sessionHistory: {
    question: string;
    answer: string;
    evaluation?: CandidateAnswerEvaluation;
  }[]
): Promise<FinalInterviewReport> {
  const prompt = `
Generate the final hiring evaluation and scorecard based on the candidate's interview session:

- Target Role: ${roleTitle} (${level})
- Interview Transcripts and Individual Scores:
${JSON.stringify(sessionHistory, null, 2)}

Respond in STRICT JSON:
{
  "overallScore": number (0 to 100),
  "recommendation": "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement",
  "executiveSummary": "Detailed multi-paragraph breakdown of overall performance, technical depth, and culture fit",
  "competencyScores": {
    "technicalDepth": number (0 to 100),
    "communication": number (0 to 100),
    "problemSolving": number (0 to 100),
    "starStructure": number (0 to 100)
  },
  "topStrengths": [
    "Key strength 1",
    "Key strength 2",
    "Key strength 3"
  ],
  "actionableNextSteps": [
    "Concrete study topic 1",
    "Concrete practice area 2"
  ],
  "recommendedPrepDays": [
    { "day": 1, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 2, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 3, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 4, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 5, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 6, "focus": "Topic name", "task": "Specific actionable exercise" },
    { "day": 7, "focus": "Topic name", "task": "Specific actionable exercise" }
  ]
}
`;

  const raw = await callGemini(
    prompt,
    "You are the Head of Engineering Hiring deciding final hiring outcomes. Output JSON only.",
    true
  );

  return JSON.parse(cleanJsonString(raw));
}

/**
 * 6. Live AI Mascot Motivational Career Advice
 */
export async function getGeminiCompanionAdvice(): Promise<string> {
  const prompt = `Give a short, punchy (1-sentence, max 10 words), inspiring or witty tech interview tip with 1 emoji. Be energetic and charismatic like a friendly AI career coach. Do not wrap in quotes.`;
  try {
    const text = await callGemini(
      prompt,
      "You are a cheerful, witty AI career mascot giving lightning-fast interview tips.",
      false
    );
    return text.replace(/^"|"$/g, "").trim();
  } catch {
    const pool = [
      "Quantify your metrics with the STAR formula! 🚀",
      "Structure beats panic in system design! 💡",
      "Speak your thought process aloud in interviews! 🎙️",
      "Highlight your biggest impact first! ⭐",
      "100% job-ready vibe loaded! 🤖",
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
