# Stage 2-B independent review

> **2026-11-18 P2-R3 follow-up (latest status):** New ledger-aggregate false-PASS finding **P2-R3 OPEN / patch submitted / independent re-review PENDING**. The original limited-merge recommendation below is a historical verdict for HEAD `5846374a...`, **not a current merge authorization**. `test_verify.py` includes new regression cases, but the old five-test log predates this patch; post-patch Python execution is **NOT_TESTED**. **P2-R1/P2-R2 remain CLOSED.** Source formal safety/browser FAIL, Stage 3-B HOLD, source merge NO remain unchanged. [New review](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4#pullrequestreview-5955991611).


2026-11-17. Reviewer is a separate AI worker in the same dot, not an external human auditor. This review covers the Stage2-B ledger, offline verifier/tests, recovery inventory and Markdown report/index additions. It does not authorize source-project changes or browser execution.

## Verdict

**Limited intake/documentation and offline-verifier review PASS; lab-only limited merge recommendation YES**, subject to exact submitted-version readback and new bundle custody. Overall PARTIAL. Source formal safety FAIL, formal browser acceptance FAIL, root cause/production bytes UNKNOWN, Stage3-B HOLD and source merge NO remain.

No new unresolved P1/P2 was found within the reviewed scope after the corrections below. Historical source P2 and legacy P3 remain recorded, not automatically closed by this review.

## Independent checks performed

- Read the assignment, current Stage2-B files, acquired failure artifact and closeout archive, retained metadata and source snippets. Newly reread archive bytes were provided by the implementation worker; this reviewer did not independently re-download those two source archives from Library.
- Independently calculated source-archive sizes and SHA-256: 744,571 bytes / `fcfad6fbdf5bf5da1b4fd5bc5938ea1a982a21a3fbc03e0caca0966a72a22cc3`, and 84,210 bytes / `b1a3ba318e7d0031bee48d41e72934d5c3194ce333aa02bcd01982bf61eb237c`. CRC344/13 and exact manifest343/12 file-set/size/SHA checks passed. Duplicate entries and symlinks absent. This is scoped integrity, not product acceptance.
- Compared all42 ledger jobs and38 artifacts to the acquired API records, including run IDs, attempts, conclusions, byte sizes and digest values. Eight engine-job mappings agree with the job names within the same run; other30 retain UNKNOWN. This is independent checking of the retrieved metadata, not a second API acquisition.
- Independently repeated the bounded central-directory scan of38 retained original archives. The recorded entry counts and empty runtime-hit sets matched. No full38-archive integrity audit or exhaustive search of every possible storage location was claimed.
- Directly read unit.log test711: normal-config Python subprocess communication timed out at6 seconds before assertions. Read the source harness: output writes follow the failing call and assertions summary follows the loop. Subsequent five conditions in that invocation were not reached. Read the workflow: only EVIDENCE_DIR is uploaded; the case records are written elsewhere. Cause, supervisor phase and residual state remain UNKNOWN, not proven leak or host slowness.
- Read the terminalNotifications default false diagnostic and optional local worker true call. Formal workflow does not call the B6g worker. NOT_RECORDED does not assert event absence.
- Checked the local/formal separation and G1–G5 reasoning. The recommendation to prioritize an independently scoped implementation review of timeout/output capture follows the bounded recovery findings; it is not permission to implement or retry.
- Ran only the lab offline tests:5 methods, normal ledger,27 ledger fault mutations,9 ZIP cases (1 normal/8 fault), all expected results. Separately reran the six counterexamples below. No source tests, browsers, CI, dependencies or source code were executed or modified.
-46 relative Markdown links resolved before this review file was added. Public files contain no Library IDs, credential values, raw HAR/trace or private storage URLs. Prior Stage2-A text is not replaced with B6g results.

## P2-R1: insufficient ledger contradiction checks — CLOSED within scope

Initial verifier accepted these altered records as PASS:

1. Unacquired artifact promoted to new_integrity PASS.
2. Evidence commit changed to an invalid string.
3. formal-normal issue FAIL changed to PASS.
4. Artifact digest changed to an invalid string.

Implementation added version/identity, acquisition-integrity, issue-status and start-gate constraints and fault tests. Independent rerun of the same four examples now rejects them. The valid ledger remains accepted. Closure concerns record consistency, not authenticity of arbitrarily coordinated replacement data or proof of the source system's safety.

## P2-R2: run/job identities could be exchanged — CLOSED within scope

The first correction still accepted (a) WebKit artifact14321924744 mapped to same-run Chromium job133998000362 and (b) moving historical failure from run44071325311 to another run while preserving the17/2 totals. Engine/job checks and fixed failed-run set checks now reject the same two examples. Dedicated tests pass. The reviewed verifier SHA-256 is `7bff26aaed3d829b75b423440bdc63782369bd60839891eab197306426c37682`.

## Limits and remaining gates

This verifier checks the fixed receipt ledger; it is not a general proof engine or cryptographic attestation. Narrative meanings and API truth still require source review. New bundle save/re-download and submitted-head readback are later separate records. Existing source safety/evidence/byte-attribution P2 and notification/legacy P3 stay unresolved as documented. No newly executed counterexample establishes a source runtime failure beyond the retained formal logs.

## Subsequent P2-R3 review supplement (2026-11-18)

The earlier P2-R1/P2-R2 reviews and their CLOSED classifications are historical and unchanged. A later GitHub review ([#5955991611](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4#pullrequestreview-5955991611)) identified a **new** P2-R3: incorrect PASS acceptance for missing jobs or a coordinated `pull_request`/`push` event reclassification. The code and fault-test additions are submitted as a follow-up, but this is **not** an independent re-review PASS. Status: **P2-R3 OPEN, independent re-review PENDING, lab limited merge HOLD**. Do not treat the original reviewer's verifier hash or five-method test log as covering this later change.
