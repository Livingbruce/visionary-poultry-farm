import { useEffect, useState } from 'react';
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
import { supabase } from './lib/supabase';
import './App.css';

const VALID_ROLES = ['owner', 'employee', 'auditor', 'guest'];

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('guest');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not restore session:', error);

      if (mounted) {
        const nextSession = data?.session ?? null;
        setSession(nextSession);
        const role = nextSession?.user?.app_metadata?.role;
        setUserRole(VALID_ROLES.includes(role) ? role : 'guest');
        setActiveTab(role === 'guest' ? 'profile' : 'dashboard');
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      const role = nextSession?.user?.app_metadata?.role;
      setUserRole(VALID_ROLES.includes(role) ? role : 'guest');
      setActiveTab(role === 'guest' ? 'profile' : 'dashboard');
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error);
      window.alert(error.message);
    }
  };

  const renderContent = () => {
    if (userRole === 'guest') {
      if (activeTab === 'help') return <Help />;
      return <Profile />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'poultry': return <Poultry />;
      case 'inventory': return <Inventory />;
      case 'analytics': return <Analytics />;
      case 'reports': return <Reports />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      case 'help': return <Help />;
      case 'staff-management': return <Staff />;
      default: return <Dashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!session) return <AuthForm />;

  const actualRole = session.user.app_metadata?.role;
  const hasAssignedRole = VALID_ROLES.includes(actualRole);

  if (!hasAssignedRole) {
    return (
      <div className="access-pending">
        <div className="access-pending-card">
          <h1>Account created</h1>
          <p>
            Your account is authenticated, but a farm access role has not been
            assigned yet. Ask the farm owner to grant the appropriate role.
          </p>
          <button onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
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
