import { ArrowLeft } from 'lucide-react';

function PerformanceReport({ setSelectedCategory }) {
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
        <h1>Performance Report</h1>
        <p>Your farm performance reports for the poultry farm.</p>
      </div>
    </div>
  );
}

export default PerformanceReport;