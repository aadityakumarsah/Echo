/**
 * Garden scene — real video background + SVG animated overlay.
 * Completion (0-3) controls: overlay brightness, birds, butterflies, fireflies.
 * CSS keyframes for all looping motion; framer-motion for state-triggered reveals.
 */

import { motion, AnimatePresence } from "framer-motion";

interface GardenSceneProps {
  completed: number; // 0–3
}

// Birds: [startX, y, flightDuration, bodyScale, delay, wingColor]
const BIRDS = [
  { x: -60,  y: 68,  dur: 20, s: 1.0, delay: 0,   wc: "#90CAF9", sid: "b0" },
  { x: -220, y: 88,  dur: 26, s: 0.75, delay: 6,  wc: "#B0BEC5", sid: "b1" },
  { x: -380, y: 52,  dur: 32, s: 1.25, delay: 13, wc: "#80DEEA", sid: "b2" },
];

// Fireflies
const FIREFLIES = Array.from({ length: 10 }, (_, i) => ({
  cx: 200 + (i * 73) % 380,
  cy: 120 + (i * 41) % 100,
  dur: 2.2 + (i * 0.35) % 2.4,
  delay: i * 0.6,
}));

function Bird({ x, y, dur, s, delay, wc, sid }: typeof BIRDS[0]) {
  const bw = 8 * s, bh = 3.5 * s;
  const wl = 14 * s, wh = 10 * s;
  // shadow offset = ground line (≈75% of 380 = 285) minus bird y
  const shadowDY = 285 - y;
  return (
    <g style={{ animation: `fly-${sid} ${dur}s linear ${delay}s infinite` }}>
      {/* Ground shadow */}
      <ellipse
        cx={x} cy={y + shadowDY}
        rx={14 * s} ry={3.5 * s}
        fill="rgba(0,0,0,0.22)"
        style={{ filter: "blur(3px)" }}
      />
      {/* Bird body + wings */}
      <g style={{
        transform: `translate(${x}px, ${y}px)`,
        animation: `bird-bob ${2.6 + delay * 0.07}s ease-in-out infinite alternate`,
      }}>
        <path d={`M0 0 Q${-wl} ${-wh*0.25} ${-wl*0.6} ${-wh}`} fill={wc} opacity="0.92"
          style={{ transformBox:"fill-box", transformOrigin:"0% 100%",
                   animation:`wing-l ${0.45 + delay*0.015}s ease-in-out infinite alternate` }} />
        <path d={`M0 0 Q${wl} ${-wh*0.25} ${wl*0.6} ${-wh}`} fill={wc} opacity="0.92"
          style={{ transformBox:"fill-box", transformOrigin:"0% 100%",
                   animation:`wing-r ${0.45 + delay*0.015}s ease-in-out infinite alternate` }} />
        <ellipse cx="0" cy="0" rx={bw} ry={bh} fill="#37474F" />
        <path d={`M${-bw} 0 Q${-bw-7*s} ${bh*1.4} ${-bw-4*s} ${-bh*0.8}`} fill="#455A64" opacity="0.75" />
        <polygon points={`${bw},-1.2 ${bw+5*s},0 ${bw},1.2`} fill="#FF8F00" />
        <circle cx={bw*0.68} cy={-bh*0.35} r={1.3*s} fill="#fff" />
        <circle cx={bw*0.73} cy={-bh*0.35} r={0.65*s} fill="#1a1a1a" />
      </g>
    </g>
  );
}

const CSS = `
  @keyframes fly-b0 { 0%{transform:translateX(0px)} 100%{transform:translateX(980px)} }
  @keyframes fly-b1 { 0%{transform:translateX(0px)} 100%{transform:translateX(980px)} }
  @keyframes fly-b2 { 0%{transform:translateX(0px)} 100%{transform:translateX(980px)} }
  @keyframes bird-bob { from{transform:var(--bt) translateY(0px)} to{transform:var(--bt) translateY(-7px)} }
  @keyframes wing-l { from{transform:rotate(12deg)} to{transform:rotate(-38deg)} }
  @keyframes wing-r { from{transform:rotate(-12deg)} to{transform:rotate(38deg)} }
  @keyframes firefly {
    0%,100%{opacity:0; transform:translate(0px,0px)}
    35%{opacity:1; transform:translate(6px,-7px)}
    65%{opacity:0.7; transform:translate(-5px,-3px)}
  }
  @keyframes bf-wing {
    0%,100%{transform:scaleX(1) scaleY(1)}
    50%{transform:scaleX(0.2) scaleY(0.85)}
  }
`;

