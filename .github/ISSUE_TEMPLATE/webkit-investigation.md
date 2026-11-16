---
name: WebKit investigation
about: Record a versioned browser observation without assuming a common cause
title: "[WebKit] "
labels: ""
assignees: ""
---

## Scope and public safety
Project public URL; source HEAD/tree; public-safe evidence only. Confirm no private URLs, personal data, credentials, cookies, raw unreviewed HAR/trace or artifacts.

## Classification
OBSERVED / REPRODUCED / HYPOTHESIS / UNKNOWN / NOT_TESTED / BLOCKED / NOT_VERIFIED. State whether historical report, record inspection, synthetic execution, or current browser execution.

## Conditions
OS/architecture/runner image; Playwright and browser build; viewport; Reduced Motion; cache/routing/service-worker/context lifecycle; exact steps; condition ID; expected result; actual result; exit state; frequency and denominator.

## Separate result layers
Browser / product / observer / fixture / environment. Chromium comparison under equivalent conditions. Physical Safari status.

## Evidence attribution
Source HEAD/tree; checkout SHA; run/job/attempt; artifact name/size/SHA-256; CRC/manifest/source status; saved/reobtained/independent readback status; missing records. Do not attach unreviewed raw evidence.

## Hypotheses and falsifiers
Support, contradiction, missing observation, confounders. Do not infer redirect from exception text or cache use from ETag alone.

## Independent review and acceptance
Reviewer separation; findings and severity; project-specific merge decision; no automatic release of HOLD. Next minimal observation and required approvals.
