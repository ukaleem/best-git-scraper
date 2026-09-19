import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { X, Mail, Lock, User, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginWithEmail, registerWithEmail, loginDemoAdmin, authErrorTip } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await registerWithEmail(email.trim(), password, name.trim());
        setRegisteredSuccess(true);
      } else {
        await loginWithEmail(email.trim(), password);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try logging in instead.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please recheck your credentials.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemoAdmin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as demo admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {registeredSuccess ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-100 mb-2">Account Created!</h3>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Your account has been registered and dispatched to the <strong className="text-emerald-300">Admin CRM verification queue</strong>. 
              The administrator will review and verify your account.
            </p>
            <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 text-left mb-6">
              <div className="flex items-center gap-2 font-medium text-neutral-200 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Admin Approval Process
              </div>
              New registrations appear instantly on the Admin Dashboard for verification.
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              Enter Application
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                RepoRadar Account & Verification
              </div>
              <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                {mode === 'login'
                  ? 'Sign in to access your saved favorites and commercial tools'
                  : 'Register for discovery access; verified by administrator'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Your Name / Organization
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                    <input
                      id="auth-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Miller or Miller Devs"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Password
                  </label>
                  {mode === 'register' && (
                    <span className="text-[10px] text-neutral-500">Min 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="auth-submit-button"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 pt-4 border-t border-neutral-800/80 text-center">
              <p className="text-xs text-neutral-400">
                {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
                {' '}
                <button
                  id="auth-mode-toggle"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError(null);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer ml-1"
                >
                  {mode === 'login' ? 'Register here' : 'Sign in here'}
                </button>
              </p>
            </div>

            {/* Demo Admin Quick Access Box */}
            <div className="mt-5 p-3.5 bg-neutral-950/90 border border-neutral-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-200">Admin CRM Test Access</div>
                  <div className="text-[11px] text-neutral-400">Instant 1-click login as Administrator</div>
                </div>
                <button
                  id="demo-admin-login-button"
                  type="button"
                  onClick={handleDemoAdmin}
                  disabled={loading}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-emerald-400 rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Login as Admin
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
