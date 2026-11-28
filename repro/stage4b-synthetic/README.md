# 4-B synthetic evidence preparation

This directory tests a bounded coordinator and evidence correlation using only generated Node worker-thread fixtures. It contains no browser adapter or real replay instructions. Real start always returns BLOCKED (NO_REAL_ADAPTER), no matter what input or approval label is supplied. Browser execution and root-cause identification are NOT_TESTED and UNKNOWN respectively. Historical results, the existing 4-A workflow, and product data and gates are unchanged.

- Maximum observation entitlement is 15 s per case, 60 s per suite, one attempt each. A separate cleanup wait is capped at 1 s. Defaults are 2 s, 12 s, and 0.5 s. The earlier deadline wins; ties are recorded as suite deadline. Deadlines use the host monotonic clock. These are cooperative scheduling bounds for the coordinator, not hard real-time OS execution guarantees.
- An isolated worker thread emits fixed events. Reports include run/case, frame and document IDs, request IDs, sequence, snapshots, host receipt time, streams (exact captured bytes in Base64), and worker exit/cleanup. Thread exit is not an external process exit; an exit or timeout does not imply a browser crash.
- Header receipt is not body completion. Events from mismatching identities, invalid ordering, duplicate records and late former document data are quarantined. Receipt records remain present for review. A partial observation or unconfirmed cleanup is not a successful case. Unconfirmed cleanup blocks further launches; the OS's actual subsequent process state is not attested.
- Build and run details, standard output/error, and manifest sizes and SHA-256 are separated from acceptance. The fresh output directory is exclusive at the workflow boundary, and report/manifest files cannot be overwritten through the entry point. A parent process abruptly killed before emitting its report may leave evidence incomplete; it cannot be treated as a successful case. No detached system process is launched.
- The small 4-A patch records an RNG exception as identity ERROR with null ID, and does not stop later listener events or fabricate an ID from a counter or clock. Missing RNG is separately UNSUPPORTED.

From the repository root, with directories dedicated to this run:

    mkdir -p .work
    mkdir .work/stage4b-checks .work/stage4b-synthetic
    TEST_SCRATCH="$PWD/.work/stage4b-checks" node --test repro/r2215-stage4a/observer.test.cjs repro/stage4b-synthetic/coordinator.test.cjs
    node repro/stage4b-synthetic/evidence.cjs synthetic .work/stage4b-synthetic
    node repro/stage4b-synthetic/evidence.cjs manifest .work/stage4b-synthetic

The tests cover complete evidence, headers only, missing and foreign identity, old-document events, a synthetic worker error, observation and suite deadlines, fixed case admission, rejected real start, and manifest input guards. Synthetic PASS is limited to those contracts.
