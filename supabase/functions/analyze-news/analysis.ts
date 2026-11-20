export interface SourceReference {
  title: string;
  url: string;
  publishedAt: string | null;
}

export interface NormalizedNewsAnalysis {
  verdict: 'REAL' | 'FAKE' | 'UNCERTAIN';
  confidence: number;
  summary: string;
  reasons: Array<{ title: string; detail: string; impact: 'supports_real' | 'supports_fake' | 'unclear' }>;
  claims: Array<{ claim: string; status: 'credible' | 'suspicious' | 'misleading' | 'unverifiable'; note: string }>;
  evidence: {
    verifiedFacts: string[];
    assumptions: string[];
    limitations: string;
  };
  keyPhrases: string[];
  styleSignals: string[];
  finalVerdict: string;
  sources: SourceReference[];
  liveSourcesUsed: boolean;
}

const RECENT_EVENT_PATTERN = /\b(?:today|tonight|this morning|this evening|yesterday|last night|last week|recently|recent|breaking|just now|some days ago|a few days ago|died|dead|death|deceased|passed away|is alive|still alive|resigned|arrested|detained|elected|appointed|announced|launched|acquired|fired|dismissed|injured|killed|missing)\b/i;
const SEARCH_ENGINE_HOSTS = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];

export function isTimeSensitiveNews(text: string): boolean {
  return RECENT_EVENT_PATTERN.test(text);
}

function normalizeSources(value: unknown): SourceReference[] {
  if (!Array.isArray(value)) return [];

  const sources: SourceReference[] = [];
  const seenHosts = new Set<string>();

  for (const item of value.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.url !== 'string' || typeof candidate.title !== 'string') continue;

    try {
      const parsed = new URL(candidate.url);
      const host = parsed.hostname.toLowerCase();
      if (parsed.protocol !== 'https:' || !host || SEARCH_ENGINE_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) continue;
      if (seenHosts.has(host)) continue;

      const publishedAt = typeof candidate.publishedAt === 'string' && !Number.isNaN(Date.parse(candidate.publishedAt))
        ? candidate.publishedAt.slice(0, 40)
        : null;
      sources.push({
        title: candidate.title.trim().slice(0, 240) || host,
        url: parsed.toString(),
        publishedAt,
      });
      seenHosts.add(host);
      if (sources.length >= 6) break;
    } catch {
      // Discard malformed source links rather than showing untrusted URLs.
    }
  }

  return sources;
}

function stringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').slice(0, limit);
}

export function normalizeNewsAnalysis(raw: unknown, input: string): NormalizedNewsAnalysis {
  const ai = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const rawEvidence = ai.evidence && typeof ai.evidence === 'object' ? ai.evidence as Record<string, unknown> : {};
  const sources = normalizeSources(ai.sources);
  const timeSensitive = isTimeSensitiveNews(input);
  const corroborated = ai.searchAssessment === 'corroborated' && sources.length >= 2;
  const needsAbstention = timeSensitive && !corroborated;
  const allowedVerdicts = ['REAL', 'FAKE', 'UNCERTAIN'] as const;
  const suggestedVerdict = typeof ai.verdict === 'string' && allowedVerdicts.includes(ai.verdict as typeof allowedVerdicts[number])
    ? ai.verdict as typeof allowedVerdicts[number]
    : 'UNCERTAIN';
  const verdict = needsAbstention ? 'UNCERTAIN' : suggestedVerdict;
  const rawConfidence = typeof ai.confidence === 'number' && Number.isFinite(ai.confidence) ? ai.confidence : 35;
  const confidenceLimit = verdict === 'UNCERTAIN' ? 70 : timeSensitive ? 80 : 95;
  const confidence = needsAbstention
    ? Math.min(45, Math.max(0, Math.round(rawConfidence)))
    : Math.max(0, Math.min(confidenceLimit, Math.round(rawConfidence)));

  const reasons = Array.isArray(ai.reasons)
    ? ai.reasons.slice(0, 4).flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const reason = item as Record<string, unknown>;
      if (typeof reason.title !== 'string' || typeof reason.detail !== 'string') return [];
      const impact = reason.impact === 'supports_real' || reason.impact === 'supports_fake' ? reason.impact : 'unclear';
      return [{ title: reason.title, detail: reason.detail, impact }];
    })
    : [];

  if (needsAbstention) {
    reasons.unshift({
      title: 'Recent claim needs current confirmation',
      detail: 'The live search did not return at least two independent, usable news-source links supporting the same conclusion. We will not label a recent event true or false without that evidence.',
      impact: 'unclear',
    });
  }

  const claims = Array.isArray(ai.claims)
    ? ai.claims.slice(0, 5).flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const claim = item as Record<string, unknown>;
      if (typeof claim.claim !== 'string') return [];
      const statuses = ['credible', 'suspicious', 'misleading', 'unverifiable'] as const;
      const status = needsAbstention
        ? 'unverifiable'
        : typeof claim.status === 'string' && statuses.includes(claim.status as typeof statuses[number])
          ? claim.status as typeof statuses[number]
          : 'unverifiable';
      return [{
        claim: claim.claim,
        status,
        note: needsAbstention ? 'Not confirmed by enough independent, usable current sources.' : typeof claim.note === 'string' ? claim.note : '',
      }];
    })
    : [];

  const fallbackSummary = 'There is not enough reliable evidence to confidently classify this news.';
  const summary = needsAbstention
    ? 'This is a time-sensitive claim, and the current source links do not independently confirm it. We cannot responsibly label it true or false yet.'
    : typeof ai.summary === 'string' ? ai.summary : fallbackSummary;
  const limitations = needsAbstention
    ? 'This claim may have changed recently. Fewer than two independent, usable news-source links supported a clear conclusion, so this result is intentionally uncertain.'
    : typeof rawEvidence.limitations === 'string'
      ? rawEvidence.limitations
      : 'This is an AI assessment. Check the linked source references before relying on the result.';

  return {
    verdict,
    confidence,
    summary,
    reasons: reasons.slice(0, 4),
    claims,
    evidence: {
      verifiedFacts: needsAbstention ? [] : stringList(rawEvidence.verifiedFacts, 8),
      assumptions: stringList(rawEvidence.assumptions, 8),
      limitations,
    },
    keyPhrases: stringList(ai.keyPhrases, 6),
    styleSignals: stringList(ai.styleSignals, 4),
    finalVerdict: needsAbstention
      ? 'Uncertain — we could not confirm this recent claim with enough independent current sources.'
      : typeof ai.finalVerdict === 'string' ? ai.finalVerdict : summary,
    sources,
    liveSourcesUsed: sources.length > 0,
  };
}