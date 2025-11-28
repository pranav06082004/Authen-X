import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'REAL':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'FAKE':
        return <XCircle className="h-5 w-5 text-warning" />;
      default:
        return <HelpCircle className="h-5 w-5 text-uncertain" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold glow-text">TruthGuard</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 glow-text">Analysis History</h1>
          <p className="text-muted-foreground mb-8">
            View all your previous news analysis results
          </p>

          {isLoading ? (
            <Card className="glass-card">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading history...</p>
              </CardContent>
            </Card>
          ) : analyses.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No analyses yet. Start by analyzing some news!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getVerdictIcon(analysis.result)}
                        <div>
                          <CardTitle className="text-lg">{analysis.result}</CardTitle>
                          <CardDescription>
                            {new Date(analysis.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {analysis.confidence.toFixed(1)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analysis.input_text && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {analysis.input_text}
                      </p>
                    )}
                    {analysis.input_url && (
                      <p className="text-sm text-secondary mb-3 truncate">
                        URL: {analysis.input_url}
                      </p>
                    )}
                    {analysis.key_phrases && analysis.key_phrases.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {analysis.key_phrases.map((phrase: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;