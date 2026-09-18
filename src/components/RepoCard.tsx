import React, { useState } from 'react';
import { 
  Star, GitFork, Sparkles, ExternalLink, Bookmark, Check, 
  Flame, ShieldCheck, ArrowRight, DollarSign, Layers
} from 'lucide-react';
import { RepositoryItem, SavedCategory } from '../types';

interface RepoCardProps {
  repo: RepositoryItem;
  onForkClick: (repo: RepositoryItem) => void;
  onAuditClick: (repo: RepositoryItem) => void;
  onSaveToggle: (repo: RepositoryItem, category: SavedCategory) => void;
  isSaved: boolean;
  savedCategory?: SavedCategory;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  onForkClick,
  onAuditClick,
  onSaveToggle,
  isSaved,
  savedCategory = 'to-fork',
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  const isCopyleft = repo.license.toLowerCase().includes('agpl') || repo.license.toLowerCase().includes('gpl');

  return (
    <div 
      id={`repo-card-${repo.id}`}
      className="group relative flex flex-col justify-between bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/40"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={repo.ownerAvatar}
              alt={repo.owner}
              className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/60 object-cover shrink-0"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src = 'https://github.com/github.png';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base font-bold text-neutral-100 hover:text-indigo-400 transition inline-flex items-center gap-1 group/title"
                >
                  <span>{repo.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/title:opacity-100 transition text-neutral-500" />
                </a>
              </div>
              <p className="text-xs text-neutral-400 font-mono">{repo.fullName}</p>
            </div>
          </div>

          {/* Bookmark Button */}
          <div className="relative">
            <button
              id={`save-btn-${repo.id}`}
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className={`p-2 rounded-xl transition ${
                isSaved 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title={isSaved ? 'Saved to tracking' : 'Save repo'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {showSaveMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl py-1.5 z-20 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-mono text-neutral-500">Track In Agency Pipeline</div>
                <button
                  onClick={() => {
                    onSaveToggle(repo, 'to-fork');
                    setShowSaveMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between text-neutral-300"
                >
                  <span>To Fork & Work On</span>
                  {isSaved && savedCategory === 'to-fork' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    onSaveToggle(repo, 'client-project');
                    setShowSaveMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between text-neutral-300"
                >
                  <span>Client Project Stack</span>
                  {isSaved && savedCategory === 'client-project' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    onSaveToggle(repo, 'saas-idea');
                    setShowSaveMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between text-neutral-300"
                >
                  <span>SaaS Product Idea</span>
                  {isSaved && savedCategory === 'saas-idea' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    onSaveToggle(repo, 'contributing');
                    setShowSaveMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 flex items-center justify-between text-neutral-300"
                >
                  <span>Open Source Contribution</span>
                  {isSaved && savedCategory === 'contributing' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 text-amber-300 bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded-md font-mono">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{formatNumber(repo.stars)}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-400 bg-neutral-800/60 border border-neutral-700/50 px-2 py-0.5 rounded-md font-mono">
            <GitFork className="w-3.5 h-3.5" />
            <span>{formatNumber(repo.forks)}</span>
          </div>
          <div className="text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded-md font-mono text-[11px]">
            {repo.language}
          </div>

          {/* License Badge with Safety Indicator */}
          <div className={`px-2 py-0.5 rounded-md font-mono text-[11px] border ${
            isCopyleft 
              ? 'bg-amber-950/30 text-amber-300 border-amber-800/40' 
              : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
          }`}>
            {repo.license}
          </div>

          {/* Commercial Score Badge */}
          <div className="ml-auto flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3 h-3" />
            <span>{repo.commercialRating}/100</span>
          </div>
        </div>

        {/* Creator Buzz Pill if applicable */}
        {repo.creatorBuzz && (
          <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-800/40 text-[11px] text-orange-200">
            <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{repo.creatorBuzz}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2 mb-3">
          {repo.description}
        </p>

        {/* Agency Monetization Highlight Box */}
        <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 mb-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Agency Revenue & Monetization Angle</span>
          </div>
          <p className="text-xs text-neutral-300 leading-normal">
            {repo.monetizationAngle}
          </p>
        </div>

        {/* Agency Use Cases */}
        {repo.agencyUseCases && repo.agencyUseCases.length > 0 && (
          <div className="mb-4 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Layers className="w-3 h-3 text-neutral-400" />
              Agency Deliverables
            </div>
            <ul className="text-xs text-neutral-400 space-y-1">
              {repo.agencyUseCases.slice(0, 2).map((useCase, idx) => (
                <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center gap-2">
        <button
          id={`fork-modal-btn-${repo.id}`}
          onClick={() => onForkClick(repo)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Fork & Work On</span>
        </button>

        <button
          id={`audit-modal-btn-${repo.id}`}
          onClick={() => onAuditClick(repo)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition"
          title="AI Commercial Viability & Monetization Blueprint"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">AI Audit</span>
        </button>

        <a
          id={`github-link-${repo.id}`}
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition border border-transparent hover:border-neutral-700"
          title="Open GitHub repository"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
