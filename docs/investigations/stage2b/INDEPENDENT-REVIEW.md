# Stage 2-B independent review

> **Current lab PR status (2026-11-19 JST): [PR #4](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4) MERGED/CLOSED at 2026-11-18 15:40:48 UTC; merge commit `47e5ae1c3e1baae51c0283ed55c93741702e5174`.** P2-R1/R2/R3 CLOSED within the fixed Stage 2-B verifier scope; independent R3 re-review PASS, lab-only acceptance YES, overall PARTIAL, formal CI NOT_TESTED. Source safety/browser FAIL, Stage 3-B HOLD, source merge NO and UNKNOWN causes/bytes remain. Historical pre-merge notices below are not current. See [Stage 3-A](../stage3a/README.md) for B6h/B6i/B6j version-separated intake.

### Historical pre-merge banner (2026-11-18, preserved verbatim below)

> **Current status (2026-11-18): Overall PARTIAL; P2-R3 CLOSED; executed independent re-review PASS; Stage 2-B documents/ledger/offline verifier limited acceptance YES; lab-only limited merge recommendation YES.** The earlier P2-R3 OPEN / independent re-review PENDING / merge HOLD and five-method test evidence below are **historical pre-re-review states, not the current verdict**. See the [P2-R3 executed re-review supplement](#p2-r3-executed-re-review-supplement-2026-11-18-utc) and [posted final review](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4#pullrequestreview-5956307340) for the six-test results, submitted-version readback, and custody limits. **P2-R1/R2 remain CLOSED.** Formal CI NOT_TESTED; Yamanaka formal safety/browser FAIL, Stage 3-B HOLD, source merge NO, root cause and production-used bytes UNKNOWN remain unchanged. This PR remains Draft and unmerged.


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


## P2-R3 executed re-review supplement (2026-11-18 UTC)

This append supersedes the R3 NOT_TESTED/HOLD execution state above, while retaining its historical record. Tested code/ledger HEAD: `118061e840471715253be7b413a78995a4c5be55`, tree `25fe8cc04384d85cfe4b71fbc72b0d2417eb99bc`. No verifier, unit-test, ledger or historical log bytes changed in this supplement.

A and separate AI reviewer B independently executed all **6 unittest methods: PASS6, FAIL0, ERROR0, SKIP0, exit0**, plus the normal ledger CLI (exit0). Python3.12.14/Linux; bounded subprocesses30s(A)/20s(B), zero retries. The normal19/42/38 ledger and PR14success1failure/push3success1failure distribution were accepted. The exact job133998029071 deletion (41jobs) and run44071333927/artifact event swap (PR14/push5) were rejected with `formal history counts` and `run event/conclusion totals`. Successful negative tests mean rejection, not valid fault data. Existing25 ledger mutations +2 identity swaps and ZIP1normal/8fault checks passed. P2-R1/R2 remain CLOSED.

New original execution receipts, timestamps, hashes, stdout/stderr and B review are in [r3-verification-20261118](r3-verification-20261118/). Old `test-results.txt` remains unchanged. B directly acquired the GitHub fixed code into a separate directory. Shared platform/account/filesystem/history limit independence; this is not third-party human audit. No new P1/P2/P3 was found within R3 scope.

**P2-R3 CLOSED; Stage2-B document/ledger/verifier limited acceptance YES and limited merge recommendation YES**, conditional on final submission readback reported in the PR review. Overall PARTIAL: this does not establish authentic/safe source execution. Formal safetyFAIL, browserFAIL, Stage3-B HOLD, source mergeNO, root-causeUNKNOWN and production-used-bytesUNKNOWN remain. No browser or Yamanaka workflow was run. Start HEAD Actions/checks/status counts0: formal CI NOT_TESTED; final observation is reported in PR review.

New evidence custody is separately recorded in the final PR review; execution PASS does not establish storage ACL or long-term retention. Draft remains; no merge.
