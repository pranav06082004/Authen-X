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
  const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const result = normalizeNewsAnalysis({
    verdict: 'REAL',
    confidence: 91,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Report one', url: 'https://www.publisher-one.example/news', publishedAt: recentDate },
      { title: 'Report two', url: 'https://publisher-two.example/news', publishedAt: recentDate },
    ],
  }, 'The actor died yesterday.');

  assertEquals(result.verdict, 'REAL');
  assertEquals(result.confidence, 80);
  assertEquals(result.sources.length, 2);
});

Deno.test('untimed historical death claims can use older independent reports', () => {
  const result = normalizeNewsAnalysis({
    verdict: 'REAL',
    confidence: 94,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Dharmendra dies at 89', url: 'https://www.bbc.com/news/articles/dharmendra-death', publishedAt: '2025-11-24' },
      { title: 'Bollywood actor Dharmendra dies at 89', url: 'https://www.theglobeandmail.com/culture/film/dharmendra-death/', publishedAt: '2025-11-24' },
    ],
  }, 'Actor Dharmendra has died.');

  assertEquals(result.verdict, 'REAL');
  assertEquals(result.confidence, 94);
  assertEquals(result.sources.length, 2);
  assertEquals(result.liveSourcesUsed, true);
});

Deno.test('search-engine pages and duplicate publishers are not source corroboration', () => {
  const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const result = normalizeNewsAnalysis({
    verdict: 'FAKE',
    confidence: 93,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Search results', url: 'https://news.google.com/search?q=claim', publishedAt: recentDate },
      { title: 'Publisher story', url: 'https://publisher.example/story', publishedAt: recentDate },
      { title: 'Same publisher', url: 'https://www.publisher.example/another-story', publishedAt: recentDate },
    ],
  }, 'Breaking: a public figure died today.');

  assertEquals(result.verdict, 'UNCERTAIN');
  assertEquals(result.sources.length, 1);
});

Deno.test('old articles cannot corroborate a recent event', () => {
  const staleDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const result = normalizeNewsAnalysis({
    verdict: 'FAKE',
    confidence: 90,
    searchAssessment: 'corroborated',
    sources: [
      { title: 'Old report one', url: 'https://publisher-one.example/old', publishedAt: staleDate },
      { title: 'Old report two', url: 'https://publisher-two.example/old', publishedAt: staleDate },
    ],
  }, 'The actor died yesterday.');

  assertEquals(result.verdict, 'UNCERTAIN');
  assertEquals(result.sources.length, 0);
});