import { ArrowLeft } from 'lucide-react';

function StaffSalary({ setSelectedCategory }) {
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
        <h1>Staff Salary Allocation</h1>
        <p>Farm staff salary allocation.</p>
      </div>
    </div>
  );
}

export default StaffSalary;