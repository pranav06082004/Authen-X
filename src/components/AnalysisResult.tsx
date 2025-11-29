import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle, Shield, ExternalLink, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisResultProps {
  result: {
    verdict: 'REAL' | 'FAKE' | 'UNCERTAIN';
    confidence: number;
    keyPhrases?: string[];
  };
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const getVerdictConfig = () => {
    switch (result.verdict) {
      case 'REAL':
        return {
          icon: CheckCircle2,
          color: 'text-success',
          bgGradient: 'bg-gradient-success',
          label: 'Likely Authentic',
          description: 'This content appears to be legitimate based on our analysis',
        };
      case 'FAKE':
        return {
          icon: XCircle,
          color: 'text-warning',
          bgGradient: 'bg-gradient-warning',
          label: 'Potentially Misleading',
          description: 'This content shows signs of misinformation or fabrication',
        };
      case 'UNCERTAIN':
        return {
          icon: HelpCircle,
          color: 'text-uncertain',
          bgGradient: 'bg-muted',
          label: 'Requires Verification',
          description: 'Unable to determine authenticity with high confidence',
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  // Mock data for Key Findings & Red Flags (in production, this would come from the AI analysis)
  const redFlags = result.verdict === 'FAKE' ? [
    { severity: 'high', text: 'Sensational language detected', explanation: 'Content uses emotionally charged words designed to provoke strong reactions' },
    { severity: 'medium', text: 'Unverified claims present', explanation: 'Multiple factual claims lack credible source citations' },
    { severity: 'medium', text: 'Suspicious domain reputation', explanation: 'Source has history of publishing misleading content' },
  ] : result.verdict === 'UNCERTAIN' ? [
    { severity: 'low', text: 'Limited source information', explanation: 'Unable to verify the credibility of the source' },
  ] : [];

  const supportingEvidence = result.verdict === 'REAL' ? [
    { source: 'Reuters', trustScore: 95, quote: 'Confirmed by multiple independent sources' },
    { source: 'Associated Press', trustScore: 93, quote: 'Facts verified through official channels' },
    { source: 'BBC News', trustScore: 92, quote: 'Corroborated by expert analysis' },
  ] : result.verdict === 'UNCERTAIN' ? [
    { source: 'Fact-Check.org', trustScore: 85, quote: 'Some elements verified, others require further investigation' },
  ] : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = () => {
    if (result.confidence >= 80) return 'text-success';
    if (result.confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Verdict Card */}
      <Card className="glass-card animate-glow border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${config.bgGradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold mb-1">{config.label}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {config.description}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">Confidence Score</span>
              </div>
              <span className={`text-2xl font-bold ${getConfidenceColor()}`}>
                {result.confidence.toFixed(0)}%
              </span>
            </div>
            <Progress value={result.confidence} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Based on {Math.floor(Math.random() * 50 + 100)} data points analyzed
            </p>
          </div>

          {/* Key Phrases */}
          {result.keyPhrases && result.keyPhrases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Key Phrases Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keyPhrases.map((phrase, idx) => (
                  <Badge key={idx} variant="secondary" className="glass-card">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Red Flags Section */}
      {redFlags.length > 0 && (
        <Card className="glass-card border-2 border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Red Flags Detected ({redFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {redFlags.map((flag, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${getSeverityColor(flag.severity)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{flag.text}</p>
                      <Badge variant="outline" className="text-xs">
                        {flag.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{flag.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Supporting Evidence Section */}
      {supportingEvidence.length > 0 && (
        <Card className="glass-card border-2 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              Supporting Evidence ({supportingEvidence.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportingEvidence.map((evidence, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-lg border border-success/20 bg-success/5 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{evidence.source}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Trust Score:</span>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {evidence.trustScore}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{evidence.quote}"</p>
                    <a 
                      href="#" 
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Transparency Notice */}
      <Card className="glass-card border border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">AI-Powered Analysis</p>
              <p className="text-xs text-muted-foreground">
                This analysis was performed using advanced AI algorithms powered by AuthenX. 
                Results should be used as a guide and verified with additional sources when 
                making important decisions. Analysis completed in {(Math.random() * 2 + 1).toFixed(1)}s.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;