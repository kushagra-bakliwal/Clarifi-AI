import { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { supabase } from '@/app/services/supabaseClient';
import clarifiLogo from 'figma:asset/f04d43a48a1d50b46f6f1bbbb319070b7bb5678b.png';

interface LoginPageProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'signup' | 'magic-link' | 'forgot-password';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        if (data.user) onLogin();
      } else if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        if (data.user) {
          setSuccess('Account created! Please check your email to verify your account (if email confirmation is enabled) or you can try signing in now.');
          setMode('login');
        }
      } else if (mode === 'magic-link') {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (authError) throw authError;
        setSuccess('Magic link sent! Check your email inbox and click the link to sign in.');
      } else if (mode === 'forgot-password') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (authError) throw authError;
        setSuccess('Password reset email sent! Check your inbox for instructions.');
      }
    } catch (err: any) {
      console.error(`Auth error (${mode}):`, err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const renderTitle = () => {
    switch (mode) {
      case 'login':           return 'Sign In';
      case 'signup':          return 'Create Account';
      case 'magic-link':      return 'Magic Link Sign In';
      case 'forgot-password': return 'Reset Password';
    }
  };

  const renderDescription = () => {
    switch (mode) {
      case 'magic-link':      return 'Enter your email and we\'ll send you a link to sign in — no password needed.';
      case 'forgot-password': return 'Enter your email and we\'ll send you instructions to reset your password.';
      default:                return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4">
              <img src={clarifiLogo} alt="Clarifi AI Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clarifi AI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer Feedback Intelligence</p>
          </div>

          {/* Back button for secondary modes */}
          {(mode === 'magic-link' || mode === 'forgot-password') && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              {renderTitle()}
            </h2>

            {renderDescription() && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {renderDescription()}
              </p>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 dark:text-green-200">{success}</p>
              </div>
            )}
            
            {/* Email field — always shown */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password field — only for login and signup modes */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Forgot password link — login mode only */}
            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setError(null); setSuccess(null); }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2.5 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : mode === 'login' ? 'Sign In'
                : mode === 'signup' ? 'Sign Up'
                : mode === 'magic-link' ? 'Send Magic Link'
                : 'Send Reset Email'
              }
            </Button>
          </form>

          {/* Only show OAuth + alternatives for login/signup modes */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                {/* Google OAuth */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 py-2.5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                {/* Magic Link */}
                <Button
                  type="button"
                  onClick={() => { setMode('magic-link'); setError(null); setSuccess(null); }}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  Sign in with Magic Link
                </Button>
              </div>

              {/* Mode Toggle */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          Secure authentication • Your data is encrypted
        </p>
      </div>
    </div>
  );
}