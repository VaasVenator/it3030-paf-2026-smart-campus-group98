import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("request"); // "request" or "reset"
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!userId.trim() || !email.trim()) {
      setError("Please enter both ID and email");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/api/auth/forgot-password", {
        studentId: userId.trim().toUpperCase(),
        email: email.trim()
      }, null);
      setMessage("Password reset code sent to your email. Please check your inbox.");
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resetCode.trim()) {
      setError("Please enter the reset code from your email");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/api/auth/reset-password", {
        studentId: userId.trim().toUpperCase(),
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword
      }, null);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <button 
        type="button" 
        className="back-button"
        onClick={() => navigate("/login")}
        aria-label="Go back to login"
      >
        ← Back to Login
      </button>
      <section className="auth-card">
        <div className="auth-copy">
          <p className="auth-eyebrow">Reset Your Password</p>
          <h2>{step === "request" ? "Recover Your Account" : "Create New Password"}</h2>
          <p>
            {step === "request"
              ? "Enter your ID and email to receive a password reset code."
              : "Enter the code from your email and create a new password."}
          </p>
        </div>

        {step === "request" ? (
          <form className="auth-form" onSubmit={handleRequestReset}>
            <label className="field">
              <span>Student/Admin ID</span>
              <input
                type="text"
                placeholder="IT12345678 or STF00000001"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

            {error && <p className="form-message form-message-error">{error}</p>}
            {message && <p className="form-message form-message-success">{message}</p>}
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <label className="field">
              <span>Reset Code</span>
              <input
                type="text"
                placeholder="Enter code from email"
                value={resetCode}
                onChange={(event) => setResetCode(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>New Password</span>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Confirm Password</span>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {error && <p className="form-message form-message-error">{error}</p>}
            {message && <p className="form-message form-message-success">{message}</p>}

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setStep("request");
                setResetCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setMessage("");
              }}
            >
              Back to ID/Email
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
