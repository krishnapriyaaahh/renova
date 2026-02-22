import { useState } from "react";
import BackBtn from "./BackBtn";

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, type = "text", value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="input-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field"
          style={{ paddingRight: isPass ? 42 : 15 }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9d6b82", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
            {show ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
export function PwStrength({ pw }) {
  const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/].filter(r => r.test(pw)).length;
  const colors = ["", "#ef4444", "#f59e0b", "#10b981", "#059669"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!pw) return null;
  return (
    <div style={{ marginBottom: 16, marginTop: -8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 2, background: i <= score ? colors[score] : "rgba(0,0,0,0.07)", transition: "all 0.3s" }} />)}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: colors[score], letterSpacing: "0.06em", textTransform: "uppercase" }}>{labels[score]}</span>
    </div>
  );
}

// ─── Auth Wrapper Layout ──────────────────────────────────────────────────────
export function AuthWrap({ title, sub, navigate, goBack, canGoBack, altText, altAction, altLabel, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <BackBtn goBack={goBack} canGoBack={canGoBack} style={{ marginBottom: 28 }} />
          <div style={{ marginBottom: 36 }}>
            <span className="serif" style={{ fontSize: 24, color: "#8b0039", fontWeight: 600 }}>Renova</span>
            <h1 className="serif" style={{ fontSize: 36, color: "#1a0a12", marginTop: 20, marginBottom: 8, fontWeight: 300, lineHeight: 1.2 }}>{title}</h1>
            <p style={{ fontSize: 15, color: "#5a3048", fontWeight: 300 }}>{sub}</p>
          </div>
          {children}
          <p style={{ fontSize: 13, color: "#5a3048", marginTop: 24, textAlign: "center" }}>
            {altText}{" "}<span style={{ color: "#c2185b", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate(altAction)}>{altLabel}</span>
          </p>
        </div>
      </div>
      <div style={{ width: "42%", background: "linear-gradient(160deg, #fce8f3, #f9d5e9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, position: "relative", overflow: "hidden" }}>
        <div className="morph" style={{ position: "absolute", top: "-20%", right: "-20%", width: 400, height: 400, background: "rgba(194,24,91,0.07)" }} />
        <p className="serif" style={{ fontSize: 34, color: "#8b0039", fontWeight: 300, fontStyle: "italic", lineHeight: 1.4, textAlign: "center" }}>"Every great comeback<br />starts with a single step."</p>
        <div style={{ width: 32, height: 1, background: "rgba(194,24,91,0.35)", margin: "24px auto 0" }} />
      </div>
    </div>
  );
}
