import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BackBtn from "../components/BackBtn";
import { CircProg } from "../components/Charts";

const API = process.env.REACT_APP_API_URL || "https://renova-119i-git-main-krishnapriyas-projects-537df4fe.vercel.app/api";

export default function RecommendationsPage({ navigate, logout, goBack }) {
  const { token } = useAuth();
  const [tab, setTab] = useState("direct");
  const [expanded, setExpanded] = useState(null);
  const [saved, setSaved] = useState([]); // dynamic IDs of saved roles
  const [savedIdMap, setSavedIdMap] = useState({}); // dynamicId → real UUID
  const [recommendations, setRecommendations] = useState({ direct: [], adjacent: [], replacement: [] });
  const [loading, setLoading] = useState(true);
  const tabs = [["direct", "Direct Comeback"], ["adjacent", "Adjacent Roles"], ["replacement", "New Horizons"]];

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setRecommendations(data.recommendations || { direct: [], adjacent: [], replacement: [] });
        const ids = [];
        const idMap = {};
        Object.values(data.recommendations || {}).forEach(cat => {
          cat.forEach(r => {
            if (r.saved) {
              ids.push(r.id);
              if (r.savedId) idMap[r.id] = r.savedId;
            }
          });
        });
        setSaved(ids);
        setSavedIdMap(idMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const toggleSave = (role) => {
    const isSaved = saved.includes(role.id);
    if (isSaved) {
      // Unsave using the real UUID
      const realId = savedIdMap[role.id] || role.savedId;
      if (realId) {
        fetch(`${API}/recommendations/${realId}/save`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      setSaved(s => s.filter(x => x !== role.id));
      setSavedIdMap(m => { const copy = { ...m }; delete copy[role.id]; return copy; });
    } else {
      // Save — send role data, get real UUID back
      fetch(`${API}/recommendations/${role.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: role.title, company: role.company, match: role.match, salary: role.salary, type: role.type, desc: role.desc, gap: role.gap, category: tab }),
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (data.savedId) setSavedIdMap(m => ({ ...m, [role.id]: data.savedId }));
        })
        .catch(() => {});
      setSaved(s => [...s, role.id]);
    }
  };

  const roles = recommendations[tab] || [];

  return (
    <div>
      <Navbar navigate={navigate} logout={logout} activePage="recommendations" goBack={goBack} canGoBack={true} />
      <div style={{ padding: "36px 5%", maxWidth: 920, margin: "0 auto" }}>
        <BackBtn goBack={goBack} canGoBack={true} style={{ marginBottom: 24 }} />
        <div className="fu1" style={{ marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: "#c2185b", marginBottom: 16 }} />
          <h1 className="serif" style={{ fontSize: 40, color: "#1a0a12", fontWeight: 300, marginBottom: 6 }}>Your matched <em style={{ color: "#c2185b" }}>opportunities</em></h1>
          <p style={{ color: "#5a3048", fontSize: 15, fontWeight: 300 }}>AI-curated roles based on your experience, skills, and goals.</p>
        </div>

        {loading && <p style={{ textAlign: "center", color: "#9d6b82", padding: 40 }}>Loading recommendations...</p>}

        {!loading && (
        <>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(194,24,91,0.1)", marginBottom: 32 }} className="fu2">
          {tabs.map(([k, l]) => (
            <div key={k} onClick={() => setTab(k)} style={{ padding: "13px 24px", cursor: "pointer", fontSize: 14, fontWeight: tab === k ? 600 : 400, color: tab === k ? "#c2185b" : "#6b3550", borderBottom: tab === k ? "2px solid #c2185b" : "2px solid transparent", marginBottom: -1, transition: "all 0.2s" }}>{l}</div>
          ))}
        </div>

        {/* Role Cards */}
        {roles.map((role, i) => (
          <div key={role.id} className="role-row" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ padding: "24px 0", display: "flex", alignItems: "center", gap: 20 }} onClick={() => setExpanded(expanded === role.id ? null : role.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a0a12" }}>{role.title}</h3>
                  <span style={{ fontSize: 12, color: "#9d6b82" }}>at {role.company}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", background: "rgba(194,24,91,0.07)", padding: "3px 10px", letterSpacing: "0.05em" }}>{role.match}% MATCH</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#5a3048", fontWeight: 300 }}>
                  <span>{role.salary}</span>
                  <span style={{ color: "rgba(194,24,91,0.3)" }}>|</span>
                  <span>{role.type}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 46, height: 46 }}>
                  <CircProg value={role.match} size={46} sw={4} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#c2185b" }}>{role.match}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded === role.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: "#9d6b82" }}>
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            {expanded === role.id && (
              <div style={{ paddingBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#5a3048", lineHeight: 1.85, marginBottom: 18, fontWeight: 300 }}>{role.desc}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Skills gaps to close</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {role.gap.map(g => <span key={g} className="tag-chip" style={{ background: "rgba(245,158,11,0.07)", color: "#b45309", borderColor: "rgba(245,158,11,0.18)" }}>{g}</span>)}
                </div>

                {/* ─── Workshop Links ─────────────────────────── */}
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Relevant Courses &amp; Workshops</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                  {[
                    { name: "Coursera", url: `https://www.coursera.org/search?query=${encodeURIComponent(role.title)}` },
                    { name: "LinkedIn Learning", url: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(role.title)}` },
                    { name: "Udemy", url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(role.title)}` },
                    { name: "edX", url: `https://www.edx.org/search?q=${encodeURIComponent(role.title)}` },
                  ].map(w => (
                    <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 12, fontWeight: 500, color: "#c2185b", background: "rgba(194,24,91,0.04)", border: "1px solid rgba(194,24,91,0.15)", textDecoration: "none", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(194,24,91,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(194,24,91,0.04)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      {w.name}
                    </a>
                  ))}
                  {role.gap.length > 0 && (
                    <a href={`https://www.coursera.org/search?query=${encodeURIComponent(role.gap.slice(0,2).join(" "))}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", fontSize: 12, fontWeight: 500, color: "#b45309", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", textDecoration: "none", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.05)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      Skill-Gap: {role.gap.slice(0,2).join(", ")}
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-primary" style={{ borderRadius: 3, padding: "10px 22px", fontSize: 13 }} onClick={() => toggleSave(role)}>
                    {saved.includes(role.id) ? "Saved ✓" : "Save to List"}
                  </button>
                  <button className="btn-outline" style={{ borderRadius: 3, padding: "9px 18px", fontSize: 13 }}>Close Skill Gaps</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {roles.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#9d6b82", padding: 40, fontSize: 14 }}>
            Complete your profile and add skills to get personalized recommendations.
          </p>
        )}
        </>
        )}
      </div>
    </div>
  );
}
