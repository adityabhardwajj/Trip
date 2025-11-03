import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon-container">
            <div className="register-icon">
              <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_48_5718)">
                  <path d="M22.6078 9C24.2109 9 27 10.3594 27 12C27 13.6875 24.2109 15 22.6078 15H17.1422L12.4313 23.2453C12.1641 23.7141 11.6672 24 11.1281 24H8.49375C7.99687 24 7.63594 23.5219 7.77188 23.0438L10.0688 15H5.25L3.225 17.7C3.08438 17.8875 2.85938 18 2.625 18H0.65625C0.290625 18 0 17.7047 0 17.3438C0 17.2828 0.009375 17.2219 0.0234375 17.1609L1.5 12L0.0234375 6.83906C0.0046875 6.77812 0 6.71719 0 6.65625C0 6.29063 0.295313 6 0.65625 6H2.625C2.85938 6 3.08438 6.1125 3.225 6.3L5.25 9H10.0734L7.77656 0.95625C7.63594 0.478125 7.99687 0 8.49375 0H11.1281C11.6672 0 12.1641 0.290625 12.4313 0.754688L17.1422 9H22.6078Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_48_5718">
                    <path d="M0 0H27V24H0V0Z" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <h2 className="register-title">Create Your Account</h2>
          <p className="register-subtitle">Join us today and get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label className="register-label">Full Name</label>
            <div className="register-input-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="register-input"
                placeholder="Aditya Bhardwaj"
                required
              />
            </div>
          </div>

          <div className="register-form-group">
            <label className="register-label">Email</label>
            <div className="register-input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="register-input"
                placeholder="aditya.bhardwaj@example.com"
                required
              />
            </div>
          </div>

          <div className="register-form-group register-form-group-password">
            <label className="register-label">Password</label>
            <div className="register-input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="register-input"
                placeholder="Choose a strong password"
                required
              />
            </div>
            <p className="register-password-hint">Password must be at least 8 characters long.</p>
          </div>

          <div className="register-form-group">
            <label className="register-label">Confirm Password</label>
            <div className="register-input-wrapper">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="register-input"
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="register-login-link">
          <span className="register-login-text">Already have an account?</span>
          <Link to="/login" className="register-login-link-text"> Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

