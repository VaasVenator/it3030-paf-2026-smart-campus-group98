import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/">
            <h1>Smart Campus Hub</h1>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/" className="header-nav-link">Home</Link>
          <Link to="/about" className="header-nav-link">About Us</Link>
          <Link to="/contact" className="header-nav-link">Contact Us</Link>
          
          {user ? (
            <div className="header-user-menu">
              <Link to="/dashboard" className="header-nav-link">Dashboard</Link>
              <span className="header-user-name">{user.displayName}</span>
              <button onClick={handleLogout} className="header-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="header-auth-links">
              <Link to="/login" className="header-nav-link">Login</Link>
              <Link to="/signup" className="header-signup-link">Sign Up</Link>
            </div>
          )}
        </nav>

        <button 
          className={`header-menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="header-mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="mobile-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
