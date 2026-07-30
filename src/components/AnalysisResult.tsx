import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Shield,
  Info,
  ListChecks,
  BookOpen,
  Quote,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface AnalysisResultData {
  verdict: "REAL" | "FAKE" | "UNCERTAIN";
  confidence: number;
  summary?: string;
  reasons?: { title: string; detail: string; impact?: "supports_real" | "supports_fake" | "unclear" }[];
  claims?: { claim: string; status: "credible" | "suspicious" | "misleading" | "unverifiable"; note?: string }[];
  evidence?: {
    verifiedFacts?: string[];
    assumptions?: string[];
    limitations?: string;
  };
  keyPhrases?: string[];
  styleSignals?: string[];
  finalVerdict?: string;
  liveSourcesUsed?: boolean;
}

const verdictConfig = {
  REAL: {
    icon: CheckCircle2,
    label: "Likely Real",
    description: "The information looks credible and consistent with what we could check.",
    tone: "text-success",
    ring: "border-success/30",
    chip: "bg-success/10 text-success border-success/30",
  },
  FAKE: {
    icon: XCircle,
    label: "Likely Fake",
    description: "The content contains strong indicators of false or misleading claims.",
    tone: "text-destructive",
    ring: "border-destructive/30",
    chip: "bg-destructive/10 text-destructive border-destructive/30",
  },
  UNCERTAIN: {
    icon: HelpCircle,
    label: "Uncertain — Needs Verification",
    description: "There isn't enough reliable evidence to confidently classify this news.",
    tone: "text-warning",
    ring: "border-warning/30",
    chip: "bg-warning/10 text-warning border-warning/30",
  },
} as const;

const claimStatusStyles: Record<string, string> = {
  credible: "bg-success/10 text-success border-success/30",
  suspicious: "bg-warning/10 text-warning border-warning/30",
  misleading: "bg-destructive/10 text-destructive border-destructive/30",
  unverifiable: "bg-muted text-muted-foreground border-border",
};

const claimStatusLabel: Record<string, string> = {
  credible: "Looks credible",
  suspicious: "Suspicious",
  misleading: "Misleading",
  unverifiable: "Can't be verified",
};

const AnalysisResult = ({ result }: { result: AnalysisResultData }) => {
  const config = verdictConfig[result.verdict] ?? verdictConfig.UNCERTAIN;
  const Icon = config.icon;

  const confidenceLabel =
    result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Moderate" : result.confidence >= 40 ? "Low" : "Very low";

  const reasons = result.reasons ?? [];
  const claims = result.claims ?? [];
  const verifiedFacts = result.evidence?.verifiedFacts ?? [];
  const assumptions = result.evidence?.assumptions ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Verdict */}
      <Card className={`glass-card border-2 ${config.ring}`}>
        <CardHeader>
          <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={`w-14 h-14 rounded-2xl border-2 ${config.ring} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-7 w-7 ${config.tone}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-2xl font-bold ${config.tone}`}>{config.label}</span>
                <Badge variant="outline" className={config.chip}>
                  Detection Result
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-normal mt-1">{config.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <Shield className="h-5 w-5 text-primary" />
                Confidence
              </span>
              <span className={`text-2xl font-bold ${config.tone}`}>{Math.round(result.confidence)}%</span>
            </div>
            <Progress value={result.confidence} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {confidenceLabel} confidence. This is an AI prediction, not proof — always double-check important news yourself.
            </p>
          </div>

          {result.summary && <p className="text-sm leading-relaxed">{result.summary}</p>}

          {result.keyPhrases && result.keyPhrases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Phrases we focused on</h4>
              <div className="flex flex-wrap gap-2">
                {result.keyPhrases.map((phrase, i) => (
                  <Badge key={i} variant="secondary" className="glass-card font-normal">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why */}
      {reasons.length > 0 && (
        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              Why did we get this result?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reasons.map((reason, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm">{reason.title}</p>
                  {reason.impact && (
                    <Badge
                      variant="outline"
                      className={
                        reason.impact === "supports_real"
                          ? claimStatusStyles.credible
                          : reason.impact === "supports_fake"
                          ? claimStatusStyles.misleading
                          : claimStatusStyles.unverifiable
                      }
                    >
                      {reason.impact === "supports_real"
                        ? "Points to real"
                        : reason.impact === "supports_fake"
                        ? "Points to fake"
                        : "Unclear"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{reason.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Claims */}
      {claims.length > 0 && (
        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Quote className="h-5 w-5 text-primary" />
              Main claims in this content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {claims.map((c, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/60 space-y-2">
                <p className="text-sm font-medium">"{c.claim}"</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={claimStatusStyles[c.status] ?? claimStatusStyles.unverifiable}>
                    {claimStatusLabel[c.status] ?? "Can't be verified"}
                  </Badge>
                  {c.note && <span className="text-xs text-muted-foreground">{c.note}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Evidence */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Key evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-success">Checked facts</h4>
            {verifiedFacts.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {verifiedFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nothing in this content could be confirmed against a reliable source.</p>
            )}
          </div>

          {assumptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-warning">Assumptions (not facts)</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {result.styleSignals && result.styleSignals.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Writing-style hints (weak signals only)</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {result.styleSignals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Style alone never decides the result — badly written news can be true, and polished text can be false.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final verdict */}
      {result.finalVerdict && (
        <Card className={`glass-card border-2 ${config.ring}`}>
          <CardHeader>
            <CardTitle className="text-lg">Final verdict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{result.finalVerdict}</p>
          </CardContent>
        </Card>
      )}

      {/* Transparency */}
      <Card className="glass-card border border-warning/30 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Please read this before you trust the result</p>
              <p className="text-xs text-muted-foreground">
                {result.evidence?.limitations ||
                  "This analysis is based only on the text you provided and the AI's general knowledge."}{" "}
                {result.liveSourcesUsed
                  ? ""
                  : "No live web search was used, so recent events cannot be confirmed."}{" "}
                Treat this as a helpful signal, not a final truth — verify important claims with official or well-known news sources.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Analysis powered by AuthenX AI.
      </p>
    </div>
  );
};

export default AnalysisResult;
