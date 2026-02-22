import { useState, useEffect, useRef } from "react";

/* ── Floating 3D Particle ─────────────────────────────────────────────── */
function Particle({ x, y, size, delay, duration }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: size, height: size,
      background: `radial-gradient(circle, rgba(194,24,91,${0.12 + Math.random() * 0.12}), transparent 70%)`,
      borderRadius: "50%",
      animation: `particle3d ${duration}s ${delay}s ease-in-out infinite`,
      pointerEvents: "none",
    }} />
  );
}

/* ── 3D Rotating Cube (pure CSS) ──────────────────────────────────────── */
function Cube3D({ size = 60, top, left, delay = 0 }) {
  const half = size / 2;
  const face = {
    position: "absolute", width: size, height: size,
    border: "1px solid rgba(194,24,91,0.15)",
    background: "rgba(252,228,238,0.15)", backdropFilter: "blur(2px)",
  };
  return (
    <div style={{
      position: "absolute", top, left, width: size, height: size,
      transformStyle: "preserve-3d",
      animation: `spinCube 12s ${delay}s linear infinite`,
    }}>
      <div style={{ ...face, transform: `translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateY(180deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateY(90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateX(90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
    </div>
  );
}

/* ── 3D Orbit Ring ───────────────────────────────────────────────────── */
function OrbitRing({ size, top, left, duration, tiltX = 65, tiltY = 0 }) {
  return (
    <div style={{
      position: "absolute", top, left, width: size, height: size,
      border: "1.5px solid rgba(194,24,91,0.12)",
      borderRadius: "50%",
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      transformStyle: "preserve-3d",
      animation: `orbitSpin ${duration}s linear infinite`,
    }}>
      {/* Orbiting dot */}
      <div style={{
        position: "absolute", top: -4, left: "50%", marginLeft: -4,
        width: 8, height: 8, borderRadius: "50%",
        background: "linear-gradient(135deg, #c2185b, #e91e8c)",
        boxShadow: "0 0 12px rgba(194,24,91,0.5)",
      }} />
    </div>
  );
}

/* ── Animated Progress Ring ──────────────────────────────────────────── */
function ProgressRing({ pct, label, size = 64 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 400);
    return () => clearTimeout(t);
  }, [pct, circ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(194,24,91,0.08)" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#grad)" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c2185b" />
            <stop offset="100%" stopColor="#e91e8c" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{ fontSize: 10, color: "#9d6b82", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* ── Mouse-tracking parallax wrapper ─────────────────────────────────── */
function Parallax3D({ children }) {
  const ref = useRef(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * -8;
      const ry = ((e.clientX - cx) / rect.width) * 8;
      setRot({ x: rx, y: ry });
    };
    const onLeave = () => setRot({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <div ref={ref} style={{
      perspective: 900, width: "100%", height: "100%",
      transformStyle: "preserve-3d",
    }}>
      <div style={{
        width: "100%", height: "100%",
        transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function HeroVisual() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    x: `${10 + Math.random() * 80}%`,
    y: `${5 + Math.random() * 85}%`,
    size: 4 + Math.random() * 10,
    delay: Math.random() * 4,
    duration: 5 + Math.random() * 6,
  }));

  return (
    <div style={{ position: "relative", width: 480, height: 540, flexShrink: 0, perspective: 1200 }}>
      <Parallax3D>
        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        {/* 3D Morphing blob */}
        <div className="morph" style={{
          position: "absolute", top: "3%", left: "5%", width: 380, height: 380,
          background: "linear-gradient(135deg, rgba(194,24,91,0.1), rgba(233,30,140,0.05))",
          filter: "blur(3px)",
        }} />

        {/* 3D Orbit rings */}
        <OrbitRing size={320} top="8%" left="10%" duration={18} tiltX={68} />
        <OrbitRing size={240} top="16%" left="18%" duration={14} tiltX={62} tiltY={15} />
        <OrbitRing size={160} top="26%" left="26%" duration={10} tiltX={72} tiltY={-10} />

        {/* Floating 3D cubes */}
        <Cube3D size={40} top="2%" left="78%" delay={0} />
        <Cube3D size={28} top="72%" left="5%" delay={3} />
        <Cube3D size={22} top="80%" left="75%" delay={6} />

        {/* Rotating outer ring */}
        <div className="rotate" style={{
          position: "absolute", top: "7%", left: "10%", width: 340, height: 340,
          border: "1px solid rgba(194,24,91,0.1)", borderRadius: "50%",
          borderTopColor: "rgba(194,24,91,0.25)",
        }} />

        {/* ── Central 3D Card ─────────────────────────────────────────── */}
        <div style={{
          position: "absolute", top: "10%", left: "13%", width: 310, height: 390,
          background: "linear-gradient(175deg, rgba(255,255,255,0.95), rgba(252,228,238,0.55))",
          border: "1px solid rgba(194,24,91,0.12)",
          boxShadow: "0 30px 80px rgba(180,60,100,0.14), 0 0 0 1px rgba(255,255,255,0.5) inset",
          overflow: "hidden", borderRadius: 4,
          transform: "translateZ(40px)",
          transformStyle: "preserve-3d",
        }}>
          {/* Grid lines */}
          <svg width="100%" height="100%" viewBox="0 0 310 390" fill="none" style={{ position: "absolute", top: 0, left: 0 }}>
            {[55, 100, 145, 190, 235, 280].map(x => <line key={x} x1={x} y1="0" x2={x} y2="390" stroke="rgba(194,24,91,0.035)" strokeWidth="1" />)}
            {[50, 95, 140, 180, 225, 270, 315, 355].map(y => <line key={y} x1="0" y1={y} x2="310" y2={y} stroke="rgba(194,24,91,0.035)" strokeWidth="1" />)}
          </svg>

          {/* Profile silhouette */}
          <svg width="310" height="220" viewBox="0 0 310 220" fill="none" style={{ position: "absolute", top: 20 }}>
            <ellipse cx="155" cy="72" rx="44" ry="52" fill="rgba(194,24,91,0.06)" stroke="rgba(194,24,91,0.14)" strokeWidth="1" />
            <path d="M72 168 Q100 135 155 130 Q210 135 238 168 L248 215 Q218 228 155 232 Q92 228 62 215 Z" fill="rgba(194,24,91,0.04)" stroke="rgba(194,24,91,0.08)" strokeWidth="1" />
            {/* Decorative data lines */}
            <line x1="16" y1="72" x2="92" y2="72" stroke="rgba(194,24,91,0.18)" strokeWidth="1.5" />
            <line x1="218" y1="72" x2="294" y2="72" stroke="rgba(194,24,91,0.18)" strokeWidth="1.5" />
            <line x1="16" y1="80" x2="56" y2="80" stroke="rgba(194,24,91,0.09)" strokeWidth="1" />
            <line x1="254" y1="80" x2="294" y2="80" stroke="rgba(194,24,91,0.09)" strokeWidth="1" />
          </svg>

          {/* Progress rings row */}
          <div style={{
            position: "absolute", bottom: 50, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 20,
            transform: "translateZ(20px)",
          }}>
            <ProgressRing pct={94} label="Interviews" size={56} />
            <ProgressRing pct={87} label="Skills" size={56} />
            <ProgressRing pct={72} label="Readiness" size={56} />
          </div>

          {/* Shimmer effect */}
          <div style={{
            position: "absolute", top: 0, left: "-50%", width: "200%", height: "100%",
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
            animation: "shimmer 4s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        </div>

        {/* ── Floating stat badges (3D depth) ─────────────────────────── */}
        <div className="float" style={{
          position: "absolute", bottom: 55, left: 8,
          background: "rgba(255,255,255,0.96)", border: "1px solid rgba(194,24,91,0.12)",
          padding: "11px 16px", borderRadius: 4,
          boxShadow: "0 12px 32px rgba(194,24,91,0.12)",
          transform: "translateZ(60px)",
          backdropFilter: "blur(8px)",
        }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: "#c2185b" }}>94%</div>
          <div style={{ fontSize: 9, color: "#9d6b82", letterSpacing: "0.08em", marginTop: 2, textTransform: "uppercase" }}>Interview Success</div>
        </div>

        <div className="float-slow" style={{
          position: "absolute", top: 14, right: 8,
          background: "rgba(255,255,255,0.96)", border: "1px solid rgba(194,24,91,0.12)",
          padding: "11px 16px", borderRadius: 4,
          boxShadow: "0 12px 32px rgba(194,24,91,0.12)",
          transform: "translateZ(55px)",
          backdropFilter: "blur(8px)",
        }}>
          <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: "#c2185b" }}>12,400</div>
          <div style={{ fontSize: 9, color: "#9d6b82", letterSpacing: "0.08em", marginTop: 2, textTransform: "uppercase" }}>Women Returned</div>
        </div>

        {/* Small sparkle badge */}
        <div className="pulse3d" style={{
          position: "absolute", top: "44%", right: -6,
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #c2185b, #e91e8c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(194,24,91,0.4)",
          transform: "translateZ(70px)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>

        {/* Vertical label */}
        <div style={{
          position: "absolute", right: -18, top: "32%",
          writingMode: "vertical-rl", fontSize: 9, color: "rgba(194,24,91,0.3)",
          letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
        }}>Career Re-Entry Platform</div>
      </Parallax3D>
    </div>
  );
}
