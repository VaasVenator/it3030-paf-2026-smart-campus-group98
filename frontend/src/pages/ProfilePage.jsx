import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../auth/AuthContext";

const emptyPasswords = {
  newPassword: "",
  confirmNewPassword: ""
};

export default function ProfilePage() {
  const { user, refreshProfile, updateProfile, deleteAccount } = useAuth();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    ...emptyPasswords
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        ...emptyPasswords
      });
    }
  }, [user]);

  useEffect(() => {
    refreshProfile().catch(() => {
    });
  }, [refreshProfile]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await updateProfile(form);
      setEditing(false);
      setMessage("Profile updated successfully.");
      setForm((current) => ({
        ...current,
        ...emptyPasswords
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete your account permanently?");
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");
    await deleteAccount();
  }

  return (
    <section>
      <PageHeader title="Profile" description="View and manage your user details." />

      <div className="profile-card">
        <div className="profile-hero">
          <button type="button" className="profile-avatar" aria-label="Profile avatar">
            {user?.firstName?.[0] ?? "U"}
          </button>
          <div>
            <h3>{user?.displayName}</h3>
            <p>{user?.studentId ?? user?.email ?? "No student ID linked"}</p>
            <p>{user?.role}</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>ID number</span>
              <input type="text" value={user?.studentId ?? "Google account"} disabled />
            </label>

            <label className="field">
              <span>Email</span>
              <input type="text" value={user?.email ?? "Not available"} disabled />
            </label>

            <label className="field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={updateField}
                disabled={!editing}
              />
            </label>

            <label className="field">
              <span>First name</span>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={updateField}
                disabled={!editing}
              />
            </label>

            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={updateField}
                disabled={!editing}
              />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={updateField}
                disabled={!editing}
                placeholder="Optional"
              />
            </label>

            <label className="field">
              <span>Confirm new password</span>
              <input
                type="password"
                name="confirmNewPassword"
                value={form.confirmNewPassword}
                onChange={updateField}
                disabled={!editing}
                placeholder="Repeat new password"
              />
            </label>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button type="submit" className="primary-button profile-action-button" disabled={busy}>
                  {busy ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setMessage("");
                    setForm({
                      username: user?.username ?? "",
                      firstName: user?.firstName ?? "",
                      lastName: user?.lastName ?? "",
                      ...emptyPasswords
                    });
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="primary-button profile-action-button" onClick={() => setEditing(true)}>
                Edit details
              </button>
            )}

            <button type="button" className="danger-button" onClick={handleDelete} disabled={busy}>
              Delete account
            </button>
          </div>

          {message ? <p className="form-message form-message-success">{message}</p> : null}
          {error ? <p className="form-message form-message-error">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
