import { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  Users,
  Egg, 
  ArrowLeft 
} from 'lucide-react';
import styles from '../styles/AuthForm.module.css';

export default function AuthForm({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1: User Account State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Poultry Farm & Accounting Setup State
  const [farmName, setFarmName] = useState('');
  const [businessType, setBusinessType] = useState('Sole Proprietorship');
  const [numOwners, setNumOwners] = useState('1');
  const [numEmployees, setNumEmployees] = useState('1-5');
  const [primaryOperation, setPrimaryOperation] = useState('Layers');
  const [initialFlockCapacity, setInitialFlockCapacity] = useState('');
  const [accountingMethod, setAccountingMethod] = useState('Cash');

  const [error, setError] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all personal account fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isSignup) {
      if (!email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
    } else {
      if (!farmName) {
        setError('Please enter your farm or company name.');
        return;
      }
      if (!initialFlockCapacity || Number(initialFlockCapacity) < 0) {
        setError('Please enter a valid initial flock capacity.');
        return;
      }
    }

    const mockUserData = {
      id: 'usr_123',
      fullName: isSignup ? fullName : 'Demo User',
      email: email,
      farmProfile: isSignup
        ? {
            farmName,
            businessType,
            numOwners: Number(numOwners),
            numEmployees,
            primaryOperation,
            initialFlockCapacity: Number(initialFlockCapacity),
            accountingMethod,
          }
        : null,
    };

    if (onLoginSuccess) {
      onLoginSuccess(mockUserData);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup((prev) => !prev);
    setStep(1);
    setError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Step Indicator for Signup */}
        {isSignup && (
          <div className={styles['step-indicator']}>
            <span className={step === 1 ? styles['step-active'] : styles['step-done']}>
              1. Account
            </span>
            <span className={styles['step-divider']}>&gt;</span>
            <span className={step === 2 ? styles['step-active'] : ''}>
              2. Farm Setup
            </span>
          </div>
        )}

        <div className={styles.header}>
          <h2>
            {!isSignup
              ? 'Welcome Back'
              : step === 1
              ? 'Create Account'
              : 'Farm & Accounting Details'}
          </h2>
          <p>
            {!isSignup
              ? 'Sign in to access your farm ledgers'
              : step === 1
              ? 'Step 1: Set up your login credentials'
              : 'Step 2: Configure your poultry business setup'}
          </p>
        </div>

        {error && <div className={styles['error-banner']}>{error}</div>}

        <form onSubmit={isSignup && step === 1 ? handleNextStep : handleSubmit} className={styles.form}>
          {/* SIGNIN OR SIGNUP STEP 1 FIELDS */}
          {(step === 1 || !isSignup) && (
            <>
              {isSignup && (
                <div className={styles['field-group']}>
                  <label htmlFor="fullName">Full Name</label>
                  <div className={styles['input-wrapper']}>
                    <User size={18} className={styles.icon} />
                    <input
                      type="text"
                      id="fullName"
                      placeholder="e.g., Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className={styles['field-group']}>
                <label htmlFor="email">Email Address</label>
                <div className={styles['input-wrapper']}>
                  <Mail size={18} className={styles.icon} />
                  <input
                    type="email"
                    id="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles['field-group']}>
                <label htmlFor="password">Password</label>
                <div className={styles['input-wrapper']}>
                  <Lock size={18} className={styles.icon} />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {isSignup && (
                <div className={styles['field-group']}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className={styles['input-wrapper']}>
                    <CheckCircle size={18} className={styles.icon} />
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* SIGNUP STEP 2: POULTRY FARM DETAILS */}
          {isSignup && step === 2 && (
            <>
              <div className={styles['field-group']}>
                <label htmlFor="farmName">Farm / Company Name</label>
                <div className={styles['input-wrapper']}>
                  <Building2 size={18} className={styles.icon} />
                  <input
                    type="text"
                    id="farmName"
                    placeholder="e.g., Crested Poultry Farm Ltd"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="businessType">Business Entity</label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Limited Company">Limited Company</option>
                    <option value="Cooperative">Cooperative</option>
                  </select>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="numOwners">No. of Owners / Partners</label>
                  <div className={styles['input-wrapper']}>
                    <Users size={18} className={styles.icon} />
                    <input
                      type="number"
                      id="numOwners"
                      min="1"
                      value={numOwners}
                      onChange={(e) => setNumOwners(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="numEmployees">Number of Employees</label>
                  <select
                    id="numEmployees"
                    value={numEmployees}
                    onChange={(e) => setNumEmployees(e.target.value)}
                  >
                    <option value="1-5">1 - 5 Employees</option>
                    <option value="6-15">6 - 15 Employees</option>
                    <option value="16-50">16 - 50 Employees</option>
                    <option value="50+">50+ Employees</option>
                  </select>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="primaryOperation">Primary Operation</label>
                  <select
                    id="primaryOperation"
                    value={primaryOperation}
                    onChange={(e) => setPrimaryOperation(e.target.value)}
                  >
                    <option value="Layers">Layers (Egg Production)</option>
                    <option value="Broilers">Broilers (Meat Production)</option>
                    <option value="Hatchery">Hatchery & Breeding</option>
                    <option value="Mixed Poultry">Mixed Poultry</option>
                  </select>
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="initialFlockCapacity">Current Flock Count</label>
                  <div className={styles['input-wrapper']}>
                    <Egg size={18} className={styles.icon} />
                    <input
                      type="number"
                      id="initialFlockCapacity"
                      placeholder="e.g., 1000"
                      min="0"
                      value={initialFlockCapacity}
                      onChange={(e) => setInitialFlockCapacity(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="accountingMethod">Accounting Method</label>
                  <select
                    id="accountingMethod"
                    value={accountingMethod}
                    onChange={(e) => setAccountingMethod(e.target.value)}
                  >
                    <option value="Cash">Cash Basis</option>
                    <option value="Accrual">Accrual Basis</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className={styles['button-group']}>
            {isSignup && step === 2 && (
              <button
                type="button"
                className={styles['back-step-btn']}
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <button type="submit" className={styles['submit-btn']}>
              <span>
                {!isSignup
                  ? 'Sign In'
                  : step === 1
                  ? 'Next: Farm Setup'
                  : 'Complete Signup'}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <span>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            className={styles['toggle-btn']}
            onClick={toggleAuthMode}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}