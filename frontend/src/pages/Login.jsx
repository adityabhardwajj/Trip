import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-container">
            <div className="login-icon">
              <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_48_5767)">
                  <path d="M22.6078 9C24.2109 9 27 10.3594 27 12C27 13.6875 24.2109 15 22.6078 15H17.1422L12.4313 23.2453C12.1641 23.7141 11.6672 24 11.1281 24H8.49375C7.99687 24 7.63594 23.5219 7.77188 23.0438L10.0688 15H5.25L3.225 17.7C3.08438 17.8875 2.85938 18 2.625 18H0.65625C0.290625 18 0 17.7047 0 17.3438C0 17.2828 0.009375 17.2219 0.0234375 17.1609L1.5 12L0.0234375 6.83906C0.0046875 6.77812 0 6.71719 0 6.65625C0 6.29063 0.295313 6 0.65625 6H2.625C2.85938 6 3.08438 6.1125 3.225 6.3L5.25 9H10.0734L7.77656 0.95625C7.63594 0.478125 7.99687 0 8.49375 0H11.1281C11.6672 0 12.1641 0.290625 12.4313 0.754688L17.1422 9H22.6078Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_48_5767">
                    <path d="M0 0H27V24H0V0Z" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <h2 className="login-title">Log In to Journey Booking Platform</h2>
          <p className="login-subtitle">Welcome back! Please enter your credentials to continue.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
                className="login-input"
              placeholder="you@example.com"
              required
            />
              <div className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 16H0V0H16V16Z" stroke="#E5E7EB"/>
                  <path d="M2 3.5C1.725 3.5 1.5 3.725 1.5 4V4.69063L6.89062 9.11563C7.5375 9.64688 8.46562 9.64688 9.1125 9.11563L14.5 4.69063V4C14.5 3.725 14.275 3.5 14 3.5H2ZM1.5 6.63125V12C1.5 12.275 1.725 12.5 2 12.5H14C14.275 12.5 14.5 12.275 14.5 12V6.63125L10.0625 10.275C8.8625 11.2594 7.13438 11.2594 5.9375 10.275L1.5 6.63125ZM0 4C0 2.89688 0.896875 2 2 2H14C15.1031 2 16 2.89688 16 4V12C16 13.1031 15.1031 14 14 14H2C0.896875 14 0 13.1031 0 12V4Z" fill="#9CA3AF"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
            <input
                type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
                className="login-input"
              placeholder="Enter your password"
              required
            />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_48_5791)">
                    <path d="M8.99922 2.5C6.96172 2.5 5.28672 3.425 4.00234 4.61562C2.79922 5.73438 1.96797 7.0625 1.54297 8C1.96797 8.9375 2.79922 10.2656 3.99922 11.3844C5.28672 12.575 6.96172 13.5 8.99922 13.5C11.0367 13.5 12.7117 12.575 13.9961 11.3844C15.1992 10.2656 16.0305 8.9375 16.4555 8C16.0305 7.0625 15.1992 5.73438 13.9992 4.61562C12.7117 3.425 11.0367 2.5 8.99922 2.5ZM2.98047 3.51875C4.45234 2.15 6.47422 1 8.99922 1C11.5242 1 13.5461 2.15 15.018 3.51875C16.4805 4.87812 17.4586 6.5 17.9242 7.61562C18.0273 7.8625 18.0273 8.1375 17.9242 8.38437C17.4586 9.5 16.4805 11.125 15.018 12.4812C13.5461 13.85 11.5242 15 8.99922 15C6.47422 15 4.45234 13.85 2.98047 12.4812C1.51797 11.125 0.539844 9.5 0.0773437 8.38437C-0.0257813 8.1375 -0.0257813 7.8625 0.0773437 7.61562C0.539844 6.5 1.51797 4.875 2.98047 3.51875ZM8.99922 10.5C10.3805 10.5 11.4992 9.38125 11.4992 8C11.4992 6.61875 10.3805 5.5 8.99922 5.5C8.97734 5.5 8.95859 5.5 8.93672 5.5C8.97734 5.65938 8.99922 5.82812 8.99922 6C8.99922 7.10313 8.10234 8 6.99922 8C6.82734 8 6.65859 7.97813 6.49922 7.9375C6.49922 7.95937 6.49922 7.97813 6.49922 8C6.49922 9.38125 7.61797 10.5 8.99922 10.5ZM8.99922 4C10.0601 4 11.0775 4.42143 11.8276 5.17157C12.5778 5.92172 12.9992 6.93913 12.9992 8C12.9992 9.06087 12.5778 10.0783 11.8276 10.8284C11.0775 11.5786 10.0601 12 8.99922 12C7.93835 12 6.92094 11.5786 6.17079 10.8284C5.42065 10.0783 4.99922 9.06087 4.99922 8C4.99922 6.93913 5.42065 5.92172 6.17079 5.17157C6.92094 4.42143 7.93835 4 8.99922 4Z" fill="#9CA3AF"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_48_5791">
                      <path d="M0 0H18V16H0V0Z" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="login-forgot-password">
          <Link to="#" className="login-forgot-link">Forgot password?</Link>
        </div>

        <div className="login-signup">
          <span className="login-signup-text">Don't have an account?</span>
          <Link to="/register" className="login-signup-link"> Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

