import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { normalizeNewsAnalysis } from './analysis.ts';

Deno.test('recent death claims without two independent sources are uncertain', () => {
  const result = normalizeNewsAnalysis({
    verdict: 'FAKE',
    confidence: 94,
    summary: 'The actor is alive.',
    searchAssessment: 'insufficient',
    sources: [],
    claims: [{ claim: 'Dharmendra is dead', status: 'suspicious', note: 'No confirmation.' }],
  }, 'Actor Dharmendra is dead.');

  assertEquals(result.verdict, 'UNCERTAIN');
  assertEquals(result.confidence, 45);
  assertEquals(result.evidence.verifiedFacts.length, 0);
  assertEquals(result.claims[0]?.status, 'unverifiable');
});

Deno.test('recent claims need corroboration from distinct publishers', () => {
  const result = normalizeNewsAnalysis({
    verdict: 'REAL',
    confidence: 91,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Report one', url: 'https://www.publisher-one.example/news', publishedAt: '2026-11-14' },
      { title: 'Report two', url: 'https://publisher-two.example/news', publishedAt: '2026-11-14' },
    ],
  }, 'The actor died yesterday.');

  assertEquals(result.verdict, 'REAL');
  assertEquals(result.confidence, 80);
  assertEquals(result.sources.length, 2);
});

Deno.test('search-engine pages and duplicate publishers are not source corroboration', () => {
  const result = normalizeNewsAnalysis({
    verdict: 'FAKE',
    confidence: 93,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Search results', url: 'https://news.google.com/search?q=claim', publishedAt: '2026-11-14' },
      { title: 'Publisher story', url: 'https://publisher.example/story', publishedAt: '2026-11-14' },
      { title: 'Same publisher', url: 'https://www.publisher.example/another-story', publishedAt: '2026-11-14' },
    ],
  }, 'Breaking: a public figure died today.');

  assertEquals(result.verdict, 'UNCERTAIN');
  assertEquals(result.sources.length, 1);
});