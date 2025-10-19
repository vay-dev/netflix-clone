import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Upload, Heart, Home } from 'lucide-react';
import './styles/navbar.scss';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">FilmFlare</span>
        </Link>

        <div className="navbar__menu">
          <Link to="/" className="navbar__link">
            <Home size={18} />
            <span>Home</span>
          </Link>

          {isAuthenticated && (
            <Link to="/favorites" className="navbar__link">
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/upload" className="navbar__link navbar__link--admin">
              <Upload size={18} />
              <span>Upload Video</span>
            </Link>
          )}
        </div>

        <div className="navbar__user">
          {isAuthenticated ? (
            <>
              <div className="navbar__profile">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.username}
                    className="navbar__avatar"
                  />
                ) : (
                  <div className="navbar__avatar navbar__avatar--default">
                    <User size={20} />
                  </div>
                )}
                <div className="navbar__user-info">
                  <span className="navbar__username">{user?.username}</span>
                  {isAdmin && <span className="navbar__badge">Admin</span>}
                </div>
              </div>
              <button onClick={logout} className="navbar__logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="navbar__link">
                Login
              </Link>
              <Link to="/register" className="navbar__link navbar__link--primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
