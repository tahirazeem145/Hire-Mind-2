export type InterviewCategory = "technical" | "behavioral" | "system-design" | "mixed";

export type SeniorityLevel = "entry" | "mid" | "senior" | "lead";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewCategory;
  context?: string;
  hints?: string[];
  keyTopics?: string[];
}

export interface CandidateAnswerEvaluation {
  score: number; // 0 to 10
  summary: string;
  strengths: string[];
  improvements: string[];
  starRating: number; // 0 to 5
  idealModelAnswer: string;
  technicalAccuracyScore?: number; // 0 to 100
  communicationScore?: number; // 0 to 100
}

export interface AnswerRecord {
  transcript: string;
  evaluation?: CandidateAnswerEvaluation;
  durationSeconds?: number;
}

export interface CompetencyScores {
  technicalDepth: number;
  communication: number;
  problemSolving: number;
  starStructure: number;
}

export interface PrepPlanDay {
  day: number;
  focus: string;
  task: string;
}

export interface FinalInterviewReport {
  overallScore: number; // 0 to 100
  recommendation: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement";
  executiveSummary: string;
  competencyScores: CompetencyScores;
  topStrengths: string[];
  actionableNextSteps: string[];
  recommendedPrepDays: PrepPlanDay[];
}

export interface InterviewSession {
  roleTitle: string;
  roleKey: string;
  level: SeniorityLevel;
  category: InterviewCategory;
  customJD?: string;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: Record<string, AnswerRecord>;
  status: "setup" | "in-progress" | "evaluating" | "completed";
  finalReport?: FinalInterviewReport;
}
