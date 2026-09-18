import React, { useState } from 'react';
import { 
  X, Bookmark, Download, Trash2, GitFork, Sparkles, 
  ExternalLink, FileText, Check, Star 
} from 'lucide-react';
import { SavedRepo, RepositoryItem, SavedCategory } from '../types';

interface SavedReposDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRepos: SavedRepo[];
  onRemove: (id: string) => void;
  onForkClick: (repo: RepositoryItem) => void;
  onAuditClick: (repo: RepositoryItem) => void;
}

export const SavedReposDrawer: React.FC<SavedReposDrawerProps> = ({
  isOpen,
  onClose,
  savedRepos,
  onRemove,
  onForkClick,
  onAuditClick,
}) => {
  const [activeTab, setActiveTab] = useState<SavedCategory | 'all'>('all');
  const [copiedExport, setCopiedExport] = useState(false);

  if (!isOpen) return null;

  const filtered = activeTab === 'all'
    ? savedRepos
    : savedRepos.filter((s) => s.category === activeTab);

  const exportAsMarkdown = () => {
    let md = `# Agency GitHub Pipeline & Repo Backlog\n\n`;
    md += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

    savedRepos.forEach(({ repo, category, notes }) => {
      md += `## [${repo.name}](${repo.url}) - ${category.toUpperCase()}\n`;
      md += `* **Stars:** ${repo.stars} | **License:** ${repo.license} | **Rating:** ${repo.commercialRating}/100\n`;
      md += `* **Purpose:** ${repo.description}\n`;
      md += `* **Monetization Angle:** ${repo.monetizationAngle}\n`;
      md += `* **Fork Command:** \`gh repo fork ${repo.fullName} --clone\`\n`;
      if (notes) md += `* **Notes:** ${notes}\n`;
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const getCategoryLabel = (cat: SavedCategory) => {
    switch (cat) {
      case 'to-fork': return 'To Fork & Build';
      case 'client-project': return 'Client Project Stack';
      case 'saas-idea': return 'SaaS Product Idea';
      case 'contributing': return 'Contribution';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="saved-repos-drawer"
        className="relative w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Agency Repo Pipeline</h2>
              <p className="text-xs text-neutral-400">
                {savedRepos.length} bookmarked repositories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedRepos.length > 0 && (
              <button
                id="export-saved-markdown-btn"
                onClick={exportAsMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition"
                title="Copy Markdown report to share with team or clients"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                <span>{copiedExport ? 'Copied' : 'Export MD'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-neutral-800 bg-neutral-950 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'to-fork', label: 'To Fork' },
            { id: 'client-project', label: 'Client Stack' },
            { id: 'saas-idea', label: 'SaaS Ideas' },
            { id: 'contributing', label: 'Contributions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Saved Repos */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-neutral-500">
              <Bookmark className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">No repositories tracked in this category yet.</p>
              <p className="text-[11px] text-neutral-600">
                Click the bookmark icon on any repository card to track it for forking or client projects.
              </p>
            </div>
          ) : (
            filtered.map(({ repo, category, savedAt }) => (
              <div
                key={repo.id}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-200">{repo.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        {getCategoryLabel(category)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{repo.fullName}</p>
                  </div>

                  <button
                    onClick={() => onRemove(repo.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-2">
                  {repo.description}
                </p>

                <div className="text-[11px] text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                  <strong>Revenue Idea:</strong> {repo.monetizationAngle}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onForkClick(repo)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Fork</span>
                    </button>
                    <button
                      onClick={() => onAuditClick(repo)}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium ml-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Audit</span>
                    </button>
                  </div>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
