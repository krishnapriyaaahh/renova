import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroVisual from "../components/HeroVisual";
import RenovaLogo from "../components/RenovaLogo";

/* ── Floating 3D diamond decoration ──────────────────────────────────── */
function FloatingDiamond({ size = 18, top, left, right, delay = 0 }) {
  return (
    <div style={{
      position: "absolute", top, left, right, width: size, height: size,
      border: "1.5px solid rgba(194,24,91,0.15)",
      transform: "rotate(45deg)",
      animation: `floatSlow ${6 + delay}s ${delay}s ease-in-out infinite`,
      pointerEvents: "none",
    }} />
  );
}

/* ── Animated counter ────────────────────────────────────────────────── */
function AnimCounter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const num = parseInt(target.replace(/[^0-9]/g, ""), 10);
    if (!num) { setVal(target); return; }
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { start = num; clearInterval(timer); }
      setVal(start.toLocaleString());
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}{suffix}</>;
}

const features = [
  { title: "AI Career Mapping", desc: "Your pre-break experience is analyzed against today's market to surface roles that genuinely fit who you are now." },
  { title: "Personalised Roadmap", desc: "A week-by-week action plan that respects your time, energy, and the reality of life with family commitments." },
  { title: "Skills Gap Analysis", desc: "Know precisely what to learn, how long it will take, and which resources are actually worth your time." },
  { title: "Confidence Tracking", desc: "Log your confidence over time. Small wins compound into momentum you can feel and measure." },
  { title: "Interview Preparation", desc: "AI coaching that helps you transform your career break into a compelling, honest narrative." },
  { title: "Peer Community", desc: "Connect with thousands of women who understand the specific experience of returning to work." },
];

const testimonials = [
  { name: "Anika Sharma", role: "Product Manager", company: "Stripe", quote: "Renova didn't just help me find a job. It helped me find myself again.", break: "2.5 yrs" },
  { name: "Claire Bouchard", role: "UX Researcher", company: "Airbnb", quote: "I genuinely thought my career was finished. Six months later I'm earning more than before.", break: "4 yrs" },
  { name: "Roshani Mehta", role: "Marketing Lead", company: "HubSpot", quote: "The roadmap feature alone saved me over a hundred hours of confused searching.", break: "3 yrs" },
];

