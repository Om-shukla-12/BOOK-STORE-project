import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BookStore
        </Link>

        <div className="navbar-links">
          <Link to="/books" className="nav-link">Books</Link>
          {isAuthenticated && (
            <>
              <Link to="/cart" className="nav-link">Cart</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="button button-secondary">
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="button button-secondary">Login</Link>
              <Link to="/register" className="button button-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 