import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🩸</span>
        <span className="brand-text">RedPint</span>
      </Link>

      <div className="navbar-links">
        {user && profile ? (
          <>
            <Link to={role === 'donor' ? '/donor/dashboard' : '/hospital/dashboard'}>
              Dashboard
            </Link>
            <Link to="/notifications">
              Notifications
            </Link>
            <span className="navbar-user">{profile.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
