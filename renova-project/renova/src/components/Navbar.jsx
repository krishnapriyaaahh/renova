import { useAuth } from "../context/AuthContext";
import RenovaLogo from "./RenovaLogo";

export default function Navbar({ navigate, logout, activePage, goBack, canGoBack }) {
  const { user } = useAuth();
  const nav = user
    ? [["Dashboard", "dashboard"], ["Opportunities", "recommendations"], ["Roadmap", "roadmap"], ["Community", "community"]]
    : [];

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,248,252,0.82)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(194,24,91,0.08)", padding: "0 40px", display: "flex", alignItems: "center", height: 58, gap: 32 }}>
      {canGoBack && (
        <button className="btn-back" style={{ borderRadius: 3, padding: "6px 12px" }} onClick={goBack}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2L3 6.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div style={{ marginRight: "auto" }}>
        <RenovaLogo size={30} fontSize={21} onClick={() => navigate(user ? "dashboard" : "landing")} />
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {user && (
          <button className="btn-home" onClick={() => navigate("landing")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
        )}
        {nav.map(([l, p]) => (
          <span key={p} className={`nav-item${activePage === p ? " active" : ""}`} onClick={() => navigate(p)}>{l}</span>
        ))}
        {user ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: 8 }}>
            <div onClick={() => navigate("profile")} style={{ width: 32, height: 32, background: "linear-gradient(135deg,#e91e8c,#c2185b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", letterSpacing: 0.5 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <button className="btn-ghost" style={{ borderRadius: 3, fontSize: 12 }} onClick={logout}>Sign Out</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
            <button className="btn-ghost" style={{ borderRadius: 3 }} onClick={() => navigate("login")}>Sign In</button>
            <button className="btn-primary" style={{ borderRadius: 3, padding: "9px 20px" }} onClick={() => navigate("signup")}>Get Started</button>
          </div>
        )}
      </div>
    </nav>
  );
}
