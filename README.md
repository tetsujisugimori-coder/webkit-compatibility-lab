# Cross-project WebKit investigation baseline

> AI担当者・ChatGPT Workの作業方針：[AGENTS.md](AGENTS.md)。調査は再現・判定・対処・未解明範囲が整理できた時点で区切りを検討し、対象作品の開発へつなぐ。

## 現行状態（2026-11-19 JST）

- **[PR #4](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4)はmerged=true / closed**。merge commit `47e5ae1c3e1baae51c0283ed55c93741702e5174`、merge日時2026-11-19 00:40:48 JST（前日の15:40:48 UTC）。P2-R1/R2/R3はオフライン台帳検査の範囲でCLOSED、文書・台帳限定の受入であり、元作品の技術PASSではない。
- 次工程：[Issue #5](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/5) / [Stage 3-A B6h〜B6j固定版受領](docs/investigations/stage3a/README.md) と[証拠台帳](docs/investigations/stage3a/evidence-ledger.md)。受領は公開GitHubメタデータ・報告の版別整理のみで、原ZIPの新規取得、ブラウザ実験、新CIは実施していない。
- 元[山中城PR #55](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55)はDraft・未マージ、B6kまで後続更新あり。B6h/B6i/B6jの歴史的正式安全FAIL、ブラウザFAIL、Stage 3-B HOLD、304代替NOT_ADOPTED、production使用byteと根因UNKNOWNを維持。後続B6kと旧B6g結果を混算しない。
- 以下のStage 0/1/2-A/2-Bに書かれた過去の「Draft」「未マージ」「current」「PENDING」は当時の状態として保持し、**現在のPR #4マージ判定の根拠として扱わない**。

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
