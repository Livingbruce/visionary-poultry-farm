import React, { useState } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  LayoutDashboard, 
  Receipt, 
  Package, 
  TrendingUp, 
  BarChart3, 
  User, 
  Settings, 
  Egg,
  Info,
  Users,
  LogOut,
  Bird
} from 'lucide-react';
import '../styles/Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, userRole = 'owner', setUserRole }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'employee', 'auditor'] },
    { id: 'transactions', name: 'Transactions', icon: Receipt, roles: ['owner', 'employee', 'auditor'] },
    { id: 'poultry', name: 'Poultry', icon: Bird, roles: ['owner', 'employee', 'auditor']},
    { id: 'inventory', name: 'Inventory', icon: Package, roles: ['owner', 'employee'] },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, roles: ['owner', 'auditor'] },
    { id: 'reports', name: 'Reports', icon: BarChart3, roles: ['owner', 'auditor'] },
    { id: 'profile', name: 'Profile', icon: User, roles: ['owner', 'employee', 'auditor', 'guest'] },
    { id: 'settings', name: 'Settings', icon: Settings, roles: ['owner'] },
    { id: 'staff-management', name: 'Staff Management', icon: Users, roles: ['owner'] },
    { id: 'help', name: 'Help', icon: Info, roles: ['owner', 'employee', 'auditor', 'guest'] },
    { id: 'logout', name: 'Logout', icon: LogOut, roles: ['owner', 'employee', 'auditor', 'guest'] }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand & Toggle Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Egg size={22} color="#F0E6D2" fill="#F0E6D2" />
          </div>
          {!collapsed && <span className="brand-title">Poultry Accounts</span>}
        </div>
        <button 
          className="toggle-btn" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.name : ''}
              >
                <span className="icon-wrapper">
                  <Icon size={20} />
                </span>
                {!collapsed && <span className="nav-label">{item.name}</span>}
              </button>
            );
          })}
      </nav>

      {/* Role Switcher Widget for Testing */}
      {!collapsed && setUserRole && (
        <div className="role-switcher">
          <span className="role-label">Role:</span>
          <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="employee">Employee</option>
            <option value="auditor">Auditor</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      )}
    </aside>
  );
}