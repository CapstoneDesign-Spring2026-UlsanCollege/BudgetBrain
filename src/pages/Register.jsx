import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import api from '../api';
import './Auth.css';

const getAuthErrorMessage = (err) =>
  err.response?.data?.msg ||
  err.response?.data?.error ||
  'Registration failed. Please try again.';

const passwordRules = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'Includes a letter', test: (value) => /[A-Za-z]/.test(value) },
  { label: 'Includes a number', test: (value) => /\d/.test(value) },
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;
  const passwordReady = passwordRules.every((rule) => rule.test(password));

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePassword = () => setShowPassword(!showPassword);

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!passwordReady) {
      toast.warning("Password must be at least 8 characters and include a letter and number.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Form Section */}
      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Join BudgetBrain</h1>
            <p>Take control of your finances today. Create a free account to track your budget and reach your goals.</p>
          </div>
          
          <form onSubmit={onSubmit}>
            <div className="auth-input-group">
              <UserIcon width={20} className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={name}
                onChange={onChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-input-group">
              <EnvelopeIcon width={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            
            <div className="auth-input-group">
              <LockClosedIcon width={20} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeSlashIcon width={20} /> : <EyeIcon width={20} />}
              </button>
            </div>

            <div className="auth-input-group">
              <LockClosedIcon width={20} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
            </div>

            <ul className="password-rules">
              {passwordRules.map((rule) => (
                <li key={rule.label} className={rule.test(password) ? 'passed' : ''}>
                  <CheckCircleIcon width={15} />
                  {rule.label}
                </li>
              ))}
            </ul>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <ArrowPathIcon width={20} className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register</span>
                  <UserPlusIcon width={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login" className="auth-link">Log In here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Illustration Section */}
      <section className="auth-illustration-section">
        <div className="illustration-glow"></div>
        <img 
          src="https://illustrations.popsy.co/amber/student-going-to-school.svg" 
          alt="Person managing finances" 
          className="floating-illustration" 
        />
      </section>
    </div>
  );
};

export default Register;
