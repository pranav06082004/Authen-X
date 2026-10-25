# AuthenX Upgrade Roadmap

## Done
- [x] News text credibility analysis (REAL / FAKE / UNCERTAIN)
- [x] URL article analysis
- [x] Google OAuth sign-in + email/password auth

## Phase 1 — Image Authenticity Check ✅ (tested end-to-end)
- [x] `analyze-media` edge function: vision model + real EXIF/metadata extraction
- [x] Media tab in Dashboard runs image analysis (uploads are now automatic)
- [x] `MediaAnalysisResult` result card (verdict, confidence, findings, metadata panel)
- [x] Storage access rules fixed (upload previously blocked for all users)
- [x] Verified live: upload → analysis → result card → saved to history

## Phase 2 — Suspicious Region Highlighting (in progress)
- [x] Ask the model for bounding boxes of suspicious regions
- [x] Overlay boxes/highlight on the image in the result card (color-coded by severity)
- [x] Store region data alongside the analysis (`analyses.regions`)
- [ ] End-to-end test with a doctored image

## Phase 3 — Image-vs-Story Consistency (planned)
- [ ] Combine news text + image in one analysis
- [ ] Flag context mismatch ("this photo doesn't match this story")

## Phase 4 — Trained ML classifier (stretch, needs external model hosting)
- [ ] EfficientNet/ConvNeXt manipulation classifier trained on CASIA/Columbia-style datasets
- [ ] Host externally (e.g. Hugging Face Inference API), call from the edge function
- [ ] Evaluate precision/recall/F1/ROC-AUC for the project report
