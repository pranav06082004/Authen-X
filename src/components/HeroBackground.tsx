import { Code2, MonitorSmartphone, GraduationCap } from "lucide-react";

const STARS = [
  { top: "18%", left: "46%", size: 3, opacity: 0.55 },
  { top: "26%", left: "53%", size: 2, opacity: 0.4 },
  { top: "34%", left: "42%", size: 2, opacity: 0.35 },
  { top: "40%", left: "57%", size: 3, opacity: 0.5 },
  { top: "48%", left: "49%", size: 2, opacity: 0.45 },
  { top: "22%", left: "60%", size: 2, opacity: 0.3 },
  { top: "56%", left: "44%", size: 2, opacity: 0.3 },
  { top: "30%", left: "36%", size: 2, opacity: 0.25 },
  { top: "62%", left: "55%", size: 3, opacity: 0.35 },
  { top: "44%", left: "64%", size: 2, opacity: 0.25 },
];

const CHIPS = [
  { icon: Code2, className: "top-[16%] right-[10%]", delay: "0s" },
  { icon: MonitorSmartphone, className: "top-[46%] left-[7%]", delay: "1.2s" },
  { icon: GraduationCap, className: "top-[52%] right-[8%]", delay: "2.1s" },
];

/**
 * Premium dark hero backdrop: near-black base, violet spotlight glow,
 * faint orbital arcs, starfield dots and floating glass chips.
 * Purely decorative — always sits behind content.
 */
export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Near-black base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Violet spotlight glow — brightest low-center, behind the CTAs */}
      <div
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[70vh] md:w-[900px] md:h-[900px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.55) 0%, rgba(124,58,237,0.32) 32%, rgba(124,58,237,0.10) 58%, rgba(0,0,0,0) 78%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[40vh] md:w-[620px] md:h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.45) 0%, rgba(124,58,237,0.18) 45%, rgba(0,0,0,0) 75%)",
          filter: "blur(120px)",
        }}
      />

      {/* Faint orbital arcs */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-120 780 C 320 520, 760 360, 1560 120"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M-160 520 C 380 700, 980 700, 1600 400"
          stroke="rgba(255,255,255,0.055)"
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

      {/* Floating glass chips — hidden on small screens */}
      {CHIPS.map(({ icon: Icon, className, delay }, i) => (
        <div
          key={i}
          className={`hidden md:flex absolute ${className} w-12 h-12 items-center justify-center rounded-2xl animate-float`}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animationDelay: delay,
          }}
        >
          <Icon className="h-5 w-5 text-white/70" />
        </div>
      ))}

      {/* Vignette so edges fade to pure black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 78%, #000 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackground;
