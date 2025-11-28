import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

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
          label: 'Likely Real',
        };
      case 'FAKE':
        return {
          icon: XCircle,
          color: 'text-warning',
          bgGradient: 'bg-gradient-warning',
          label: 'Likely Fake',
        };
      case 'UNCERTAIN':
        return {
          icon: HelpCircle,
          color: 'text-uncertain',
          bgGradient: 'bg-muted',
          label: 'Uncertain',
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <Card className="glass-card animate-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${config.bgGradient} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl">{config.label}</div>
            <div className="text-sm text-muted-foreground font-normal">
              Confidence: {result.confidence.toFixed(1)}%
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className="font-bold">{result.confidence.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${config.bgGradient} transition-all duration-1000`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* Key Phrases */}
        {result.keyPhrases && result.keyPhrases.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Key Phrases Detected</h4>
            <div className="flex flex-wrap gap-2">
              {result.keyPhrases.map((phrase, idx) => (
                <Badge key={idx} variant="secondary" className="glass-card">
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Info */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            This analysis was performed using advanced AI algorithms. Results should be 
            used as a guide and verified with additional sources when making important decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;