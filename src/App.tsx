import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitFork, Sparkles, Bookmark, Terminal, Shield, RefreshCw, 
  Search, Layers, ExternalLink, Code2, AlertCircle, Compass 
} from 'lucide-react';
import { RepositoryItem, SavedRepo, SavedCategory } from './types';
import { RepoCard } from './components/RepoCard';
import { DeepSearchHeader } from './components/DeepSearchHeader';
import { ForkModal } from './components/ForkModal';
import { AnalysisModal } from './components/AnalysisModal';
import { CustomAnalyzeModal } from './components/CustomAnalyzeModal';
import { SavedReposDrawer } from './components/SavedReposDrawer';

export default function App() {
  const [repos, setRepos] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('stars');
  const [activeTimeframe, setActiveTimeframe] = useState('this week');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  // Modals state
  const [selectedForkRepo, setSelectedForkRepo] = useState<RepositoryItem | null>(null);
  const [selectedAuditRepo, setSelectedAuditRepo] = useState<RepositoryItem | null>(null);
  const [isCustomAnalyzeOpen, setIsCustomAnalyzeOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Saved repositories in localStorage
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>(() => {
    try {
      const stored = localStorage.getItem('agency_saved_repos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveToLocalStorage = (items: SavedRepo[]) => {
    setSavedRepos(items);
    try {
      localStorage.setItem('agency_saved_repos', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Fetch trending repositories
  const fetchTrendingRepos = useCallback(async (cat = activeCategory, sort = activeSort) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos/trending?category=${cat}&sort=${sort}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setRepos(data.repos);
      } else {
        setError(data.error || 'Failed to load repositories');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching repositories');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort]);

  // Initial load
  useEffect(() => {
    fetchTrendingRepos();
  }, [fetchTrendingRepos]);

  // Handle Keyword Search
  const handleSearch = async (query: string) => {
    setActiveSearchTerm(query);
    if (!query.trim()) {
      fetchTrendingRepos(activeCategory, activeSort);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/repos/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.repos)) {
        setRepos(data.repos);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Handle AI Deep Search across Internet & Creator channels
  const handleDeepSearchAI = async (prompt: string, focus: string, timeframe: string) => {
    setIsAiSearching(true);
    setError(null);
    setNotice(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch('/api/ai/deep-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, focus, timeframe }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && Array.isArray(data.repos) && data.repos.length > 0) {
        setRepos(data.repos);
        if (data.notice) {
          setNotice(data.notice);
        }
      } else {
        setError(data.error || 'AI Deep Search returned no results. Try adjusting the query.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Search request timed out. Please try a simpler query or select a preset.');
      } else {
        setError(err.message || 'AI Deep Search failed.');
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  // Save / Bookmark toggle
  const handleSaveToggle = (repo: RepositoryItem, category: SavedCategory) => {
    const existingIndex = savedRepos.findIndex((s) => s.repo.id === repo.id);
    let updated: SavedRepo[];
    if (existingIndex >= 0) {
      if (savedRepos[existingIndex].category === category) {
        // Remove if clicking same category
        updated = savedRepos.filter((s) => s.repo.id !== repo.id);
      } else {
        // Update category
        updated = [...savedRepos];
        updated[existingIndex] = { ...updated[existingIndex], category };
      }
    } else {
      updated = [
        ...savedRepos,
        {
          repo,
          category,
          savedAt: new Date().toISOString(),
        },
      ];
    }
    saveToLocalStorage(updated);
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedRepos.filter((s) => s.repo.id !== id);
    saveToLocalStorage(updated);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-neutral-100">
                  RepoRadar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  Agency & Dev Intelligence
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                Deep search internet & creators for commercial-ready codebases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="refresh-trending-btn"
              onClick={() => fetchTrendingRepos()}
              disabled={loading}
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition"
              title="Refresh repo feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="open-saved-drawer-btn"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-800 transition"
            >
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>Agency Pipeline</span>
              {savedRepos.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono">
                  {savedRepos.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Deep Search Header & Controls */}
        <DeepSearchHeader
          onSearch={handleSearch}
          onDeepSearchAI={handleDeepSearchAI}
          onAnalyzeCustomUrl={() => setIsCustomAnalyzeOpen(true)}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            fetchTrendingRepos(cat, activeSort);
          }}
          onSortChange={(sort) => {
            setActiveSort(sort);
            fetchTrendingRepos(activeCategory, sort);
          }}
          onTimeframeChange={(tf) => {
            setActiveTimeframe(tf);
          }}
          activeCategory={activeCategory}
          activeSort={activeSort}
          activeTimeframe={activeTimeframe}
          isAiSearching={isAiSearching}
          totalCount={repos.length}
        />

        {/* Notice message alert */}
        {notice && !error && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-amber-300">Discovery update:</span> {notice}
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs text-amber-400 hover:text-amber-200 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error message alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-start gap-3 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-red-300">Notice:</span> {error}
            </div>
            <button
              onClick={() => fetchTrendingRepos()}
              className="text-xs text-red-300 underline font-medium hover:text-red-100"
            >
              Reload
            </button>
          </div>
        )}

        {/* Repository Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-6 flex flex-col justify-between animate-pulse"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-neutral-800 rounded w-1/2" />
                      <div className="h-3 bg-neutral-800/60 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded w-3/4 mt-4" />
                  <div className="h-3 bg-neutral-800/60 rounded w-full" />
                </div>
                <div className="h-9 bg-neutral-800/80 rounded-xl" />
              </div>
            ))}
          </div>
        ) : repos.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/30">
            <Compass className="w-10 h-10 text-neutral-600 mx-auto" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-neutral-200">No repositories found</h3>
              <p className="text-xs text-neutral-500">
                Try resetting your filters or run an AI Deep Search for fresh creator recommendations.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveSearchTerm('');
                fetchTrendingRepos('all', 'stars');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters & Reload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {repos.map((repo) => {
              const isSaved = savedRepos.some((s) => s.repo.id === repo.id);
              const savedItem = savedRepos.find((s) => s.repo.id === repo.id);
              return (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  onForkClick={(r) => setSelectedForkRepo(r)}
                  onAuditClick={(r) => setSelectedAuditRepo(r)}
                  onSaveToggle={handleSaveToggle}
                  isSaved={isSaved}
                  savedCategory={savedItem?.category}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RepoRadar Developer & Agency Intelligence Engine</span>
          <span>Powered by GitHub Public API & Google Gemini 3.8 Flash</span>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <ForkModal
        repo={selectedForkRepo}
        onClose={() => setSelectedForkRepo(null)}
        onOpenAudit={(r) => {
          setSelectedForkRepo(null);
          setSelectedAuditRepo(r);
        }}
      />

      <AnalysisModal
        repo={selectedAuditRepo}
        onClose={() => setSelectedAuditRepo(null)}
      />

      <CustomAnalyzeModal
        isOpen={isCustomAnalyzeOpen}
        onClose={() => setIsCustomAnalyzeOpen(false)}
        onAnalyzeRepo={(repo) => setSelectedAuditRepo(repo)}
      />

      <SavedReposDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedRepos={savedRepos}
        onRemove={handleRemoveSaved}
        onForkClick={(r) => {
          setIsSavedDrawerOpen(false);
          setSelectedForkRepo(r);
        }}
        onAuditClick={(r) => {
          setIsSavedDrawerOpen(false);
          setSelectedAuditRepo(r);
        }}
      />
    </div>
  );
}
