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
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: -2.34578, y: 4.10711 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateY = (mouseX / (rect.width / 2)) * 5;
    const rotateX = -(mouseY / (rect.height / 2)) * 3;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: -2.34578, y: 4.10711 });
  };

  return (
    <div 
      className="stat-card-3d-container"
      style={{ perspective: '1500px' }}
    >
      <div 
        ref={cardRef}
        className="text-center group p-6 rounded-xl bg-white/[0.03] backdrop-blur-sm"
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          zIndex: 0,
          transform: isHovered 
            ? `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg) translateZ(20px)` 
            : `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: isHovered ? '3px solid rgb(139, 92, 246)' : '2px solid rgb(139, 92, 246)',
          transition: 'transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease',
          boxShadow: isHovered
            ? '0 20px 40px rgba(139, 92, 246, 0.3), 0 0 20px rgba(124, 58, 237, 0.25)'
            : '0 4px 20px rgba(139, 92, 246, 0.1)',

        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-hero mb-5 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-hero bg-clip-text text-transparent">
          {stat.value >= 1000 
            ? `${(count / 1000).toFixed(count >= 1000 ? 0 : 1)}k`
            : count}
          {stat.suffix}
        </div>
        <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</div>

      </div>
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
    <section ref={sectionRef} className="py-24 px-6 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-card rounded-2xl p-8 sm:p-10 md:p-14">
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">

            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} isVisible={isVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
