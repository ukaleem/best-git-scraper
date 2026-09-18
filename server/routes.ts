import { Router, Request, Response } from 'express';
import { CURATED_AGENCY_REPOS, RepositoryItem } from './curatedRepos';
import { getGemini } from './gemini';

export const apiRouter = Router();

// In-memory cache for live GitHub responses
const cache: Record<string, { data: RepositoryItem[]; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

// Helper to format GitHub API items into RepositoryItem
function formatGithubRepo(item: any, fallbackCategory: RepositoryItem['category'] = 'agency-solutions'): RepositoryItem {
  const licenseName = item.license ? item.license.spdx_id || item.license.name : 'Unknown';
  const stars = item.stargazers_count || 0;
  
  // Calculate commercial rating estimation based on stars, license, forks
  let commercialRating = 80;
  if (['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'].includes(licenseName)) {
    commercialRating += 12;
  } else if (licenseName.includes('AGPL')) {
    commercialRating += 4;
  }
  if (stars > 10000) commercialRating += 6;
  if (stars > 30000) commercialRating += 2;
  commercialRating = Math.min(99, Math.max(70, commercialRating));

  const topics: string[] = Array.isArray(item.topics) ? item.topics : [];
  
  let category: RepositoryItem['category'] = fallbackCategory;
  if (topics.some(t => ['ai', 'agent', 'llm', 'rag', 'gpt', 'langchain'].includes(t.toLowerCase()))) {
    category = 'ai-agents';
  } else if (topics.some(t => ['saas', 'boilerplate', 'starter', 'nextjs', 'template'].includes(t.toLowerCase()))) {
    category = 'saas-starter';
  } else if (topics.some(t => ['automation', 'workflow', 'bot', 'scraping'].includes(t.toLowerCase()))) {
    category = 'automation';
  } else if (topics.some(t => ['cli', 'devtools', 'monitoring', 'observability', 'testing'].includes(t.toLowerCase()))) {
    category = 'devtools';
  }

  return {
    id: String(item.id || item.full_name?.replace('/', '-') || Math.random().toString(36).slice(2)),
    name: item.name || 'Unnamed Repo',
    fullName: item.full_name || item.name,
    owner: item.owner?.login || 'unknown',
    ownerAvatar: item.owner?.avatar_url || 'https://github.com/github.png',
    url: item.html_url || `https://github.com/${item.full_name}`,
    description: item.description || 'No description provided.',
    stars,
    forks: item.forks_count || 0,
    openIssues: item.open_issues_count || 0,
    language: item.language || 'Code',
    license: licenseName,
    topics,
    updatedAt: item.pushed_at || item.updated_at || new Date().toISOString(),
    category,
    agencyUseCases: [
      `Deploy customized instances for agency clients needing ${item.name} capabilities`,
      `Integrate into agency starter stacks to reduce custom development cycle time`,
      `Offer ongoing maintenance, hosting, and SLA support retainers`
    ],
    monetizationAngle: `Package as a turnkey agency solution or client automation module ($2,500 - $7,500 setup).`,
    commercialRating,
    forkRecommendation: `Fork with 'gh repo fork ${item.full_name} --clone' to adapt UI and business logic for client deliverables.`
  };
}

// 1. Get curated or trending repositories
apiRouter.get('/repos/trending', async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'all';
  const sort = (req.query.sort as string) || 'stars'; // stars | velocity | rating

  // Start with curated goldmine repos
  let items = [...CURATED_AGENCY_REPOS];

  // Attempt live GitHub fetch if internet/cache allows
  const cacheKey = `trending-${category}-${sort}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    items = cached.data;
  } else {
    try {
      // Build a query for high quality repos
      let queryTopic = 'developer-tools';
      if (category === 'ai-agents') queryTopic = 'ai-agent+OR+llm';
      else if (category === 'saas-starter') queryTopic = 'saas+OR+boilerplate';
      else if (category === 'automation') queryTopic = 'workflow-automation+OR+automation';
      else if (category === 'agency-solutions') queryTopic = 'open-source-alternative+OR+crm+OR+cms';
      else if (category === 'devtools') queryTopic = 'developer-tools+OR+cli';

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'AI-Studio-Repo-Discovery'
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      // Fetch top repos from GitHub
      const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(queryTopic)}+stars:>1000&sort=stars&order=desc&per_page=15`;
      const response = await fetch(ghUrl, { headers, signal: AbortSignal.timeout(5000) });

      if (response.ok) {
        const ghData = await response.json();
        if (Array.isArray(ghData.items)) {
          const fetchedItems = ghData.items.map((it: any) => formatGithubRepo(it, category as any));
          
          // Merge with curated (deduplicating by fullName)
          const seen = new Set<string>();
          const merged: RepositoryItem[] = [];
          
          for (const item of [...CURATED_AGENCY_REPOS, ...fetchedItems]) {
            if (!seen.has(item.fullName.toLowerCase())) {
              seen.add(item.fullName.toLowerCase());
              merged.push(item);
            }
          }
          items = merged;
          cache[cacheKey] = { data: items, timestamp: Date.now() };
        }
      }
    } catch {
      // Gracefully fall back to curated database
    }
  }

  // Filter by category if specified and not 'all'
  let filtered = items;
  if (category !== 'all') {
    filtered = filtered.filter(it => it.category === category);
  }

  // Sort
  if (sort === 'stars') {
    filtered.sort((a, b) => b.stars - a.stars);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.commercialRating - a.commercialRating);
  } else if (sort === 'velocity') {
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  res.json({
    success: true,
    total: filtered.length,
    repos: filtered
  });
});

