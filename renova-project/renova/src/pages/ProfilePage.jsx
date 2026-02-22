import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BackBtn from "../components/BackBtn";
import { MiniLine } from "../components/Charts";

const API = process.env.REACT_APP_API_URL || "https://renova-119i-git-main-krishnapriyas-projects-537df4fe.vercel.app/api";

const banners = [
  "linear-gradient(135deg, #fce8f3, #e91e8c 60%, #c2185b)",
  "linear-gradient(135deg, #1a0a12, #4a1030 50%, #c2185b)",
  "linear-gradient(135deg, #fce8f3, #f9a8d4 40%, #fce8f3)",
  "linear-gradient(160deg, #c2185b, #e91e8c 40%, #f9a8d4)",
];

// Empty profile template — no dummy data
const emptyProfile = {
  name: "",
  headline: "",
  location: "",
  website: "",
  about: "",
  careerBreak: "",
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  achievements: [],
  volunteering: [],
  languages: [],
  openTo: [],
  targetRoles: [],
};

function Chip({ children, onRemove, editing }) {
  return (
    <span className="tag-chip">
      {children}
      {onRemove && editing && <span style={{ cursor: "pointer", opacity: 0.45, marginLeft: 2 }} onClick={onRemove}>&times;</span>}
    </span>
  );
}

function Sec({ label, children }) {
  return (
    <div className="profile-section">
      <div className="sec-label">{label}</div>
      {children}
    </div>
  );
}

