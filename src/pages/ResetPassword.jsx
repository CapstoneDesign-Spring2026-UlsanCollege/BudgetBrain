import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid';
import api from '../api';
import './Auth.css';

const passwordRules = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'Includes a letter', test: (value) => /[A-Za-z]/.test(value) },
  { label: 'Includes a number', test: (value) => /\d/.test(value) },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passedRules = useMemo(
    () => passwordRules.filter((rule) => rule.test(formData.password)).length,
    [formData.password]
  );
  const passwordReady = passedRules === passwordRules.length;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Password reset link is missing a token.');
      return;
    }
    if (!passwordReady) {
      toast.warning('Please choose a stronger password.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.warning('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password: formData.password });
      toast.success(res.data.msg || 'Password reset successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Choose New Password</h1>
            <p>Create a stronger password for your BudgetBrain account.</p>
          </div>

          {!token && (
            <p className="auth-status auth-status-error">
              This reset link is missing a token. Request a new link from the forgot password page.
            </p>
          )}

          <form onSubmit={onSubmit}>
            <div className="auth-input-group">
              <LockClosedIcon width={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                name="password"
                value={formData.password}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeSlashIcon width={20} /> : <EyeIcon width={20} />}
              </button>
            </div>

            <div className="auth-input-group">
              <LockClosedIcon width={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
            </div>

            <ul className="password-rules">
              {passwordRules.map((rule) => (
                <li key={rule.label} className={rule.test(formData.password) ? 'passed' : ''}>
                  <CheckCircleIcon width={15} />
                  {rule.label}
                </li>
              ))}
            </ul>

            <button type="submit" className="auth-btn" disabled={isLoading || !token}>
              {isLoading ? (
                <>
                  <ArrowPathIcon width={20} className="spinner" />
                  <span>Saving password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <CheckCircleIcon width={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p><Link to="/login" className="auth-link">Back to login</Link></p>
          </div>
        </div>
      </section>

      <section className="auth-illustration-section">
        <div className="illustration-glow"></div>
        <img
          src="https://illustrations.popsy.co/amber/key.svg"
          alt="Password reset illustration"
          className="floating-illustration"
        />
      </section>
    </div>
  );
};

export default ResetPassword;
