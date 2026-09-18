import React, { useState } from 'react';
import { Copy, Check, GitFork, Terminal, ExternalLink, X, ShieldAlert, Sparkles } from 'lucide-react';
import { RepositoryItem } from '../types';

interface ForkModalProps {
  repo: RepositoryItem | null;
  onClose: () => void;
  onOpenAudit: (repo: RepositoryItem) => void;
}

export const ForkModal: React.FC<ForkModalProps> = ({ repo, onClose, onOpenAudit }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!repo) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const ghForkCmd = `gh repo fork ${repo.fullName} --clone=true`;
  const gitCloneCmd = `git clone ${repo.url}.git && cd ${repo.name}`;
  const setupCmd = `npm install # or pnpm install / yarn\ncp .env.example .env\nnpm run dev`;

  const isCopyleft = repo.license.toLowerCase().includes('agpl') || repo.license.toLowerCase().includes('gpl');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="fork-modal-container"
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                Fork & Work on <span className="text-indigo-400 font-mono">{repo.name}</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">{repo.fullName}</p>
            </div>
          </div>
          <button
            id="close-fork-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* License Alert if Copyleft */}
          {isCopyleft ? (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Commercial License Notice ({repo.license}):</span>{' '}
                This repository uses a copyleft license. If creating a proprietary closed-source SaaS, ensure compliance or deploy as a standalone client service infrastructure.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Commercial Permissive License (<strong className="text-emerald-200">{repo.license}</strong>): Highly friendly for agencies, client customization, and white-labeling.</span>
            </div>
          )}

          {/* Direct Fork via GitHub CLI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Recommended: Fork & Clone with GitHub CLI
              </span>
              <button
                onClick={() => copyToClipboard(ghForkCmd, 'gh')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {copiedKey === 'gh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'gh' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 select-all overflow-x-auto">
              <code>{ghForkCmd}</code>
            </div>
            <p className="text-[11px] text-neutral-500">
              This forks the repo under your GitHub account and clones it locally to your machine in one step.
            </p>
          </div>

          {/* Standard Git Clone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                Alternative: Standard Git Clone
              </span>
              <button
                onClick={() => copyToClipboard(gitCloneCmd, 'git')}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 font-mono"
              >
                {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'git' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 select-all overflow-x-auto">
              <code>{gitCloneCmd}</code>
            </div>
          </div>

          {/* Recommended Agency Quickstart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-medium">Quick Environment Initialization</span>
              <button
                onClick={() => copyToClipboard(setupCmd, 'setup')}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 font-mono"
              >
                {copiedKey === 'setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'setup' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-400 overflow-x-auto">
              {setupCmd}
            </pre>
          </div>

          {/* Agency Advice */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
            <h4 className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Agency Development Tip
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {repo.forkRecommendation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => {
              onClose();
              onOpenAudit(repo);
            }}
            className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            <Sparkles className="w-4 h-4" />
            View Monetization & Agency Audit
          </button>

          <div className="flex items-center gap-3">
            <a
              id="view-github-button"
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open on GitHub
            </a>
            <a
              id="direct-fork-web-link"
              href={`${repo.url}/fork`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition"
            >
              <GitFork className="w-3.5 h-3.5" />
              Fork in Browser
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
