export interface KeywordMatch {
  keyword: string;
  category: "languages" | "frameworks" | "tools" | "concepts" | "soft_skills";
  found: boolean;
  frequency: number;
  importance: "critical" | "recommended" | "optional";
}

export interface BulletPointImprovement {
  original: string;
  improved: string;
  reason: string;
  impactScoreBefore: number; // 0-100
  impactScoreAfter: number; // 0-100
}

export interface SectionCheck {
  name: string;
  found: boolean;
  status: "good" | "warning" | "missing";
  feedback: string;
}

export interface ATSScoreBreakdown {
  overallScore: number; // 0 - 100
  keywordScore: number; // 0 - 100
  impactScore: number; // 0 - 100
  structureScore: number; // 0 - 100
  skillsScore: number; // 0 - 100
}

export interface ResumeAnalysisResult {
  fileName: string;
  fileSize: string;
  wordCount: number;
  readingTimeMinutes: number;
  targetRole: string;
  scores: ATSScoreBreakdown;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  sections: SectionCheck[];
  bulletPoints: BulletPointImprovement[];
  topRecommendations: string[];
  analyzedAt: string;
}