// 2. Search GitHub repositories by keyword
apiRouter.get('/repos/search', async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) {
    return res.json({ success: true, repos: CURATED_AGENCY_REPOS });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'AI-Studio-Repo-Discovery'
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=20`;
    const response = await fetch(ghUrl, { headers, signal: AbortSignal.timeout(6000) });

    if (response.ok) {
      const data = await response.json();
      const repos = (data.items || []).map((it: any) => formatGithubRepo(it));
      return res.json({ success: true, repos });
    }
  } catch {
    // If rate-limited or offline, filter curated repos
  }

  // Fallback search in curated database
  const queryLower = q.toLowerCase();
  const matched = CURATED_AGENCY_REPOS.filter(r => 
    r.name.toLowerCase().includes(queryLower) ||
    r.description.toLowerCase().includes(queryLower) ||
    r.topics.some(t => t.toLowerCase().includes(queryLower)) ||
    r.language.toLowerCase().includes(queryLower)
  );

  res.json({ success: true, repos: matched });
});

// 3. AI Deep Search for Creator & Internet Trending Repositories
apiRouter.post('/ai/deep-search', async (req: Request, res: Response) => {
  const { prompt, focus, timeframe } = req.body;
  const userQuery = prompt || 'Find the most useful GitHub repositories for software agencies and developers';
  const filterFocus = focus || 'all'; // all | ai | saas | tools | automation
  const period = timeframe || 'this week';

  try {
    const ai = getGemini();

    const systemPrompt = `You are an elite open-source researcher and agency CTO.
Your task is to identify and recommend the highest-potential, most useful GitHub repositories for developers and software agencies.
Developers and agencies want repos they can:
1. Fork and build upon to deliver client solutions (e.g. CRM, automation, portals, AI bots)
2. Turn into profitable SaaS or micro-SaaS products
3. Use as agency-accelerating boilerplates and devtools
4. Track viral trends popular on YouTube tech channels, Twitter/X, and Hacker News.

Timeframe: ${period}
Focus area: ${filterFocus}
User custom criteria: ${userQuery}

Return a valid JSON array of 6 to 8 top repositories. Each object MUST strictly follow this schema:
[
  {
    "name": "repository-name",
    "fullName": "owner/repository-name",
    "url": "https://github.com/owner/repository-name",
    "owner": "owner",
    "description": "Crisp 1-2 sentence description of what the project does",
    "starsEstimate": 15000,
    "language": "TypeScript",
    "license": "MIT",
    "topics": ["ai", "agents", "automation"],
    "category": "ai-agents",
    "creatorBuzz": "Why creators on YouTube/X are raving about it",
    "agencyUseCases": [
      "Concrete way an agency can use this for client work",
      "Another tangible agency deliverable or internal workflow"
    ],
    "monetizationAngle": "Specific revenue angle (e.g. 'Charge $3,000 to deploy custom workflows for local businesses')",
    "commercialRating": 95,
    "forkRecommendation": "Exact advice on how to fork, modify, or extend this repository"
  }
]
Return ONLY raw JSON with no Markdown backticks or wrapping text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ]
    });

    const rawText = response.text || '[]';
    // Clean potential markdown backticks
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Attempt to extract JSON array if there's surrounding chatter
      const startIdx = cleaned.indexOf('[');
      const endIdx = cleaned.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
        parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      }
    }

    // Enhance items to match RepositoryItem structure
    const formattedRepos: RepositoryItem[] = parsed.map((item, idx) => ({
      id: item.fullName?.replace('/', '-') || `ai-discovered-${idx}-${Date.now()}`,
      name: item.name || 'Repo',
      fullName: item.fullName || `dev/${item.name}`,
      owner: item.owner || item.fullName?.split('/')[0] || 'developer',
      ownerAvatar: `https://avatars.githubusercontent.com/u/${(Math.abs(hashString(item.fullName || 'repo')) % 100000000) + 100000}?v=4`,
      url: item.url || `https://github.com/${item.fullName}`,
      description: item.description || '',
      stars: item.starsEstimate || 5000,
      forks: Math.round((item.starsEstimate || 5000) * 0.18),
      openIssues: 45,
      language: item.language || 'TypeScript',
      license: item.license || 'MIT',
      topics: Array.isArray(item.topics) ? item.topics : ['trending', 'developer-tool'],
      updatedAt: new Date().toISOString(),
      category: item.category || 'agency-solutions',
      agencyUseCases: item.agencyUseCases || ['Client projects', 'Internal tools'],
      monetizationAngle: item.monetizationAngle || 'Package as a client solution',
      commercialRating: item.commercialRating || 90,
      forkRecommendation: item.forkRecommendation || `Run 'gh repo fork ${item.fullName} --clone'`,
      creatorBuzz: item.creatorBuzz || 'Trending among dev creators'
    }));

    return res.json({
      success: true,
      query: userQuery,
      repos: formattedRepos
    });
  } catch (error: any) {
    console.error('AI Deep Search error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete AI deep search'
    });
  }
});

