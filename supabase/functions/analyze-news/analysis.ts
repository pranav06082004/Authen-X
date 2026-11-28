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
const EXPLICIT_RECENT_TIMING_PATTERN = /\b(?:today|tonight|this morning|this evening|yesterday|last night|last week|this week|last month|this month|recently|recent|breaking|just now|right now|currently|as of now|at present|some days ago|a few days ago|in the last (?:few|several|\d+) (?:hours?|days?|weeks?)|over the last (?:few|several|\d+) (?:hours?|days?|weeks?)|last \d+ (?:hours?|days?|weeks?))\b/i;
const SEARCH_ENGINE_HOSTS = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
const MULTI_PART_PUBLIC_SUFFIXES = new Set(['co.uk', 'org.uk', 'ac.uk', 'com.au', 'net.au', 'org.au', 'co.in', 'firm.in', 'net.in', 'org.in', 'com.br', 'com.mx', 'com.sg', 'com.my', 'com.ph', 'com.pk', 'co.za', 'co.nz', 'co.jp', 'com.tr', 'com.ng']);

export function isTimeSensitiveNews(text: string): boolean {
  return RECENT_EVENT_PATTERN.test(text);
}

export function requiresFreshNewsSources(text: string): boolean {
  return EXPLICIT_RECENT_TIMING_PATTERN.test(text);
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
      const normalizedHost = host.replace(/^(www|m|mobile|edition|amp)\./, '');
      const hostParts = normalizedHost.split('.');
      const suffix = hostParts.slice(-2).join('.');
      const publisher = hostParts.slice(-(MULTI_PART_PUBLIC_SUFFIXES.has(suffix) ? 3 : 2)).join('.');
      if (seenHosts.has(publisher)) continue;

      const publishedAt = typeof candidate.publishedAt === 'string' && !Number.isNaN(Date.parse(candidate.publishedAt))
        ? candidate.publishedAt.slice(0, 40)
        : null;
      sources.push({
        title: candidate.title.trim().slice(0, 240) || host,
        url: parsed.toString(),
        publishedAt,
      });
      seenHosts.add(publisher);
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
  const freshnessRequired = requiresFreshNewsSources(input);
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const freshSources = sources.filter((source) => {
    if (!source.publishedAt) return false;
    const publishedTime = Date.parse(source.publishedAt);
    return Number.isFinite(publishedTime) && publishedTime >= recentCutoff && publishedTime <= Date.now() + 24 * 60 * 60 * 1000;
  });
  const corroborationSources = freshnessRequired ? freshSources : sources;
  const corroborated = ai.searchAssessment === 'corroborated' && corroborationSources.length >= 2;
  const needsAbstention = timeSensitive && !corroborated;
  const allowedVerdicts = ['REAL', 'FAKE', 'UNCERTAIN'] as const;
  const suggestedVerdict = typeof ai.verdict === 'string' && allowedVerdicts.includes(ai.verdict as typeof allowedVerdicts[number])
    ? ai.verdict as typeof allowedVerdicts[number]
    : 'UNCERTAIN';
  const verdict = needsAbstention ? 'UNCERTAIN' : suggestedVerdict;
  const rawConfidence = typeof ai.confidence === 'number' && Number.isFinite(ai.confidence) ? ai.confidence : 35;
  const confidenceLimit = verdict === 'UNCERTAIN' ? 70 : freshnessRequired ? 80 : 95;
  const confidence = needsAbstention
    ? Math.min(45, Math.max(0, Math.round(rawConfidence)))
    : Math.max(0, Math.min(confidenceLimit, Math.round(rawConfidence)));

  const reasons = Array.isArray(ai.reasons)
    ? ai.reasons.slice(0, 4).flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const reason = item as Record<string, unknown>;
      if (typeof reason.title !== 'string' || typeof reason.detail !== 'string') return [];
      const impact: 'supports_real' | 'supports_fake' | 'unclear' = reason.impact === 'supports_real' || reason.impact === 'supports_fake' ? reason.impact : 'unclear';
      return [{ title: reason.title, detail: reason.detail, impact }];
    })
    : [];

  if (needsAbstention) {
    reasons.unshift({
      title: freshnessRequired ? 'Recent claim needs current confirmation' : 'Claim needs independent source confirmation',
      detail: freshnessRequired
        ? 'The live search did not return at least two independent, usable recent news-source links supporting the stated timing. We will not label a current event true or false without that evidence.'
        : 'The analysis did not include at least two independently verified article links supporting this claim. Older reports can confirm historical events, but we will not label it true or false without those sources.',
      impact: 'unclear' as const,
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
         note: needsAbstention
           ? freshnessRequired ? 'Not confirmed by enough independent, recent sources.' : 'Not confirmed by enough independent, verified article sources.'
           : typeof claim.note === 'string' ? claim.note : '',
      }];
    })
    : [];

  const fallbackSummary = 'There is not enough reliable evidence to confidently classify this news.';
  const summary = needsAbstention
    ? freshnessRequired
      ? 'This claim includes recent timing, but the available current source links do not independently confirm it. We cannot responsibly label it true or false yet.'
      : 'There are not enough independently verified article links to confirm this claim. We cannot responsibly label it true or false yet.'
    : typeof ai.summary === 'string' ? ai.summary : fallbackSummary;
  const limitations = needsAbstention
    ? freshnessRequired
      ? 'This claim may have changed recently. Fewer than two independent, usable recent news-source links supported a clear conclusion, so this result is intentionally uncertain.'
      : 'Fewer than two independently verified article links supported a clear conclusion. This result is intentionally uncertain until those sources are available.'
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
      ? freshnessRequired
        ? 'Uncertain — we could not confirm this recent claim with enough independent current sources.'
        : 'Uncertain — we could not confirm this claim with enough independent article sources.'
      : typeof ai.finalVerdict === 'string' ? ai.finalVerdict : summary,
    sources: freshnessRequired ? freshSources : sources,
    liveSourcesUsed: (freshnessRequired ? freshSources : sources).length > 0,
  };
}