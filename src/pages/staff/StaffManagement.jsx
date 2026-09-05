import { ArrowLeft } from 'lucide-react';

function StaffManagement({ setSelectedCategory }) {
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
        <h1>Staff Management</h1>
        <p>Manage staff here.</p>
      </div>
    </div>
  );
}

export default StaffManagement;