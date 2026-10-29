export type SeniorityLevel = 'Entry / Junior' | 'Mid-Level' | 'Senior' | 'Staff / Principal' | 'Manager / Executive';

export type InterviewType = 
  | 'Comprehensive Mixed'
  | 'Behavioral & Leadership'
  | 'Technical & Architecture'
  | 'Case Study & Problem Solving'
  | 'Culture Fit & Values';

export interface RoleSetup {
  role: string;
  industry: string;
  company: string;
  seniority: SeniorityLevel;
  interviewType: InterviewType;
  jobDescription?: string;
  resumeSummary?: string;
  totalQuestions: number;
}

export interface ScoreBreakdown {
  contentAndRelevance: number;
  structureAndClarity: number;
  impactAndMetrics: number;
  executiveTone: number;
}

export interface EvaluationResult {
  score: number;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  improvementSuggestions: string[];
  coachInsight: string;
  modelAnswerSnippet: string;
}

export interface InterviewTurn {
  id: string;
  questionNumber: number;
  question: string;
  questionCategory: string;
  coachTip: string;
  recommendedDurationSeconds?: number;
  userAnswer?: string;
  answerDurationSeconds?: number;
  evaluation?: EvaluationResult;
  transitionRationale?: string;
  answeredAt?: string;
}

export interface ReadinessReport {
  overallScore: number;
  hiringVerdict: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice';
  executiveSummary: string;
  topStrengths: string[];
  primaryGrowthAreas: string[];
  starMethodMastery: {
    rating: string;
    critique: string;
  };
  tailoredActionPlan: string[];
}
