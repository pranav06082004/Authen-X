const STARS = [
  { top: 170, left: "46%", size: 3, opacity: 0.55 },
  { top: 250, left: "53%", size: 2, opacity: 0.4 },
  { top: 320, left: "42%", size: 2, opacity: 0.35 },
  { top: 400, left: "57%", size: 3, opacity: 0.5 },
  { top: 470, left: "49%", size: 2, opacity: 0.45 },
  { top: 220, left: "60%", size: 2, opacity: 0.3 },
  { top: 560, left: "44%", size: 2, opacity: 0.3 },
  { top: 300, left: "36%", size: 2, opacity: 0.25 },
  { top: 620, left: "55%", size: 3, opacity: 0.35 },
  { top: 440, left: "64%", size: 2, opacity: 0.25 },
];

/**
 * Premium dark page backdrop: near-black base, violet spotlight glow behind
 * the hero, faint orbital arcs, starfield dots and floating glass chips,
 * plus softer ambient glows further down the page.
 * Purely decorative — always sits behind content.
 */
export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Near-black base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Violet spotlight glow — brightest behind the headline / CTAs */}
      <div
        className="absolute left-1/2 top-[420px] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[560px] md:w-[900px] md:h-[900px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.55) 0%, rgba(124,58,237,0.32) 32%, rgba(124,58,237,0.10) 58%, rgba(0,0,0,0) 78%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[620px] -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[340px] md:w-[620px] md:h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.45) 0%, rgba(124,58,237,0.18) 45%, rgba(0,0,0,0) 75%)",
          filter: "blur(120px)",
        }}
      />

      {/* Ambient glows further down the page */}
      <div
        className="absolute left-[-10%] top-[45%] w-[70vw] h-[40vh] md:w-[700px] md:h-[700px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.16) 0%, rgba(124,58,237,0.06) 45%, rgba(0,0,0,0) 75%)",
          filter: "blur(130px)",
        }}
      />
      <div
        className="absolute right-[-10%] top-[70%] w-[70vw] h-[40vh] md:w-[700px] md:h-[700px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(20,184,166,0.14) 0%, rgba(16,185,129,0.05) 45%, rgba(0,0,0,0) 75%)",
          filter: "blur(140px)",
        }}
      />

      {/* Faint orbital arcs sweeping across the page */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 3000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-120 900 C 320 520, 760 300, 1560 60"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M-160 560 C 380 820, 980 820, 1600 420"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="1"
        />
        <path
          d="M-160 1900 C 420 1500, 1000 2300, 1600 1700"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <path
          d="M-160 2600 C 460 2200, 980 2850, 1600 2350"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      </svg>

      {/* Starfield inside the glow */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {/* Vignette so edges fade to pure black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 30% at 50% 420px, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackground;
