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
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from '../styles/AuthForm.module.css';

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [farmName, setFarmName] = useState('');
  const [businessType, setBusinessType] = useState('Sole Proprietorship');
  const [numOwners, setNumOwners] = useState('1');
  const [numEmployees, setNumEmployees] = useState('1-5');
  const [primaryOperation, setPrimaryOperation] = useState('Layers');
  const [initialFlockCapacity, setInitialFlockCapacity] = useState('');
  const [accountingMethod, setAccountingMethod] = useState('Cash');

  const clearNotices = () => {
    setError('');
    setMessage('');
  };

  const handleNextStep = (event) => {
    event.preventDefault();
    clearNotices();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Complete all account fields before continuing.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearNotices();

    if (loading) return;

    if (isSignup) {
      if (!farmName.trim()) {
        setError('Enter your farm or business name.');
        return;
      }

      if (initialFlockCapacity === '' || Number(initialFlockCapacity) < 0) {
        setError('Enter a valid current flock count.');
        return;
      }

      if (!Number.isInteger(Number(numOwners)) || Number(numOwners) < 1) {
        setError('Number of owners must be at least 1.');
        return;
      }
    } else if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              farm_setup: {
                farm_name: farmName.trim(),
                business_type: businessType,
                number_of_owners: Number(numOwners),
                number_of_employees: numEmployees,
                primary_operation: primaryOperation,
                current_flock_count: Number(initialFlockCapacity),
                accounting_method: accountingMethod,
              },
            },
          },
        });

        if (signupError) throw signupError;

        if (data.session) {
          setMessage(
            'Account created. If this is the first account for your farm, an administrator must assign the Owner role before owner-only features are available.'
          );
        } else {
          setMessage(
            'Account created. Check your email for the confirmation link, then return here to sign in. Your role must be assigned securely before you can access farm records.'
          );
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (loginError) throw loginError;
        // App.jsx listens for Supabase auth state changes and opens the app.
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      setError(authError.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearNotices();

    if (!email.trim()) {
      setError('Enter your email address first, then choose Forgot password.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin }
      );

      if (resetError) throw resetError;

      setMessage(
        'If an account exists for that address, Supabase will send password-reset instructions. Check your inbox and spam folder.'
      );
    } catch (resetError) {
      console.error('Password reset error:', resetError);
      setError(resetError.message || 'Could not request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup((previous) => !previous);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    clearNotices();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles['brand-mark']}><Egg size={23} /></div>
          <div>
            <span className={styles['brand-name']}>VISIONARY</span>
            <span className={styles['brand-subtitle']}>POULTRY ACCOUNTS</span>
          </div>
        </div>

        {isSignup && (
          <div className={styles['step-indicator']}>
            <span className={step === 1 ? styles['step-active'] : styles['step-done']}>
              1. Account
            </span>
            <span className={styles['step-divider']}>/</span>
            <span className={step === 2 ? styles['step-active'] : ''}>
              2. Farm setup
            </span>
          </div>
        )}

        <div className={styles.header}>
          <h2>
            {!isSignup
              ? 'Welcome back'
              : step === 1
                ? 'Create your account'
                : 'Set up your farm'}
          </h2>
          <p>
            {!isSignup
              ? 'Sign in to manage your poultry records.'
              : step === 1
                ? 'One account for your farm’s financial records.'
                : 'Add the basic details for your poultry business.'}
          </p>
        </div>

        {error && <div className={styles['error-banner']} role="alert">{error}</div>}
        {message && <div className={styles['success-banner']} role="status">{message}</div>}

        <form
          onSubmit={isSignup && step === 1 ? handleNextStep : handleSubmit}
          className={styles.form}
        >
          {(step === 1 || !isSignup) && (
            <>
              {isSignup && (
                <div className={styles['field-group']}>
                  <label htmlFor="fullName">Full name</label>
                  <div className={styles['input-wrapper']}>
                    <User size={18} className={styles.icon} />
                    <input
                      type="text"
                      id="fullName"
                      autoComplete="name"
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles['field-group']}>
                <label htmlFor="email">Email address</label>
                <div className={styles['input-wrapper']}>
                  <Mail size={18} className={styles.icon} />
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles['field-group']}>
                <label htmlFor="password">Password</label>
                <div className={styles['input-wrapper']}>
                  <Lock size={18} className={styles.icon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles['password-toggle']}
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className={styles['field-group']}>
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className={styles['input-wrapper']}>
                    <CheckCircle size={18} className={styles.icon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {!isSignup && (
                <button
                  type="button"
                  className={styles['forgot-btn']}
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  <KeyRound size={15} /> Forgot password?
                </button>
              )}
            </>
          )}

          {isSignup && step === 2 && (
            <>
              <div className={styles['field-group']}>
                <label htmlFor="farmName">Farm / business name</label>
                <div className={styles['input-wrapper']}>
                  <Building2 size={18} className={styles.icon} />
                  <input
                    type="text"
                    id="farmName"
                    placeholder="e.g. Visionary Poultry Farm"
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="businessType">Business type</label>
                  <select id="businessType" value={businessType} onChange={(event) => setBusinessType(event.target.value)}>
                    <option value="Sole Proprietorship">Sole proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Limited Company">Limited company</option>
                    <option value="Cooperative">Cooperative</option>
                  </select>
                </div>
                <div className={styles['field-group']}>
                  <label htmlFor="numOwners">Number of owners</label>
                  <div className={styles['input-wrapper']}>
                    <Users size={18} className={styles.icon} />
                    <input id="numOwners" type="number" min="1" step="1" value={numOwners} onChange={(event) => setNumOwners(event.target.value)} required />
                  </div>
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="numEmployees">Employees</label>
                  <select id="numEmployees" value={numEmployees} onChange={(event) => setNumEmployees(event.target.value)}>
                    <option value="1-5">1–5 employees</option>
                    <option value="6-15">6–15 employees</option>
                    <option value="16-50">16–50 employees</option>
                    <option value="50+">50+ employees</option>
                  </select>
                </div>
                <div className={styles['field-group']}>
                  <label htmlFor="primaryOperation">Main operation</label>
                  <select id="primaryOperation" value={primaryOperation} onChange={(event) => setPrimaryOperation(event.target.value)}>
                    <option value="Layers">Layers / egg production</option>
                    <option value="Broilers">Broilers / meat production</option>
                    <option value="Hatchery">Hatchery and breeding</option>
                    <option value="Mixed Poultry">Mixed poultry</option>
                  </select>
                </div>
              </div>

              <div className={styles['field-row']}>
                <div className={styles['field-group']}>
                  <label htmlFor="initialFlockCapacity">Current flock count</label>
                  <div className={styles['input-wrapper']}>
                    <Egg size={18} className={styles.icon} />
                    <input id="initialFlockCapacity" type="number" min="0" step="1" placeholder="e.g. 250" value={initialFlockCapacity} onChange={(event) => setInitialFlockCapacity(event.target.value)} required />
                  </div>
                </div>
                <div className={styles['field-group']}>
                  <label htmlFor="accountingMethod">Accounting method</label>
                  <select id="accountingMethod" value={accountingMethod} onChange={(event) => setAccountingMethod(event.target.value)}>
                    <option value="Cash">Cash basis</option>
                    <option value="Accrual">Accrual basis</option>
                  </select>
                </div>
              </div>
              <p className={styles['security-note']}>
                New accounts do not choose their own access role. The farm owner must assign permissions separately.
              </p>
            </>
          )}

          <div className={styles['button-group']}>
            {isSignup && step === 2 && (
              <button type="button" className={styles['back-step-btn']} onClick={() => setStep(1)} disabled={loading}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button type="submit" className={styles['submit-btn']} disabled={loading}>
              <span>
                {loading
                  ? 'Please wait…'
                  : !isSignup
                    ? 'Sign in'
                    : step === 1
                      ? 'Continue to farm setup'
                      : 'Create account'}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <span>{isSignup ? 'Already registered?' : 'New to Visionary Poultry?'}</span>
          <button type="button" className={styles['toggle-btn']} onClick={toggleAuthMode} disabled={loading}>
            {isSignup ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
