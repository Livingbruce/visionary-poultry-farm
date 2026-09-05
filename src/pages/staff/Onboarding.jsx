import { ArrowLeft } from 'lucide-react';

function StaffOnboarding({ setSelectedCategory }) {
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
        <h1>Staff Onboarding</h1>
        <p>Onboard staff members.</p>
      </div>
    </div>
  );
}

export default StaffOnboarding;