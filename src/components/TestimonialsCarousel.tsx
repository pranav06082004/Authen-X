import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Journalist, Tech Daily",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    review: "AuthenX has become an essential tool in my workflow. It's saved me countless hours verifying sources and has caught several misleading articles before publication.",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Research Analyst",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    review: "The accuracy is impressive. I've tested it against known fake news articles and it correctly identified them every time. A must-have for anyone who values truth.",
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Social Media Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 4,
    review: "Before sharing any news on our company accounts, we run it through AuthenX. It's given us confidence and protected our brand reputation multiple times.",
  },
  {
    id: 4,
    name: "David Kim",
    role: "University Professor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    review: "I recommend AuthenX to all my students. Teaching media literacy is crucial, and this tool provides practical, real-world verification skills.",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    rating: 5,
    review: "The detailed analysis breakdown helps me understand exactly why something might be misleading. It's educational and protective at the same time.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + testimonials.length) % testimonials.length;
      visible.push({ ...testimonials[index], position: i });
    }
    return visible;
  };

  return (
    <section className="py-20 px-6 relative z-10 overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users say about fighting misinformation with AuthenX
          </p>
        </div>

        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Carousel */}
          <div className="flex items-center justify-center gap-4 md:gap-6 min-h-[320px]">
            {getVisibleTestimonials().map((testimonial) => (
              <div
                key={`${testimonial.id}-${testimonial.position}`}
                className={`glass-card rounded-2xl p-6 md:p-8 transition-all duration-500 ${
                  testimonial.position === 0
                    ? "scale-100 opacity-100 z-10 w-full md:w-[400px]"
                    : "scale-90 opacity-40 hidden md:block w-[300px]"
                }`}
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-foreground/90 mb-6 leading-relaxed">
                  "{testimonial.review}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-muted"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <StarRating rating={testimonial.rating} />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
