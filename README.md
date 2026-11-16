# Cross-project WebKit investigation baseline

Stage 0 is a documentation baseline, not a root-cause fix or browser acceptance certificate.

## Repository identity and submission state

The repository is [tetsujisugimori-coder/webkit-compatibility-lab](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab). Initial observation found a leading-hyphen name; the owner subsequently renamed it. A second GitHub read confirmed the same repository ID under the corrected name. The assistant did not rename it.

The initial empty-repository blocker was resolved by an owner-created initial commit. The current base is main commit `e9177268a29d3e9f77ea8bfb2176f4c43b3c969e`, tree `6a2bcd7c94dad71bb1f8e8d5b5fa4e928abc2ef4`, containing only the original 26-byte README. The assistant did not initialize or change main. The owner explicitly approved proceeding with a documentation Draft PR. These documents are proposed on `docs/stage0-webkit-baseline`; no merge is authorized. See the submission supplement for the check boundary.

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
