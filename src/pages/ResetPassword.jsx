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
import securityResetImage from '../assets/security-reset.webp';
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
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: '',
    password: '',
    confirmPassword: '',
  });
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
    if (!token && (!formData.email || formData.code.replace(/\s/g, '').length !== 6)) {
      toast.error('Enter your email and 6-digit reset code.');
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
      const res = await api.post('/auth/reset-password', {
        token,
        email: formData.email,
        code: formData.code.replace(/\s/g, ''),
        password: formData.password,
      });
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
            <p>Type the 6-digit code from your email and create a stronger password.</p>
          </div>

          <form onSubmit={onSubmit}>
            {!token && (
              <>
                <div className="auth-input-group">
                  <LockClosedIcon width={20} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <LockClosedIcon width={20} className="input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    placeholder="6-digit code"
                    name="code"
                    value={formData.code}
                    onChange={onChange}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </>
            )}

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

            <button type="submit" className="auth-btn" disabled={isLoading}>
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
          src={securityResetImage}
          alt="Password reset illustration"
          className="floating-illustration"
        />
      </section>
    </div>
  );
};

export default ResetPassword;
