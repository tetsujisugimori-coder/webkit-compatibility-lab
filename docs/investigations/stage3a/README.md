# Stage 3-A: 山中城B6h〜B6j既存成果の固定版受領

> **現行判定（2026-11-19 JST）：資料・公開メタデータの受領作業を実施。技術受入はPARTIAL、元作品の正式有限processゲートFAIL、ブラウザ受入FAIL、Stage 3-B HOLD、304代替NOT_ADOPTED、source merge NO。** 横断ラボPR #4は2026-11-19 00:40:48 JSTにマージ済みで、文書/オフライン台帳の限定受入と元作品の受入は無関係。Stage 3-Aの新しい独立文書レビュー、原ZIP再取得監査、実行テスト、CIはいずれもNOT_TESTED。

## 目的・版と工程の境界
- 管理[Issue #5](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/5)。作業基準lab main `47e5ae1c3e1baae51c0283ed55c93741702e5174`（[PR #4](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/4)のmerge commit）。PR #4の提出HEADは`6050ebcb8f955cf2dc7ca2f6041d693c8e883918`であり、merge commitとは別。
- 元作品[山中城PR #55](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55)はDraft・未マージ。B6h→B6i→B6jの**3つの完了固定版**を区別して読む。PR #55はその後B6k（調査時HEAD `29eb183726e6649b62495c573e19bd32f8f33abe`）まで進んでいるが、B6kは今回の受領・技術受入対象外。後続版があることはB6jの失敗を変更しない。
- 参照する原資料：GitHub固定commitの変更ファイル一覧、PR #55の版別報告とレビュー、代表正式run/jobの公開メタデータ。判定の根拠区分：**D**=今回GitHubから直接読取、**R**=元PRで報告された原ZIP取得・監査/局所試験（今回は追試せず）、**U**=未取得・未確証。
- 詳細台帳は[Stage 3-A証拠受領台帳](evidence-ledger.md)。ここには元原ZIPや非公開Library識別子をコピーしない。

## 固定版の違い
| 版 | 参照commit / tree | 変更（直接確認した差分path数） | 正式実行の版別結果 | 判定 |
|---|---|---|---|---|
| B6h | [`8168c355`](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/8168c3552b820d2da5a666e205e27c55fbd70026) / `e8ae785db4e448b78609d8229ae1d374a197a3ec` | 16。watchdog、失敗時原票、collector/専用workflow、故障テスト | [報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6961249966)：19 run=16成功/3失敗。overview時間契約FAIL、専用4 jobは単体・収録ゲート成功だがbrowser FAIL | PARTIAL / formal safety FAIL |
| B6i | [`8b0abbd7`](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/8b0abbd7038be062aa43c8aeff40edc25b9ad203) / `6d9a6cb51265967d16afe8b2e410ae57f94a3295` | 5。overview workflowへのalways収録と時間観測 | [報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6974070224)：19 run=16成功/3失敗。限定Chromium close 1829ms >1800ms、他browser FAIL | PARTIAL / formal safety FAIL |
| B6j | [`f6be90f4`](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/f6be90f4a27452375041bf7e4f7ebc35c5cd4e1b) / `3af71e0dfafb8c40814f35aec2e6350eb64d0730` | 12。signal先行、evidence-first判定、B6j-controls追加 | [確定報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6984053076)：19 run=8成功/10失敗/1取消。Z残留・assertions欠落・collector集合不足 | PARTIAL / formal safety FAIL、P2-CI-01 OPEN（B6j時点） |

## 差分を混同しない
B6hの作業は旧B6gで原票収録が失敗した後の収録器・監督処理改善。B6iはoverview側の収録改善であり、専用4 jobのPASSを全jobへ拡張しない。B6jはB6iの時間失敗を受けたsignal順序と台帳改善だが、旧REDを伴う**正式6主要原票中4件が途中停止**し、対照の全件成功は未成立。旧B6gの6秒TimeoutExpired、B6h overviewの1261.703ms超過、B6i closeの1829.093ms超過、B6j Z残留は異なる版・条件の記録であり、単一の原因にまとめない。

## 保全と受入の分離
[中央保全規約v0.2.0](https://github.com/tetsujisugimori-coder/git-preservation-gate/blob/4695c3ce2d61e66df0dd36a4312373459e1557d4/docs/v0.2.0/policy.md)では公開文書はLevel 1、重要な実験原ZIPはLevel 2となる。元作品の保存・独立再取得PASSという**報告**は、今回のラボが再取得したことを意味しない。本Stage 3-Aでは原ZIP・生ログの取得/展開/保存0件、ブラウザ・Python・Node・CI起動0件。今回の台帳の「収録記録を読んだ」ことと「内容を検査した」ことを明確に分ける。実原物の完全性、製品受入、独立性の判断を統合しない。

## 残件と次工程の開始条件
1. Stage 3-A文書の固定版読戻し・相対リンク・数値整合・独立レビューを別工程で確認する。正式CIが存在しない/未実施ならCI PASSと書かない。
2. B6kは別版として後続に存在。新CI、未解決P2、保存後再取得・独立審査は**B6k側で個別判定**し、本受領台帳のB6j結果を遡って変更しない。
3. 元作品のHOLD/FAILを解除せず、新ブラウザ因果実験、共有harness実装、304受入述語緩和、手動workflow retry/dispatch、元作品のPR操作は別の範囲審査まで実施しない。

**本書の範囲内の整理で新規実験の再現性・本番使用bytes・根本原因は立証されていない。**