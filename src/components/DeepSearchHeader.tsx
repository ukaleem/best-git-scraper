import React, { useState } from 'react';
import { 
  Search, Sparkles, Flame, Briefcase, Bot, Rocket, 
  Layers, ArrowUpDown, Filter, Loader2, Compass, PlusCircle
} from 'lucide-react';

interface DeepSearchHeaderProps {
  onSearch: (query: string) => void;
  onDeepSearchAI: (prompt: string, focus: string, timeframe: string) => void;
  onAnalyzeCustomUrl: () => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  activeCategory: string;
  activeSort: string;
  activeTimeframe: string;
  isAiSearching: boolean;
  totalCount: number;
}

export const DeepSearchHeader: React.FC<DeepSearchHeaderProps> = ({
  onSearch,
  onDeepSearchAI,
  onAnalyzeCustomUrl,
  onCategoryChange,
  onSortChange,
  onTimeframeChange,
  activeCategory,
  activeSort,
  activeTimeframe,
  isAiSearching,
  totalCount,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [deepPromptInput, setDeepPromptInput] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const presets = [
    {
      label: 'Creator Viral Picks',
      icon: Flame,
      prompt: 'Find the most viral and useful GitHub repositories trending on YouTube and Twitter for developers and agencies',
      focus: 'all',
      badgeColor: 'text-orange-400 border-orange-800/40 bg-orange-950/30'
    },
    {
      label: 'Agency Turnkey MVPs',
      icon: Briefcase,
      prompt: 'Find open source platforms agencies can sell or white-label to clients (CRM, booking, forms, customer support)',
      focus: 'agency-solutions',
      badgeColor: 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30'
    },
    {
      label: 'Autonomous AI Agents',
      icon: Bot,
      prompt: 'Find the top open-source AI agent workflows, browser automation, and LLM orchestration repos for agency work',
      focus: 'ai-agents',
      badgeColor: 'text-purple-400 border-purple-800/40 bg-purple-950/30'
    },
    {
      label: 'SaaS Boilerplates',
      icon: Rocket,
      prompt: 'Find modern full-stack SaaS starters with Next.js, Stripe, auth, and database ready to fork',
      focus: 'saas-starter',
      badgeColor: 'text-cyan-400 border-cyan-800/40 bg-cyan-950/30'
    }
  ];

  const handleDeepSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepPromptInput.trim()) return;
    onDeepSearchAI(deepPromptInput, activeCategory, activeTimeframe);
  };

  const handleKeywordChange = (val: string) => {
    setSearchInput(val);
    onSearch(val);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Hero Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Intelligent Open Source Discovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">
              Curated High-Value Repos for Developers & Agencies
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Deep search trending codebases across YouTube, Twitter, and GitHub. Uncover commercial potential, monetization roadmaps, and ready-to-use fork blueprints.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="open-custom-analyze-btn"
              onClick={onAnalyzeCustomUrl}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-700 transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Audit Any Repo URL</span>
            </button>

            <button
              id="toggle-deep-search-btn"
              onClick={() => setShowAiInput(!showAiInput)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Deep Web Search</span>
            </button>
          </div>
        </div>

        {/* AI Deep Search Bar (Expandable or Inline) */}
        {showAiInput && (
          <form 
            onSubmit={handleDeepSearchSubmit}
            className="mt-6 p-4 rounded-2xl bg-neutral-950/80 border border-indigo-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini Deep Search Prompt</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Searches internet, creator channels, & GitHub
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                id="deep-search-input"
                type="text"
                value={deepPromptInput}
                onChange={(e) => setDeepPromptInput(e.target.value)}
                placeholder="e.g. Find trending AI agent tools and high-margin client CRM alternatives with MIT license..."
                className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                id="execute-deep-search-btn"
                type="submit"
                disabled={isAiSearching}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                {isAiSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Web...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Deep Search</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Creator & Agency Presets */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-neutral-400 mb-2.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Trending Internet & Creator Discovery Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => {
              const Icon = preset.icon;
              return (
                <button
                  key={i}
                  id={`preset-btn-${i}`}
                  onClick={() => {
                    setDeepPromptInput(preset.prompt);
                    onDeepSearchAI(preset.prompt, preset.focus, activeTimeframe);
                  }}
                  disabled={isAiSearching}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition hover:brightness-125 disabled:opacity-50 ${preset.badgeColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter & Live Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800/80">
        {/* Keyword Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            id="repo-keyword-search"
            type="text"
            value={searchInput}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Search by repo name, tech stack, keyword (e.g. Next.js, Supabase, CRM)..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 overflow-x-auto">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'agency-solutions', label: 'Agency Stacks' },
              { id: 'saas-starter', label: 'SaaS Starters' },
              { id: 'ai-agents', label: 'AI Agents' },
              { id: 'devtools', label: 'DevTools' },
              { id: 'automation', label: 'Automation' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition text-xs ${
                  activeCategory === cat.id
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            {[
              { id: 'today', label: 'Daily' },
              { id: 'this week', label: 'Weekly' },
              { id: 'all-time', label: 'All-Time' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTimeframe === tf.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-neutral-950 px-2 py-1.5 rounded-xl border border-neutral-800 text-neutral-400">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
            <select
              id="sort-select"
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="stars" className="bg-neutral-900 text-neutral-200">Most Stars</option>
              <option value="rating" className="bg-neutral-900 text-neutral-200">Agency Score</option>
              <option value="velocity" className="bg-neutral-900 text-neutral-200">Recently Updated</option>
            </select>
          </div>

          <div className="hidden sm:block text-neutral-500 font-mono text-[11px] px-2">
            {totalCount} repos found
          </div>
        </div>
      </div>
    </div>
  );
};
