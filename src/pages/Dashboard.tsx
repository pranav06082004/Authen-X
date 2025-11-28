import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut, History, User, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import AnalysisResult from "@/components/AnalysisResult";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleAnalyze = async (type: 'text' | 'url') => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-news', {
        body: {
          text: type === 'text' ? inputText : undefined,
          url: type === 'url' ? inputUrl : undefined,
        },
      });

      if (error) throw error;

      setResult(data);
      toast.success("Analysis complete!");

      // Clear inputs
      setInputText("");
      setInputUrl("");
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold glow-text">TruthGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/history")}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              {userRole === 'admin' && (
                <Button variant="ghost" onClick={() => navigate("/admin")}>
                  <Layout className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 glow-text">Analyze News</h1>
          <p className="text-muted-foreground mb-8">
            Enter news content or URL to verify its credibility
          </p>

          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Submit Content</CardTitle>
              <CardDescription>Choose text input or URL analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">News Article Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste news article content here..."
                      rows={10}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-gradient-hero"
                    onClick={() => handleAnalyze('text')}
                    disabled={!inputText.trim() || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                  </Button>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">News Article URL</Label>
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/news-article"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-gradient-hero"
                    onClick={() => handleAnalyze('url')}
                    disabled={!inputUrl.trim() || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze URL"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {result && <AnalysisResult result={result} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;