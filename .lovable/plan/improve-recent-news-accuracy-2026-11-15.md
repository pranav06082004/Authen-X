# Improve recent-news accuracy

## What will change
- Add live web search for news-text analysis so current claims are checked against recent reporting instead of relying on the model's older general knowledge.
- Feed dated, attributed search excerpts into the existing analysis and keep the existing REAL / FAKE / UNCERTAIN result format.
- Return real source names, links, and publication dates in the evidence, and show those sources in the result screen.
- Make the detector return UNCERTAIN with restrained confidence when search fails, evidence is stale, or reputable sources conflict; never claim a search verified something it did not.
- Preserve existing text/URL inputs, model, authentication, analysis history, and image analysis.

## Technical approach
- Use the Parallel web-search connector from the server-side `analyze-news` function; do not expose search credentials in the browser.
- Upgrade the existing model request to the supported Lovable AI Gateway SDK while preserving its current model selection.
- Validate and normalize search results, include dates/source URLs with the model prompt, and validate citations before returning them.
- Add focused tests for recent-event abstention, actual source citation, and search-unavailable behavior; deploy and verify the news function.

## Dependency
- The owner must connect Parallel to the project so live search is available at runtime. If that connection is skipped, current-news verification cannot be enabled.
