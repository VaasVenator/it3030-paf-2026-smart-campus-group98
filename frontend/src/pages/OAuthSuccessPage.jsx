import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OAuthSuccessPage() {
  const [error, setError] = useState("");
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    console.log("OAuthSuccessPage: Starting session completion...");

    // Fallback: If session check hangs, redirect after 5 seconds
    const timeout = setTimeout(() => {
      if (active) {
        console.warn("OAuthSuccessPage: Session check timed out, redirecting to home...");
        navigate("/", { replace: true });
      }
    }, 5000);

    completeGoogleLogin()
      .then((user) => {
        if (active) {
          console.log("OAuthSuccessPage: Session verified for user:", user?.username);
          clearTimeout(timeout);
          navigate("/", { replace: true });
        }
      })
      .catch((requestError) => {
        if (active) {
          console.error("OAuthSuccessPage: Failed to complete login:", requestError);
          setError(requestError.message);
          clearTimeout(timeout);
          
          // If it's a 401 but we got here, maybe the cookie is missing.
          // We still want to let them try to go home after a bit.
          setTimeout(() => navigate("/login"), 3000);
        }
      });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [completeGoogleLogin, navigate]);

  return (
    <section className="auth-card">
      <div className="auth-copy">
        <p className="auth-eyebrow">Google sign-in</p>
        <h2>Finishing your sign-in</h2>
        <p>
          We are linking your Google account to Smart Campus Hub and loading your workspace.
        </p>
      </div>
      {error ? (
        <div style={{ marginTop: "1rem" }}>
          <p className="form-message form-message-error">{error}</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Redirecting you back to login...
          </p>
        </div>
      ) : (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
          <div className="loading-spinner" />
        </div>
      )}
    </section>
  );
}
