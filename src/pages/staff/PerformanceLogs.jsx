import { ArrowLeft } from 'lucide-react';

function PerformanceLog({ setSelectedCategory }) {
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
        <h1>Staff Performance Logs</h1>
        <p>Farm staff performance logs.</p>
      </div>
    </div>
  );
}

export default PerformanceLog;