export default function LandingPage({ navigate }) {
  return (
    <div>
      <Navbar navigate={navigate} activePage="landing" canGoBack={false} />

      {/* Hero */}
      <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", padding: "0 6%", gap: 60, maxWidth: 1260, margin: "0 auto" }}>
        <div style={{ flex: 1 }}>
          <div className="fu1" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 36, height: 1, background: "#c2185b" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#c2185b", letterSpacing: "0.12em", textTransform: "uppercase" }}>For Women. On Your Terms.</span>
          </div>
          <h1 className="serif fu2" style={{ fontSize: "clamp(52px,5.5vw,82px)", lineHeight: 1.05, color: "#1a0a12", marginBottom: 28, fontWeight: 300 }}>
            Your career pause<br /><em style={{ color: "#c2185b" }}>was never a stop.</em>
          </h1>
          <p className="fu3" style={{ fontSize: 17, lineHeight: 1.85, color: "#5a3048", marginBottom: 40, maxWidth: 480, fontWeight: 300 }}>
            Return to work with clarity and confidence. Renova maps your experience to today's market, closes your skills gaps, and builds a roadmap that fits around your life.
          </p>
          <div className="fu4" style={{ display: "flex", gap: 14 }}>
            <button className="btn-primary" style={{ borderRadius: 3, fontSize: 15, padding: "15px 36px" }} onClick={() => navigate("signup")}>Start for Free</button>
            <button className="btn-outline" style={{ borderRadius: 3, fontSize: 15, padding: "14px 32px" }} onClick={() => navigate("login")}>See a Demo</button>
          </div>
          <div className="fu5" style={{ display: "flex", gap: 36, marginTop: 48 }}>
            {[["12,400+", "Women Returned"], ["4 weeks", "Average to First Offer"], ["94%", "Interview Success Rate"]].map(([n, l]) => (
              <div key={l}>
                <div className="serif" style={{ fontSize: 28, fontWeight: 600, color: "#c2185b" }}><AnimCounter target={n} suffix={n.includes("+") ? "+" : n.includes("%") ? "%" : ""} /></div>
                <div style={{ fontSize: 12, color: "#9d6b82", fontWeight: 500, letterSpacing: "0.04em", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="fu2"><HeroVisual /></div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(194,24,91,0.15),transparent)", margin: "0 6%" }} />

      {/* Features */}
      <section style={{ padding: "80px 6%", position: "relative", overflow: "hidden" }}>
        <FloatingDiamond size={22} top="12%" left="3%" delay={0} />
        <FloatingDiamond size={14} top="65%" right="4%" delay={2} />
        <FloatingDiamond size={18} top="85%" left="15%" delay={4} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 className="serif" style={{ fontSize: 48, color: "#1a0a12", fontWeight: 300, lineHeight: 1.1 }}>Everything you need<br /><em style={{ color: "#c2185b" }}>to return with confidence</em></h2>
            <p style={{ fontSize: 15, color: "#5a3048", maxWidth: 300, lineHeight: 1.85, fontWeight: 300 }}>No generic advice. No judgment. Intelligent support for your unique journey.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(194,24,91,0.08)" }}>
            {features.map((f, i) => (
              <div key={i} className="metric-hover" style={{ background: "rgba(255,248,252,0.9)", padding: "36px 32px" }}>
                <div style={{ width: 28, height: 2, background: "linear-gradient(90deg,#c2185b,#e91e8c)", marginBottom: 20 }} />
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a0a12", marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#5a3048", lineHeight: 1.85, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 6%", background: "rgba(194,24,91,0.025)", position: "relative", overflow: "hidden" }}>
        <FloatingDiamond size={16} top="8%" right="6%" delay={1} />
        <FloatingDiamond size={20} top="50%" left="2%" delay={3} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ width: 36, height: 1, background: "#c2185b", margin: "0 auto 16px" }} />
            <h2 className="serif" style={{ fontSize: 42, color: "#1a0a12", fontWeight: 300 }}>Real women. <em style={{ color: "#c2185b" }}>Real comebacks.</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: "36px 30px" }}>
                <div style={{ width: 32, height: 1, background: "rgba(194,24,91,0.3)", marginBottom: 20 }} />
                <p className="serif" style={{ fontSize: 17, color: "#2d1a25", lineHeight: 1.8, fontStyle: "italic", marginBottom: 24, fontWeight: 300 }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#e91e8c,#c2185b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1a0a12", fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#9d6b82" }}>{t.role} · {t.company}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: "#c2185b", fontWeight: 600, letterSpacing: "0.06em" }}>{t.break} break</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 6%", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ width: 36, height: 1, background: "#c2185b", margin: "0 auto 20px" }} />
          <h2 className="serif" style={{ fontSize: 44, color: "#1a0a12", fontWeight: 300, marginBottom: 16 }}>Your next chapter<br /><em style={{ color: "#c2185b" }}>starts today.</em></h2>
          <p style={{ color: "#5a3048", fontSize: 16, lineHeight: 1.85, marginBottom: 36, fontWeight: 300 }}>Join over 12,000 women who chose to return on their own terms. Free to start, always.</p>
          <button className="btn-primary" style={{ borderRadius: 3, fontSize: 16, padding: "16px 48px" }} onClick={() => navigate("signup")}>Begin Your Comeback</button>
          <div style={{ marginTop: 20 }}>
            <button className="btn-outline" style={{ borderRadius: 3, fontSize: 14, padding: "12px 32px" }} onClick={() => navigate("landing")}>Back to Home</button>
          </div>
        </div>
      </section>

      <footer style={{ padding: "28px 6%", borderTop: "1px solid rgba(194,24,91,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RenovaLogo size={26} fontSize={19} onClick={() => navigate("landing")} />
        <p style={{ color: "#9d6b82", fontSize: 13 }}>© 2026 Renova. Built for women returning to work.</p>
      </footer>
    </div>
  );
}
