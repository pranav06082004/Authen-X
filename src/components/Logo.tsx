type LogoProps = {
  size?: number;
  showText?: boolean;
  textClassName?: string;
};

export default function Logo({
  size = 36,
  showText = true,
  textClassName = "text-slate-900 dark:text-white",
}: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Authen-X logo">
        <defs>
          <linearGradient id="ax-shield" x1="6" y1="3" x2="34" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#10244F" />
            <stop offset="1" stopColor="#0B1B3A" />
          </linearGradient>
          <linearGradient id="ax-verified" x1="13" y1="13" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Shield */}
        <path
          d="M20 3 L34 8 V19 C34 27 28 33 20 37 C12 33 6 27 6 19 V8 Z"
          fill="url(#ax-shield)"
          stroke="#22D3EE"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Unverified stroke (dimmed) */}
        <path d="M26.5 13.5 L13.5 26.5" stroke="#fff" strokeOpacity="0.4" strokeWidth="3.4" strokeLinecap="round" />

        {/* Verified stroke, with a navy gap where it crosses */}
        <path d="M13.5 13.5 L26.5 26.5" stroke="#0B1B3A" strokeWidth="7" strokeLinecap="round" />
        <path d="M13.5 13.5 L26.5 26.5" stroke="url(#ax-verified)" strokeWidth="3.4" strokeLinecap="round" />
      </svg>

      {showText && (
        <span className={`font-semibold text-lg tracking-tight ${textClassName}`}>Authen-X</span>
      )}
    </span>
  );
}