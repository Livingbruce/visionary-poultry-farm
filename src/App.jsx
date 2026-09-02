import { useState } from 'react';
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
  AuthForm
} from './pages';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('owner');

  const renderContent = () => {
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
      case 'logout': return <AuthForm />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}