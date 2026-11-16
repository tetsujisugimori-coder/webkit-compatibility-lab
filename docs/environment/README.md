# Environment inventory

The table combines fixed workflow reads with attributed historical execution reports. A workflow declaration is an intended environment, not a complete measurement of a historical runner. Browser binary, exact runner image revision, dependency hashes and runtime flags require the original run records. Those were not freshly extracted from raw artifacts in Stage 0.

| Investigation | Intended/recorded OS and runner | Driver/runtime | Conditions and boundary |
|---|---|---|---|
| Loading API isolation | Ubuntu 24.04, Node 22 | Node Playwright 1.56.1 | Chromium/WebKit; specific viewport/motion/cache per case remains partially NOT_VERIFIED |
| Loading WAAPI Stage2A | Ubuntu 24.04, Node 22, Python 3.12 | Python Playwright 1.56.0 | width 375/390/765; not the same binding/version as API isolation |
| Intelligence outline Round14 | Windows 2025 / Ubuntu 24.04, Node 22 | Playwright 1.56.1; reported WebKit 26.0/Chromium 141, SDK 0.2.2 | 375x1000, light, text100%, DPR1, normal motion; fresh context/page; 70/144 timing comparisons non-equivalent |
| Yamanaka B6d | Ubuntu 24.04, Node 22 | Playwright 1.56.1 | 375/390/765/1280 x normal/reduced x two engines; normal routing OFF vs race/fault routing ON not cache-equivalent |
| Atlas v6 browser diagnostic | Ubuntu 24.04 | Playwright 1.56.1; fixed WebKit executable hashes in original report | 375x1000 normal; fresh worker/browser/context, retry0; timeout bounds specified in project record |
| Atlas current acceptance workflow | Ubuntu 24.04, Python 3.12, Node 24 | Playwright 1.56.1 | Latest PR HEAD has no run; older formal result must remain tied to its own HEAD |

## Required standard record

Record actual OS release, architecture, runner image/version, browser engine/build/revision and executable hash, test driver and binding, package lock SHA, launch flags, GPU/headless mode, fonts, locale/timezone, DPR, viewport, color scheme, text scale, Reduced Motion, network/cache/service-worker/routing setup, context isolation, input mechanism, and timeout/retry policy. Distinguish absent, redacted, NOT_VERIFIED and NOT_TESTED.

Physical Safari, VoiceOver, physical touch and OS text enlargement are not covered by these Playwright comparisons. Stage 0 starts no browser or workflow.
