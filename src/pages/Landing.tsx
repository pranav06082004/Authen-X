import { Button } from "@/components/ui/button";
import { Shield, Zap, BarChart3, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Shield3DCanvas } from "@/components/Shield3DCanvas";
import { useParallax } from "@/hooks/useParallax";
import { useState } from "react";

const Landing = () => {
  const scrollY = useParallax();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-primary font-medium">
                Home
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-hero">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Parallax background elements */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div 
            className="inline-block mb-6 px-4 py-2 glass-card rounded-full"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            <span className="text-sm text-secondary font-medium">AI-Powered Truth Detection</span>
          </div>
          
          <h1 
            className="text-6xl md:text-7xl font-bold mb-6 glow-text"
            style={{
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          >
            Stop Fake News<br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              With AI Precision
            </span>
          </h1>
          
          <p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            Advanced machine learning algorithms analyze news articles in real-time, 
            providing instant credibility scores and detailed analysis.
          </p>

          <div 
            className="flex gap-4 justify-center"
            style={{
              transform: `translateY(${scrollY * 0.25}px)`,
            }}
          >
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-hero text-lg px-8">
                Start Analyzing <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* 3D Shield */}
          <div 
            className="mt-16 max-w-4xl mx-auto"
            style={{
              transform: `translateY(${scrollY * -0.1}px)`,
            }}
          >
            <Shield3DCanvas />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Built with cutting-edge technology to ensure accuracy and reliability
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Analysis",
                description: "Get real-time credibility scores and detailed analysis within seconds. Our AI processes articles at lightning speed.",
                gradient: "bg-gradient-hero"
              },
              {
                icon: BarChart3,
                title: "Confidence Scoring",
                description: "Receive detailed confidence percentages and key phrase analysis to understand the reasoning behind each verdict.",
                gradient: "bg-gradient-success"
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "Your data is encrypted and protected. Track your analysis history privately with role-based access control.",
                gradient: "bg-gradient-warning"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  transform: hoveredCard === index 
                    ? 'translateY(-12px) rotateX(5deg) scale(1.03)' 
                    : 'translateY(0) rotateX(0) scale(1)',
                  boxShadow: hoveredCard === index 
                    ? '0 20px 40px rgba(34, 211, 238, 0.3)' 
                    : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div 
                  className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300`}
                  style={{
                    transform: hoveredCard === index ? 'translateZ(20px) rotateY(10deg)' : 'translateZ(0)',
                  }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Input Content</h3>
              <p className="text-muted-foreground">
                Paste news article text or provide a URL to analyze
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI model processes and evaluates credibility
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Get Results</h3>
              <p className="text-muted-foreground">
                Receive verdict, confidence score, and key insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-card p-12 rounded-2xl text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Verify Truth?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands using AuthenX to combat misinformation
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-hero text-lg px-8">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 AuthenX. AI-Powered Authenticity Detection Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;