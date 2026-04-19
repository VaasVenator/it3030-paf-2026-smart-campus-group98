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
  confirmPassword: ""
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
        confirmPassword: form.confirmPassword
      });
      navigate("/", { replace: true });
    } catch (errorResponse) {
      setRequestError(errorResponse.message);
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
      <section className="auth-card auth-card-wide">
      <div className="auth-copy">
        <p className="auth-eyebrow">Student registration</p>
        <h2>Create your Smart Campus account</h2>
        <p>
          Use your SLIIT-style student ID and create a secure password to get started.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              placeholder="username"
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
              placeholder="First name"
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
              placeholder="Last name"
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
              placeholder="Minimum 8 characters"
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
        </div>

        <button type="submit" className="primary-button">
          {submitting ? "Creating account..." : "Sign up"}
        </button>
        {requestError ? <p className="form-message form-message-error">{requestError}</p> : null}
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Go to login</Link>
      </p>
    </section>    </div>  );
}
