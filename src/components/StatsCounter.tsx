import { useEffect, useRef, useState } from "react";
import { Shield, Target, Users } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { icon: Shield, value: 150000, suffix: "+", label: "Analyses Performed" },
  { icon: Target, value: 98.7, suffix: "%", label: "Accuracy Rate" },
  { icon: Users, value: 25000, suffix: "+", label: "Users Protected" },
];

const useCountUp = (end: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);
  const isDecimal = end % 1 !== 0;

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = easeOutQuart * end;
      
      setCount(isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, isDecimal]);

  return count;
};

const StatCard = ({ stat, isVisible }: { stat: StatItem; isVisible: boolean }) => {
  const count = useCountUp(stat.value, 2500, isVisible);
  const Icon = stat.icon;

  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
        {stat.value >= 1000 
          ? `${(count / 1000).toFixed(count >= 1000 ? 0 : 1)}k`
          : count}
        {stat.suffix}
      </div>
      <div className="text-muted-foreground font-medium">{stat.label}</div>
    </div>
  );
};

export const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-6 relative z-10">
      <div className="container mx-auto">
        <div className="glass-card rounded-2xl p-10 md:p-14">
          <div className="grid md:grid-cols-3 gap-10">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} isVisible={isVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
