# Cross-project WebKit investigation baseline

Stage 0 is a documentation baseline, not a root-cause fix or browser acceptance certificate.

## Repository identity and submission state

Stage 0 was merged through [PR #1](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/1), merge commit `c84ac9e5077ef5e56f6242876c4a1dfd0a1c4858`, tree `d7fef0a0fcfdfccf6187a0c69d2f95ebc3994771`. This was limited acceptance of the documentation baseline; technical failures and project HOLDs remain. Earlier submission decisions are preserved in the baseline history.

[Stage 1: evidence update and next observations](docs/investigations/stage1-next-observations.md) preserves the historical proposal. The [Stage 1 evidence ledger](docs/investigations/stage1-evidence-ledger.md) now records the completed B6e report separately from B6d, and the [comparison/start gates](docs/investigations/stage1-comparison-gates.md) identify concrete missing evidence. No new experiments or shared harness have been run.

Repository: [tetsujisugimori-coder/webkit-compatibility-lab](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab). The owner created the initial main commit before Stage 0. The original initialization and submission decisions remain historical records in [the submission supplement](docs/baseline/SUBMISSION.md).

## Scope

- Loading Museum: status transitions and API/WAAPI paths.
- Intelligence UI Museum: outline and visual differences.
- Yamanaka historical terrain: HTTP revalidation, observer exceptions, resource use.
- Historical Source Atlas: style/focus/scrollIntoView comparison signatures.

These are separate investigations. A common browser family is not evidence of a common cause.

## Interim policy

Per the owner's Stage 0 instruction, WebKit success is temporarily not a universal merge prerequisite across all projects. WebKit tests continue and failures remain FAIL. Chromium, unit, contract, and regression requirements, independent review, evidence preservation, and project-specific merge review remain. Clear data corruption or safety problems stop acceptance. This policy does not change a technical FAIL to PASS or authorize merging any project. Existing repository rules, required checks, workflow files, and settings have not been changed by this draft.

## Contents

- [Baseline and limitations](docs/baseline/README.md)
- [Repository bootstrap](docs/baseline/bootstrap.md)
- [Project records](docs/projects/README.md)
- [Environment inventory](docs/environment/README.md)
- [Hypotheses](docs/investigations/README.md)
- [Evidence and publication policy](docs/policies/evidence.md)
- [Classification and acceptance policy](docs/policies/acceptance.md)
- [Roadmap](docs/roadmap.md)

Source projects retain ownership of test code, original evidence, and acceptance decisions. This lab does not import their raw artifacts or modify their repositories.


## Stage 2-B supplement

[B6g existing-evidence intake](docs/investigations/stage2b/README.md): formal safety/browser FAIL preserved; no new browser or source tests.
