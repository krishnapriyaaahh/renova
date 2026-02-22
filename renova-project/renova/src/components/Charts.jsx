export function CircProg({ value, size = 80, sw = 7 }) {
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#e91e8c" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(194,24,91,0.08)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#cg)" strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
    </svg>
  );
}

export function Radar({ data }) {
  const sz = 200, cx = sz / 2, cy = sz / 2, r = 72, n = data.length;
  const angs = data.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
  const pt = (a, rad) => ({ x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) });
  const rings = [0.25, 0.5, 0.75, 1].map(f => angs.map((a, i) => `${i === 0 ? "M" : "L"}${pt(a, r * f).x},${pt(a, r * f).y}`).join(" ") + "Z");
  const dp = angs.map((a, i) => `${i === 0 ? "M" : "L"}${pt(a, r * (data[i].val / 100)).x},${pt(a, r * (data[i].val / 100)).y}`).join(" ") + "Z";
  return (
    <svg width={sz} height={sz} style={{ overflow: "visible" }}>
      {rings.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(194,24,91,0.09)" strokeWidth={1} />)}
      {angs.map((a, i) => { const p = pt(a, r); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(194,24,91,0.09)" strokeWidth={1} />; })}
      <path d={dp} fill="rgba(194,24,91,0.09)" stroke="#c2185b" strokeWidth={1.5} />
      {angs.map((a, i) => { const p = pt(a, r * (data[i].val / 100)); return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#c2185b" />; })}
      {angs.map((a, i) => { const l = pt(a, r + 20); return <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} fill="#7a3d58" fontFamily="Outfit" letterSpacing="0.04em">{data[i].skill}</text>; })}
    </svg>
  );
}

export function MiniLine({ data }) {
  const w = 220, h = 68, p = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => ({ x: p + (i / (data.length - 1)) * (w - p * 2), y: h - p - ((v - min) / (max - min || 1)) * (h - p * 2) }));
  const path = pts.map((q, i) => `${i === 0 ? "M" : "L"}${q.x},${q.y}`).join(" ");
  const fill = `${path} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="mlg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2185b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c2185b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#mlg)" />
      <path d={path} fill="none" stroke="#c2185b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={i === pts.length - 1 ? 4 : 2.5} fill="#c2185b" />)}
    </svg>
  );
}
