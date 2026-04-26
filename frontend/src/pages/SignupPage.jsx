import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const studentIdPattern = /^IT\d{8}$/;

const initialForm = {
  studentId: "",
  username: "",
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  profilePictureUrl: ""
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const nextErrors = {};

    if (!studentIdPattern.test(form.studentId.trim())) {
      nextErrors.studentId = "Student ID must follow the format IT12345678.";
    }

    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  }, [form]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }
 
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
 
    if (file.size > 1024 * 1024) {
      alert("Image must be smaller than 1MB");
      return;
    }
 
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((current) => ({
        ...current,
        profilePictureUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setRequestError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        studentId: form.studentId.trim().toUpperCase(),
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        profilePictureUrl: form.profilePictureUrl.trim()
      });
      navigate("/", { replace: true });
    } catch (errorResponse) {
      setRequestError(errorResponse.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell" style={{ position: "relative", overflow: "hidden" }}>
      {/* Premium ambient background glows */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 60%)", borderRadius: "50%", zIndex: 0 }}></div>
      <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)", borderRadius: "50%", zIndex: 0 }}></div>

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
          flexDirection: "row",
          padding: 0,
          overflow: "hidden",
          width: "100%",
          maxWidth: "1200px",
          zIndex: 1,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
        }}
      >
        {/* Left Side - Form */}
        <div style={{ flex: "1 1 60%", padding: "3.5rem 3rem", display: "flex", flexDirection: "column" }}>
          <div className="auth-copy" style={{ marginBottom: "2rem" }}>
            <p className="auth-eyebrow">Student registration</p>
            <h2 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>Create account</h2>
            <p style={{ color: "var(--text-soft)" }}>
              Join the Smart Campus Hub to manage bookings and tickets.
            </p>
          </div>

          <style>
            {`
              .premium-signup-form .field input { width: 100%; }
              .premium-signup-form .field { margin-bottom: 0.2rem; }
            `}
          </style>

          <form className="auth-form premium-signup-form" onSubmit={handleSubmit} noValidate style={{ marginTop: 0 }}>
            <div className="field-grid">
              <label className="field">
                <span>ID number</span>
                <input
                  type="text"
                  name="studentId"
                  placeholder="IT12345678"
                  value={form.studentId}
                  onChange={updateField}
                />
                {submitted && errors.studentId ? (
                  <small className="field-error">{errors.studentId}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={updateField}
                />
                {submitted && errors.username ? (
                  <small className="field-error">{errors.username}</small>
                ) : null}
              </label>

              <label className="field">
                <span>First name</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={updateField}
                />
                {submitted && errors.firstName ? (
                  <small className="field-error">{errors.firstName}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Last name</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={updateField}
                />
                {submitted && errors.lastName ? (
                  <small className="field-error">{errors.lastName}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={updateField}
                />
                {submitted && errors.password ? (
                  <small className="field-error">{errors.password}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={updateField}
                />
                {submitted && errors.confirmPassword ? (
                  <small className="field-error">{errors.confirmPassword}</small>
                ) : null}
              </label>
 
              <label className="field" style={{ gridColumn: "span 2" }}>
                <span>Profile picture</span>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ 
                      flex: 1,
                      padding: "0.5rem", 
                      border: "1px dashed var(--border)", 
                      borderRadius: "var(--radius)",
                      cursor: "pointer"
                    }}
                  />
                  {form.profilePictureUrl && (
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent-strong)", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
                      <img src={form.profilePictureUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </label>
            </div>

            <button type="submit" className="primary-button" style={{ marginTop: "1.5rem" }}>
              {submitting ? "Creating account..." : "Complete registration"}
            </button>
            {requestError ? <p className="form-message form-message-error">{requestError}</p> : null}
          </form>

          <p className="auth-footer" style={{ marginTop: "auto", paddingTop: "2rem" }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in instead</Link>
          </p>
        </div>

        {/* Right Side - Premium Promo Panel */}
        <div
          className="promo-side"
          style={{
            flex: "1 1 40%",
            background: "linear-gradient(145deg, rgba(20, 28, 41, 0.9), rgba(10, 15, 23, 0.95))",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            padding: "3.5rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Top Edge Highlight */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, var(--accent-strong), var(--accent-deep))" }}></div>

          {/* Subtle Graphic */}
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--accent-bg-strong)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h3 style={{ fontSize: "1.8rem", color: "var(--text)", marginBottom: "1rem", lineHeight: 1.2 }}>
            Your digital campus pass.
          </h3>
          <p style={{ color: "var(--text-soft)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Gain unified access to university resources, IT support systems, and facility management directly from a centralized, real-time dashboard.
          </p>

          <div style={{ marginTop: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", color: "var(--text-soft)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Instant Resource Booking</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", color: "var(--text-soft)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Real-time Issue Tracking</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-soft)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Automated Notifications</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
