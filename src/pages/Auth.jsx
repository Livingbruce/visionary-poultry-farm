import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  LogOut,
  UserRoundPlus,
  ShieldCheck,
  LoaderCircle,
} from 'lucide-react';
import { supabase } from '../libs/supabase';
import styles from '../styles/AuthForm.module.css';

const initialFarm = {
  farmName: '',
  businessType: 'Sole Proprietorship',
  numOwners: '1',
  numEmployees: '1-5',
  primaryOperation: 'Layers',
  flockCount: '',
  accountingMethod: 'Cash',
};

function friendlyError(error, context = 'general') {
  const message = String(error?.message || '').toLowerCase();

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid email or password')
  ) {
    return 'The email or password is incorrect. Check your details and try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Your email has not been verified yet. Check your inbox for the confirmation link.';
  }

  if (message.includes('user already registered')) {
    return 'An account with this email may already exist. Try signing in or resetting your password.';
  }

  if (message.includes('password should be at least')) {
    return 'Your password is too short. Use at least 8 characters.';
  }

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts were made in a short time. Wait a little before trying again.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'We could not reach the server. Check your internet connection and try again.';
  }

  if (message.includes('jwt') || message.includes('session')) {
    return 'Your session may have expired. Sign in again to continue.';
  }

  if (
    message.includes('permission denied') ||
    message.includes('row-level security') ||
    message.includes('row level security')
  ) {
    return 'The database denied this action. Your account may lack the required access. If this continues, contact support.';
  }

  if (context === 'farm') {
    return 'We could not create your farm. Check the details and try again. Your account has not been deleted.';
  }

  if (context === 'membership') {
    return 'We could not check your farm membership. Check your connection and try again.';
  }

  if (context === 'reset') {
    return 'We could not request a password reset. Check your connection and try again.';
  }

  return error?.message || 'Something went wrong. Please try again.';
}

