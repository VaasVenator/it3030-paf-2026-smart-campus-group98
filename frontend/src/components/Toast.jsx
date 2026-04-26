import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClear }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClear, 400); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClear]);

  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      zIndex: 9999,
      padding: "1rem 1.5rem",
      borderRadius: "16px",
      background: type === "error" ? "var(--danger)" : "var(--accent)",
      color: "#06090e",
      fontWeight: 600,
      boxShadow: "0 10px 25px rgba(0,0,0,0.3), 0 0 20px rgba(94, 234, 212, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transform: visible ? "translateY(0)" : "translateY(100px)",
      opacity: visible ? 1 : 0,
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      pointerEvents: "none"
    }}>
      <span style={{ fontSize: "1.2rem" }}>{type === "error" ? "✕" : "✓"}</span>
      <span>{message}</span>
    </div>
  );
}
