import { ArrowLeft } from 'lucide-react';

function SalesReport({ setSelectedCategory }) {
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
        <h1>Sales Report</h1>
        <p>Your sales reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default SalesReport;