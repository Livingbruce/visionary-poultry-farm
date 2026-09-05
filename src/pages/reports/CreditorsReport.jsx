import { ArrowLeft } from 'lucide-react';

function CreditorsReport({ setSelectedCategory }) {
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
        <h1>Creditors Report</h1>
        <p>Your creditors reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default CreditorsReport;