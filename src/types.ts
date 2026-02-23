export enum AgentRole {
  ASSET = 'Asset Specialist',
  BUSINESS = 'Business Auditor',
  DTI = 'Financial Analyst',
  FRAUD = 'Fraud Investigator',
  ARBITER = 'Final Arbiter'
}

export interface DebateTurn {
  role: AgentRole;
  content: string;
  timestamp: string;
}

export interface RiskAnalysis {
  passProbability: number;
  creditLimit: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScores: {
    asset: number;
    business: number;
    dti: number;
    fraud: number;
  };
  summary: string;
  evidenceChain: string[];
  historicalMatch: {
    caseId: string;
    similarity: number;
    outcome: string;
    details?: string;
  };
}

export interface LoanApplication {
  id: string;
  applicant: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
}

export interface HistoricalCase extends LoanApplication {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  outcome: 'APPROVED' | 'REJECTED' | 'DEFAULTED';
  date: string;
}

export interface CaseFeedback {
  caseId: string;
  isCorrect: boolean;
  managerNotes: string;
  timestamp: string;
}