export default function GardenScene({ completed }: GardenSceneProps) {
  // Overlay shifts from desaturated/dark → bright/warm as tasks complete
  const overlayOpacity  = [0.38, 0.22, 0.12, 0.04][completed];
  const overlayColor    = ["rgba(6,15,30,1)", "rgba(6,15,30,1)", "rgba(6,15,30,1)", "rgba(6,15,30,1)"][completed];
  // Brightness filter on video: more complete = cleaner/brighter
  const videoBrightness = [0.72, 0.85, 0.95, 1.05][completed];
  const videoSaturate   = [0.6,  0.8,  0.95, 1.1 ][completed];

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ height: "clamp(220px, 42vw, 500px)" }}
    >
      {/* ── Real garden video ───────────────────────────────────── */}
      <motion.video
        src="/garden.mov"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        animate={{
          filter: `brightness(${videoBrightness}) saturate(${videoSaturate})`,
        }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />

      {/* ── Completion darkness overlay ──────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ background: overlayColor }}
      />

      {/* ── Warm glow at ground when complete ───────────────────── */}
      <AnimatePresence>
        {completed >= 2 && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 40% at 50% 85%, rgba(255,180,60,0.18) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── SVG animated overlay ────────────────────────────────── */}
      <svg
        viewBox="0 0 800 380"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <style>{CSS}</style>
          <filter id="blur-glow"><feGaussianBlur stdDeviation="3" /></filter>
          <filter id="blur-ff"><feGaussianBlur stdDeviation="2.5" /></filter>
          <linearGradient id="darkFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="58%"  stopColor="rgba(6,15,30,0.38)" />
            <stop offset="100%" stopColor="#060F1E" />
          </linearGradient>
          <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(6,15,30,0.18)" />
            <stop offset="30%"  stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ── Birds with ground shadows ──────────────────────────── */}
        <AnimatePresence>
          {completed >= 1 && BIRDS.map((b, i) => (
            <motion.g key={b.sid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.7, duration: 1 }}
            >
              <Bird {...b} />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* ── Butterflies ───────────────────────────────────────── */}
        <AnimatePresence>
          {completed >= 3 && (
            <>
              {[
                { x: 340, y: 200, c: "#F8BBD9", c2: "#F48FB1", delay: 0.3, dur: 5.5 },
                { x: 520, y: 215, c: "#FFF9C4", c2: "#FFD54F", delay: 1.0, dur: 6.2 },
                { x: 460, y: 175, c: "#B3E5FC", c2: "#4FC3F7", delay: 1.8, dur: 4.8 },
              ].map((b, i) => (
                <motion.g key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: b.delay, duration: 0.7, type: "spring" }}
                >
                  <motion.g
                    animate={{ x: [0,20,-12,18,0], y: [0,-16,8,-10,0] }}
                    transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
                  >
                    {/* Upper wings */}
                    <ellipse cx={b.x-8} cy={b.y-7} rx="9" ry="12" fill={b.c} opacity="0.88"
                      style={{ transformBox:"fill-box", transformOrigin:`${b.x}px ${b.y}px`,
                               animation:`bf-wing ${0.38+i*0.04}s ease-in-out infinite alternate` }} />
                    <ellipse cx={b.x+8} cy={b.y-7} rx="9" ry="12" fill={b.c} opacity="0.88"
                      style={{ transformBox:"fill-box", transformOrigin:`${b.x}px ${b.y}px`,
                               animation:`bf-wing ${0.38+i*0.04}s ease-in-out infinite alternate-reverse` }} />
                    {/* Lower wings */}
                    <ellipse cx={b.x-6} cy={b.y+5} rx="6" ry="8" fill={b.c2} opacity="0.72"
                      style={{ transformBox:"fill-box", transformOrigin:`${b.x}px ${b.y}px`,
                               animation:`bf-wing ${0.38+i*0.04}s ease-in-out infinite alternate` }} />
                    <ellipse cx={b.x+6} cy={b.y+5} rx="6" ry="8" fill={b.c2} opacity="0.72"
                      style={{ transformBox:"fill-box", transformOrigin:`${b.x}px ${b.y}px`,
                               animation:`bf-wing ${0.38+i*0.04}s ease-in-out infinite alternate-reverse` }} />
                    {/* Body */}
                    <ellipse cx={b.x} cy={b.y} rx="1.8" ry="7" fill="#4E342E" />
                    {/* Antennae */}
                    <line x1={b.x} y1={b.y-7} x2={b.x-5} y2={b.y-16} stroke="#4E342E" strokeWidth="0.8" />
                    <line x1={b.x} y1={b.y-7} x2={b.x+5} y2={b.y-16} stroke="#4E342E" strokeWidth="0.8" />
                    <circle cx={b.x-5} cy={b.y-16} r="1.2" fill="#4E342E" />
                    <circle cx={b.x+5} cy={b.y-16} r="1.2" fill="#4E342E" />
                  </motion.g>
                </motion.g>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* ── Fireflies ─────────────────────────────────────────── */}
        <AnimatePresence>
          {completed >= 3 && FIREFLIES.map((f, i) => (
            <motion.g key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: f.delay * 0.4, duration: 0.8 }}
            >
              {/* Glow halo */}
              <circle cx={f.cx} cy={f.cy} r="7" fill="#D4FF5E" opacity="0"
                filter="url(#blur-ff)"
                style={{ animation:`firefly ${f.dur}s ease-in-out ${f.delay}s infinite` }} />
              {/* Core dot */}
              <circle cx={f.cx} cy={f.cy} r="2.2" fill="#ECFF5E" opacity="0"
                style={{ animation:`firefly ${f.dur}s ease-in-out ${f.delay}s infinite` }} />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* ── Edge vignettes ────────────────────────────────────── */}
        <rect x="0" y="0" width="800" height="380" fill="url(#topFade)" />
        <rect x="0" y="0" width="800" height="380" fill="url(#darkFade)" />
      </svg>
    </div>
  );
}