export default function ProfilePage({ navigate, logout, goBack }) {
  const { user, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [p, setP] = useState({ ...emptyProfile, name: user?.name || "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [confidenceHistory, setConfidenceHistory] = useState([]);
  const [savedOpps, setSavedOpps] = useState([]);
  const [savedExpanded, setSavedExpanded] = useState(null);
  const [savedLoading, setSavedLoading] = useState(false);

  // Avatar & Banner state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // CV Analysis state
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [cvFileName, setCvFileName] = useState("");
  const [cvFileUrl, setCvFileUrl] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvDragOver, setCvDragOver] = useState(false);
  const cvInputRef = useRef(null);

  // Load saved opportunities
  const loadSaved = useCallback(async () => {
    if (!token) return;
    setSavedLoading(true);
    try {
      const res = await fetch(`${API}/recommendations/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { saved } = await res.json();
        setSavedOpps(saved || []);
      }
    } catch (err) { console.error("Failed to load saved:", err); }
    setSavedLoading(false);
  }, [token]);

  const removeSaved = async (recId) => {
    try {
      await fetch(`${API}/recommendations/${recId}/save`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedOpps(prev => prev.filter(s => s.recommendation_id !== recId));
    } catch {}
  };

  // Load profile from backend on mount
  const loadProfile = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { profile } = await res.json();
        setP({
          name: profile.name || user?.name || "",
          headline: profile.headline || "",
          location: profile.location || "",
          website: profile.website || "",
          about: profile.about || "",
          careerBreak: profile.career_break || "",
          experience: (profile.experience || []).map(e => ({
            id: e.id, title: e.title, company: e.company, location: e.location || "",
            start: e.start_date || "", end: e.end_date || "", current: e.is_current || false, desc: e.description || "",
          })),
          education: (profile.education || []).map(e => ({
            id: e.id, institution: e.institution, degree: e.degree, years: e.years || "", grade: e.grade || "",
          })),
          certifications: (profile.certifications || []).map(c => ({
            id: c.id, name: c.name, issuer: c.issuer, year: c.year || "",
          })),
          skills: profile.skills || [],
          achievements: (profile.achievements || []).map(a => ({
            id: a.id, title: a.title, org: a.org || "", year: a.year || "", desc: a.description || "",
          })),
          volunteering: (profile.volunteering || []).map(v => ({
            id: v.id, org: v.org, role: v.role || "", years: v.years || "", desc: v.description || "",
          })),
          languages: (profile.languages || []).map(l => ({
            id: l.id, name: l.name, level: l.level || "",
          })),
          openTo: profile.open_to || [],
          targetRoles: profile.target_roles || [],
        });
        setBannerIdx(profile.banner_index || 0);
        setAvatarUrl(profile.avatar_url || "");
        setBannerUrl(profile.banner_url || "");
      }
    } catch (err) { console.error("Failed to load profile:", err); }

    // Load CV analysis
    try {
      const res = await fetch(`${API}/profile/cv-analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { analysis } = await res.json();
        if (analysis) {
          setCvAnalysis(analysis);
          setCvFileName(analysis.file_name || "");
          setCvFileUrl(analysis.file_url || "");
        }
      }
    } catch (err) { console.error("Failed to load CV analysis:", err); }

    // Load confidence history
    try {
      const res = await fetch(`${API}/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { metrics } = await res.json();
        setConfidenceHistory(metrics?.confidenceHistory || []);
      }
    } catch {}

    setLoading(false);
  }, [token, user?.name]);

  useEffect(() => { loadProfile(); loadSaved(); }, [loadProfile, loadSaved]);

  // Save profile to backend
  const saveProfile = async () => {
    if (!token) {
      setSaveMsg("Not signed in. Please log in first.");
      console.error("saveProfile: no token available");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      // Save top-level profile fields
      const profileRes = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: p.name,
          headline: p.headline,
          location: p.location,
          website: p.website,
          about: p.about,
          career_break: p.careerBreak,
          skills: p.skills,
          open_to: p.openTo,
          target_roles: p.targetRoles,
          banner_index: bannerIdx,
        }),
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${profileRes.status}`);
      }

      // Save sub-sections: for each, delete removed + add new + update existing
      const subSections = [
        { key: "experience", fields: (e) => ({ title: e.title, company: e.company, location: e.location, start_date: e.start, end_date: e.end, is_current: e.current, description: e.desc }) },
        { key: "education", fields: (e) => ({ institution: e.institution, degree: e.degree, years: e.years, grade: e.grade }) },
        { key: "certifications", fields: (c) => ({ name: c.name, issuer: c.issuer, year: c.year }) },
        { key: "achievements", fields: (a) => ({ title: a.title, org: a.org, year: a.year, description: a.desc }) },
        { key: "volunteering", fields: (v) => ({ org: v.org, role: v.role, years: v.years, description: v.desc }) },
        { key: "languages", fields: (l) => ({ name: l.name, level: l.level }) },
      ];

      for (const section of subSections) {
        for (const item of p[section.key]) {
          const body = section.fields(item);
          // If it's a new item (numeric id from Date.now()), create it; otherwise update
          if (typeof item.id === "number") {
            const res = await fetch(`${API}/profile/${section.key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            });
            if (res.ok) {
              const { data } = await res.json();
              item.id = data.id; // Replace temp id with real UUID
            } else {
              console.error(`Failed to save ${section.key} item:`, await res.text());
            }
          } else {
            const res = await fetch(`${API}/profile/${section.key}/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              console.error(`Failed to update ${section.key}/${item.id}:`, await res.text());
            }
          }
        }
      }

      setSaveMsg("Profile saved! Roadmap & recommendations updated.");

      // Regenerate roadmap based on updated profile
      fetch(`${API}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }).catch(() => {});

      setTimeout(() => setSaveMsg(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMsg(err.message || "Failed to save. Try again.");
    }
    setSaving(false);
  };

  const handleEditToggle = async () => {
    if (editing) {
      await saveProfile();
    }
    setEditing(!editing);
  };

  const up = (k, v) => setP(pp => ({ ...pp, [k]: v }));
  const upArr = (k, id, f, v) => setP(pp => ({ ...pp, [k]: pp[k].map(x => x.id === id ? { ...x, [f]: v } : x) }));
  const addArr = (k, item) => setP(pp => ({ ...pp, [k]: [...pp[k], item] }));
  const rmArr = (k, id) => {
    // Delete from backend if it has a UUID id
    if (typeof id === "string" && token) {
      fetch(`${API}/profile/${k}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setP(pp => ({ ...pp, [k]: pp[k].filter(x => x.id !== id) }));
  };

  // ─── Avatar Upload ──────────────────────────────────────────────────────────
  const handleAvatarUpload = async (file) => {
    if (!file || !token) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setSaveMsg("Please upload a JPG, PNG, GIF, or WebP image.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API}/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const { avatar_url } = await res.json();
        setAvatarUrl(avatar_url);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMsg(err.error || "Failed to upload avatar.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setSaveMsg("Failed to upload avatar.");
    }
    setUploadingAvatar(false);
  };

  // ─── Banner Upload ─────────────────────────────────────────────────────────
  const handleBannerUpload = async (file) => {
    if (!file || !token) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setSaveMsg("Please upload a JPG, PNG, GIF, or WebP image.");
      return;
    }
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const res = await fetch(`${API}/profile/banner`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const { banner_url } = await res.json();
        setBannerUrl(banner_url);
        setBannerIdx(-1); // -1 means custom banner image
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMsg(err.error || "Failed to upload banner.");
      }
    } catch (err) {
      console.error("Banner upload error:", err);
      setSaveMsg("Failed to upload banner.");
    }
    setUploadingBanner(false);
  };

  // ─── CV Upload & Analyze ───────────────────────────────────────────────────
  const handleCvUpload = async (file) => {
    if (!file || !token) return;
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setSaveMsg("Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }
    setUploadingCv(true);
    setCvFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch(`${API}/profile/cv-analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCvAnalysis(data.analysis);
        setCvFileUrl(data.file_url);
        setCvFileName(data.file_name);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMsg(err.error || "Failed to analyze CV.");
      }
    } catch (err) {
      console.error("CV upload error:", err);
      setSaveMsg("Failed to upload CV.");
    }
    setUploadingCv(false);
  };

  const handleCvDrop = (e) => {
    e.preventDefault();
    setCvDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleCvUpload(file);
  };

  return (
    <div>
      <Navbar navigate={navigate} logout={logout} activePage="profile" goBack={goBack} canGoBack={true} />
      <div style={{ maxWidth: 820, margin: "0 auto", paddingBottom: 60 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9d6b82" }}>
            <p style={{ fontSize: 15 }}>Loading your profile...</p>
          </div>
        )}
        <BackBtn goBack={goBack} canGoBack={true} style={{ margin: "20px 40px 0", display: "inline-flex" }} />

        {/* Banner */}
        <div style={{
          height: 172,
          background: bannerIdx === -1 && bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : banners[bannerIdx],
          position: "relative",
          marginTop: 12,
        }}>
          {editing && (
            <div style={{ position: "absolute", bottom: 12, right: 16, display: "flex", gap: 8, alignItems: "center", zIndex: 10 }}>
              {banners.map((_, i) => (
                <div key={i} onClick={() => { setBannerIdx(i); }} style={{ width: 20, height: 20, background: banners[i], border: `2px solid ${bannerIdx === i ? "white" : "transparent"}`, cursor: "pointer" }} />
              ))}
              <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleBannerUpload(e.target.files[0]); }} />
              <div
                onClick={() => bannerInputRef.current?.click()}
                style={{
                  width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  background: bannerIdx === -1 ? "white" : "rgba(255,255,255,0.5)",
                  border: `2px solid ${bannerIdx === -1 ? "#c2185b" : "transparent"}`,
                  cursor: "pointer", fontSize: 13, color: "#c2185b", fontWeight: 700,
                }}
                title="Upload custom banner"
              >
                {uploadingBanner ? "…" : "📷"}
              </div>
            </div>
          )}
        </div>

        {/* Avatar & Edit Button */}
        <div style={{ padding: "0 40px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -42 }}>
            <div style={{ position: "relative" }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{ width: 84, height: 84, objectFit: "cover", border: "4px solid white", boxShadow: "0 4px 20px rgba(194,24,91,0.2)", display: "block" }}
                />
              ) : (
                <div style={{ width: 84, height: 84, background: "linear-gradient(135deg,#e91e8c,#c2185b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 300, color: "white", border: "4px solid white", boxShadow: "0 4px 20px rgba(194,24,91,0.2)", fontFamily: "'Cormorant Garamond',serif" }}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
              )}
              {editing && (
                <>
                  <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleAvatarUpload(e.target.files[0]); }} />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      position: "absolute", bottom: -2, right: -2, width: 28, height: 28,
                      background: "#c2185b", borderRadius: "50%", border: "2px solid white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, color: "white",
                    }}
                    title="Upload profile picture"
                  >
                    {uploadingAvatar ? "…" : "📷"}
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saveMsg && <span style={{ fontSize: 12, color: saveMsg.includes("Failed") ? "#d32f2f" : "#2e7d32", fontWeight: 500 }}>{saveMsg}</span>}
              <button className={editing ? "btn-primary" : "btn-outline"} style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px", opacity: saving ? 0.6 : 1 }} onClick={handleEditToggle} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Profile" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Name & Headline */}
          <div style={{ marginTop: 16, marginBottom: 14 }}>
            {editing
              ? <input value={p.name} onChange={e => up("name", e.target.value)} className="input-field" style={{ fontSize: 26, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, marginBottom: 10, display: "block" }} />
              : <h1 className="serif" style={{ fontSize: 30, color: "#1a0a12", fontWeight: 600, marginBottom: 6 }}>{p.name}</h1>
            }
            {editing
              ? <input value={p.headline} onChange={e => up("headline", e.target.value)} className="input-field" style={{ fontSize: 14, marginBottom: 10, display: "block" }} />
              : <p style={{ fontSize: 14, color: "#2d1a25", lineHeight: 1.65, marginBottom: 10 }}>{p.headline}</p>
            }
            <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#7a3d58", flexWrap: "wrap" }}>
              {editing
                ? <>
                  <input value={p.location} onChange={e => up("location", e.target.value)} className="input-field" style={{ fontSize: 13, width: 200 }} placeholder="Location" />
                  <input value={p.website} onChange={e => up("website", e.target.value)} className="input-field" style={{ fontSize: 13, width: 220 }} placeholder="LinkedIn / Website URL" />
                </>
                : <><span>{p.location}</span>{p.website && <span style={{ color: "#c2185b" }}>{p.website}</span>}</>
              }
            </div>
          </div>

          {/* Open To Banner */}
          <div style={{ padding: "12px 16px", background: "rgba(194,24,91,0.04)", borderLeft: "2px solid #c2185b", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Open To</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {p.openTo.map(o => <Chip key={o} editing={editing} onRemove={() => up("openTo", p.openTo.filter(x => x !== o))}>{o}</Chip>)}
              {editing && (
                <input placeholder="+ Add (press Enter)" className="input-field" style={{ width: 150, fontSize: 12, padding: "4px 10px" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { up("openTo", [...p.openTo, e.target.value.trim()]); e.target.value = ""; } }} />
              )}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 12 }}>Target Roles</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {p.targetRoles.map(r => <Chip key={r} editing={editing} onRemove={() => up("targetRoles", p.targetRoles.filter(x => x !== r))}>{r}</Chip>)}
              {editing && (
                <input placeholder="+ Add role (press Enter)" className="input-field" style={{ width: 170, fontSize: 12, padding: "4px 10px" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { up("targetRoles", [...p.targetRoles, e.target.value.trim()]); e.target.value = ""; } }} />
              )}
            </div>
          </div>

          {/* CV Upload & Analysis */}
          <div
            onDragOver={e => { e.preventDefault(); setCvDragOver(true); }}
            onDragLeave={() => setCvDragOver(false)}
            onDrop={handleCvDrop}
            onClick={() => cvInputRef.current?.click()}
            style={{
              padding: "22px 20px",
              border: `1.5px dashed ${cvDragOver ? "#c2185b" : "rgba(194,24,91,0.18)"}`,
              background: cvDragOver ? "rgba(194,24,91,0.05)" : "transparent",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(194,24,91,0.02)"}
            onMouseLeave={e => { e.currentTarget.style.background = cvDragOver ? "rgba(194,24,91,0.05)" : "transparent"; }}
          >
            <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleCvUpload(e.target.files[0]); }} />
            {uploadingCv ? (
              <>
                <div style={{ width: 28, height: 28, border: "3px solid rgba(194,24,91,0.2)", borderTopColor: "#c2185b", borderRadius: "50%", margin: "0 auto 8px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontWeight: 600, color: "#c2185b", fontSize: 13 }}>Analyzing your CV...</p>
                <p style={{ fontSize: 12, color: "#9d6b82" }}>This may take a moment</p>
              </>
            ) : cvFileName ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2185b" strokeWidth="1.5" style={{ margin: "0 auto 6px", display: "block" }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
                </svg>
                <p style={{ fontWeight: 600, color: "#c2185b", fontSize: 13, marginBottom: 2 }}>{cvFileName}</p>
                <p style={{ fontSize: 12, color: "#9d6b82" }}>Click or drop a new file to replace</p>
              </>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c2185b" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontWeight: 600, color: "#c2185b", fontSize: 13, marginBottom: 2 }}>Drop your CV here or click to upload</p>
                <p style={{ fontSize: 12, color: "#9d6b82" }}>PDF, DOC, DOCX, or TXT · AI will analyze it for you</p>
              </>
            )}
          </div>

          {/* CV Analysis Results */}
          {cvAnalysis && (
            <div style={{ marginBottom: 16, border: "1px solid rgba(194,24,91,0.12)", background: "rgba(255,255,255,0.6)", overflow: "hidden" }}>
              {/* Header with score + rating */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(194,24,91,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2185b" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12", margin: 0 }}>CV Analysis</h3>
                  {cvAnalysis.rating && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "3px 10px",
                      background: cvAnalysis.rating === "Excellent" ? "rgba(46,125,50,0.1)" : cvAnalysis.rating === "Very Good" ? "rgba(46,125,50,0.08)" : cvAnalysis.rating === "Good" ? "rgba(245,158,11,0.1)" : "rgba(211,47,47,0.1)",
                      color: cvAnalysis.rating === "Excellent" || cvAnalysis.rating === "Very Good" ? "#2e7d32" : cvAnalysis.rating === "Good" ? "#f59e0b" : "#d32f2f",
                      borderRadius: 4,
                    }}>{cvAnalysis.rating}</span>
                  )}
                  {cvAnalysis.ats_friendly !== undefined && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      padding: "3px 10px", borderRadius: 4,
                      background: cvAnalysis.ats_friendly ? "rgba(46,125,50,0.08)" : "rgba(211,47,47,0.08)",
                      color: cvAnalysis.ats_friendly ? "#2e7d32" : "#d32f2f",
                    }}>{cvAnalysis.ats_friendly ? "ATS ✓" : "ATS ✗"}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: cvAnalysis.score >= 80 ? "#2e7d32" : cvAnalysis.score >= 60 ? "#f59e0b" : "#d32f2f", fontFamily: "'Cormorant Garamond',serif" }}>
                    {cvAnalysis.score}
                  </span>
                  <span style={{ fontSize: 12, color: "#9d6b82", fontWeight: 500 }}>/100</span>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ padding: "0 20px", marginTop: 14 }}>
                <div style={{ height: 6, background: "rgba(194,24,91,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${cvAnalysis.score}%`,
                    height: "100%",
                    background: cvAnalysis.score >= 80 ? "linear-gradient(90deg,#2e7d32,#4caf50)" : cvAnalysis.score >= 60 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#d32f2f,#ef5350)",
                    borderRadius: 3,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>

              {/* Overall Chance + Experience Level */}
              {(cvAnalysis.overall_chance || cvAnalysis.experience_level) && (
                <div style={{ padding: "14px 20px 0", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {cvAnalysis.overall_chance != null && (
                    <div style={{ flex: 1, minWidth: 160, padding: "12px 16px", background: "rgba(194,24,91,0.03)", border: "1px solid rgba(194,24,91,0.08)", borderRadius: 6, textAlign: "center" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Shortlist Chance</p>
                      <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", color: cvAnalysis.overall_chance >= 70 ? "#2e7d32" : cvAnalysis.overall_chance >= 45 ? "#f59e0b" : "#d32f2f", margin: 0 }}>
                        {cvAnalysis.overall_chance}%
                      </p>
                    </div>
                  )}
                  {cvAnalysis.experience_level && (
                    <div style={{ flex: 1, minWidth: 160, padding: "12px 16px", background: "rgba(194,24,91,0.03)", border: "1px solid rgba(194,24,91,0.08)", borderRadius: 6, textAlign: "center" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Experience Level</p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: "#1a0a12", margin: 0 }}>{cvAnalysis.experience_level}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Category Scores */}
              {cvAnalysis.category_scores && Object.keys(cvAnalysis.category_scores).length > 0 && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Category Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { key: "content", label: "Content & Achievements", icon: "📝" },
                      { key: "formatting", label: "Formatting & Structure", icon: "📐" },
                      { key: "impact", label: "Impact & Results", icon: "🎯" },
                      { key: "keywords_ats", label: "Keywords & ATS", icon: "🔍" },
                      { key: "brevity", label: "Brevity & Clarity", icon: "✂️" },
                    ].map(cat => {
                      const val = cvAnalysis.category_scores[cat.key];
                      if (val == null) return null;
                      return (
                        <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, width: 18, textAlign: "center" }}>{cat.icon}</span>
                          <span style={{ fontSize: 12, color: "#2d1a25", width: 150, fontWeight: 400 }}>{cat.label}</span>
                          <div style={{ flex: 1, height: 6, background: "rgba(194,24,91,0.06)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              width: `${val}%`, height: "100%", borderRadius: 3, transition: "width 1s ease",
                              background: val >= 80 ? "#4caf50" : val >= 60 ? "#fbbf24" : "#ef5350",
                            }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: val >= 80 ? "#2e7d32" : val >= 60 ? "#f59e0b" : "#d32f2f", width: 32, textAlign: "right" }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary */}
              {cvAnalysis.summary && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 13, color: "#2d1a25", lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}>
                    {cvAnalysis.summary}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {cvAnalysis.strengths && cvAnalysis.strengths.length > 0 && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    ✓ Strengths
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cvAnalysis.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#2d1a25", lineHeight: 1.6, fontWeight: 300 }}>
                        <span style={{ color: "#2e7d32", flexShrink: 0, marginTop: 2 }}>●</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {cvAnalysis.improvements && cvAnalysis.improvements.length > 0 && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    ↗ Areas to Improve
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cvAnalysis.improvements.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#2d1a25", lineHeight: 1.6, fontWeight: 300 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>●</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords Detected */}
              {cvAnalysis.keywords && cvAnalysis.keywords.length > 0 && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    Keywords Detected
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cvAnalysis.keywords.map((kw, i) => (
                      <span key={i} className="tag-chip">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {cvAnalysis.missing_keywords && cvAnalysis.missing_keywords.length > 0 && (
                <div style={{ padding: "14px 20px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#d32f2f", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    Missing Keywords — Consider Adding
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cvAnalysis.missing_keywords.map((kw, i) => (
                      <span key={i} style={{ display: "inline-block", padding: "4px 12px", fontSize: 12, fontWeight: 500, background: "rgba(211,47,47,0.06)", color: "#d32f2f", border: "1px dashed rgba(211,47,47,0.25)", borderRadius: 20 }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Suggestion */}
              {cvAnalysis.suggestion && (
                <div style={{ padding: "14px 20px 16px", marginTop: 8 }}>
                  <div style={{ padding: "12px 16px", background: "rgba(194,24,91,0.04)", borderLeft: "3px solid #c2185b" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      💡 Key Suggestion
                    </p>
                    <p style={{ fontSize: 13, color: "#2d1a25", lineHeight: 1.7, fontWeight: 300 }}>{cvAnalysis.suggestion}</p>
                  </div>
                </div>
              )}

              {cvFileUrl && (
                <div style={{ padding: "0 20px 16px" }}>
                  <a href={cvFileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#c2185b", textDecoration: "none", fontWeight: 500 }}>
                    View uploaded CV →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ─── Saved Opportunities Folder ─────────────────────────── */}
          <Sec label={`Saved Opportunities (${savedOpps.length})`}>
            {savedLoading && <p style={{ fontSize: 13, color: "#9d6b82" }}>Loading saved…</p>}
            {!savedLoading && savedOpps.length === 0 && (
              <div style={{ padding: "28px 20px", textAlign: "center", background: "rgba(194,24,91,0.02)", border: "1.5px dashed rgba(194,24,91,0.12)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c2185b" strokeWidth="1.5" style={{ opacity: 0.35, marginBottom: 10 }}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                <p style={{ fontSize: 13, color: "#9d6b82", fontWeight: 300 }}>No saved opportunities yet.</p>
                <p style={{ fontSize: 12, color: "#b8899e", marginTop: 4 }}>Browse <span style={{ cursor: "pointer", color: "#c2185b", fontWeight: 500 }} onClick={() => navigate("recommendations")}>Opportunities</span> and save roles you like.</p>
              </div>
            )}
            {savedOpps.map((s) => {
              const d = s.data || {};
              const isOpen = savedExpanded === s.recommendation_id;
              return (
                <div key={s.recommendation_id} style={{ marginBottom: 14, border: "1px solid rgba(194,24,91,0.1)", background: "rgba(255,255,255,0.55)", overflow: "hidden", transition: "box-shadow 0.2s", ...(isOpen ? { boxShadow: "0 4px 20px rgba(194,24,91,0.08)" } : {}) }}>
                  {/* Header row */}
                  <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                    onClick={() => setSavedExpanded(isOpen ? null : s.recommendation_id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isOpen ? "#c2185b" : "none"} stroke="#c2185b" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12", margin: 0 }}>{d.title || "Untitled Role"}</h4>
                        {d.company && <span style={{ fontSize: 12, color: "#9d6b82" }}>at {d.company}</span>}
                        {d.match && <span style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", background: "rgba(194,24,91,0.07)", padding: "2px 8px" }}>{d.match}%</span>}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#7a3d58", marginTop: 4 }}>
                        {d.salary && <span>{d.salary}</span>}
                        {d.type && <span>{d.type}</span>}
                        <span style={{ color: "#b8899e" }}>Saved {new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: "#9d6b82", flexShrink: 0 }}>
                      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Expanded detail panel */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(194,24,91,0.06)" }}>
                      {d.desc && <p style={{ fontSize: 13, color: "#5a3048", lineHeight: 1.85, fontWeight: 300, marginTop: 14, marginBottom: 14 }}>{d.desc}</p>}

                      {/* Skill gaps */}
                      {d.gap && d.gap.length > 0 && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Skill Gaps</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                            {d.gap.map(g => <span key={g} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 500, background: "rgba(245,158,11,0.07)", color: "#b45309", border: "1px solid rgba(245,158,11,0.18)" }}>{g}</span>)}
                          </div>
                        </>
                      )}

                      {/* Workshop links from backend */}
                      {s.workshops && s.workshops.length > 0 && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Courses &amp; Workshops</p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                            {s.workshops.map((w, wi) => (
                              <a key={wi} href={w.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11, fontWeight: 500, color: w.note ? "#b45309" : "#c2185b", background: w.note ? "rgba(245,158,11,0.05)" : "rgba(194,24,91,0.04)", border: `1px solid ${w.note ? "rgba(245,158,11,0.18)" : "rgba(194,24,91,0.12)"}`, textDecoration: "none", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                {w.name}{w.note ? ` — ${w.note}` : ""}
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Academies from backend */}
                      {s.academies && s.academies.length > 0 && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9d6b82", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Academies &amp; Bootcamps</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                            {s.academies.map((a, ai) => (
                              <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer"
                                style={{ padding: "10px 14px", textDecoration: "none", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(194,24,91,0.08)", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(194,24,91,0.3)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(194,24,91,0.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(194,24,91,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                              >
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a0a12", marginBottom: 2 }}>{a.name}</p>
                                <p style={{ fontSize: 11, color: "#9d6b82" }}>{a.type}</p>
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button className="btn-outline" style={{ borderRadius: 3, padding: "8px 16px", fontSize: 12, color: "#d32f2f", borderColor: "rgba(211,47,47,0.2)" }} onClick={() => removeSaved(s.recommendation_id)}>
                          Remove
                        </button>
                        <button className="btn-outline" style={{ borderRadius: 3, padding: "8px 16px", fontSize: 12 }} onClick={() => navigate("recommendations")}>
                          Find More Roles
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Sec>

          {/* About */}
          <Sec label="About">
            {editing
              ? <textarea value={p.about} onChange={e => up("about", e.target.value)} className="input-field" style={{ width: "100%", minHeight: 110, resize: "vertical", lineHeight: 1.75, fontSize: 14 }} />
              : <p style={{ fontSize: 15, color: "#2d1a25", lineHeight: 1.9, fontWeight: 300, whiteSpace: "pre-line" }}>{p.about}</p>
            }
          </Sec>

          {/* Career Break */}
          <Sec label="Career Break">
            <div style={{ padding: "16px 18px", background: "rgba(194,24,91,0.03)", border: "1px solid rgba(194,24,91,0.1)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#c2185b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Intentional Career Pause · 2021 – 2024</p>
              {editing
                ? <textarea value={p.careerBreak} onChange={e => up("careerBreak", e.target.value)} className="input-field" style={{ width: "100%", minHeight: 88, resize: "vertical", lineHeight: 1.75, fontSize: 13 }} />
                : <p style={{ fontSize: 14, color: "#2d1a25", lineHeight: 1.85, fontWeight: 300 }}>{p.careerBreak}</p>
              }
            </div>
          </Sec>

          {/* Experience */}
          <Sec label="Experience">
            {p.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: 26, paddingBottom: 26, borderBottom: i < p.experience.length - 1 ? "1px solid rgba(180,100,130,0.1)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    {editing
                      ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <input value={e.title} onChange={ev => upArr("experience", e.id, "title", ev.target.value)} className="input-field" style={{ fontSize: 15, fontWeight: 600 }} placeholder="Job title" />
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={e.company} onChange={ev => upArr("experience", e.id, "company", ev.target.value)} className="input-field" style={{ fontSize: 14 }} placeholder="Company" />
                          <input value={e.location} onChange={ev => upArr("experience", e.id, "location", ev.target.value)} className="input-field" style={{ fontSize: 14 }} placeholder="Location" />
                        </div>
                      </div>
                      : <><h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a0a12" }}>{e.title}</h3>
                        <p style={{ fontSize: 14, color: "#5a3048", marginTop: 3 }}>{e.company} · {e.location}</p></>
                    }
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: "#9d6b82", fontWeight: 500, whiteSpace: "nowrap" }}>{e.start} – {e.current ? "Present" : e.end}</p>
                    {editing && <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 6 }} onClick={() => rmArr("experience", e.id)}>Remove</button>}
                  </div>
                </div>
                {editing
                  ? <textarea value={e.desc} onChange={ev => upArr("experience", e.id, "desc", ev.target.value)} className="input-field" style={{ width: "100%", minHeight: 80, resize: "vertical", fontSize: 13, lineHeight: 1.75 }} />
                  : <p style={{ fontSize: 14, color: "#5a3048", lineHeight: 1.85, fontWeight: 300, marginTop: 8 }}>{e.desc}</p>
                }
              </div>
            ))}
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px" }} onClick={() => addArr("experience", { id: Date.now(), title: "", company: "", location: "", start: "", end: "", current: false, desc: "" })}>+ Add Position</button>}
          </Sec>

          {/* Education */}
          <Sec label="Education">
            {p.education.map((e, i) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 18, borderBottom: i < p.education.length - 1 ? "1px solid rgba(180,100,130,0.1)" : "none" }}>
                <div style={{ flex: 1 }}>
                  {editing
                    ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input value={e.institution} onChange={ev => upArr("education", e.id, "institution", ev.target.value)} className="input-field" style={{ fontSize: 15, fontWeight: 600 }} placeholder="Institution" />
                      <input value={e.degree} onChange={ev => upArr("education", e.id, "degree", ev.target.value)} className="input-field" style={{ fontSize: 14 }} placeholder="Degree" />
                    </div>
                    : <><h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12" }}>{e.institution}</h3>
                      <p style={{ fontSize: 13, color: "#5a3048", marginTop: 3, fontWeight: 300 }}>{e.degree}</p></>
                  }
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                  <p style={{ fontSize: 12, color: "#9d6b82" }}>{e.years}</p>
                  <p style={{ fontSize: 12, color: "#c2185b", fontWeight: 600, marginTop: 4 }}>{e.grade}</p>
                  {editing && <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 6 }} onClick={() => rmArr("education", e.id)}>Remove</button>}
                </div>
              </div>
            ))}
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px" }} onClick={() => addArr("education", { id: Date.now(), institution: "", degree: "", years: "", grade: "" })}>+ Add Education</button>}
          </Sec>

          {/* Certifications */}
          <Sec label="Certifications">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {p.certifications.map(c => (
                <div key={c.id} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(194,24,91,0.1)" }}>
                  {editing ? (
                    <>
                      <input value={c.name} onChange={ev => upArr("certifications", c.id, "name", ev.target.value)} className="input-field" style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }} placeholder="Certification name" />
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={c.issuer} onChange={ev => upArr("certifications", c.id, "issuer", ev.target.value)} className="input-field" style={{ fontSize: 12, flex: 1 }} placeholder="Issuer" />
                        <input value={c.year} onChange={ev => upArr("certifications", c.id, "year", ev.target.value)} className="input-field" style={{ fontSize: 12, width: 70 }} placeholder="Year" />
                      </div>
                      <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 8 }} onClick={() => rmArr("certifications", c.id)}>Remove</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#1a0a12", marginBottom: 3 }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: "#7a3d58" }}>{c.issuer} · {c.year}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px", marginTop: 14 }} onClick={() => addArr("certifications", { id: Date.now(), name: "", issuer: "", year: "" })}>+ Add Certification</button>}
          </Sec>

          {/* Skills */}
          <Sec label="Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.skills.map(s => <Chip key={s} editing={editing} onRemove={() => up("skills", p.skills.filter(x => x !== s))}>{s}</Chip>)}
              {editing && (
                <input placeholder="+ Add skill" className="input-field" style={{ width: 140, fontSize: 13, padding: "5px 12px" }}
                  onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { up("skills", [...p.skills, e.target.value.trim()]); e.target.value = ""; } }} />
              )}
            </div>
          </Sec>

          {/* Achievements */}
          <Sec label="Achievements & Awards">
            {p.achievements.map((a, i) => (
              <div key={a.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < p.achievements.length - 1 ? "1px solid rgba(180,100,130,0.1)" : "none" }}>
                {editing ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input value={a.title} onChange={ev => upArr("achievements", a.id, "title", ev.target.value)} className="input-field" style={{ fontSize: 15, fontWeight: 600, flex: 1 }} placeholder="Achievement title" />
                      <input value={a.org} onChange={ev => upArr("achievements", a.id, "org", ev.target.value)} className="input-field" style={{ fontSize: 13, width: 150 }} placeholder="Organization" />
                      <input value={a.year} onChange={ev => upArr("achievements", a.id, "year", ev.target.value)} className="input-field" style={{ fontSize: 13, width: 70 }} placeholder="Year" />
                    </div>
                    <textarea value={a.desc} onChange={ev => upArr("achievements", a.id, "desc", ev.target.value)} className="input-field" style={{ width: "100%", minHeight: 60, resize: "vertical", fontSize: 13, lineHeight: 1.75 }} placeholder="Description" />
                    <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 6 }} onClick={() => rmArr("achievements", a.id)}>Remove</button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12" }}>{a.title}</h3>
                      <span style={{ fontSize: 12, color: "#9d6b82", flexShrink: 0 }}>{a.org} · {a.year}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#5a3048", marginTop: 5, fontWeight: 300, lineHeight: 1.75 }}>{a.desc}</p>
                  </>
                )}
              </div>
            ))}
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px" }} onClick={() => addArr("achievements", { id: Date.now(), title: "", org: "", year: "", desc: "" })}>+ Add Achievement</button>}
          </Sec>

          {/* Volunteering */}
          <Sec label="Volunteering">
            {p.volunteering.map((v, i) => (
              <div key={v.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < p.volunteering.length - 1 ? "1px solid rgba(180,100,130,0.1)" : "none" }}>
                {editing ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input value={v.role} onChange={ev => upArr("volunteering", v.id, "role", ev.target.value)} className="input-field" style={{ fontSize: 15, fontWeight: 600, flex: 1 }} placeholder="Role" />
                      <input value={v.years} onChange={ev => upArr("volunteering", v.id, "years", ev.target.value)} className="input-field" style={{ fontSize: 13, width: 120 }} placeholder="Years" />
                    </div>
                    <input value={v.org} onChange={ev => upArr("volunteering", v.id, "org", ev.target.value)} className="input-field" style={{ fontSize: 14, marginBottom: 6 }} placeholder="Organization" />
                    <textarea value={v.desc} onChange={ev => upArr("volunteering", v.id, "desc", ev.target.value)} className="input-field" style={{ width: "100%", minHeight: 60, resize: "vertical", fontSize: 13, lineHeight: 1.75 }} placeholder="Description" />
                    <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 6 }} onClick={() => rmArr("volunteering", v.id)}>Remove</button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a0a12" }}>{v.role}</h3>
                      <span style={{ fontSize: 12, color: "#9d6b82" }}>{v.years}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#7a3d58", marginTop: 3, fontWeight: 500 }}>{v.org}</p>
                    <p style={{ fontSize: 13, color: "#5a3048", marginTop: 6, fontWeight: 300, lineHeight: 1.8 }}>{v.desc}</p>
                  </>
                )}
              </div>
            ))}
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px", marginTop: 12 }} onClick={() => addArr("volunteering", { id: Date.now(), org: "", role: "", years: "", desc: "" })}>+ Add Volunteering</button>}
          </Sec>

          {/* Languages */}
          <Sec label="Languages">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {p.languages.map(l => (
                <div key={l.id} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(194,24,91,0.1)" }}>
                  {editing ? (
                    <>
                      <input value={l.name} onChange={ev => upArr("languages", l.id, "name", ev.target.value)} className="input-field" style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }} placeholder="Language" />
                      <input value={l.level} onChange={ev => upArr("languages", l.id, "level", ev.target.value)} className="input-field" style={{ fontSize: 12 }} placeholder="Level (e.g. Native, Fluent)" />
                      <button style={{ fontSize: 11, color: "#c2185b", background: "none", border: "none", cursor: "pointer", marginTop: 6 }} onClick={() => rmArr("languages", l.id)}>Remove</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#1a0a12" }}>{l.name}</p>
                      <p style={{ fontSize: 12, color: "#7a3d58", marginTop: 2 }}>{l.level}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            {editing && <button className="btn-outline" style={{ borderRadius: 3, fontSize: 13, padding: "9px 20px", marginTop: 12 }} onClick={() => addArr("languages", { id: Date.now(), name: "", level: "" })}>+ Add Language</button>}
          </Sec>

          {/* Confidence Journey */}
          {confidenceHistory.length > 0 && (
            <Sec label="Confidence Journey on Renova">
              <p style={{ fontSize: 13, color: "#5a3048", fontWeight: 300, marginBottom: 16 }}>Your confidence growth since joining Renova.</p>
              <MiniLine data={confidenceHistory} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9d6b82", marginTop: 10 }}>
                <span>Start: {confidenceHistory[0]}</span>
                <span style={{ color: "#c2185b", fontWeight: 600 }}>Now: {confidenceHistory[confidenceHistory.length - 1]}</span>
              </div>
            </Sec>
          )}
        </div>
      </div>
    </div>
  );
}
