import { ArrowLeft } from 'lucide-react';

function ExpenseReport({ setSelectedCategory }) {
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
        <h1>Expenses Report</h1>
        <p>Your expense reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default ExpenseReport;