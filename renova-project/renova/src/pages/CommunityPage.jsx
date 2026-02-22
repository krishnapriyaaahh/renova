import { useState } from "react";
import Navbar from "../components/Navbar";
import BackBtn from "../components/BackBtn";
import { useAuth } from "../context/AuthContext";
import { mockPosts } from "../data/mockData";

export default function CommunityPage({ navigate, logout, goBack }) {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState("");
  const [anon, setAnon] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();

  const submit = () => {
    if (!newPost.trim()) return;
    setPosts(ps => [{
      id: Date.now(),
      author: anon ? "Anonymous" : user?.name || "You",
      initials: anon ? "AN" : (user?.name?.[0]?.toUpperCase() || "U") + "N",
      anon,
      time: "Just now",
      text: newPost,
      likes: 0,
      comments: 0,
      tags: [],
    }, ...ps]);
    setNewPost("");
  };

  return (
    <div>
      <Navbar navigate={navigate} logout={logout} activePage="community" goBack={goBack} canGoBack={true} />
      <div style={{ padding: "36px 5%", maxWidth: 660, margin: "0 auto" }}>
        <BackBtn goBack={goBack} canGoBack={true} style={{ marginBottom: 24 }} />
        <div className="fu1" style={{ marginBottom: 32 }}>
          <div style={{ width: 32, height: 1, background: "#c2185b", marginBottom: 16 }} />
          <h1 className="serif" style={{ fontSize: 40, color: "#1a0a12", fontWeight: 300, marginBottom: 6 }}>The <em style={{ color: "#c2185b" }}>Renova community</em></h1>
          <p style={{ color: "#5a3048", fontSize: 15, fontWeight: 300 }}>12,400 women who understand. Share, support, and celebrate together.</p>
        </div>

        {/* Post Composer */}
        <div className="card fu2" style={{ padding: 22, marginBottom: 24 }}>
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share something — a win, a worry, a question, or a thought..."
            style={{ width: "100%", minHeight: 86, border: "1px solid rgba(180,100,130,0.15)", padding: "12px 14px", fontSize: 14, color: "#2d1a25", background: "rgba(255,255,255,0.55)", resize: "none", lineHeight: 1.75, fontFamily: "'Outfit',sans-serif" }}
            onFocus={e => e.target.style.borderColor = "rgba(194,24,91,0.38)"}
            onBlur={e => e.target.style.borderColor = "rgba(180,100,130,0.15)"}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setAnon(!anon)}>
              <div style={{ width: 36, height: 19, background: anon ? "linear-gradient(135deg,#c2185b,#e91e8c)" : "rgba(194,24,91,0.1)", position: "relative", transition: "all 0.3s" }}>
                <div style={{ width: 15, height: 15, background: "white", position: "absolute", top: 2, left: anon ? 19 : 2, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }} />
              </div>
              <span style={{ fontSize: 13, color: "#5a3048" }}>Post anonymously</span>
            </div>
            <button className="btn-primary" style={{ borderRadius: 3, padding: "9px 20px", fontSize: 13 }} onClick={submit}>Share</button>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.map((post, i) => (
          <div key={post.id} className="card fu1" style={{ padding: 22, marginBottom: 14, animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, background: post.anon ? "rgba(107,76,94,0.1)" : "linear-gradient(135deg,#e91e8c,#c2185b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: post.anon ? "#6b3550" : "white", flexShrink: 0, letterSpacing: 0.5 }}>
                {post.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#1a0a12", fontSize: 14 }}>{post.author}</span>
                  <span style={{ fontSize: 12, color: "#9d6b82" }}>{post.time}</span>
                </div>
                <p style={{ fontSize: 14, color: "#2d1a25", lineHeight: 1.8, marginTop: 7, fontWeight: 300 }}>{post.text}</p>
              </div>
            </div>
            {post.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, paddingLeft: 50 }}>
                {post.tags.map(t => <span key={t} className="tag-chip" style={{ fontSize: 11 }}>#{t}</span>)}
              </div>
            )}
            <div style={{ display: "flex", gap: 18, paddingLeft: 50 }}>
              <span style={{ fontSize: 13, color: "#9d6b82", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#c2185b"} onMouseLeave={e => e.target.style.color = "#9d6b82"}>{post.likes} likes</span>
              <span style={{ fontSize: 13, color: "#9d6b82", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#c2185b"} onMouseLeave={e => e.target.style.color = "#9d6b82"} onClick={() => setExpanded(expanded === post.id ? null : post.id)}>{post.comments} replies</span>
            </div>
            {expanded === post.id && (
              <div style={{ marginTop: 16, paddingLeft: 50, paddingTop: 16, borderTop: "1px solid rgba(180,100,130,0.1)" }}>
                <textarea placeholder="Write a supportive reply..." style={{ width: "100%", minHeight: 58, border: "1px solid rgba(180,100,130,0.15)", padding: "10px 13px", fontSize: 13, background: "rgba(255,255,255,0.55)", resize: "none", fontFamily: "'Outfit',sans-serif", lineHeight: 1.65, color: "#2d1a25" }} />
                <button className="btn-outline" style={{ borderRadius: 3, fontSize: 12, padding: "7px 16px", marginTop: 10 }}>Reply</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
