import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../lib/api";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState("student"); // "student" or "admin"
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
    <div className="auth-shell">
      <button 
        type="button" 
        className="back-button"
        onClick={() => navigate("/")}
        aria-label="Go back to home"
      >
        ← Back
      </button>
      <section className="auth-card">
      <div className="auth-copy">
        <p className="auth-eyebrow">Welcome back</p>
        <h2>Sign in to your campus workspace</h2>
        <p>
          Access facility bookings, maintenance tickets, and notifications from one place.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="login-mode-toggle">
          <button
            type="button"
            className={`login-mode-button ${loginMode === "student" ? "active" : ""}`}
            onClick={() => setLoginMode("student")}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`login-mode-button ${loginMode === "admin" ? "active" : ""}`}
            onClick={() => setLoginMode("admin")}
          >
            Admin Login
          </button>
        </div>

        <label className="field">
          <span>{loginMode === "admin" ? "Admin ID" : "Student ID"}</span>
          <input
            type="text"
            placeholder={loginMode === "admin" ? "STF00000001" : "IT12345678"}
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

        <button type="submit" className="primary-button">
          {submitting ? "Signing in..." : "Login"}
        </button>
        {error ? <p className="form-message form-message-error">{error}</p> : null}
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <a className="secondary-button google-login-button" href={`${API_BASE_URL}/oauth2/authorization/google`}>
        Continue with Google
      </a>

      <p className="auth-footer">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
    </div>
  );
}
