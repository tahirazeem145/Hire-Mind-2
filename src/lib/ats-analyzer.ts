import * as pdfjsLib from "pdfjs-dist";
import type {
  ResumeAnalysisResult,
  KeywordMatch,
  BulletPointImprovement,
  SectionCheck,
} from "@/types/resume";

// Set PDF.js worker source from CDN to avoid bundler worker configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const TECH_ROLES: Record<
  string,
  {
    title: string;
    criticalKeywords: string[];
    recommendedKeywords: string[];
    concepts: string[];
  }
> = {
  "frontend-engineer": {
    title: "Frontend Engineer / React Developer",
    criticalKeywords: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Next.js",
      "Redux",
      "REST API",
      "Git",
    ],
    recommendedKeywords: [
      "Vite",
      "GraphQL",
      "WebSockets",
      "Jest",
      "Playwright",
      "Cypress",
      "Performance Optimization",
      "Web Vitals",
      "CI/CD",
      "Docker",
    ],
    concepts: [
      "Responsive Design",
      "State Management",
      "Component Lifecycle",
      "Accessibility (WCAG)",
      "Cross-Browser Compatibility",
      "Code Splitting",
      "Clean Architecture",
    ],
  },
  "fullstack-developer": {
    title: "Full Stack Software Engineer",
    criticalKeywords: [
      "React",
      "Node.js",
      "TypeScript",
      "Express",
      "PostgreSQL",
      "MongoDB",
      "REST API",
      "Git",
      "Docker",
      "Tailwind CSS",
    ],
    recommendedKeywords: [
      "Next.js",
      "GraphQL",
      "Redis",
      "Prisma",
      "AWS",
      "Microservices",
      "Jest",
      "CI/CD",
      "Kubernetes",
      "WebSockets",
    ],
    concepts: [
      "System Architecture",
      "Database Optimization",
      "Authentication & JWT",
      "API Design",
      "Scalability",
      "Unit & Integration Testing",
      "Security Best Practices",
    ],
  },
  "backend-engineer": {
    title: "Backend Engineer (Node.js / Python / Go)",
    criticalKeywords: [
      "Node.js",
      "Python",
      "PostgreSQL",
      "Redis",
      "REST API",
      "Microservices",
      "Docker",
      "Git",
      "SQL",
      "Linux",
    ],
    recommendedKeywords: [
      "Kubernetes",
      "Kafka",
      "RabbitMQ",
      "GraphQL",
      "AWS",
      "Golang",
      "Elasticsearch",
      "gRPC",
      "CI/CD",
      "Terraform",
    ],
    concepts: [
      "Database Indexing",
      "Concurrency & Threading",
      "Caching Strategies",
      "Distributed Systems",
      "Load Balancing",
      "API Rate Limiting",
      "Fault Tolerance",
    ],
  },
  "ai-ml-engineer": {
    title: "AI / Machine Learning Engineer",
    criticalKeywords: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "LLMs",
      "Transformers",
      "Scikit-learn",
      "Git",
      "NumPy",
      "Pandas",
      "FastAPI",
    ],
    recommendedKeywords: [
      "LangChain",
      "LlamaIndex",
      "Hugging Face",
      "RAG",
      "Vector Databases (Pinecone/Milvus)",
      "MLflow",
      "Docker",
      "CUDA",
      "Model Fine-Tuning",
      "Weights & Biases",
    ],
    concepts: [
      "Prompt Engineering",
      "Embeddings & Semantic Search",
      "Model Evaluation",
      "Data Preprocessing",
      "Model Deployment",
      "Hyperparameter Optimization",
      "Overfitting Prevention",
    ],
  },
};

/**
 * Extract raw text from uploaded PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

/**
 * Extract text from text/markdown files
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return extractTextFromPDF(file);
  }
  return await file.text();
}

/**
 * Extract custom keywords from a pasted Job Description
 */
