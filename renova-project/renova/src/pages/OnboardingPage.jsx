import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Field } from "../components/AuthComponents";

const API = process.env.REACT_APP_API_URL || "https://renova-119i-git-main-krishnapriyas-projects-537df4fe.vercel.app/api";

export default function OnboardingPage({ onComplete }) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", years: "", role: "", industry: "", skills: [], confidence: 50, goal: "" });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const steps = ["Personal Info", "Experience", "Your Skills", "Confidence", "Your Goal"];

  const addSkill = e => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      setData(d => ({ ...d, skills: [...d.skills, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          career_break_years: data.years,
          last_role: data.role,
          industry: data.industry,
          skills: data.skills,
          confidence: data.confidence,
          goal: data.goal,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save onboarding");
      }

      // Also update the user's profile with skills and target info
      const profileRes = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          skills: data.skills,
          headline: data.role,
          open_to: data.goal === "flexible" ? ["Flexible / Remote"] : data.goal === "freelance" ? ["Freelance / Consulting"] : ["Full-time"],
          target_roles: data.role ? [data.role] : [],
        }),
      });
      if (!profileRes.ok) {
        console.error("Onboarding profile update failed:", await profileRes.text());
      }

      onComplete();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const content = [
    <div key={0}>
      <h2 className="serif" style={{ fontSize: 30, color: "#1a0a12", marginBottom: 8, fontWeight: 300 }}>Let's start with you</h2>
      <p style={{ color: "#5a3048", marginBottom: 28, fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>Tell us a little about yourself. This helps us personalise everything from the start.</p>
      <Field label="What should we call you?" value={data.name} onChange={v => setData(d => ({ ...d, name: v }))} placeholder="First name" />
      <div style={{ marginBottom: 20 }}>
        <label className="input-label">Career break duration</label>
        <select value={data.years} onChange={e => setData(d => ({ ...d, years: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
          <option value="">Select</option>
          {["Under 1 year", "1–2 years", "2–4 years", "4–6 years", "6+ years"].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>,
    <div key={1}>
      <h2 className="serif" style={{ fontSize: 30, color: "#1a0a12", marginBottom: 8, fontWeight: 300 }}>Your professional background</h2>
      <p style={{ color: "#5a3048", marginBottom: 28, fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>Tell us about your career before your break. Do not downplay it — it carries more weight than you think.</p>
      <Field label="Last role title and company" value={data.role} onChange={v => setData(d => ({ ...d, role: v }))} placeholder="e.g. Marketing Manager at Unilever" />
      <div style={{ marginBottom: 20 }}>
        <label className="input-label">Industry</label>
        <select value={data.industry} onChange={e => setData(d => ({ ...d, industry: e.target.value }))} className="input-field" style={{ cursor: "pointer" }}>
          <option value="">Select</option>
          {["Marketing & Communications", "Finance & Accounting", "Technology", "Healthcare", "Education", "Legal", "Operations", "Design", "Engineering", "Data Science", "Other"].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>,
    <div key={2}>
      <h2 className="serif" style={{ fontSize: 30, color: "#1a0a12", marginBottom: 8, fontWeight: 300 }}>Skills you bring</h2>
      <p style={{ color: "#5a3048", marginBottom: 20, fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>Type a skill and press Enter. Be generous — everything counts here.</p>
      <div style={{ minHeight: 54, display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 14px", background: "rgba(255,255,255,0.65)", border: "1px solid rgba(180,100,130,0.2)", marginBottom: 14 }}>
        {data.skills.map((s, i) => (
          <span key={i} className="tag-chip">
            {s}
            <span style={{ cursor: "pointer", opacity: 0.5 }} onClick={() => setData(d => ({ ...d, skills: d.skills.filter((_, j) => j !== i) }))}>&times;</span>
          </span>
        ))}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addSkill} placeholder={data.skills.length ? "Add more..." : "Type a skill, press Enter"} style={{ border: "none", background: "transparent", fontSize: 14, color: "#2d1a25", minWidth: 150, outline: "none", fontFamily: "'Outfit',sans-serif" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["Leadership", "Strategy", "Analytics", "Writing", "Project Management", "Client Relations"].map(s => (
          <span key={s} className="tag-chip" style={{ cursor: "pointer", opacity: data.skills.includes(s) ? 0.3 : 1 }} onClick={() => !data.skills.includes(s) && setData(d => ({ ...d, skills: [...d.skills, s] }))}>{s}</span>
        ))}
      </div>
    </div>,
    <div key={3}>
      <h2 className="serif" style={{ fontSize: 30, color: "#1a0a12", marginBottom: 8, fontWeight: 300 }}>How confident do you feel?</h2>
      <p style={{ color: "#5a3048", marginBottom: 28, fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>Be honest — this helps us support you in exactly the right way. There is no wrong answer here.</p>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="serif" style={{ fontSize: 64, fontWeight: 300, color: "#c2185b", lineHeight: 1 }}>{data.confidence}</div>
        <div style={{ fontSize: 11, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>out of 100</div>
        <p style={{ fontSize: 14, color: "#5a3048", marginTop: 14, fontWeight: 300 }}>
          {data.confidence < 30 ? "That is completely valid. We will build you up." : data.confidence < 60 ? "You are getting there. Let us work on this together." : data.confidence < 80 ? "Good foundation. Let us turn this into momentum." : "Excellent — let us channel this energy effectively."}
        </p>
      </div>
      <input type="range" min={0} max={100} value={data.confidence} onChange={e => setData(d => ({ ...d, confidence: +e.target.value }))} style={{ width: "100%", background: `linear-gradient(to right, #c2185b ${data.confidence}%, rgba(194,24,91,0.1) ${data.confidence}%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9d6b82", marginTop: 8, letterSpacing: "0.04em" }}>
        <span>Starting fresh</span><span>Fully ready</span>
      </div>
    </div>,
    <div key={4}>
      <h2 className="serif" style={{ fontSize: 30, color: "#1a0a12", marginBottom: 8, fontWeight: 300 }}>What is your goal?</h2>
      <p style={{ color: "#5a3048", marginBottom: 24, fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>Dream clearly. We will build the roadmap to get you there.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["same-role", "Return to a similar role", "Same field, refreshed skills and perspective"],
          ["pivot", "Pivot to a new industry", "Fresh direction with your transferable strengths"],
          ["flexible", "Find flexible or remote work", "Better integration of career and family life"],
          ["leadership", "Step into a leadership role", "That long-overdue, well-deserved leap forward"],
          ["freelance", "Go freelance or consulting", "Full independence on your own terms"],
        ].map(([v, l, d]) => (
          <div key={v} onClick={() => setData(dd => ({ ...dd, goal: v }))} style={{ padding: "16px 18px", border: `1.5px solid ${data.goal === v ? "#c2185b" : "rgba(180,100,130,0.15)"}`, background: data.goal === v ? "rgba(194,24,91,0.04)" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a0a12" }}>{l}</div>
            <div style={{ fontSize: 13, color: "#5a3048", marginTop: 2, fontWeight: 300 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card fu1" style={{ width: "100%", maxWidth: 520, padding: "48px 44px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#9d6b82", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Step {step + 1} of {steps.length}</span>
            <span style={{ fontSize: 11, color: "#c2185b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{steps[step]}</span>
          </div>
          <div style={{ height: 2, background: "rgba(194,24,91,0.08)" }}>
            <div style={{ height: "100%", width: `${((step + 1) / steps.length) * 100}%`, background: "linear-gradient(90deg,#c2185b,#e91e8c)", transition: "width 0.5s ease" }} />
          </div>
        </div>
        <div style={{ minHeight: 320 }}>{content[step]}</div>
        {error && <p style={{ color: "#d32f2f", fontSize: 13, marginTop: 8 }}>{error}</p>}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {step > 0 && <button className="btn-outline" style={{ flex: 1, borderRadius: 3 }} onClick={() => setStep(s => s - 1)}>Back</button>}
          {step < steps.length - 1
            ? <button className="btn-primary" style={{ flex: 1, borderRadius: 3 }} onClick={() => setStep(s => s + 1)}>Continue</button>
            : <button className="btn-primary" style={{ flex: 1, borderRadius: 3, opacity: saving ? 0.6 : 1 }} onClick={handleComplete} disabled={saving}>{saving ? "Saving..." : "Build My Roadmap"}</button>
          }
        </div>
      </div>
    </div>
  );
}
