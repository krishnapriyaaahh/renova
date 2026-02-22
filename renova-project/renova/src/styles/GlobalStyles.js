import { useEffect } from "react";

export function FontLink() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
  return null;
}

export function GlobalStyles() {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}
      .serif{font-family:'Cormorant Garamond',serif;}

      @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(2deg)}}
      @keyframes floatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
      @keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes morph{0%,100%{border-radius:60% 40% 55% 45%/50% 60% 40% 50%}33%{border-radius:40% 60% 45% 55%/60% 40% 60% 40%}66%{border-radius:50% 50% 60% 40%/40% 55% 45% 60%}}
      @keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.12)}100%{transform:scale(1)}}

      .float{animation:float 7s ease-in-out infinite;}
      .float-slow{animation:floatSlow 9s ease-in-out infinite;}
      .morph{animation:morph 10s ease-in-out infinite;}
      .rotate{animation:rotate 25s linear infinite;}

      .fu1{animation:fadeUp 0.7s 0s ease both;}
      .fu2{animation:fadeUp 0.7s 0.12s ease both;}
      .fu3{animation:fadeUp 0.7s 0.24s ease both;}
      .fu4{animation:fadeUp 0.7s 0.38s ease both;}
      .fu5{animation:fadeUp 0.7s 0.52s ease both;}

      .card{background:rgba(255,255,255,0.62);backdrop-filter:blur(18px);border:1px solid rgba(194,24,91,0.1);box-shadow:0 4px 32px rgba(180,60,100,0.07);}

      .btn-primary{background:linear-gradient(135deg,#c2185b,#e91e8c);color:#fff;border:none;font-family:'Outfit',sans-serif;font-weight:600;font-size:14px;cursor:pointer;letter-spacing:0.02em;transition:all 0.28s;padding:13px 28px;}
      .btn-primary:hover{background:linear-gradient(135deg,#ad1457,#c2185b);transform:translateY(-1px);box-shadow:0 8px 24px rgba(194,24,91,0.35);}
      .btn-outline{background:transparent;color:#c2185b;border:1.5px solid rgba(194,24,91,0.35);font-family:'Outfit',sans-serif;font-weight:500;font-size:14px;cursor:pointer;letter-spacing:0.02em;transition:all 0.28s;padding:12px 26px;}
      .btn-outline:hover{background:rgba(194,24,91,0.05);border-color:rgba(194,24,91,0.6);}
      .btn-ghost{background:rgba(255,255,255,0.5);color:#6b3550;border:1px solid rgba(180,100,130,0.2);font-family:'Outfit',sans-serif;font-weight:500;font-size:13px;cursor:pointer;transition:all 0.25s;padding:9px 18px;backdrop-filter:blur(8px);}
      .btn-ghost:hover{background:rgba(255,255,255,0.85);}
      .btn-back{background:rgba(255,255,255,0.55);color:#6b3550;border:1px solid rgba(180,100,130,0.18);font-family:'Outfit',sans-serif;font-weight:500;font-size:13px;cursor:pointer;transition:all 0.25s;padding:8px 16px;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(8px);}
      .btn-back:hover{background:rgba(255,255,255,0.88);transform:translateX(-2px);}

      input,textarea,select{font-family:'Outfit',sans-serif;transition:all 0.25s;}
      input:focus,textarea:focus,select:focus{outline:none;}

      .input-field{width:100%;padding:12px 15px;font-size:14px;color:#2d1a25;background:rgba(255,255,255,0.65);border:1px solid rgba(180,100,130,0.2);transition:all 0.25s;}
      .input-field:focus{background:rgba(255,255,255,0.9);border-color:rgba(194,24,91,0.45);box-shadow:0 0 0 3px rgba(194,24,91,0.07);}
      .input-label{display:block;font-size:12px;font-weight:600;color:#7a3d58;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:7px;}

      .nav-item{font-size:13.5px;font-weight:500;color:#6b3550;cursor:pointer;transition:color 0.2s;letter-spacing:0.01em;}
      .nav-item:hover{color:#c2185b;}
      .nav-item.active{color:#c2185b;}

      .tag-chip{background:rgba(194,24,91,0.07);color:#9c1a55;border:1px solid rgba(194,24,91,0.15);font-size:12px;font-weight:500;padding:4px 12px;letter-spacing:0.02em;display:inline-flex;align-items:center;gap:5px;}

      .metric-hover{transition:transform 0.3s,box-shadow 0.3s;}
      .metric-hover:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(180,60,100,0.1);}

      .role-row{transition:all 0.3s;cursor:pointer;border-bottom:1px solid rgba(194,24,91,0.08);}
      .role-row:hover{background:rgba(255,255,255,0.3);}

      .timeline-dot{transition:all 0.35s cubic-bezier(0.34,1.3,0.64,1);}

      ::-webkit-scrollbar{width:5px;}
      ::-webkit-scrollbar-thumb{background:rgba(194,24,91,0.2);}

      input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}
      input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#c2185b,#e91e8c);cursor:pointer;box-shadow:0 2px 8px rgba(194,24,91,0.35);}

      .profile-section{border-top:1px solid rgba(180,100,130,0.12);padding-top:28px;margin-top:28px;}
      .sec-label{font-size:11px;font-weight:700;color:#9d6b82;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:18px;display:flex;align-items:center;gap:10px;}
      .sec-label::after{content:'';flex:1;height:1px;background:rgba(180,100,130,0.15);}

      @keyframes spinCube{0%{transform:rotateX(0deg) rotateY(0deg)}100%{transform:rotateX(360deg) rotateY(360deg)}}
      @keyframes orbitSpin{0%{transform:rotateX(65deg) rotateZ(0deg)}100%{transform:rotateX(65deg) rotateZ(360deg)}}
      @keyframes particle3d{0%,100%{transform:translate3d(0,0,0) scale(1);opacity:0.5}25%{transform:translate3d(8px,-14px,12px) scale(1.3);opacity:0.9}50%{transform:translate3d(-6px,-22px,20px) scale(0.8);opacity:0.6}75%{transform:translate3d(10px,-10px,8px) scale(1.1);opacity:0.8}}
      @keyframes pulse3d{0%,100%{transform:translateZ(70px) scale(1);box-shadow:0 4px 20px rgba(194,24,91,0.4)}50%{transform:translateZ(70px) scale(1.12);box-shadow:0 8px 32px rgba(194,24,91,0.6)}}
      @keyframes shimmer{0%{transform:translateX(-100%)}50%,100%{transform:translateX(100%)}}
      .pulse3d{animation:pulse3d 2.5s ease-in-out infinite;}

      .btn-home{background:rgba(194,24,91,0.06);color:#c2185b;border:1.5px solid rgba(194,24,91,0.2);font-family:'Outfit',sans-serif;font-weight:600;font-size:12px;cursor:pointer;transition:all 0.28s;padding:7px 16px;border-radius:3px;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.03em;}
      .btn-home:hover{background:rgba(194,24,91,0.12);border-color:rgba(194,24,91,0.4);transform:translateY(-1px);box-shadow:0 4px 14px rgba(194,24,91,0.15);}
      .btn-home svg{transition:transform 0.25s;}
      .btn-home:hover svg{transform:translateX(-2px);}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);
  return null;
}
