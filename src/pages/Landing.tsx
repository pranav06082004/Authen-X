import { Button } from "@/components/ui/button";
import { Shield, Zap, BarChart3, Lock, ArrowRight, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo3D } from "@/components/Logo3D";
import { useParallax } from "@/hooks/useParallax";
import { ParticleBackground } from "@/components/ParticleBackground";
import { StatsCounter } from "@/components/StatsCounter";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { AnimatedSection } from "@/components/AnimatedSection";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FAQSection } from "@/components/FAQSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TiltCard } from "@/components/TiltCard";

const Landing = () => {
  const scrollY = useParallax();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
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
              <ThemeToggle />
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

          {/* 3D A-X Logo */}
          <div 
            className="mt-12 max-w-4xl mx-auto"
            style={{
              transform: `translateY(${scrollY * -0.1}px)`,
            }}
          >
            <Logo3D />
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <StatsCounter />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-4">Powerful Features</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure accuracy and reliability
            </p>
          </AnimatedSection>

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
              <AnimatedSection key={index} delay={index * 150} direction="up">
                <TiltCard 
                  className="glass-card p-8 rounded-xl cursor-pointer h-full"
                  maxTilt={5}
                  scale={1.02}
                >
                  <div 
                    className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-6`}
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ transform: 'translateZ(20px)' }}>{feature.title}</h3>
                  <p className="text-muted-foreground" style={{ transform: 'translateZ(10px)' }}>
                    {feature.description}
                  </p>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Input Content", desc: "Paste news article text or provide a URL to analyze" },
              { step: 2, title: "AI Analysis", desc: "Our AI model processes and evaluates credibility" },
              { step: 3, title: "Get Results", desc: "Receive verdict, confidence score, and key insights" },
            ].map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 200} direction="up">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <AnimatedSection direction="up">
            <TiltCard 
              className="glass-card p-12 rounded-2xl text-center max-w-4xl mx-auto"
              maxTilt={3}
              scale={1.01}
            >
              <h2 className="text-4xl font-bold mb-6" style={{ transform: 'translateZ(20px)' }}>Ready to Verify Truth?</h2>
              <p className="text-xl text-muted-foreground mb-8" style={{ transform: 'translateZ(15px)' }}>
                Join thousands using AuthenX to combat misinformation
              </p>
              <Link to="/auth" style={{ transform: 'translateZ(30px)', display: 'inline-block' }}>
                <Button size="lg" className="bg-gradient-hero text-lg px-8">
                  Get Started for Free
                </Button>
              </Link>
            </TiltCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/50 bg-card/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-7 w-7 text-primary" />
                <span className="font-bold text-xl">AuthenX</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                AI-Powered Authenticity Detection Platform. Fighting misinformation with cutting-edge technology.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:contact@authenx.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link to="/history" className="hover:text-primary transition-colors">Analysis History</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for the latest updates.
              </p>
              <NewsletterSignup />
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 AuthenX. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;