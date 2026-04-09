import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function OAuthSuccessPage() {
  const [error, setError] = useState("");
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    completeGoogleLogin()
      .then(() => {
        if (active) {
          navigate("/", { replace: true });
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
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
      {error ? <p className="form-message form-message-error">{error}</p> : null}
    </section>
  );
}
