import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { CircProg, MiniLine, Radar } from "../components/Charts";

const API = "http://localhost:5000/api";

export default function DashboardPage({ navigate, logout, goBack }) {
  const { user, token } = useAuth();
  const [m, setM] = useState({
    comebackScore: 0,
    confidenceHistory: [20],
    skillsData: [],
    appsSent: 0,
    profileStrength: 0,
  });
  const [roadmap, setRoadmap] = useState([]);
  const [reminder, setReminder] = useState("");
  const [, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/dashboard/metrics`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/roadmap`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/dashboard/reminder`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
    ]).then(([metricsData, roadmapData, reminderData]) => {
      if (metricsData?.metrics) {
        setM({
          comebackScore: metricsData.metrics.comebackScore || 0,
          confidenceHistory: metricsData.metrics.confidenceHistory || [20],
          skillsData: metricsData.metrics.skillsData || [],
          appsSent: metricsData.metrics.appsSent || 0,
          profileStrength: metricsData.metrics.profileStrength || 0,
        });
      }
      if (roadmapData?.roadmap) setRoadmap(roadmapData.roadmap.slice(0, 5));
      if (reminderData?.reminder) setReminder(reminderData.reminder);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const confStart = m.confidenceHistory[0] || 20;
  const confNow = m.confidenceHistory[m.confidenceHistory.length - 1] || 20;
  const confGrowth = confStart > 0 ? Math.round(((confNow - confStart) / confStart) * 100) : 0;

  return (
    <div>
      <Navbar navigate={navigate} logout={logout} activePage="dashboard" goBack={goBack} canGoBack={false} />
      <div style={{ padding: "36px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <div className="fu1" style={{ marginBottom: 36 }}>
          <div style={{ width: 32, height: 1, background: "#c2185b", marginBottom: 16 }} />
          <h1 className="serif" style={{ fontSize: 42, color: "#1a0a12", fontWeight: 300, marginBottom: 6 }}>
            Welcome back, <em style={{ color: "#c2185b" }}>{user?.name}</em>
          </h1>
          <p style={{ color: "#5a3048", fontSize: 16, fontWeight: 300 }}>You are making real progress. Keep going — your comeback is happening.</p>
        </div>

        {/* Top Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="card metric-hover fu1" style={{ padding: 28, textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Comeback Score</p>
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 12px" }}>
              <CircProg value={m.comebackScore} size={100} sw={8} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span className="serif" style={{ fontSize: 30, fontWeight: 600, color: "#c2185b" }}>{m.comebackScore}</span>
                <span style={{ fontSize: 10, color: "#9d6b82" }}>/ 100</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#5a3048", fontWeight: 300 }}>Strong momentum</p>
          </div>

          <div className="card metric-hover fu2" style={{ padding: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Confidence Growth</p>
            <MiniLine data={m.confidenceHistory} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#5a3048" }}>
              <span>Start: {confStart}</span><span style={{ color: "#c2185b", fontWeight: 600 }}>Now: {confNow} {confGrowth > 0 ? `+${confGrowth}%` : ""}</span>
            </div>
          </div>

          <div className="card metric-hover fu3" style={{ padding: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>This Week</p>
            {[["Applications Sent", `${m.appsSent} of 5`, `${Math.min(100, (m.appsSent / 5) * 100)}%`], ["Profile Strength", `${m.profileStrength}%`, `${m.profileStrength}%`]].map(([l, v, w]) => (
              <div key={l} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#5a3048" }}>{l}</span>
                  <span style={{ fontWeight: 600, color: "#1a0a12", fontSize: 13 }}>{v}</span>
                </div>
                <div style={{ height: 2, background: "rgba(194,24,91,0.08)" }}>
                  <div style={{ height: "100%", width: w, background: "linear-gradient(90deg,#e91e8c,#c2185b)", transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Roadmap */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="card metric-hover fu2" style={{ padding: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Skills Radar</p>
            <div style={{ display: "flex", justifyContent: "center" }}><Radar data={m.skillsData} /></div>
          </div>
          <div className="card metric-hover fu3" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase" }}>Roadmap</p>
              <span style={{ fontSize: 13, color: "#c2185b", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("roadmap")}>View All</span>
            </div>
            {roadmap.slice(0, 5).map((item, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
                <div style={{ width: 22, height: 22, background: item.done ? "#c2185b" : "rgba(194,24,91,0.07)", border: item.done ? "none" : "1px solid rgba(194,24,91,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: item.done ? "white" : "#c2185b", fontWeight: 700, flexShrink: 0 }}>
                  {item.done ? "✓" : idx + 1}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: item.done ? 400 : 600, color: item.done ? "#9d6b82" : "#1a0a12", textDecoration: item.done ? "line-through" : "none" }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: "#9d6b82" }}>{item.week}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Reminder */}
        <div className="card fu4" style={{ padding: 32, borderLeft: "2px solid #c2185b" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Today's Reminder</p>
          <p className="serif" style={{ fontSize: 20, color: "#2d1a25", fontStyle: "italic", fontWeight: 300, lineHeight: 1.7 }}>
            "{reminder || "Your career break did not erase your experience — it added to it. You have grown in ways that do not fit on a CV, and that makes you more capable than you know."}"
          </p>
        </div>
      </div>
    </div>
  );
}
