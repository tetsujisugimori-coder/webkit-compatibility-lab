# Separate hypotheses and evidence

| ID | Observed signature in existing records | Hypothesis / confounder | Needed falsifier or observation |
|---|---|---|---|
| LM-STATE | Status Morph phase/state discrepancy; API and WAAPI failures | Observer timing/intervention and product behavior may both contribute; UNKNOWN | Fixed primary observation time, driver-binding distinction, delayed body capture vs same-slot stop policy |
| IUI-OUTLINE | WebKit focus returns but final focus-visible false and no pseudo-element outline in B/D; Chromium displays outline | Native focus-visible logic, event sequencing, and timing differences; no proven common cause | Equivalent time budgets, focus and rendering separately observed, minimal intervention |
| YM-BODY | Revalidation304 associated with body exception; Playwright refusal branch reported | Proximate observation-layer mechanism supported, actual resource use/root cause UNKNOWN | Preserve raw/API distinction, identify effective response entity; do not infer redirect from message |
| YM-VARY | B6c fixture kept same entity; B6d representation-specific fixture reports 200→200 | Old fixture inadequacy is not browser defect; B6d observed correction is scoped | Independent B6d review and original-artifact readback before promotion |
| YM-MISSING | B6d missing-resource capture does not settle | Observer completion/fixture issue possible, UNKNOWN | Record pending request/response and terminal result without ignoring required failure |
| ATLAS-ASSERT | Reload triggers optional assertion in WebKit | Native mechanism UNKNOWN; Linux/graphics warnings alone not causal | Authorized native stack/signal capture; no permission bypass |

Style/focus/scrollIntoView removal in Atlas only excludes each tested expression as a necessary condition in that fixed path. It does not establish universal irrelevance of CSS/focus/scroll or isolate a native cause.

HTTP 304 has no response content. That fact alone neither proves browser failure nor proves successful resource use. Request If-None-Match and response ETag are different fields. Vary must be evaluated against the request and selected representation; ETag/HAR agreement alone does not prove the browser-used bytes.

No shared-cause classification has been assigned. Proposed experiments are NOT_TESTED and require a separately scoped plan.
