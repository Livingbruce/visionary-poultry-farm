
import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import {
  Dashboard,
  Transactions,
  Inventory,
  Analytics,
  Reports,
  Profile,
  Settings,
  Help,
  Staff,
  Poultry,
} from './pages';
import AuthForm from './pages/Auth';
import { supabase } from './libs/supabase';
import './App.css';

const VALID_ROLES = [
  'owner',
  'co_owner',
  'employee',
  'auditor',
  'guest',
];

function getFriendlyError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'Could not connect to the server. Check your internet connection and try again.';
  }

  if (
    message.includes('permission denied') ||
    message.includes('row-level security') ||
    message.includes('row level security')
  ) {
    return 'The database denied access to your farm membership. Check your database permissions and RLS policies.';
  }

  if (message.includes('jwt') || message.includes('token')) {
    return 'Your login session may have expired. Sign out and sign in again.';
  }

  return 'We could not load your farm membership. Please try again.';
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);

  const [farmId, setFarmId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [membershipError, setMembershipError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const loadMembership = useCallback(async (currentSession) => {
    if (!currentSession?.user?.id) {
      setFarmId(null);
      setUserRole(null);
      setMembershipError('');
      setMembershipLoading(false);
      setAuthLoading(false);
      return;
    }

    setMembershipLoading(true);
    setMembershipError('');

    try {
      const { data, error } = await supabase
        .from('farm_members')
        .select('farm_id, role, created_at')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setFarmId(null);
        setUserRole(null);
        setActiveTab('dashboard');
        return;
      }

      if (!VALID_ROLES.includes(data.role)) {
        throw new Error('The database returned an invalid farm role.');
      }

      setFarmId(data.farm_id);
      setUserRole(data.role);

      setActiveTab((currentTab) => {
        if (data.role === 'guest') {
          return currentTab === 'help' ? 'help' : 'profile';
        }

        return currentTab === 'profile' || currentTab === 'help'
          ? 'dashboard'
          : currentTab;
      });
    } catch (error) {
      console.error('Could not load farm membership:', error);
      setFarmId(null);
      setUserRole(null);
      setMembershipError(getFriendlyError(error));
    } finally {
      setMembershipLoading(false);
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const processSession = async (nextSession) => {
      if (!mounted) return;

      setSession(nextSession);

      if (!nextSession) {
        setFarmId(null);
        setUserRole(null);
        setMembershipError('');
        setMembershipLoading(false);
        setAuthLoading(false);
        setActiveTab('dashboard');
        return;
      }

      setAuthLoading(true);
      await loadMembership(nextSession);

      if (mounted) {
        setAuthLoading(false);
      }
    };

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          await processSession(data?.session ?? null);
        }
      } catch (error) {
        console.error('Could not restore session:', error);

        if (mounted) {
          setSession(null);
          setFarmId(null);
          setUserRole(null);
          setMembershipError(
            'We could not restore your login session. Please sign in again.'
          );
          setAuthLoading(false);
        }
      }
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      // Defer the membership query so it runs outside the auth callback.
      setSession(nextSession);

      if (!nextSession) {
        setFarmId(null);
        setUserRole(null);
        setMembershipError('');
        setMembershipLoading(false);
        setAuthLoading(false);
        setActiveTab('dashboard');
        return;
      }

      setAuthLoading(true);

      Promise.resolve().then(() => {
        if (mounted) {
          void loadMembership(nextSession);
        }
      });
    });

    // Auth.jsx dispatches this after creating a farm or finding membership.
    const handleMembershipUpdated = async () => {
      if (!mounted) return;

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Could not refresh the session:', error);
        setMembershipError(
          'Your farm was processed, but we could not refresh your session. Please try again.'
        );
        return;
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);

      if (currentSession) {
        setAuthLoading(true);
        await loadMembership(currentSession);
      }
    };

    window.addEventListener(
      'farm-membership-checked',
      handleMembershipUpdated
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(
        'farm-membership-checked',
        handleMembershipUpdated
      );
    };
  }, [loadMembership]);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    setLogoutError('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSession(null);
      setFarmId(null);
      setUserRole(null);
      setMembershipError('');
    } catch (error) {
      console.error('Sign out failed:', error);
      setLogoutError(
        'We could not sign you out. Check your connection and try again.'
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  const renderContent = () => {
    if (userRole === 'guest') {
      if (activeTab === 'help') return <Help />;
      return <Profile />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'poultry':
        return <Poultry />;
      case 'inventory':
        return <Inventory />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <Help />;
      case 'staff-management':
        return <Staff />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading || membershipLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>
          {session
            ? 'Checking your farm account...'
            : 'Checking your login session...'}
        </p>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  if (membershipError) {
    return (
      <div className="access-pending">
        <div className="access-pending-card">
          <h1>Unable to load your farm</h1>
          <p>{membershipError}</p>
          <button
            type="button"
            onClick={() => void loadMembership(session)}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    );
  }

  // A signed-in account without a farm membership needs onboarding.
  if (!farmId || !userRole) {
    return <AuthForm />;
  }

  return (
    <div className="app-layout">
      {logoutError && (
        <div className="app-error-banner" role="alert">
          {logoutError}
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <main className="content">{renderContent()}</main>
    </div>
  );
}