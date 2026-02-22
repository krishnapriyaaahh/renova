import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BackBtn from "../components/BackBtn";

const API = process.env.REACT_APP_API_URL || "https://renova-119i.vercel.app/api";

export default function RoadmapPage({ navigate, logout, goBack }) {
  const { token } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [celebrating, setCelebrating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const done = milestones.filter(m => m.done).length;

  const fetchRoadmap = () => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setMilestones((data.roadmap || []).map((m, i) => ({ ...m, displayId: i + 1 })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRoadmap(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const regenerateRoadmap = async () => {
    if (!token) return;
    setRegenerating(true);
    try {
      const res = await fetch(`${API}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMilestones((data.roadmap || []).map((m, i) => ({ ...m, displayId: i + 1 })));
      }
    } catch {}
    setRegenerating(false);
  };

  const toggle = id => {
    const m = milestones.find(m => m.id === id);
    setMilestones(ms => ms.map(m => m.id === id ? { ...m, done: !m.done } : m));
    if (!m.done) { setCelebrating(id); setTimeout(() => setCelebrating(null), 900); }
    // Persist to backend
    fetch(`${API}/roadmap/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  return (
    <div>
      <Navbar navigate={navigate} logout={logout} activePage="roadmap" goBack={goBack} canGoBack={true} />
      <div style={{ padding: "36px 5%", maxWidth: 660, margin: "0 auto" }}>
        <BackBtn goBack={goBack} canGoBack={true} style={{ marginBottom: 24 }} />
        <div className="fu1" style={{ marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: "#c2185b", marginBottom: 16 }} />
          <h1 className="serif" style={{ fontSize: 40, color: "#1a0a12", fontWeight: 300, marginBottom: 6 }}>Your <em style={{ color: "#c2185b" }}>comeback roadmap</em></h1>
          <p style={{ color: "#5a3048", fontSize: 15, fontWeight: 300, marginBottom: 16 }}>One step at a time. You are doing this.</p>
          <button className="btn-outline" style={{ borderRadius: 3, fontSize: 12, padding: "8px 16px", opacity: regenerating ? 0.6 : 1 }} onClick={regenerateRoadmap} disabled={regenerating}>
            {regenerating ? "Regenerating..." : "↻ Regenerate from Profile"}
          </button>
        </div>

        {/* Progress Bar */}
        {milestones.length > 0 && (
        <div className="fu2" style={{ marginBottom: 32, padding: "22px 26px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(194,24,91,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: "#1a0a12", fontSize: 14 }}>{done} of {milestones.length} milestones complete</span>
            <span className="serif" style={{ fontWeight: 600, color: "#c2185b", fontSize: 22 }}>{Math.round((done / milestones.length) * 100)}%</span>
          </div>
          <div style={{ height: 2, background: "rgba(194,24,91,0.08)" }}>
            <div style={{ height: "100%", width: `${(done / milestones.length) * 100}%`, background: "linear-gradient(90deg,#e91e8c,#c2185b)", transition: "width 0.8s ease" }} />
          </div>
        </div>
        )}

        {loading && <p style={{ textAlign: "center", color: "#9d6b82", padding: 40 }}>Loading your roadmap...</p>}

        {!loading && milestones.length === 0 && (
          <p style={{ textAlign: "center", color: "#9d6b82", padding: 40, fontSize: 14 }}>
            Complete onboarding to get your personalized comeback roadmap.
          </p>
        )}

        {/* Timeline */}
        {milestones.length > 0 && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 17, top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, #c2185b, rgba(194,24,91,0.05))" }} />
          {milestones.map((m, i) => (
            <div key={m.id} className="fu1" style={{ display: "flex", gap: 22, marginBottom: 22, position: "relative", animationDelay: `${i * 0.07}s` }}>
              <div
                className="timeline-dot"
                onClick={() => toggle(m.id)}
                style={{ width: 34, height: 34, flexShrink: 0, cursor: "pointer", background: m.done ? "linear-gradient(135deg,#c2185b,#e91e8c)" : "rgba(255,255,255,0.85)", border: m.done ? "none" : "1.5px solid rgba(194,24,91,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: m.done ? "white" : "#c2185b", zIndex: 1, boxShadow: m.done ? "0 4px 14px rgba(194,24,91,0.32)" : "none", transform: celebrating === m.id ? "scale(1.28)" : "scale(1)" }}
              >
                {m.done ? "✓" : m.displayId}
              </div>
              <div className="card" style={{ flex: 1, padding: "18px 22px", opacity: m.done ? 0.58 : 1, transition: "opacity 0.3s" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12", textDecoration: m.done ? "line-through" : "none", marginBottom: 4 }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: "#5a3048", lineHeight: 1.7, fontWeight: 300, marginBottom: 8 }}>{m.description || m.desc}</p>
                <span style={{ fontSize: 11, color: "#9d6b82", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{m.week}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
