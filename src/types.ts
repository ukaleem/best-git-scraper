export interface RepositoryItem {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  ownerAvatar: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  license: string;
  topics: string[];
  updatedAt: string;
  category: 'saas-starter' | 'ai-agents' | 'agency-solutions' | 'devtools' | 'automation';
  agencyUseCases: string[];
  monetizationAngle: string;
  commercialRating: number; // 1-100
  forkRecommendation: string;
  creatorBuzz?: string;
}

export interface CommercialAudit {
  executiveSummary: string;
  commercialViabilityScore: number;
  viabilityBreakdown: {
    marketDemand: string;
    extensibility: string;
    maintenanceHealth: string;
    licenseAssessment: string;
  };
  monetizationStrategies: Array<{
    title: string;
    description: string;
    pricingGuidance: string;
    targetClients: string;
  }>;
  forkAndSetupBlueprint: {
    forkCommand: string;
    gitCloneCommand: string;
    prerequisites: string[];
    keyEnvVariables: string[];
    quickstartSteps: string[];
    suggestedAgencyExtensions: string[];
  };
  contributionOpportunities: string[];
}

export type SavedCategory = 'to-fork' | 'client-project' | 'saas-idea' | 'contributing';

export interface SavedRepo {
  repo: RepositoryItem;
  category: SavedCategory;
  savedAt: string;
  notes?: string;
}
