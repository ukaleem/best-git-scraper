import React, { useState } from 'react';
import { X, Search, Sparkles, ExternalLink, Loader2, GitFork } from 'lucide-react';
import { RepositoryItem } from '../types';

interface CustomAnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeRepo: (repo: RepositoryItem) => void;
}

export const CustomAnalyzeModal: React.FC<CustomAnalyzeModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeRepo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setError(null);
    setLoading(true);

    try {
      // Extract owner and repo from URL like github.com/owner/repo or owner/repo
      let cleanInput = urlInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      const parts = cleanInput.split('/');

      if (parts.length < 2) {
        throw new Error('Please enter a valid GitHub repository format (e.g., owner/repo or https://github.com/owner/repo)');
      }

      const owner = parts[0];
      const name = parts[1];
      const fullName = `${owner}/${name}`;

      // Try fetching metadata from GitHub public API
      let repoItem: RepositoryItem = {
        id: `custom-${fullName.replace('/', '-')}`,
        name,
        fullName,
        owner,
        ownerAvatar: `https://github.com/${owner}.png`,
        url: `https://github.com/${fullName}`,
        description: 'Analyzing repository structure and commercial potential...',
        stars: 0,
        forks: 0,
        openIssues: 0,
        language: 'TypeScript',
        license: 'MIT',
        topics: ['custom-audit'],
        updatedAt: new Date().toISOString(),
        category: 'agency-solutions',
        agencyUseCases: ['Deploy for custom client solution', 'White-label implementation'],
        monetizationAngle: 'Analyze commercial potential and client delivery pricing',
        commercialRating: 85,
        forkRecommendation: `Run 'gh repo fork ${fullName} --clone' to start developing.`
      };

      try {
        const ghRes = await fetch(`https://api.github.com/repos/${fullName}`, {
          headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          repoItem = {
            ...repoItem,
            description: ghData.description || 'No description provided.',
            stars: ghData.stargazers_count || 0,
            forks: ghData.forks_count || 0,
            openIssues: ghData.open_issues_count || 0,
            language: ghData.language || 'Code',
            license: ghData.license ? (ghData.license.spdx_id || ghData.license.name) : 'Unknown',
            topics: ghData.topics || [],
            ownerAvatar: ghData.owner?.avatar_url || repoItem.ownerAvatar,
          };
        }
      } catch {
        // Continue with basic metadata
      }

      onClose();
      onAnalyzeRepo(repoItem);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="custom-analyze-modal-container"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Audit Any GitHub Repository
              </h2>
              <p className="text-xs text-neutral-400">
                Paste any repo link seen on YouTube, X, or Reddit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              GitHub Repository URL or Owner/Repo
            </label>
            <div className="relative">
              <input
                id="custom-repo-url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://github.com/shadcn-ui/taxonomy or owner/repo"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Gemini will evaluate commercial readiness, license safety, revenue strategies, and generate fork commands.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Quick recommendations */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-neutral-500">Or try one of these trending repos:</div>
            <div className="flex flex-wrap gap-1.5">
              {['shadcn-ui/taxonomy', 'twentyhq/twenty', 'browser-use/browser-use', 'FlowiseAI/Flowise'].map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setUrlInput(`https://github.com/${slug}`)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 transition"
                >
                  {slug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              id="submit-custom-audit-btn"
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspecting Repo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Commercial Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
