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
            <div className="header-user-menu" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Link to="/dashboard" className="header-nav-link">Dashboard</Link>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-bg-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-strong)", border: "1px solid var(--border-strong)", overflow: "hidden" }}>
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  user.firstName?.[0] ?? "U"
                )}
              </div>
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
