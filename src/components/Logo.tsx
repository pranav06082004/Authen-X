
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
      <img
        src="/favicon.svg"
        width={size}
        height={size}
        alt="Authen-X logo"
        className="shrink-0 object-contain"
      />

      {showText && (
        <span
          className={`font-semibold text-lg tracking-tight ${textClassName}`}
        >
          Authen-X
        </span>
      )}
    </span>
  );
}
