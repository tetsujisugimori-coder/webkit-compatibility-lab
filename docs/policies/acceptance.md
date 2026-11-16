# Classification and acceptance

Each claim has a scope, version, method, evidence reference, and classification:

- OBSERVED: directly supported by inspected evidence. Specify whether the observation is a CI record, code, or actual runtime behavior.
- REPRODUCED: reproduced under recorded conditions. Historical reproduction is labelled historical and tied to its original run; reading that report is not a new reproduction.
- HYPOTHESIS: a falsifiable proposed explanation, with supporting evidence, counterexamples and missing observations.
- UNKNOWN: a fact or cause remains unestablished.
- NOT_TESTED: not executed.
- BLOCKED: prerequisites or permissions prevent execution.
- NOT_VERIFIED: a record or claim was not independently checked in this baseline.

Keep browser behavior, observer/capture failure, fixture failure, and environment limitations in separate fields. A nonzero job result does not identify which layer failed. A successful job does not by itself establish evidence completeness or correct product behavior.

Chromium PASS never substitutes for WebKit PASS. Playwright WebKit is not physical Safari, VoiceOver, physical touch, or OS text scaling. Mark these NOT_TESTED unless tested explicitly.

## Interim operational policy

WebKit success is not a blanket merge requirement across all projects, as directed by the owner for this Stage 0 baseline. It remains a reported technical result and continues to be tested. No FAIL, unknown cause, or missing evidence is relabelled PASS. Each project independently weighs severity, user impact, available alternatives, and explicitly accepted limitations. Data corruption or safety issues stop acceptance. Other required test classes and independent evidence/review obligations remain.

This document neither edits required checks nor grants permission to merge. A project with an earlier HOLD is not automatically released by publication of this policy.
