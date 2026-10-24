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
      {/* Text-based monogram mark (no shield) */}
      <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Authen-X logo">
        <defs>
          <linearGradient id="ax-mark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#0E7490" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="34" height="34" rx="10" fill="none" stroke="url(#ax-mark)" strokeWidth="2.2" />
        <text
          x="20"
          y="26.5"
          textAnchor="middle"
          fontFamily="Outfit, sans-serif"
          fontSize="17"
          fontWeight="700"
          fill="url(#ax-mark)"
        >
          AX
        </text>
      </svg>

      {showText && (
        <span className={`font-semibold text-lg tracking-tight ${textClassName}`}>Authen-X</span>
      )}
    </span>
  );
}
