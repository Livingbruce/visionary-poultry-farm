import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { reportTypes } from '../components/ReportCards';
import SalesReport from './reports/SalesReport';
import PurchaseReport from './reports/PurchaseReport';
import DebtorsReport from './reports/DebtorsReport';
import CreditorsReport from './reports/CreditorsReport';
import ExpenseReport from './reports/ExpenseReport';
import PerformanceReport from './reports/PerformanceReport';
import '../styles/Reports.css';

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const handleCardClick = (reportId) => {
    console.log(`Report clicked: ${reportId}`);
    setSelectedCategory(reportId);
  };

  if (selectedCategory === 'sales-report') {
    return <SalesReport setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  } else if (selectedCategory === 'purchases-report') {
    return <PurchaseReport setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  } else if (selectedCategory === 'debtors-report') {
    return <DebtorsReport selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  } else if (selectedCategory === 'creditors-report') {
    return <CreditorsReport selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  } else if (selectedCategory === 'expenses-report') {
    return <ExpenseReport selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  } else if (selectedCategory === 'performance-report') {
    return <PerformanceReport selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  }

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