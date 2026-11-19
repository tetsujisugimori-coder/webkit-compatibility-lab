## Stage 3-A current index supplement — 2026-11-19 JST

Lab [PR #4](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4) is merged (47e5ae1c). [B6h–B6j fixed intake](stage3a/README.md) and [evidence ledger](stage3a/evidence-ledger.md) are versioned documents only. Original source tests are not rerun; source formal safety/browser FAIL, 304 NOT_ADOPTED and Stage3-B HOLD remain. Earlier paragraphs are dated historical observations.

## Stage 2-A current supplement — 2026-11-17

Stage 1 PR #2 is merged at `66d56436591b8f935a2f3515c4618d513a8473ff`. Earlier current/pending statements below are historical snapshots, not current execution permission. [Stage 2-A B6f evidence intake](stage2a-b6f-evidence-intake.md) separates direct source reads, cited observations and unacquired originals. B6g is a separate version; no new experiments or source-project changes. FAIL/UNKNOWN/HOLD remain.

# Separate hypotheses and evidence

Current follow-up: [Stage 1 evidence update and next observations](stage1-next-observations.md). The table below is the Stage 0 hypothesis inventory. B6d now has a reported independent audit; this lab has read the report, not independently retrieved its originals.

| ID | Observed signature in existing records | Hypothesis / confounder | Needed falsifier or observation |
|---|---|---|---|
| LM-STATE | Status Morph phase/state discrepancy; API and WAAPI failures | Observer timing/intervention and product behavior may both contribute; UNKNOWN | Fixed primary observation time, driver-binding distinction, delayed body capture vs same-slot stop policy |
| IUI-OUTLINE | WebKit focus returns but final focus-visible false and no pseudo-element outline in B/D; Chromium displays outline | Native focus-visible logic, event sequencing, and timing differences; no proven common cause | Equivalent time budgets, focus and rendering separately observed, minimal intervention |
| YM-BODY | Revalidation304 associated with body exception; Playwright refusal branch reported | Proximate observation-layer mechanism supported, actual resource use/root cause UNKNOWN | Preserve raw/API distinction, identify effective response entity; do not infer redirect from message |
| YM-VARY | B6c fixture kept same entity; B6d representation-specific fixture reports 200→200 | Old fixture inadequacy is not browser defect; B6d observed correction is scoped | B6d independent audit reported; keep synthetic scope and production-byte UNKNOWN |
| YM-MISSING | B6d missing-resource capture does not settle | Observer completion/fixture issue possible, UNKNOWN | Record pending request/response and terminal result without ignoring required failure |
| ATLAS-ASSERT | Reload triggers optional assertion in WebKit | Native mechanism UNKNOWN; Linux/graphics warnings alone not causal | Authorized native stack/signal capture; no permission bypass |

Style/focus/scrollIntoView removal in Atlas only excludes each tested expression as a necessary condition in that fixed path. It does not establish universal irrelevance of CSS/focus/scroll or isolate a native cause.

HTTP 304 has no response content. That fact alone neither proves browser failure nor proves successful resource use. Request If-None-Match and response ETag are different fields. Vary must be evaluated against the request and selected representation; ETag/HAR agreement alone does not prove the browser-used bytes.

No shared-cause classification has been assigned. Proposed experiments are NOT_TESTED and require a separately scoped plan.

## Stage 2-B supplement

[B6g existing-evidence intake](stage2b/README.md): formal safety/browser FAIL preserved; no new browser or source tests.
