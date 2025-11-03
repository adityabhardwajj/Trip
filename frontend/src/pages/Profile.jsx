import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getErrorMessage } from '../utils/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setProfile(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue });
  };

  const handleSave = async (field) => {
    // In a real application, you would call an API to update the profile
    toast.info('Profile update functionality coming soon');
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-state">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-avatar-container">
            <img 
              src="https://placehold.co/160x160" 
              alt="Profile" 
              className="profile-avatar-img"
            />
            <button className="avatar-edit-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2.06" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.06" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.06" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="profile-name-section">
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="account-section">
          <h2 className="account-title">Account</h2>
          <div className="account-form">
            {/* Name Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Name</label>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    className="field-input"
                    value={editValues.name || profile.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <div className="field-value">{profile.name}</div>
                )}
              </div>
              {editingField === 'name' ? (
                <div className="field-actions">
                  <button onClick={() => handleSave('name')} className="btn-save">Save</button>
                  <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                </div>
              ) : (
                <button onClick={() => handleEdit('name', profile.name)} className="btn-change">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" fill="#3B82F6"/>
                  </svg>
                  Change
                </button>
              )}
            </div>

            {/* Email Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Email</label>
                {editingField === 'email' ? (
                  <input
                    type="email"
                    className="field-input"
                    value={editValues.email || profile.email}
                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <div className="field-value">{profile.email}</div>
                )}
              </div>
              {editingField === 'email' ? (
                <div className="field-actions">
                  <button onClick={() => handleSave('email')} className="btn-save">Save</button>
                  <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                </div>
              ) : (
                <button className="btn-add-email">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="#3B82F6" strokeWidth="1"/>
                    <path d="M8 5V11M5 8H11" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  Add another email
                </button>
              )}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Password</label>
                <div className="field-value password-masked">************</div>
              </div>
              <button onClick={() => handleEdit('password', '')} className="btn-change">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" fill="#3B82F6"/>
                </svg>
                Change
              </button>
            </div>

            {/* Phone Number Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Phone number</label>
                <div className="field-value">+1 000-000-0000</div>
              </div>
            </div>

            {/* Address Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Address</label>
                {editingField === 'address' ? (
                  <input
                    type="text"
                    className="field-input"
                    value={editValues.address || 'St 32 main downtown, Los Angeles, California, USA'}
                    onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <div className="field-value">St 32 main downtown, Los Angeles, California, USA</div>
                )}
              </div>
              {editingField === 'address' ? (
                <div className="field-actions">
                  <button onClick={() => handleSave('address')} className="btn-save">Save</button>
                  <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                </div>
              ) : (
                <button onClick={() => handleEdit('address', 'St 32 main downtown, Los Angeles, California, USA')} className="btn-change">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" fill="#3B82F6"/>
                  </svg>
                  Change
                </button>
              )}
            </div>

            {/* Date of Birth Field */}
            <div className="form-field">
              <div className="field-left">
                <label className="field-label">Date of birth</label>
                <div className="field-value">01-01-1992</div>
              </div>
            </div>

            {/* Account Creation Date Field */}
            {profile.createdAt && (
              <div className="form-field">
                <div className="field-left">
                  <label className="field-label">Account created</label>
                  <div className="field-value">{formatDate(profile.createdAt)}</div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="form-field logout-field">
              <div className="field-left">
                <label className="field-label">Account Actions</label>
                <div className="field-value">Sign out of your account</div>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 14H3.333C2.979 14 2.639 13.86 2.389 13.61C2.139 13.36 2 13.02 2 12.667V3.333C2 2.979 2.139 2.639 2.389 2.389C2.639 2.139 2.979 2 3.333 2H6M11 11.333L14.333 8M14.333 8L11 4.667M14.333 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