// Simple string hash for avatar generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// 4. AI Repository Commercial Audit & Monetization Blueprint
apiRouter.post('/ai/analyze', async (req: Request, res: Response) => {
  const { repoUrl, repoName, description, language, license } = req.body;

  if (!repoUrl && !repoName) {
    return res.status(400).json({ success: false, error: 'Repository URL or Name is required' });
  }

  try {
    const ai = getGemini();

    const prompt = `Analyze this GitHub repository for a software agency and professional developer:
Target Repository: ${repoUrl || repoName}
Description: ${description || 'Not provided'}
Language: ${language || 'Unknown'}
License: ${license || 'Unknown'}

Perform a deep agency commercial viability audit.
Return a valid JSON object with the following fields:
{
  "executiveSummary": "Concise 2-sentence summary of what this repo does and why it matters to an agency or developer",
  "commercialViabilityScore": 92,
  "viabilityBreakdown": {
    "marketDemand": "High/Medium/Low with brief reason",
    "extensibility": "Ease of building on top of this codebase",
    "maintenanceHealth": "Evaluation of stability and community health",
    "licenseAssessment": "Assessment of commercial use safety (MIT vs Apache vs AGPL)"
  },
  "monetizationStrategies": [
    {
      "title": "Client Solution Package",
      "description": "Exact service package an agency can sell to businesses using this repo",
      "pricingGuidance": "$3,000 - $8,000 setup fee + $500/mo retainer",
      "targetClients": "e.g. E-commerce brands, Medical clinics, SaaS companies"
    },
    {
      "title": "Turnkey Micro-SaaS / White-Label",
      "description": "How a developer can fork, rebrand, or wrap this into a recurring revenue SaaS",
      "pricingGuidance": "$49 - $199/mo per subscriber",
      "targetClients": "Target customer segment"
    },
    {
      "title": "Custom Integration & API Workflows",
      "description": "Specialized integration or automation services",
      "pricingGuidance": "$120 - $180/hour or fixed fee",
      "targetClients": "Mid-market tech teams"
    }
  ],
  "forkAndSetupBlueprint": {
    "forkCommand": "gh repo fork ${repoName || 'owner/repo'} --clone",
    "gitCloneCommand": "git clone ${repoUrl || 'https://github.com/owner/repo'}.git",
    "prerequisites": ["Node.js 20+", "Docker", "PostgreSQL"],
    "keyEnvVariables": ["DATABASE_URL", "NEXTAUTH_SECRET", "STRIPE_SECRET_KEY"],
    "quickstartSteps": [
      "1. Clone the repository and install dependencies with pnpm/npm",
      "2. Copy .env.example to .env and configure credentials",
      "3. Run database migrations",
      "4. Launch development server with npm run dev"
    ],
    "suggestedAgencyExtensions": [
      "Add custom multi-tenant organization billing",
      "White-label agency dashboard styling and custom domains"
    ]
  },
  "contributionOpportunities": [
    "High-value feature or bug fix that would build open-source authority",
    "Documentation or integration plugin that helps agency clients"
  ]
}
Return ONLY pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const rawText = response.text || '{}';
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let analysis = {};
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        analysis = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      }
    }

    return res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('AI Repo Analysis error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Analysis failed' });
  }
});

// 5. Generate Agency Pitch & Proposal for Client
apiRouter.post('/ai/pitch', async (req: Request, res: Response) => {
  const { repoName, clientIndustry, clientPainPoint } = req.body;

  try {
    const ai = getGemini();

    const prompt = `You are a top software agency sales director.
Draft a high-converting, professional project pitch email and proposal outline that an agency can send to a prospective client in the "${clientIndustry || 'Business Services'}" industry.
The agency will be building the client's custom solution using the proven architecture of "${repoName}".
Client pain point: "${clientPainPoint || 'Need custom automation and modern web platform without starting from scratch'}".

Include:
1. Executive Subject Line
2. The Value Proposition (Saving 2-3 months of development time and $30k+ in custom coding fees)
3. Proposed Solution Architecture & Timeline
4. Investment / Budget Range
5. Next Step Call to Action

Format cleanly with clear sections.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return res.json({
      success: true,
      pitch: response.text || 'Proposal generated successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
