import React from 'react';
import { ArrowRight, Folder, UserPlus, Users, Banknote, ClipboardList } from 'lucide-react';
import '../styles/Staff.css';

function Staff({ onSelectCategory }) {
  const folders = [
    {
      id: 'onboarding',
      title: 'Onboarding',
      desc: 'Add new owners, staff, and auditors.',
      icon: UserPlus,
    },
    {
      id: 'manage',
      title: 'Manage Staff',
      desc: 'Manage staff, auditors, leaves, layoffs, halts, etc.',
      icon: Users,
    },
    {
      id: 'salaries',
      title: 'Salaries',
      desc: 'Manage farm employees wages & salaries here.',
      icon: Banknote,
    },
    {
      id: 'performance',
      title: 'Performance Logs',
      desc: 'Supervise employee activities in the system.',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="page staff-page">
      <div className="page-header">
        <h1>Staff Management</h1>
        <p>View, onboard, and manage your farm personnel and payroll accounts.</p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="page-cards">
        <div className="card">
          <h2>Owners</h2>
          <div className="total-owners stat-number" id="allOwners">0</div>
          <p>Farm partners and stakeholders</p>
        </div>

        <div className="card">
          <h2>Staff</h2>
          <div className="total-staff stat-number" id="allStaff">0</div>
          <p>All active staff working in the farm</p>
        </div>

        <div className="card">
          <h2>Staff on Leave</h2>
          <div className="staff-leave stat-number" id="StaffLeave">0</div>
          <p>Personnel currently on approved leave</p>
        </div>

        <div className="card">
          <h2>Auditor</h2>
          <div className="total-auditor stat-number" id="allAuditor">0</div>
          <p>Active auditors overseeing accounts</p>
        </div>
      </div>

      {/* Directory Section */}
      <div className="folder-section">
        <div className="section-header">
          <h2>Staff Directory & Operations</h2>
        </div>

        <div className="folder-list">
          {folders.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="folder-row"
                onClick={() => onSelectCategory && onSelectCategory(item.id)}
              >
                <div className="folder-icon-wrapper">
                  <IconComponent size={20} className="folder-icon" />
                </div>
                <div className="folder-details">
                  <span className="folder-title">{item.title}</span>
                  <span className="folder-desc">{item.desc}</span>
                </div>
                <div className="folder-action">
                  <ArrowRight size={18} className="arrow-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Staff;