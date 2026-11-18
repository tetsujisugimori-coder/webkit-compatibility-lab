# Stage 2-B: B6g existing-evidence intake (2026-11-17)

> **2026-11-18 P2-R3 follow-up (latest status):** New ledger-aggregate false-PASS finding **P2-R3 OPEN / patch submitted / independent re-review PENDING**. The original limited-merge recommendation below is a historical verdict for HEAD `5846374a...`, **not a current merge authorization**. `test_verify.py` includes new regression cases, but the old five-test log predates this patch; post-patch Python execution is **NOT_TESTED**. **P2-R1/P2-R2 remain CLOSED.** Source formal safety/browser FAIL, Stage 3-B HOLD, source merge NO remain unchanged. [New review](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4#pullrequestreview-5955991611).


## A. Verdict and scope
Overall **PARTIAL**. Evidence intake PARTIAL; Git/CI identity PASS; two reacquired ZIP integrity PASS (self-check); historical local safety limited PASS; formal safety FAIL; formal browser acceptance FAIL; root cause and production-used bytes UNKNOWN. Document-only acceptance is separate: [independent review](INDEPENDENT-REVIEW.md) limited PASS after two verifier findings were corrected. No source runner/test/browser execution, installation, workflow dispatch, source modification or merge occurred. Offline ledger tests are not network experiments or CI. Five unittest methods cover one valid ledger,27 mutated-ledger failures, one valid archive and8 archive faults. ZIP adversarial controls include traversal, duplicates, symlinks, CRC corruption, missing/empty manifest, missing/extra files and changed bytes.

`ledger.json` contains the evidence, run/job/artifact, safety, unresolved-issue and next-start ledgers. D = directly inspected metadata/archive/source, R = inherited report, U = unresolved. An acquired archive can directly establish what a report says without newly reproducing that report's experiment. `verify.py` checks records, not product safety.

## B. Fixed versions and discovery
Lab main `44c832da8f1a864570c4b8966c74bfd420367a06`, tree `f7577e293f4be88b42f7684aa133b57e8613ef5b`. [PR3](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/3) merged at 2026-11-17 12:39:22Z from Stage2-A head `46b4ddb485ad3579b0c92e43b9bddfde1bd78f95`. Prior Stage1/2-A files remain unchanged apart from appended index links.

Source main `148317e52a7dc5efba8aa519538a476dfead18c5`, tree `55223ca4be5db9f7e0de56b0b795ec964744f82c`. [PR55](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55) remains Draft at B6g `16e26b3381763269dfc9d2360670b57726db996d`, tree `c2f1b07f938535d91acd0f94ec3d2d31b4a4a1a9`. No later source commit found at intake. PR checkout `16573d8f532da1c31de73b3cf8c8b9da02ea039a` is a different commit; GitHub Git commit objects directly confirm identical trees. Do not equate all run metadata head fields with the executed checkout.

Latest [B6g closeout](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6947192938) supersedes the PR body's older B6e status, not its failure history. Current formal review records do not contain a new B6g formal review; the scoped local independent AI review and later failure audit are separate evidence. Applicable lab evidence/acceptance policies were read; no repository AGENTS.md found.

## C–E. Intake and correspondence
Direct GitHub metadata: 19 run attempts (all attempt1), 42 jobs, 38 artifacts. 17 runs success and 2 failure: push `44071325311`, PR `44071333914`. PR15 runs =14success1failure; push4=3success1failure. This is not 19 independent conditions. Artifact-to-job mappings use a unique engine job name within the same run (8 mappings); other30 remain UNKNOWN, not fabricated. All38 run links are established. Metadata digest is not a fresh download audit.

Two Library originals were newly reacquired into a separate case directory and compared byte-for-byte to retained originals, then CRC, safe entry names, duplicate/symlink checks and exact manifest file-set/size/SHA audited:

| Archive | bytes | SHA-256 | entries / manifest files |
|---|---:|---|---:|
| failure artifact14321924744 |744571|`fcfad6fbdf5bf5da1b4fd5bc5938ea1a982a21a3fbc03e0caca0966a72a22cc3`|344/343|
| B6g closeout |84210|`b1a3ba318e7d0031bee48d41e72934d5c3194ce333aa02bcd01982bf61eb237c`|13/12|

Failure artifact maps to push run44071325311, WebKit job133998000707. Archive identity confirms source HEAD/tree. Stored source-before and unit/exit logs were read without execution. Fresh GitHub recursive tree (truncated=false) matches all334 source-before Git blobs (`source-match.json`); this does not prove production-used bytes. Prior38-archive custody (2,290,938,171bytes;10 manifests,28 absent) is **R**, not a new38-archive audit. Saving this intake will not convert other37 into fresh acquisition PASS.

## F. G1–G5
- G1 UNKNOWN formally: reviewed source starts individual45s/global180s budgets before launch, reserves cleanup10s/TERM1s/audit1s and uses outer supervisor. Configuration/code is not runtime proof. The formal synthetic normal configuration instead uses1.8s/4s, reserve0.7s/TERM0.15s/audit0.15s. Python communication timeout6s does not locate supervisor phase or prove deadline escape.
- G2 UNKNOWN formally: source rechecks PID birth identity, handles own descendants/subreaper adoption, TERM/KILL and residual audit. Historical local controls pass. Missing formal runtime records prevent proving cleanup. Host suspension, blocking filesystem/kernel behavior are outside proven guarantees. First worker failure and cleanup/supervisor failure remain separate.
- G3 historical-local limited PASS: normal, operation hang, close hang, detached orphan, first failure plus cleanup failure, total deadline. Prior independent AI review reran these locally; this intake did not. Old synthetic RED and new local PASS are not browser RED/GREEN or official-CI success.
- G4 FAIL: unit test711 normal config raised `subprocess.TimeoutExpired` at6s; assertions incomplete. Subsequent five controls NOT_TESTED in that invocation. 723 unit tests:722PASS1FAIL. Unit exit1, other preservation/protected/generated/diff/build exit0; browser step skipped. Phase, residual process state, direct cause UNKNOWN. Not proven flakiness, leak or slow host.
- G5 BLOCKED: formal safety PASS plus independent review precede any new browser observation. Prior local slots: planned4, workers1, browser attempts0, BLOCKED1, NOT_TESTED3. No new slots run or dependencies installed.

## G. WebKit inheritance
Stage2-A's phase1 normal200/phase2 abnormal404, server96bytes/capture0bytes, save callback complete, response.finished pending at DIAGNOSTIC_DEADLINE and failure release after context.close remain historical evidence. H1–H4 remain unranked and unchanged: no new causal discrimination. Late SETTLED is not deadline success; static path is not actual traversal; temporal association is not causation.

B6g formal workflow invokes default diagnostic path without terminalNotifications, whereas the optional B6g local worker enables it. Therefore formal requestfinished/requestfailed/Page.Close correspondence is NOT_RECORDED, not notifications absent. Formal browserFAIL,304 NOT_ADOPTED, Stage3-B HOLD and source mergeNO remain.

## H. Missing record recovery
All38 retained archive central directories were searched (see `recovery-scan.json`, no extraction/execution). No runtime normal-config, trial-ledger, supervisor-result, worker-result, assertions or descendant-PID records found outside source copies. This is a bounded central-directory search, not fresh38-ZIP integrity verification or proof no copy exists elsewhere.

Failure archive omits per-case stdout/stderr, phase/PID-birth/residual and result outputs. Workflow archives EVIDENCE_DIR; harness writes elsewhere. At `tests/stage3b6g-supervisor.py:39` the unhandled timeout occurs before stdout/stderr writes at41 and summary at56. This explains non-preservation by that path, not whether files were ever generated. GitHub runner ephemeral storage and unlisted external copies remain unverified. Stop position, residual and cause stay UNKNOWN.

## I–M. Review, preservation, risks and next step
Independent review and new bundle readback are separately recorded in the review/submission records when completed. Independent means another AI reviewer within the same dot, not external human audit. No unresolved P1 is established by this intake; existing P2 formal safety/evidence/byte-attribution and P3 notification/legacy gaps remain. Exact historical defect closures are not reopened as newly reproduced defects.

Prioritize **案2: independent implementation review of outer timeout and evidence packaging**, not implementation here. Concrete basis:38 retained archives lack case records; current failure path cannot persist post-call summaries and workflow excludes their directory. Further recovery is conditional on discovery of a named retained source; it is not declared impossible. Review durable outer-watchdog/exception checkpoints, PID-birth/phase, bounded cleanup and correct artifact inclusion. Simple6s extension/retry cannot erase FAIL. A separately authorized new safety proof and independent review must precede browser work.

Lab-only document merge recommendation YES subject to submitted-head readback and new bundle custody; source merge remains NO. New Draft PR only; no Draft release or merge. Formal CI for this new lab change is reported separately after submission.

## P2-R3 follow-up: aggregate false-PASS acceptance (2026-11-18)

Independent follow-up review identified a **new** verifier gap; this is **P2-R3**, not a reopening of P2-R1 or P2-R2. Both earlier findings remain **CLOSED** within their original scopes.

- **Counterexample A:** remove an artifact-unreferenced job (e.g. `job_id=133998029071`): the 42-job receipt shrinks to 41 without breaking artifact-to-job references. The old verifier checked no job count.
- **Counterexample B:** change successful PR `run_id=44071333927` to `push` and change the corresponding artifact event: PR15/push4 becomes PR14/push5 while cross-references stay aligned. The old verifier checked success/failure totals but not event/conclusion distribution.
- **Patch:** `verify.py` now requires exactly 42 jobs and the recorded event/conclusion pairs (PR success14/failure1, push success3/failure1). `test_verify.py` includes a normal-ledger check and both new fault regressions.
- **Verification status:** the structural checks are reviewed against the fixed receipt data, but the new Python tests have **NOT_TESTED** execution status in this follow-up. Existing `test-results.txt` remains the historical five-method log, not evidence that the new cases ran. A separately executed test run and independent re-review are required to mark **P2-R3 CLOSED** and restore a limited-merge YES.

This patch does not change source artifacts, their audit scope, any formal safety/browser outcomes, or browser-start permissions. Overall **PARTIAL**; lab PR #4 remains **Draft / merge HOLD** pending P2-R3 closure.
