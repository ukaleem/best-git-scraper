import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, DollarSign, Target, CheckCircle2, 
  Terminal, ShieldCheck, FileText, Send, Loader2, Copy, Check, ExternalLink 
} from 'lucide-react';
import { RepositoryItem, CommercialAudit } from '../types';

interface AnalysisModalProps {
  repo: RepositoryItem | null;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ repo, onClose }) => {
  const [audit, setAudit] = useState<CommercialAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pitch generator state
  const [clientIndustry, setClientIndustry] = useState('E-Commerce & Retail');
  const [clientPainPoint, setClientPainPoint] = useState('Needs rapid custom web platform & automated workflows without 6-month dev cycle');
  const [pitch, setPitch] = useState<string | null>(null);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!repo) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setAudit(null);
    setPitch(null);

    fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: repo.url,
        repoName: repo.fullName,
        description: repo.description,
        language: repo.language,
        license: repo.license,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.success && isMounted) {
          setAudit(data.analysis);
        } else if (isMounted) {
          setError(data.error || 'Failed to analyze repository');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [repo]);

  if (!repo) return null;

  const handleGeneratePitch = async () => {
    setGeneratingPitch(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repo.fullName,
          clientIndustry,
          clientPainPoint,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPitch(data.pitch);
      }
    } catch {
      // ignore
    } finally {
      setGeneratingPitch(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="analysis-modal-container"
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">{repo.name}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {repo.license}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                  {repo.language}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{repo.fullName}</p>
            </div>
          </div>
          <button
            id="close-analysis-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <div className="text-sm font-medium text-neutral-200">
                Synthesizing Agency Commercial Viability & Monetization Angles...
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Analyzing license safety, architecture extensibility, market positioning, and revenue blueprints with Gemini.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-xs text-red-300">
              {error}
            </div>
          )}

          {audit && (
            <>
              {/* Top Score and Executive Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between">
                  <div className="text-xs text-neutral-400 font-medium">Commercial Viability</div>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-3xl font-extrabold text-indigo-400">
                      {audit.commercialViabilityScore || repo.commercialRating}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">/100</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${audit.commercialViabilityScore || repo.commercialRating}%` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-center">
                  <div className="text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Executive Summary & Commercial Fit
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {audit.executiveSummary || repo.description}
                  </p>
                </div>
              </div>

              {/* Viability Breakdown Pills */}
              {audit.viabilityBreakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Market Demand</span>
                    <span className="text-neutral-200 font-medium mt-1 block">{audit.viabilityBreakdown.marketDemand}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Extensibility</span>
                    <span className="text-neutral-200 font-medium mt-1 block">{audit.viabilityBreakdown.extensibility}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Maintenance</span>
                    <span className="text-neutral-200 font-medium mt-1 block">{audit.viabilityBreakdown.maintenanceHealth}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">License Safety</span>
                    <span className="text-neutral-200 font-medium mt-1 block">{audit.viabilityBreakdown.licenseAssessment}</span>
                  </div>
                </div>
              )}

              {/* 3 Monetization Strategies */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Direct Monetization & Revenue Blueprints
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(audit.monetizationStrategies || []).map((strat, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-3 hover:border-neutral-700 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          {strat.title}
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                          {strat.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                        <div className="text-[11px] text-neutral-400">
                          <span className="text-neutral-500 font-mono">Pricing:</span>{' '}
                          <strong className="text-emerald-400">{strat.pricingGuidance}</strong>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          <span className="text-neutral-500 font-mono">Clients:</span>{' '}
                          <span className="text-neutral-300">{strat.targetClients}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fork & Quickstart Blueprint */}
              {audit.forkAndSetupBlueprint && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-semibold text-neutral-200">
                        Fork & Dev Setup Blueprint
                      </h3>
                    </div>
                    <button
                      onClick={() => copyText(audit.forkAndSetupBlueprint.forkCommand, 'blueprint-fork')}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                    >
                      {copiedKey === 'blueprint-fork' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'blueprint-fork' ? 'Copied' : 'Copy Fork Command'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 truncate">
                      <span className="text-neutral-500 mr-2">$</span>
                      {audit.forkAndSetupBlueprint.forkCommand}
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 truncate">
                      <span className="text-neutral-500 mr-2">$</span>
                      {audit.forkAndSetupBlueprint.gitCloneCommand}
                    </div>
                  </div>

                  {audit.forkAndSetupBlueprint.quickstartSteps && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">Setup Steps</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-300">
                        {audit.forkAndSetupBlueprint.quickstartSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-neutral-900/50 p-2 rounded border border-neutral-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pitch Drafter for Agency Clients */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-semibold text-neutral-200">
                      Client Proposal & Sales Pitch Drafter
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-500">Send to prospective clients</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Client Industry</label>
                    <input
                      type="text"
                      value={clientIndustry}
                      onChange={(e) => setClientIndustry(e.target.value)}
                      placeholder="e.g. Legal, E-Commerce, Healthcare, SaaS"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Client Pain Point</label>
                    <input
                      type="text"
                      value={clientPainPoint}
                      onChange={(e) => setClientPainPoint(e.target.value)}
                      placeholder="e.g. Needs custom customer portal without high dev cost"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="generate-client-pitch-btn"
                    onClick={handleGeneratePitch}
                    disabled={generatingPitch}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    {generatingPitch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Drafting Proposal...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Generate Client Proposal
                      </>
                    )}
                  </button>
                </div>

                {pitch && (
                  <div className="mt-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-purple-300">Generated Agency Proposal</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pitch);
                          setCopiedPitch(true);
                          setTimeout(() => setCopiedPitch(false), 2000);
                        }}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 font-mono"
                      >
                        {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPitch ? 'Copied to Clipboard' : 'Copy Pitch'}
                      </button>
                    </div>
                    <pre className="text-xs text-neutral-300 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {pitch}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-900/60">
          <div className="text-xs text-neutral-500">
            Powered by Gemini AI Commercial Intelligence
          </div>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Inspect Code on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};
