import { useState, useEffect } from 'react';
import { supabase } from '@/app/services/supabaseClient';
import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/components/Header';
import { FloatingChatButton } from '@/app/components/FloatingChatButton';
import { HelpGuide } from '@/app/components/HelpGuide';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { ReviewsPage } from '@/app/pages/ReviewsPage';
import { FeatureRequestsPage } from '@/app/pages/FeatureRequestsPage';
import { AIRecommendationsPage } from '@/app/pages/AIRecommendationsPage';
import { ReportsPage } from '@/app/pages/ReportsPage';
import { ChatWithDataPage } from '@/app/pages/ChatWithDataPage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { ConnectorsPage } from '@/app/pages/ConnectorsPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { OnboardingPage } from '@/app/pages/OnboardingPage';
import { ThemeProvider } from '@/app/contexts/ThemeContext';
import { fetchProfile, updateProfile } from '@/app/services/dataService';

type AuthState = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<any | null>(null);

  /**
   * Bug Fix #4 & #11:
   * - Removed the double-fetch race condition (handleLogin called checkSession
   *   AND onAuthStateChange also called fetchProfile).
   * - Now there is ONE source of truth: onAuthStateChange.
   * - handleLogin is a no-op — it lets onAuthStateChange handle state transitions.
   */
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);

  useEffect(() => {
    console.log('[useEffect] App mounted');
    // Check session once on mount
    console.log('[useEffect] Checking initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useEffect] Initial session fetched:', session ? 'has session' : 'no session');
      setUser(session?.user ?? null);
      setInitialSessionChecked(true);
    }).catch(err => {
      console.error('[useEffect] Initial session error:', err);
      setInitialSessionChecked(true);
    });

    // Listen for subsequent auth changes (login, logout, token refresh)
    console.log('[useEffect] Subscribing to onAuthStateChange');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[onAuthStateChange] Event:', event, session ? 'has session' : 'no session');
        setUser(session?.user ?? null);
      }
    );

    return () => {
      console.log('[useEffect] App cleanup');
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialSessionChecked) return;

    if (!user) {
      console.log('[useEffect user] No user found, setting authState to unauthenticated');
      setAuthState('unauthenticated');
      return;
    }

    console.log('[useEffect user] Fetching profile for user:', user.id);
    fetchProfile(user.id).then(profile => {
      console.log('[useEffect user] Fetched profile successfully:', profile);
      if (profile?.onboarding_completed) {
        console.log('[useEffect user] Onboarding complete, setting to authenticated');
        setAuthState('authenticated');
      } else {
        console.log('[useEffect user] Onboarding NOT complete, setting to onboarding');
        setAuthState('onboarding');
      }
    }).catch(err => {
      console.error('[useEffect user] Error fetching profile:', err);
      setAuthState('unauthenticated');
    });
  }, [user, initialSessionChecked]);

  const handleLogin = () => {
    // No-op: onAuthStateChange fires after login and handles state
  };

  const handleOnboardingComplete = async () => {
    if (!user) return;
    const success = await updateProfile(user.id, { onboarding_completed: true });
    if (success) {
      setAuthState('authenticated');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
    // onAuthStateChange will fire and set state to 'unauthenticated'
  };

  // ─── Render by auth state ──────────────────────────────────────────────────

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  if (authState === 'onboarding') {
    return (
      <ThemeProvider>
        <OnboardingPage onComplete={handleOnboardingComplete} />
      </ThemeProvider>
    );
  }

  // ─── Authenticated App Shell ───────────────────────────────────────────────

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':        return <DashboardPage />;
      case 'reviews':          return <ReviewsPage />;
      case 'feature-requests': return <FeatureRequestsPage />;
      case 'ai-recommendations': return <AIRecommendationsPage />;
      case 'reports':          return <ReportsPage />;
      case 'chat':             return <ChatWithDataPage />;
      case 'profile':          return <ProfilePage />;
      case 'connectors':       return <ConnectorsPage />;
      default:                 return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <Header onNavigate={setCurrentPage} onSignOut={handleSignOut} />

        <main className="lg:ml-64 md:ml-20 sm:ml-20 ml-0 mt-16 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>

        <FloatingChatButton />
        <HelpGuide />
      </div>
    </ThemeProvider>
  );
}