export default function AuthForm() {
  const [mode, setMode] = useState('login');
  const [, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [farm, setFarm] = useState(initialFarm);
  const [, setSignedIn] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);

  const clearNotices = () => {
    setError('');
    setMessage('');
  };

  const updateFarm = (field, value) => {
    setFarm((previous) => ({ ...previous, [field]: value }));
  };

  const checkMembership = useCallback(async () => {
    clearNotices();
    setLoading(true);
    setMembershipChecked(false);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user;

      if (!user) {
        setSignedIn(false);
        setError('Your session has expired. Please sign in again.');
        return;
      }

      setSignedIn(true);

      const { data, error: membershipError } = await supabase
        .from('farm_members')
        .select('farm_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (data) {
        setMessage(
          `Your farm membership was found. Your assigned role is ${data.role.replace('_', ' ')}. Loading your workspace...`
        );
        window.dispatchEvent(new Event('farm-membership-checked'));
      } else {
        setMembershipChecked(true);
        setMessage(
          'Your account is ready, but it is not linked to a farm yet.'
        );
      }
    } catch (membershipError) {
      console.error('Membership lookup failed:', membershipError);
      setError(friendlyError(membershipError, 'membership'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;

      if (sessionError) {
        setError(friendlyError(sessionError));
        return;
      }

      if (data?.session?.user) {
        setSignedIn(true);
        setMode('onboarding');
        void checkMembership();
      }
    });

    return () => {
      active = false;
    };
  }, [checkMembership]);

  const handleSignup = async (event) => {
    event.preventDefault();
    clearNotices();

    if (loading) return;

    if (fullName.trim().length < 2) {
      setError('Enter your full name.');
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

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) throw signupError;

      if (data.session) {
        setSignedIn(true);
        setMode('onboarding');
        setMessage('Your account was created successfully.');
        await checkMembership();
      } else {
        setMessage(
          'Your account has been created. Check your email and click the confirmation link. Once verified, return here and sign in to create a farm or join an existing one.'
        );
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (signupError) {
      console.error('Signup failed:', signupError);
      setError(friendlyError(signupError));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    clearNotices();

    if (loading) return;

    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) throw loginError;

      setSignedIn(true);
      setMode('onboarding');
      await checkMembership();
    } catch (loginError) {
      console.error('Login failed:', loginError);
      setError(friendlyError(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (event) => {
    event.preventDefault();
    clearNotices();

    if (loading) return;

    if (farm.farmName.trim().length < 2) {
      setError('Enter a farm name containing at least 2 characters.');
      return;
    }

    const owners = Number(farm.numOwners);
    const flockCount = Number(farm.flockCount);

    if (!Number.isInteger(owners) || owners < 1 || owners > 100) {
      setError('The number of owners must be between 1 and 100.');
      return;
    }

    if (
      farm.flockCount === '' ||
      !Number.isInteger(flockCount) ||
      flockCount < 0
    ) {
      setError('Enter a valid whole number for the current flock count.');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData?.session?.user) {
        setSignedIn(false);
        setMode('login');
        throw new Error('Your session has expired. Please sign in again.');
      }

      const { data: existingMembership, error: membershipError } =
        await supabase
          .from('farm_members')
          .select('farm_id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1)
          .maybeSingle();

      if (membershipError) throw membershipError;

      if (existingMembership) {
        setMessage('Your farm membership already exists. Loading your workspace...');
        window.dispatchEvent(new Event('farm-membership-checked'));
        return;
      }

      const { data: farmId, error: createError } = await supabase.rpc(
        'create_farm_and_owner',
        {
          p_farm_name: farm.farmName.trim(),
          p_business_type: farm.businessType,
          p_owner_count: owners,
          p_employee_range: farm.numEmployees,
          p_main_operation: farm.primaryOperation,
          p_current_flock_count: flockCount,
          p_accounting_method: farm.accountingMethod,
        }
      );

      if (createError) throw createError;

      if (!farmId) {
        throw new Error(
          'The database did not return a farm ID. Please check your farm list before retrying.'
        );
      }

      setMessage(
        `Your farm account has been created successfully. You are its owner.`
      );

      window.dispatchEvent(new Event('farm-membership-checked'));
    } catch (createError) {
      console.error('Farm creation failed:', {
        message: createError?.message,
        code: createError?.code,
        details: createError?.details,
        hint: createError?.hint,
      });

      const errorDetails = [
        createError?.message,
        createError?.details,
        createError?.hint,
      ]
        .filter(Boolean)
        .join(' ');

      setError(
        errorDetails
          ? `Farm creation failed: ${errorDetails}`
          : friendlyError(createError, 'farm')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearNotices();

    if (!email.trim()) {
      setError('Enter your email address first.');
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
        'If an account exists for this email, password-reset instructions will be sent. Check your inbox and spam folder.'
      );
    } catch (resetError) {
      console.error('Password reset failed:', resetError);
      setError(friendlyError(resetError, 'reset'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    clearNotices();
    setLoading(true);

    try {
      const { error: signoutError } = await supabase.auth.signOut();

      if (signoutError) throw signoutError;

      setSignedIn(false);
      setMembershipChecked(false);
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setMessage('You have been signed out.');
    } catch (signoutError) {
      console.error('Sign out failed:', signoutError);
      setError(friendlyError(signoutError));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    clearNotices();
    setMode(nextMode);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
  };

  const renderNotices = () => (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          className={styles['error-banner']}
          role="alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      )}

      {message && (
        <motion.div
          key="message"
          className={styles['success-banner']}
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className={styles.brand}>
          <div className={styles['brand-mark']}>
            <Egg size={23} />
          </div>
          <div>
            <span className={styles['brand-name']}>VISIONARY</span>
            <span className={styles['brand-subtitle']}>POULTRY ACCOUNTS</span>
          </div>
        </div>

        {renderNotices()}

        <AnimatePresence mode="wait">
          {mode === 'signup' && (
            <motion.section
              key="signup"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <h2>Create your account</h2>
                <p>Create a secure account before setting up or joining a farm.</p>
              </div>

              <form className={styles.form} onSubmit={handleSignup}>
                <div className={styles['field-group']}>
                  <label htmlFor="signup-name">Full name</label>
                  <div className={styles['input-wrapper']}>
                    <User size={18} className={styles.icon} />
                    <input
                      id="signup-name"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="signup-email">Email address</label>
                  <div className={styles['input-wrapper']}>
                    <Mail size={18} className={styles.icon} />
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="signup-password">Password</label>
                  <div className={styles['input-wrapper']}>
                    <Lock size={18} className={styles.icon} />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className={styles['password-toggle']}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="signup-confirm">Confirm password</label>
                  <div className={styles['input-wrapper']}>
                    <CheckCircle size={18} className={styles.icon} />
                    <input
                      id="signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                </div>

                <p className={styles['security-note']}>
                  Your role is assigned through your farm membership, never
                  through a signup form.
                </p>

                <button
                  className={styles['submit-btn']}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </motion.section>
          )}

          {mode === 'login' && (
            <motion.section
              key="login"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <h2>Welcome back</h2>
                <p>Sign in to access your poultry farm account.</p>
              </div>

              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles['field-group']}>
                  <label htmlFor="login-email">Email address</label>
                  <div className={styles['input-wrapper']}>
                    <Mail size={18} className={styles.icon} />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles['field-group']}>
                  <label htmlFor="login-password">Password</label>
                  <div className={styles['input-wrapper']}>
                    <Lock size={18} className={styles.icon} />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className={styles['password-toggle']}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles['forgot-btn']}
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  <KeyRound size={15} /> Forgot password?
                </button>

                <button
                  className={styles['submit-btn']}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </motion.section>
          )}

          {mode === 'onboarding' && (
            <motion.section
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <div className={styles.header}>
                <h2>Connect to a farm</h2>
                <p>
                  Your account is signed in. Create a new farm or ask an
                  existing farm owner to add you.
                </p>
              </div>

              {membershipChecked && (
                <div className={styles['choice-grid']}>
                  <motion.button
                    type="button"
                    className={styles['choice-card']}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      clearNotices();
                      setMode('create-farm');
                    }}
                  >
                    <Building2 size={25} />
                    <strong>Create a farm account</strong>
                    <span>
                      Start a farm account and become its first owner.
                    </span>
                    <ArrowRight size={18} />
                  </motion.button>

                  <motion.div
                    className={styles['choice-card']}
                    whileHover={{ y: -3 }}
                  >
                    <UserRoundPlus size={25} />
                    <strong>Join an existing farm</strong>
                    <span>
                      Ask the farm owner to add your email and assign your role.
                      Once added, sign in again.
                    </span>
                    <ShieldCheck size={18} />
                  </motion.div>
                </div>
              )}

              {!membershipChecked && loading && (
                <p className={styles['security-note']}>
                  Checking your farm membership...
                </p>
              )}

              <button
                type="button"
                className={styles['back-step-btn']}
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOut size={16} /> Sign out
              </button>
            </motion.section>
          )}

          {mode === 'create-farm' && (
            <motion.section
              key="create-farm"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <h2>Set up your farm</h2>
                <p>
                  Your farm will be created with your account as its first
                  owner.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleCreateFarm}>
                <div className={styles['field-group']}>
                  <label htmlFor="farm-name">Farm / business name</label>
                  <div className={styles['input-wrapper']}>
                    <Building2 size={18} className={styles.icon} />
                    <input
                      id="farm-name"
                      value={farm.farmName}
                      onChange={(e) => updateFarm('farmName', e.target.value)}
                      placeholder="e.g. Visionary Poultry Farm"
                      minLength={2}
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                <div className={styles['field-row']}>
                  <div className={styles['field-group']}>
                    <label htmlFor="business-type">Business type</label>
                    <select
                      id="business-type"
                      value={farm.businessType}
                      onChange={(e) => updateFarm('businessType', e.target.value)}
                    >
                      <option>Sole Proprietorship</option>
                      <option>Partnership</option>
                      <option>Limited Company</option>
                      <option>Cooperative</option>
                    </select>
                  </div>

                  <div className={styles['field-group']}>
                    <label htmlFor="num-owners">Number of owners</label>
                    <div className={styles['input-wrapper']}>
                      <Users size={18} className={styles.icon} />
                      <input
                        id="num-owners"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={farm.numOwners}
                        onChange={(e) => updateFarm('numOwners', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles['field-row']}>
                  <div className={styles['field-group']}>
                    <label htmlFor="num-employees">Employees</label>
                    <select
                      id="num-employees"
                      value={farm.numEmployees}
                      onChange={(e) => updateFarm('numEmployees', e.target.value)}
                    >
                      <option value="1-5">1–5 employees</option>
                      <option value="6-15">6–15 employees</option>
                      <option value="16-50">16–50 employees</option>
                      <option value="50+">50+ employees</option>
                    </select>
                  </div>

                  <div className={styles['field-group']}>
                    <label htmlFor="primary-operation">Main operation</label>
                    <select
                      id="primary-operation"
                      value={farm.primaryOperation}
                      onChange={(e) => updateFarm('primaryOperation', e.target.value)}
                    >
                      <option value="Layers">Layers / egg production</option>
                      <option value="Broilers">Broilers / meat production</option>
                      <option value="Hatchery">Hatchery and breeding</option>
                      <option value="Mixed Poultry">Mixed poultry</option>
                    </select>
                  </div>
                </div>

                <div className={styles['field-row']}>
                  <div className={styles['field-group']}>
                    <label htmlFor="flock-count">Current flock count</label>
                    <div className={styles['input-wrapper']}>
                      <Egg size={18} className={styles.icon} />
                      <input
                        id="flock-count"
                        type="number"
                        min="0"
                        step="1"
                        value={farm.flockCount}
                        onChange={(e) => updateFarm('flockCount', e.target.value)}
                        placeholder="e.g. 250"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles['field-group']}>
                    <label htmlFor="accounting-method">Accounting method</label>
                    <select
                      id="accounting-method"
                      value={farm.accountingMethod}
                      onChange={(e) => updateFarm('accountingMethod', e.target.value)}
                    >
                      <option value="Cash">Cash basis</option>
                      <option value="Accrual">Accrual basis</option>
                    </select>
                  </div>
                </div>

                <p className={styles['security-note']}>
                  The database assigns you the Owner role automatically. You
                  cannot assign yourself a role through the form.
                </p>

                <div className={styles['button-group']}>
                  <button
                    type="button"
                    className={styles['back-step-btn']}
                    onClick={() => {
                      clearNotices();
                      setMode('onboarding');
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <button
                    type="submit"
                    className={styles['submit-btn']}
                    disabled={loading}
                  >
                    {loading ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}
                    {loading ? 'Creating farm...' : 'Create farm'}
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {(mode === 'login' || mode === 'signup') && (
          <div className={styles.footer}>
            <span>
              {mode === 'signup' ? 'Already registered?' : 'New to Visionary Poultry?'}
            </span>
            <button
              type="button"
              className={styles['toggle-btn']}
              onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
              disabled={loading}
            >
              {mode === 'signup' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}