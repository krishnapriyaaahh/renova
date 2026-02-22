/**
 * Renova brand logo — a stylised rising "R" mark + wordmark.
 * The mark represents an upward arc (career re-entry) cradling a bloom.
 * All SVG, no images. Works at any size.
 */
export function RenovaMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rn-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#e91e8c" />
        </linearGradient>
        <linearGradient id="rn-g2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ad1457" />
          <stop offset="100%" stopColor="#e91e8c" />
        </linearGradient>
      </defs>
      {/* Outer rounded-square container */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#rn-g1)" />
      {/* Rising arc — represents career comeback curve */}
      <path
        d="M10 28 Q12 14, 20 12 Q28 14, 30 28"
        stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
      {/* Stylised "R" letterform */}
      <path
        d="M14 30 L14 16 Q14 12, 18.5 12 L21 12 Q26 12, 26 16 Q26 19.5, 22 20 L27 30"
        stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Small bloom / star accent at the peak */}
      <circle cx="20" cy="8.5" r="2" fill="white" opacity="0.9" />
      <circle cx="20" cy="8.5" r="3.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
    </svg>
  );
}

export function RenovaWordmark({ fontSize = 21, color = "#8b0039" }) {
  return (
    <span style={{
      fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
      fontSize,
      fontWeight: 700,
      color,
      letterSpacing: "0.04em",
      lineHeight: 1,
    }}>
      Renova
    </span>
  );
}

/**
 * Full brand lockup: Mark + Wordmark side by side.
 */
export default function RenovaLogo({ size = 30, fontSize = 21, color = "#8b0039", onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <RenovaMark size={size} />
      <RenovaWordmark fontSize={fontSize} color={color} />
    </div>
  );
}
