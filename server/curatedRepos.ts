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

export const CURATED_AGENCY_REPOS: RepositoryItem[] = [
  {
    id: 'shadcn-ui-taxonomy',
    name: 'taxonomy',
    fullName: 'shadcn-ui/taxonomy',
    owner: 'shadcn-ui',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/139895814?v=4',
    url: 'https://github.com/shadcn-ui/taxonomy',
    description: 'An open-source Next.js 14 application with Server Components, authentication, Stripe subscription billing, and Postgres.',
    stars: 18900,
    forks: 3400,
    openIssues: 42,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['nextjs', 'react', 'stripe', 'tailwind', 'shadcn', 'saas-starter'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    category: 'saas-starter',
    agencyUseCases: [
      'Rapid MVP client delivery in 1-2 weeks instead of 2 months',
      'Deploy custom SaaS platforms for clients with subscription paywalls',
      'White-label portal for client customer management'
    ],
    monetizationAngle: 'Sell turnkey SaaS MVPs to non-technical founders for $4,000 - $12,000 using this foundation.',
    commercialRating: 98,
    forkRecommendation: 'Fork immediately as agency base boilerplate. Add your own UI theme and multi-tenant DB schema.',
    creatorBuzz: 'Featured across YouTube dev channels as the gold-standard Next.js SaaS architecture.'
  },
  {
    id: 'activepieces',
    name: 'activepieces',
    fullName: 'activepieces/activepieces',
    owner: 'activepieces',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/98914674?v=4',
    url: 'https://github.com/activepieces/activepieces',
    description: 'Your friendliest open source all-in-one automation tool, Zapier/Make alternative designed for businesses.',
    stars: 14200,
    forks: 1800,
    openIssues: 160,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['automation', 'zapier-alternative', 'workflow', 'integration', 'agency'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'automation',
    agencyUseCases: [
      'Sell internal business workflow automation retainers to local and mid-market companies',
      'Host private white-label automation cloud for client companies avoiding high Zapier per-task fees',
      'Custom webhook triggers connecting CRM, ERP, and AI models'
    ],
    monetizationAngle: 'Charge $1,500/mo - $5,000/mo agency retainers to manage and build custom client automations on dedicated instances.',
    commercialRating: 96,
    forkRecommendation: 'Fork and brand with your agency styling. Embed custom connectors for your clients proprietary APIs.',
    creatorBuzz: 'Praised by automation agencies as the best self-hostable Make/Zapier replacement.'
  },
  {
    id: 'flowise',
    name: 'Flowise',
    fullName: 'FlowiseAI/Flowise',
    owner: 'FlowiseAI',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/130174092?v=4',
    url: 'https://github.com/FlowiseAI/Flowise',
    description: 'Drag & drop UI to build your customized LLM flow with Langchain, LlamaIndex, and multi-agent systems.',
    stars: 32500,
    forks: 16800,
    openIssues: 210,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['ai-agent', 'langchain', 'llm', 'rag', 'visual-workflow'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    category: 'ai-agents',
    agencyUseCases: [
      'Build custom RAG chatbots and AI agents for enterprise and e-commerce clients',
      'Provide visual AI agent dashboards where clients can inspect conversation logic',
      'Integrate internal knowledge bases (PDFs, Notion, SQL) into client apps'
    ],
    monetizationAngle: 'Package customized AI assistants and RAG systems for clients at $3,500 setup + $500/mo maintenance.',
    commercialRating: 95,
    forkRecommendation: 'Fork to add custom authentication, client tenant isolation, and custom company API tools.',
    creatorBuzz: 'Viral on X (Twitter) and YouTube for zero-code agent chaining and multi-agent routing.'
  },
  {
    id: 'calcom',
    name: 'cal.com',
    fullName: 'calcom/cal.com',
    owner: 'calcom',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/79145102?v=4',
    url: 'https://github.com/calcom/cal.com',
    description: 'Scheduling infrastructure for absolutely everyone. Calendly alternative with white-label and embed options.',
    stars: 34100,
    forks: 8200,
    openIssues: 450,
    language: 'TypeScript',
    license: 'AGPL-3.0',
    topics: ['scheduling', 'calendar', 'calendly-alternative', 'enterprise', 'nextjs'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'Embed white-labeled booking systems inside client telehealth, consulting, or salon platforms',
      'Provide privacy-compliant self-hosted scheduling for law firms and medical agencies',
      'Automate client intake booking workflows with payment processing'
    ],
    monetizationAngle: 'Sell end-to-end appointment & booking platform setups to service businesses for $2,000 - $8,000.',
    commercialRating: 88,
    forkRecommendation: 'Review AGPL terms if offering proprietary SaaS, or deploy as standalone client service infrastructure.',
    creatorBuzz: 'One of the most praised open source companies demonstrating commercial open source success.'
  },
  {
    id: 'formbricks',
    name: 'formbricks',
    fullName: 'formbricks/formbricks',
    owner: 'formbricks',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/105469466?v=4',
    url: 'https://github.com/formbricks/formbricks',
    description: 'Open Source Survey & Experience Management Suite. Qualtrics and Typeform alternative.',
    stars: 8700,
    forks: 1400,
    openIssues: 85,
    language: 'TypeScript',
    license: 'AGPL-3.0',
    topics: ['survey', 'typeform-alternative', 'feedback', 'product-analytics'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'In-app micro-surveys and CSAT feedback tracking for clients software products',
      'Client onboarding questionnaires that sync directly to internal CRMs',
      'User research and churn analysis dashboards for agency client projects'
    ],
    monetizationAngle: 'Bundle user feedback and churn prevention systems into agency UX redesign contracts ($5,000+).',
    commercialRating: 90,
    forkRecommendation: 'Fork to customize widget styling or integrate with custom webhooks.',
    creatorBuzz: 'Rising rapidly on GitHub trending as companies look to avoid high Typeform pricing.'
  },
  {
    id: 'chatwoot',
    name: 'chatwoot',
    fullName: 'chatwoot/chatwoot',
    owner: 'chatwoot',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/55122177?v=4',
    url: 'https://github.com/chatwoot/chatwoot',
    description: 'Customer engagement suite, open source alternative to Intercom, Zendesk, and Salesforce Service Cloud.',
    stars: 21500,
    forks: 3600,
    openIssues: 190,
    language: 'Ruby / Vue',
    license: 'MIT',
    topics: ['intercom-alternative', 'customer-support', 'live-chat', 'omnichannel', 'crm'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'Deliver omni-channel customer support desks (WhatsApp, Email, Webchat) for e-commerce clients',
      'Replace expensive $500/seat Intercom contracts with self-hosted instances',
      'Hook up AI auto-responders to handle 80% of routine client customer inquiries'
    ],
    monetizationAngle: 'Charge $1,000 setup + $300/mo managed hosting per client. With 10 clients that is $3,000/mo MRR.',
    commercialRating: 97,
    forkRecommendation: 'MIT license makes it ideal for proprietary extensions and white-labeling under agency branding.',
    creatorBuzz: 'Regularly highlighted by agency creators as the highest-margin self-hosted client offering.'
  },
  {
    id: 'documenso',
    name: 'documenso',
    fullName: 'documenso/documenso',
    owner: 'documenso',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/101373516?v=4',
    url: 'https://github.com/documenso/documenso',
    description: 'The Open Source DocuSign Alternative. Sign documents digitally with cryptographic security.',
    stars: 9600,
    forks: 1100,
    openIssues: 120,
    language: 'TypeScript',
    license: 'AGPL-3.0',
    topics: ['docusign-alternative', 'e-signature', 'nextjs', 'pdf-signing', 'legaltech'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'Integrate compliant e-signing directly inside client contract portals and HR platforms',
      'White-label document signing for real estate, recruitment, and legal agencies',
      'Automated NDA & freelance contract workflows'
    ],
    monetizationAngle: 'Build custom automated contract generation and signing pipelines for B2B clients ($4,000 - $10,000 project fee).',
    commercialRating: 92,
    forkRecommendation: 'Fork to hook into client ERP or CRM document storage like AWS S3 or Google Drive.',
    creatorBuzz: 'Featured in tech creator roundups for its clean Next.js App Router architecture and modern UI.'
  },
  {
    id: 'langfuse',
    name: 'langfuse',
    fullName: 'langfuse/langfuse',
    owner: 'langfuse',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/127393457?v=4',
    url: 'https://github.com/langfuse/langfuse',
    description: 'Open source LLM engineering platform: observability, metrics, evals, prompt management and playground.',
    stars: 8400,
    forks: 900,
    openIssues: 95,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['llm-observability', 'rag-evaluation', 'ai-engineering', 'prompt-management'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'devtools',
    agencyUseCases: [
      'Offer AI auditing and cost optimization services for companies deploying LLMs',
      'Monitor and debug client AI agents for latency, hallucination, and token spend',
      'Implement prompt versioning and regression testing for client production apps'
    ],
    monetizationAngle: 'Position your agency as an elite "AI Reliability & LLMOps" consultancy charging $8,000+ audit fees.',
    commercialRating: 94,
    forkRecommendation: 'Integrate directly into any client AI project to provide transparent analytics to executive stakeholders.',
    creatorBuzz: 'The de-facto observability tool trending in Y-Combinator AI batches and Twitter engineer circles.'
  },
  {
    id: 'twenty',
    name: 'twenty',
    fullName: 'twentyhq/twenty',
    owner: 'twentyhq',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/108340448?v=4',
    url: 'https://github.com/twentyhq/twenty',
    description: 'Building a modern alternative to Salesforce, powered by the open-source community.',
    stars: 25400,
    forks: 2800,
    openIssues: 180,
    language: 'TypeScript',
    license: 'AGPL-3.0',
    topics: ['crm', 'salesforce-alternative', 'graphql', 'enterprise-crm', 'agency'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'Deploy and customize enterprise CRMs for agency clients tired of Salesforce 6-figure licenses',
      'Tailor custom pipeline stages, fields, and automated client follow-ups',
      'Integrate with client VoIP, WhatsApp, and email marketing stacks'
    ],
    monetizationAngle: 'CRM implementation is one of the highest-paid agency niches: $10k-$35k implementation + ongoing maintenance retainers.',
    commercialRating: 95,
    forkRecommendation: 'Fork to build vertical CRM solutions (e.g. CRM for Architects, CRM for Logistics, CRM for Dental Practices).',
    creatorBuzz: 'Exploding in popularity as the slickest Notion-like open source CRM ever built.'
  },
  {
    id: 'payload',
    name: 'payload',
    fullName: 'payloadcms/payload',
    owner: 'payloadcms',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/70932202?v=4',
    url: 'https://github.com/payloadcms/payload',
    description: 'The best Next.js & Node.js headless CMS and application framework. Full TypeScript, Postgres/MongoDB.',
    stars: 28500,
    forks: 2100,
    openIssues: 220,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['cms', 'headless-cms', 'nextjs', 'typescript', 'agency-favorite'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    category: 'agency-solutions',
    agencyUseCases: [
      'Primary CMS backbone for agency web design and web application client deliveries',
      'Extremely customizable admin panel where non-technical client teams manage content',
      'Native Next.js App Router integration with zero separate server overhead'
    ],
    monetizationAngle: 'Standard web development contracts ($6k - $25k) built 3x faster with native TypeScript type safety.',
    commercialRating: 99,
    forkRecommendation: 'Fork and create your agency master template with pre-built blocks (hero, pricing, testimonials, FAQ).',
    creatorBuzz: 'Acquired by / partnered with Vercel; currently the fastest trending CMS in the developer ecosystem.'
  },
  {
    id: 'browser-use',
    name: 'browser-use',
    fullName: 'browser-use/browser-use',
    owner: 'browser-use',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/187903848?v=4',
    url: 'https://github.com/browser-use/browser-use',
    description: 'Make websites accessible for AI agents. Open-source web browsing automation framework for LLMs.',
    stars: 27900,
    forks: 3400,
    openIssues: 140,
    language: 'Python',
    license: 'MIT',
    topics: ['ai-agent', 'browser-automation', 'scraping', 'web-agent', 'playwright'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: 'ai-agents',
    agencyUseCases: [
      'Build autonomous research agents for clients (competitor price scraping, lead collection)',
      'Automate tedious human web workflows (filling municipal forms, portal data entry)',
      'Deliver automated QA testing and end-to-end user verification'
    ],
    monetizationAngle: 'Sell automated data extraction and web agent pipelines to e-commerce & finance clients for $3,000-$8,000.',
    commercialRating: 96,
    forkRecommendation: 'Fork to wrap in a FastAPI / Docker container with webhooks and agency dashboard.',
    creatorBuzz: 'The #1 breakout viral AI agent repository of 2025-2026 across YouTube, Twitter, and Reddit.'
  },
  {
    id: 'open-webui',
    name: 'open-webui',
    fullName: 'open-webui/open-webui',
    owner: 'open-webui',
    ownerAvatar: 'https://avatars.githubusercontent.com/u/156475355?v=4',
    url: 'https://github.com/open-webui/open-webui',
    description: 'User-friendly WebUI for LLMs (Ollama, OpenAI, Gemini, Claude). ChatGPT alternative with RBAC and document RAG.',
    stars: 64200,
    forks: 8900,
    openIssues: 320,
    language: 'Python / Svelte',
    license: 'MIT',
    topics: ['chatgpt-alternative', 'ollama', 'rag', 'llm-ui', 'enterprise-ai'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    category: 'ai-agents',
    agencyUseCases: [
      'Deploy an internal private ChatGPT for corporate clients with confidentiality guarantees',
      'Provide department-level document search and knowledge management',
      'Manage multi-model API access with per-employee rate limits and auditing'
    ],
    monetizationAngle: 'Deploy as a "Private Enterprise AI Suite" for local businesses: $5k setup + $1,000/mo ongoing support.',
    commercialRating: 98,
    forkRecommendation: 'Fork to customize logo, domain, and pre-load company prompt libraries.',
    creatorBuzz: 'Universally hailed as the cleanest self-hosted AI chat interface in the world.'
  }
];
