import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitFork, Sparkles, Bookmark, Terminal, Shield, RefreshCw, 
  Search, Layers, ExternalLink, Code2, AlertCircle, Compass,
  User, LogIn, LogOut, ShieldCheck, Clock, UserCheck
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './lib/AuthContext';
import { RepositoryItem, SavedRepo, SavedCategory } from './types';
import { RepoCard } from './components/RepoCard';
import { DeepSearchHeader } from './components/DeepSearchHeader';
import { ForkModal } from './components/ForkModal';
import { AnalysisModal } from './components/AnalysisModal';
import { CustomAnalyzeModal } from './components/CustomAnalyzeModal';
import { SavedReposDrawer } from './components/SavedReposDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminCRMModal } from './components/AdminCRMModal';

export default function App() {
  const { user, userProfile, isAdmin, isVerified, logout } = useAuth();

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAdminCrmOpen, setIsAdminCrmOpen] = useState(false);

  // Saved / Favorite repositories (synced with Firebase if logged in, otherwise localStorage)
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>(() => {
    try {
      const stored = localStorage.getItem('agency_saved_repos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites with Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const unsubFavorites = onSnapshot(favoritesRef, (snapshot) => {
      const list: SavedRepo[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.repo) {
          list.push({
            repo: d.repo,
            category: d.category || 'to-fork',
            savedAt: d.savedAt || new Date().toISOString(),
            notes: d.notes
          });
        }
      });
      if (list.length > 0) {
        setSavedRepos(list);
      }
    }, (err) => {
      console.warn('Firestore favorites sync note:', err.message);
    });

    return () => unsubFavorites();
  }, [user]);

  const saveToStorageOrCloud = async (items: SavedRepo[], modifiedRepo?: RepositoryItem, isRemoval?: boolean, newCat?: SavedCategory) => {
    setSavedRepos(items);
    try {
      localStorage.setItem('agency_saved_repos', JSON.stringify(items));
    } catch {
      // ignore
    }

    // Persist to user's Firebase account if signed in
    if (user && modifiedRepo) {
      const favDocRef = doc(db, 'users', user.uid, 'favorites', modifiedRepo.id);
      try {
        if (isRemoval) {
          await deleteDoc(favDocRef);
        } else {
          await setDoc(favDocRef, {
            id: modifiedRepo.id,
            userId: user.uid,
            repo: modifiedRepo,
            category: newCat || 'to-fork',
            savedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error updating favorite in Firestore:', err);
      }
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

  // Handle AI Deep Search
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
    // If user is not logged in, optionally prompt login or allow guest bookmark
    const existingIndex = savedRepos.findIndex((s) => s.repo.id === repo.id);
    let updated: SavedRepo[];
    let isRemoval = false;
    let finalCat = category;

    if (existingIndex >= 0) {
      if (savedRepos[existingIndex].category === category) {
        // Remove if clicking same category
        updated = savedRepos.filter((s) => s.repo.id !== repo.id);
        isRemoval = true;
      } else {
        // Update category
        updated = [...savedRepos];
        updated[existingIndex] = { ...updated[existingIndex], category };
        finalCat = category;
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
    saveToStorageOrCloud(updated, repo, isRemoval, finalCat);
  };

  const handleRemoveSaved = (id: string) => {
    const target = savedRepos.find((s) => s.repo.id === id);
    const updated = savedRepos.filter((s) => s.repo.id !== id);
    saveToStorageOrCloud(updated, target?.repo, true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Verification Notice Banner for logged in user */}
      {user && !isVerified && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 py-2.5 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Account Pending Verification:</strong> Your registration has been sent to the Admin CRM. 
                Full commercial deployment capabilities unlock upon admin verification.
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAdminCrmOpen(true)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded text-[11px] font-semibold text-amber-300 transition-colors"
              >
                Open Admin CRM
              </button>
            )}
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-2.5">
            {/* Refresh Feed */}
            <button
              id="refresh-trending-btn"
              onClick={() => fetchTrendingRepos()}
              disabled={loading}
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition cursor-pointer"
              title="Refresh repo feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Agency Favorites Pipeline */}
            <button
              id="open-saved-drawer-btn"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-800 transition cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Favorites</span>
              {savedRepos.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono">
                  {savedRepos.length}
                </span>
              )}
            </button>

            {/* Admin CRM Button */}
            {isAdmin && (
              <button
                id="open-admin-crm-btn"
                onClick={() => setIsAdminCrmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Open Admin CRM & User Approvals"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Admin CRM</span>
              </button>
            )}

            {/* Authentication Login/Register or Profile State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-medium text-neutral-200 truncate max-w-[130px]">
                    {userProfile?.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {isVerified ? 'Verified' : 'Pending Review'}
                  </span>
                </div>
                <button
                  id="user-logout-btn"
                  onClick={logout}
                  className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 rounded-xl border border-neutral-800 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <button
                  id="open-login-btn"
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  id="open-register-btn"
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950 transition cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
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
              className="text-xs text-amber-400 hover:text-amber-200 font-medium cursor-pointer"
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
              className="text-xs text-red-300 underline font-medium hover:text-red-100 cursor-pointer"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
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
          <span>Secured with Firebase Auth & Cloud Firestore Verification</span>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AdminCRMModal
        isOpen={isAdminCrmOpen}
        onClose={() => setIsAdminCrmOpen(false)}
      />

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
