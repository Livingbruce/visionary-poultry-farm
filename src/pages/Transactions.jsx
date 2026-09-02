import { useState } from 'react';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import SalesTable from '../tables/SalesTable';
import PurchasesTable from '../tables/PurchasesTable';
import ExpenseTable from '../tables/ExpenseTable';
import CreditorTable from '../tables/CreditorTable';
import DebtorTable from '../tables/DebtorTable';
import '../styles/Transactions.css';
import { categories } from '../components/TransactionCards';

function Transactions() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory === 'sales') {
    return <SalesTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'purchases') {
    return <PurchasesTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'expenses') {
    return <ExpenseTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
  } else if (selectedCategory === 'creditors') {
    return <CreditorTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  } else if (selectedCategory === 'debtors') {
    return <DebtorTable selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
  }

  if (selectedCategory) {
    return (
      <div className="page transactions-container">
        <div className="table-view-header">
          <button 
            className="back-btn" 
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={18} />
            <span>Back to Transactions</span>
          </button>
          <h1>{selectedCategory.toUpperCase()} Ledger Table</h1>
        </div>
        <div className="table-placeholder-card" id="content">
          <p>Table component for <strong>{selectedCategory}</strong> will be rendered here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page transactions-container">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>View and manage your poultry farm transactions.</p>
      </div>

      <div className="page-content transaction-grid">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className={`transaction-card ${item.colorClass}`}
              onClick={() => setSelectedCategory(item.id)}
            >
              <div className="card-top">
                <div className="icon-badge">
                  <Icon size={22} />
                </div>
                <div className="arrow-indicator">
                  <ArrowRight size={18} />
                </div>
              </div>

              <div className="card-body">
                <h2>{item.title}</h2>
                <div className="transaction-details" id={`${item.id}-transactions`}>
                  {item.amount}
                </div>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="page-footer">
        <Info size={16} />
        <p>Click on a card to view the detailed ledger table for that transaction category.</p>
      </div>
    </div>
  );
}

export default Transactions;