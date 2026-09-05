import { ArrowLeft } from 'lucide-react';

function PurchaseReport({ setSelectedCategory }) {
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
        <h1>Purchases Report</h1>
        <p>Your purchase reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default PurchaseReport;