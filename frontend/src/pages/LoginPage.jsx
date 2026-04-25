import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../lib/api";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from ?? "/";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({
        studentId: studentId.trim().toUpperCase(),
        password
      });
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell" style={{ position: "relative", height: "100vh", padding: "1rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Premium ambient background glows */}
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)", borderRadius: "50%", zIndex: 0 }}></div>
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 60%)", borderRadius: "50%", zIndex: 0 }}></div>

      <button 
        type="button" 
        className="back-button"
        onClick={() => navigate("/")}
        aria-label="Go back to home"
        style={{ zIndex: 10 }}
      >
        ← Back
      </button>
      
      <section 
        className="auth-card auth-card-wide" 
        style={{ 
          display: "flex", 
          flexDirection: "row-reverse",
          padding: 0, 
          overflow: "hidden", 
          width: "100%",
          maxWidth: "1200px", 
          zIndex: 1, 
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
        }}
      >
        {/* Form Side */}
        <div style={{ flex: "1 1 50%", padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="auth-copy" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "0.2rem" }}>Sign in</h2>
            <p style={{ color: "var(--text-soft)", fontSize: "0.95rem" }}>
              Access facility bookings, maintenance tickets, and notifications from one place.
            </p>
          </div>

          <style>
            {`
              .premium-login-form .field input { width: 100%; padding: 0.75rem 1rem; }
              .premium-login-form .field { margin-bottom: 0.8rem; }
            `}
          </style>

          <form className="auth-form premium-login-form" onSubmit={handleSubmit} style={{ marginTop: 0 }}>
            <label className="field">
              <span>ID number</span>
              <input
                type="text"
                placeholder="IT12345678"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <button type="submit" className="primary-button" style={{ marginTop: "0.5rem" }}>
              {submitting ? "Signing in..." : "Login"}
            </button>
            {error ? <p className="form-message form-message-error">{error}</p> : null}
          </form>

          <div className="auth-divider" style={{ margin: "1.2rem 0" }}>
            <span>or</span>
          </div>

          <a className="secondary-button google-login-button" href="http://localhost:8080/oauth2/authorization/google" style={{ marginTop: 0 }}>
            Continue with Google
          </a>

          <p className="auth-footer" style={{ marginTop: "1.2rem", textAlign: "center" }}>
            New here? <Link to="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>

        {/* Promo Side */}
        <div 
          className="promo-side"
          style={{ 
            flex: "1 1 50%", 
            background: "linear-gradient(145deg, rgba(15, 23, 34, 0.95), rgba(6, 9, 14, 0.9))", 
            borderRight: "1px solid rgba(255,255,255,0.05)", 
            padding: "2.5rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center", 
            position: "relative", 
            overflow: "hidden" 
          }}
        >
          {/* Top Edge Highlight */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, var(--accent-deep), var(--accent-strong))" }}></div>
          
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--accent-bg)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h3 style={{ fontSize: "1.8rem", color: "var(--text)", marginBottom: "0.5rem", lineHeight: 1.2 }}>
            Welcome to the Hub.
          </h3>
          <p style={{ color: "var(--text-soft)", fontSize: "1rem", lineHeight: 1.5 }}>
            Your portal to an integrated campus experience. Book resources seamlessly and track maintenance effortlessly.
          </p>
          
          <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>Secure</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>End-to-end encrypted sessions</div>
            </div>
            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>Fast</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>Real-time state updates</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
