import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Receipt, 
  Activity, 
  ChevronRight 
} from 'lucide-react';
import '../styles/Reports.css';

export default function Reports() {
  const reportTypes = [
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'View sales reports for your poultry farm.',
      icon: TrendingUp,
      colorClass: 'sales'
    },
    {
      id: 'purchases-report',
      title: 'Purchases Report',
      description: 'View purchases reports for your poultry farm.',
      icon: ShoppingBag,
      colorClass: 'purchases'
    },
    {
      id: 'debtors-report',
      title: 'Debtors Report',
      description: 'View debtors reports for your poultry farm.',
      icon: Users,
      colorClass: 'debtors'
    },
    {
      id: 'creditors-report',
      title: 'Creditors Report',
      description: 'View creditors reports for your poultry farm.',
      icon: CreditCard,
      colorClass: 'creditors'
    },
    {
      id: 'expenses-report',
      title: 'Expenses Report',
      description: 'View expenses reports for your poultry farm.',
      icon: Receipt,
      colorClass: 'expenses'
    },
    {
      id: 'performance-report',
      title: 'Farm Performance Report',
      description: 'View performance reports for your poultry farm.',
      icon: Activity,
      colorClass: 'performance'
    }
  ];

  const handleCardClick = (reportId) => {
    // Logic for opening/generating specific report will go here
    console.log(`Report clicked: ${reportId}`);
  };

  return (
    <div className="page reports-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Generate and view reports for your poultry farm.</p>
      </div>

      <div className="reports-stack">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div 
              key={report.id} 
              className={`report-card ${report.colorClass}`}
              onClick={() => handleCardClick(report.id)}
            >
              <div className="card-left">
                <div className="icon-badge">
                  <Icon size={22} />
                </div>
                <div className="card-info">
                  <h2>{report.title}</h2>
                  <p>{report.description}</p>
                </div>
              </div>

              <div className="arrow-wrapper">
                <ChevronRight size={22} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}