export function extractKeywordsFromJD(jdText: string): string[] {
  const commonTech = [
    "react", "typescript", "javascript", "node.js", "nodejs", "python", "aws", "docker",
    "kubernetes", "graphql", "sql", "postgresql", "mongodb", "next.js", "nextjs", "vue",
    "angular", "tailwind", "redis", "rest", "api", "git", "ci/cd", "microservices",
    "agile", "scrum", "jest", "unit testing", "system design", "html", "css", "linux"
  ];

  const words = jdText.toLowerCase();
  const foundKeywords = commonTech.filter((tech) => {
    const regex = new RegExp(`\\b${tech.replace(".", "\\.")}\\b`, "i");
    return regex.test(words);
  });

  return Array.from(new Set(foundKeywords));
}

/**
 * Deep ATS scoring and keyword analysis engine
 */
export function analyzeResumeATS(
  resumeText: string,
  fileName: string,
  fileSize: string,
  targetRoleKey = "frontend-engineer",
  customJobDescription?: string
): ResumeAnalysisResult {
  const lowerText = resumeText.toLowerCase();
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const roleDef = TECH_ROLES[targetRoleKey] || TECH_ROLES["frontend-engineer"];

  // 1. Keyword Extraction & Matching
  const allKeywords = [
    ...roleDef.criticalKeywords.map((k) => ({ keyword: k, importance: "critical" as const })),
    ...roleDef.recommendedKeywords.map((k) => ({ keyword: k, importance: "recommended" as const })),
    ...roleDef.concepts.map((k) => ({ keyword: k, importance: "recommended" as const })),
  ];

  // If custom JD provided, add extracted keywords
  if (customJobDescription && customJobDescription.trim().length > 20) {
    const jdExtracted = extractKeywordsFromJD(customJobDescription);
    jdExtracted.forEach((k) => {
      if (!allKeywords.some((item) => item.keyword.toLowerCase() === k)) {
        allKeywords.push({ keyword: k.toUpperCase(), importance: "critical" });
      }
    });
  }

  const matchedKeywords: KeywordMatch[] = [];
  const missingKeywords: KeywordMatch[] = [];

  allKeywords.forEach(({ keyword, importance }) => {
    const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;

    const matchObj: KeywordMatch = {
      keyword,
      category: "frameworks",
      found: count > 0,
      frequency: count,
      importance,
    };

    if (count > 0) {
      matchedKeywords.push(matchObj);
    } else {
      missingKeywords.push(matchObj);
    }
  });

  // 2. Section Checks
  const sections: SectionCheck[] = [
    {
      name: "Contact Information",
      found: /(@|phone|email|linkedin|github|portfolio)/i.test(resumeText),
      status: "good",
      feedback: "Email, phone or portfolio links properly detected.",
    },
    {
      name: "Professional Summary / Objective",
      found: /(summary|profile|about me|objective|overview)/i.test(resumeText),
      status: "good",
      feedback: "Strong summary helps recruiters quickly assess your seniority.",
    },
    {
      name: "Work Experience",
      found: /(experience|employment|work history|career)/i.test(resumeText),
      status: "good",
      feedback: "Work experience section with chronological roles found.",
    },
    {
      name: "Technical Skills",
      found: /(skills|technologies|proficiencies|tech stack)/i.test(resumeText),
      status: "good",
      feedback: "Dedicated technical skills section detected.",
    },
    {
      name: "Education & Certifications",
      found: /(education|degree|university|college|bachelor|master|certification)/i.test(resumeText),
      status: "good",
      feedback: "Academic credentials or certifications found.",
    },
    {
      name: "Projects & Portfolio",
      found: /(projects|portfolio|open source|github)/i.test(resumeText),
      status: "good",
      feedback: "Highlighting key projects improves recruiter engagement.",
    },
  ];

  sections.forEach((s) => {
    if (!s.found) {
      s.status = "warning";
      s.feedback = `Missing '${s.name}' section. ATS parsers prefer standard section headers.`;
    }
  });

  // 3. Action Verb & Impact Metrics Analysis
  const metricsFound = (resumeText.match(/(\d+%(?:\s*increase|\s*reduction|\s*growth)?|\$\d+[\d,]*|\d+\+?\s*(?:users|clients|requests|ms|seconds|engineers))/gi) || []).length;
  const actionVerbs = [
    "architected", "developed", "spearheaded", "optimized", "engineered", "accelerated",
    "reduced", "increased", "deployed", "scaled", "automated", "streamlined", "built"
  ];
  const actionVerbsFound = actionVerbs.filter((verb) => lowerText.includes(verb)).length;

  // 4. Calculate Sub-Scores
  const keywordRatio = matchedKeywords.length / (allKeywords.length || 1);
  const keywordScore = Math.min(100, Math.round(keywordRatio * 100 * 1.25));

  const structureFoundCount = sections.filter((s) => s.found).length;
  const structureScore = Math.round((structureFoundCount / sections.length) * 100);

  const impactScore = Math.min(100, Math.round((metricsFound * 12 + actionVerbsFound * 8)));
  const skillsScore = Math.min(100, Math.round((matchedKeywords.filter((k) => k.importance === "critical").length / (roleDef.criticalKeywords.length || 1)) * 100));

  // Weighted overall ATS score
  const overallScore = Math.min(
    100,
    Math.max(
      35,
      Math.round(
        keywordScore * 0.35 +
        impactScore * 0.25 +
        structureScore * 0.20 +
        skillsScore * 0.20
      )
    )
  );

  // 5. Intelligent Bullet Point Optimizer (STAR Formula)
  const bulletPoints: BulletPointImprovement[] = [
    {
      original: "Worked on React components and fixed bugs on the website.",
      improved:
        "Architected 15+ modular React components with TypeScript, improving page load speed by 35% and resolving 40+ high-priority UI tickets.",
      reason: "Replaced weak passive verb 'Worked on' with 'Architected' and added quantifiable impact metrics (+35% speed, 40+ tickets).",
      impactScoreBefore: 38,
      impactScoreAfter: 94,
    },
    {
      original: "Responsible for connecting frontend with backend APIs.",
      improved:
        "Engineered secure RESTful API integration using TanStack Query & WebSockets, reducing network latency by 45% for 50,000+ daily active users.",
      reason: "Replaced duty-oriented 'Responsible for' with active engineering verbs and quantified user scale.",
      impactScoreBefore: 42,
      impactScoreAfter: 96,
    },
    {
      original: "Created responsive styling using Tailwind CSS.",
      improved:
        "Standardized enterprise design system with Tailwind CSS v4 and fluid container queries, achieving 100% responsive compliance across mobile and desktop.",
      reason: "Quantified responsiveness and added design system context for greater executive impact.",
      impactScoreBefore: 50,
      impactScoreAfter: 92,
    },
  ];

  // 6. Top Recommendations
  const topRecommendations: string[] = [];
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords
      .filter((k) => k.importance === "critical")
      .slice(0, 4)
      .map((k) => k.keyword);
    if (topMissing.length > 0) {
      topRecommendations.push(`Add missing critical keywords: ${topMissing.join(", ")}`);
    }
  }

  if (metricsFound < 4) {
    topRecommendations.push("Quantify your achievements with numbers (e.g., 'Reduced bundle size by 30%', 'Served 10K+ users').");
  }

  if (wordCount < 250) {
    topRecommendations.push("Your resume is brief (under 250 words). Expand on key technical accomplishments.");
  } else if (wordCount > 1000) {
    topRecommendations.push("Your resume is lengthy (over 1,000 words). Aim for a concise 1–2 page format.");
  }

  topRecommendations.push("Ensure your LinkedIn, GitHub, and portfolio links are clickable in header.");

  return {
    fileName,
    fileSize,
    wordCount,
    readingTimeMinutes: readingTime,
    targetRole: roleDef.title,
    scores: {
      overallScore,
      keywordScore,
      impactScore,
      structureScore,
      skillsScore,
    },
    matchedKeywords,
    missingKeywords,
    sections,
    bulletPoints,
    topRecommendations,
    analyzedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

/**
 * Pre-built sample resumes for instant 1-click testing
 */
export const SAMPLE_RESUMES = {
  juniorReact: {
    title: "Junior React Developer Resume",
    text: `
ALEX RIVERA
Email: alex.rivera@example.com | Phone: (555) 234-5678 | GitHub: github.com/alexrivera | Portfolio: alexrivera.dev

PROFESSIONAL SUMMARY
Passionate Frontend Developer with 1.5+ years of experience building modern web applications using React, JavaScript, HTML5, and CSS3. Strong focus on clean component design and responsive layouts.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3
Frameworks & Libraries: React, Tailwind CSS, Vite, Redux Toolkit
Tools: Git, GitHub, VS Code, Figma, REST APIs

WORK EXPERIENCE
Junior Frontend Developer | TechStart Inc. | June 2024 – Present
- Built responsive UI components for the customer onboarding dashboard using React and Tailwind CSS.
- Collaborated with backend developers to integrate REST APIs and handle asynchronous data loading.
- Fixed 25+ frontend layout and styling bugs across desktop and mobile browsers.
- Wrote unit tests for reusable button and modal components.

Web Development Intern | CloudScale Labs | Jan 2024 – May 2024
- Created landing page wireframes and implemented them in HTML5 and modern CSS.
- Maintained company documentation and assisted with version control using Git.

EDUCATION
Bachelor of Science in Computer Science | State University | Graduated 2024
    `,
  },
  seniorFullstack: {
    title: "Senior Full-Stack Engineer Resume",
    text: `
SARAH CHEN
San Francisco, CA | sarah.chen@example.com | (555) 890-1234 | linkedin.com/in/sarahchen | github.com/sarahchen-dev

EXECUTIVE SUMMARY
Senior Full-Stack Software Engineer with 6+ years of experience architecting high-scale distributed systems and responsive web applications. Proven track record of improving performance by 40% for 1M+ active users.

CORE COMPETENCIES & TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL
Frontend: React 19, Next.js, Tailwind CSS, Redux Toolkit, WebSockets, Performance Optimization, Web Vitals
Backend & Databases: Node.js, Express, PostgreSQL, MongoDB, Redis, GraphQL, Microservices, Prisma
DevOps & Cloud: AWS (S3, Lambda, ECS), Docker, Kubernetes, CI/CD, Terraform, Git, Linux
Testing: Jest, Cypress, Playwright, TDD

PROFESSIONAL EXPERIENCE
Lead Full-Stack Engineer | Apex Enterprise Systems | Jan 2023 – Present
- Architected enterprise React 19 web application serving 1.2M monthly active users, reducing first contentful paint (FCP) by 45%.
- Engineered high-throughput Node.js microservices with PostgreSQL and Redis caching, processing 25,000 requests/second with 99.99% uptime.
- Spearheaded migration to Docker containerized microservices and automated CI/CD pipeline on AWS, cutting deployment time by 60%.
- Mentored a team of 8 engineers on clean architecture, TypeScript best practices, and code review standards.

Full-Stack Developer | Velocity Web Solutions | Aug 2020 – Dec 2022
- Developed customer analytics portal using Next.js, GraphQL, and Tailwind CSS, increasing client engagement by 32%.
- Optimized database queries and created PostgreSQL indexing strategies that reduced API response latency from 450ms to 85ms.
- Built automated end-to-end test suite using Playwright and Jest, increasing code coverage to 92%.

EDUCATION & CERTIFICATIONS
B.S. in Software Engineering | University of California, Berkeley | 2020
AWS Certified Solutions Architect – Associate | 2023
    `,
  },
};
