import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <div className="logo-circle">
              <div className="logo-inner"></div>
            </div>
          </div>
          <span className="logo-text">Argo</span>
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to={isAuthenticated ? "/my-bookings" : "/login"} 
            className={`navbar-link ${isActive('/my-bookings') ? 'active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                navigate('/login');
              }
            }}
          >
            My Bookings
          </Link>
          <Link 
            to={isAuthenticated ? "/profile" : "/login"} 
            className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                navigate('/login');
              }
            }}
          >
            Profile
          </Link>
          <Link 
            to={(isAuthenticated && isAdmin) ? "/admin" : "/login"} 
            className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={(e) => {
              if (!isAuthenticated || !isAdmin) {
                e.preventDefault();
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  toast.error('Admin access required');
                }
              }
            }}
          >
            Admin
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="navbar-user">
              <img 
                src="https://placehold.co/32x32" 
                alt="User" 
                className="user-avatar"
              />
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
