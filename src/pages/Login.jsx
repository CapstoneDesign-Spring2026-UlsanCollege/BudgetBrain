import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowRightOnRectangleIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import api from '../api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePassword = () => setShowPassword(!showPassword);

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', JSON.stringify(user.name));
      localStorage.setItem('budgetbrain-avatar', user.avatar || '🎯');
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Please check your credentials.');
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
            <h1>Welcome Back</h1>
            <p>Log in to your account to continue managing your finances securely.</p>
          </div>
          
          <form onSubmit={onSubmit}>
            <div className="auth-input-group">
              <EnvelopeIcon width={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
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

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <ArrowPathIcon width={20} className="spinner" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRightOnRectangleIcon width={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register" className="auth-link">Create one here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Illustration Section */}
      <section className="auth-illustration-section">
        <div className="illustration-glow"></div>
        <img 
          src="https://illustrations.popsy.co/amber/success.svg" 
          alt="Success illustration" 
          className="floating-illustration" 
        />
      </section>
    </div>
  );
};

export default Login;
