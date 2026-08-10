import { AnimatedSection } from "@/components/AnimatedSection";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Renders the heading as h2 by default; use h1 only in the hero. */
  as?: "h2" | "h3";
  className?: string;
}

/**
 * Unified section heading: single type scale + consistent bottom spacing
 * so every landing page section aligns the same way.
 */
export const SectionHeading = ({
  title,
  subtitle,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) => {
  return (
    <AnimatedSection>
      <div className={`text-center max-w-2xl mx-auto mb-14 ${className}`}>
        <Tag className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
          {title}
        </Tag>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </AnimatedSection>
  );
};
