import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  ScanSearch,
  ListChecks,
  FileSearch,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface MediaAnalysisResultData {
  kind?: "media";
  verdict: "AUTHENTIC" | "LIKELY_MANIPULATED" | "UNCERTAIN";
  confidence: number;
  summary?: string;
  findings?: { title: string; detail: string; impact?: "supports_authentic" | "supports_manipulated" | "unclear" }[];
  metadataObservations?: string[];
  limitations?: string;
  finalVerdict?: string;
  hasMetadata?: boolean;
}

const verdictConfig = {
  AUTHENTIC: {
    icon: CheckCircle2,
    label: "Looks Authentic",
    description: "No clear signs of editing were found in the image.",
    tone: "text-success",
    ring: "border-success/30",
    chip: "bg-success/10 text-success border-success/30",
  },
  LIKELY_MANIPULATED: {
    icon: XCircle,
    label: "Likely Doctored",
    description: "The image shows multiple indicators of digital manipulation.",
    tone: "text-destructive",
    ring: "border-destructive/30",
    chip: "bg-destructive/10 text-destructive border-destructive/30",
  },
  UNCERTAIN: {
    icon: HelpCircle,
    label: "Uncertain — Needs Verification",
    description: "There isn't enough reliable evidence to confidently classify this image.",
    tone: "text-warning",
    ring: "border-warning/30",
    chip: "bg-warning/10 text-warning border-warning/30",
  },
} as const;

const impactStyles: Record<string, string> = {
  supports_authentic: "bg-success/10 text-success border-success/30",
  supports_manipulated: "bg-destructive/10 text-destructive border-destructive/30",
  unclear: "bg-muted text-muted-foreground border-border",
};

const impactLabel: Record<string, string> = {
  supports_authentic: "Points to real",
  supports_manipulated: "Points to edited",
  unclear: "Unclear",
};

interface MediaAnalysisResultProps {
  result: MediaAnalysisResultData;
  imageUrl?: string;
}

const MediaAnalysisResult = ({ result, imageUrl }: MediaAnalysisResultProps) => {
  const config = verdictConfig[result.verdict] ?? verdictConfig.UNCERTAIN;
  const Icon = config.icon;

  const confidenceLabel =
    result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Moderate" : result.confidence >= 40 ? "Low" : "Very low";

  const findings = result.findings ?? [];
  const metadataObservations = result.metadataObservations ?? [];

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
                  Image Forensics Result
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-normal mt-1">{config.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {imageUrl && (
            <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20">
              <img src={imageUrl} alt="Analysed image" className="max-h-80 w-full object-contain" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <ScanSearch className="h-5 w-5 text-primary" />
                Confidence
              </span>
              <span className={`text-2xl font-bold ${config.tone}`}>{Math.round(result.confidence)}%</span>
            </div>
            <Progress value={result.confidence} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {confidenceLabel} confidence. This is an AI-based estimate, not proof — even authentic-looking images can be edited.
            </p>
          </div>

          {result.summary && <p className="text-sm leading-relaxed">{result.summary}</p>}
        </CardContent>
      </Card>

      {/* Findings */}
      {findings.length > 0 && (
        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              What did we find in the image?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.map((finding, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm">{finding.title}</p>
                  {finding.impact && (
                    <Badge variant="outline" className={impactStyles[finding.impact] ?? impactStyles.unclear}>
                      {impactLabel[finding.impact] ?? "Unclear"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{finding.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSearch className="h-5 w-5 text-primary" />
            File metadata check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {metadataObservations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {metadataObservations.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {result.hasMetadata
                ? "Metadata was found in the file but revealed nothing notable."
                : "No camera or editing metadata was readable from this file."}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Metadata is read directly from your file — it is real evidence, not a guess. But its absence is normal: apps and
            messengers strip metadata on upload, so a missing camera tag alone does not mean the image is fake.
          </p>
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
                {result.limitations ||
                  "This analysis is based only on the image you provided and its file metadata."}{" "}
                No reverse image search was performed, so we could not check where this image originally appeared. Treat this
                as a helpful signal, not a final truth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Image forensics powered by AuthenX AI.
      </p>
    </div>
  );
};

export default MediaAnalysisResult;
