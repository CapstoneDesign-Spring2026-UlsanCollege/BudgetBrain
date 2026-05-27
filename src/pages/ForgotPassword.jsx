import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import api from '../api';
import securityResetImage from '../assets/security-reset.webp';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetCode('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.msg);
      setResetCode(res.data.resetCode || '');
      toast.success('Password reset code sent.');
      if (!res.data.resetCode) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not start password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your account email and we will send a secure 6-digit code if the account exists.</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="auth-input-group">
              <EnvelopeIcon width={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <ArrowPathIcon width={20} className="spinner" />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ShieldCheckIcon width={20} />
                </>
              )}
            </button>
          </form>

          {message && <p className="auth-status">{message}</p>}
          {resetCode && (
            <p className="auth-status">
              Local reset code: <strong>{resetCode}</strong>. <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="auth-link">Enter code</Link>
            </p>
          )}

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link"><ArrowLeftIcon width={16} /> Back to login</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="auth-illustration-section">
        <div className="illustration-glow"></div>
        <img
          src={securityResetImage}
          alt="Security illustration"
          className="floating-illustration"
        />
      </section>
    </div>
  );
};

export default ForgotPassword;
