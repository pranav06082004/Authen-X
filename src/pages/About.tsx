import { Button } from "@/components/ui/button";
import { Shield, Brain, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary cursor-pointer" onClick={() => navigate("/")} />
            </div>
            <div className="flex items-center gap-6">
              <div className="cursor-pointer text-foreground hover:text-primary transition-colors" onClick={() => navigate("/")}>
                Home
              </div>
              <div className="text-primary font-medium">
                About
              </div>
              <div className="cursor-pointer text-foreground hover:text-primary transition-colors" onClick={() => navigate("/contact")}>
                Contact
              </div>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-hero">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 glow-text">About AuthenX</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-xl text-muted-foreground">
              AuthenX is an AI-powered platform designed to combat misinformation 
              by analyzing news articles and providing credibility assessments in real-time.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="glass-card p-6 rounded-xl">
                <Brain className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Advanced AI</h3>
                <p className="text-muted-foreground">
                  Powered by state-of-the-art machine learning models trained on millions of articles
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <Target className="h-12 w-12 text-success mb-4" />
                <h3 className="text-xl font-bold mb-2">High Accuracy</h3>
                <p className="text-muted-foreground">
                  Achieves industry-leading accuracy in fake news detection
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <Zap className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">Real-time Analysis</h3>
                <p className="text-muted-foreground">
                  Get instant results with detailed confidence scores and reasoning
                </p>
              </div>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                In an age of information overload, distinguishing fact from fiction has become 
                increasingly challenging. AuthenX was created to empower users with the tools 
                they need to verify information quickly and accurately.
              </p>
              <p className="text-muted-foreground">
                Our platform combines advanced natural language processing, machine learning, 
                and deep learning techniques to analyze news content and provide users with 
                reliable credibility assessments. We believe in transparent, explainable AI 
                that helps users understand not just what is true, but why.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h2 className="text-3xl font-bold mb-4">Technology</h2>
              <p className="text-muted-foreground mb-4">
                AuthenX utilizes cutting-edge AI models including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Transformer-based language models for semantic understanding</li>
                <li>Named entity recognition for fact-checking key claims</li>
                <li>Sentiment analysis to detect emotional manipulation</li>
                <li>Source credibility assessment using historical data</li>
                <li>Cross-referencing with verified news databases</li>
              </ul>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-gradient-hero text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Start Using AuthenX
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;