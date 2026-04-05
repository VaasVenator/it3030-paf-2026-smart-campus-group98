import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <section className="auth-card">
      <div className="auth-copy">
        <p className="auth-eyebrow">Welcome back</p>
        <h2>Sign in to your campus workspace</h2>
        <p>
          Access facility bookings, maintenance tickets, and notifications from one place.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Student ID</span>
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

        <button type="submit" className="primary-button">
          {submitting ? "Signing in..." : "Login"}
        </button>
        {error ? <p className="form-message form-message-error">{error}</p> : null}
      </form>

      <p className="auth-footer">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}
