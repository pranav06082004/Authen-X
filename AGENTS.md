# Project architecture rules

- Call Lovable AI Gateway only from server-side edge functions through `@lovable.dev/ai-gateway`; current-news results must abstain without independently corroborating source links because model knowledge can be stale.