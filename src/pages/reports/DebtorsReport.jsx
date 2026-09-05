import { ArrowLeft } from 'lucide-react';

function DebtorsReport({ setSelectedCategory }) {
  return (
    <div>
      <div className="page-header">
        <button 
          className="back"
          onClick={() => setSelectedCategory(null)}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Debtors Report</h1>
        <p>Your debtors reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default DebtorsReport;