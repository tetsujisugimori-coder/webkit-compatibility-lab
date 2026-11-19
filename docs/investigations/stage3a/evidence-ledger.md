# Stage 3-A 固定版成果受領・証拠台帳（2026-11-19 JST）

## 評価語と受領境界
- **D（直接確認）**：この工程でGitHubのPR metadata、固定commit変更ファイル一覧、公開レビュー/コメント、代表runのjob/stepを直接取得したこと。コメント内の「原ZIP監査PASS」はその報告本文の取得であり、**原ZIPの新監査ではない**。
- **R（報告の受領）**：元PRで実行者・独立担当が述べた局所試験、全run集計、zipの保存後再取得・CRC/manifest。ラボ担当による新たな追試・全量再取得ではない。
- **U**：必要な直接観測、元ZIP再取得、正式使用byte、原因等が今回ないもの。PASSに変換しない。
- 固定ソース： [B6h報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6961249966)、[B6i確定報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6974070224)、[B6j確定報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6984053076)、[B6j別担当レビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5960380971)。

## Git版・変更集合（GitHub固定commitの変更一覧 D、tree/parentは元報告 R）
| Stage | 固定HEAD | parent | tree | commit差分path | 実装変更の意味 |
|---|---|---|---|---:|---|
| B6h | `8168c3552b820d2da5a666e205e27c55fbd70026` | `16e26b3381763269dfc9d2360670b57726db996d` | `e8ae785db4e448b78609d8229ae1d374a197a3ec` | 16 | supervisor/worker、watchdog、collector、専用workflow、records tests、5文書 |
| B6i | `8b0abbd7038be062aa43c8aeff40edc25b9ad203` | `8168c3552b820d2da5a666e205e27c55fbd70026` | `6d9a6cb51265967d16afe8b2e410ae57f94a3295` | 5 | overview workflow、2文書、supervisor test、contract test |
| B6j | `f6be90f4a27452375041bf7e4f7ebc35c5cd4e1b` | `8b0abbd7038be062aa43c8aeff40edc25b9ad203` | `3af71e0dfafb8c40814f35aec2e6350eb64d0730` | 12 | signal前checkpointの除去、evidence-first harness、collector補訂、旧版ソースfixture、2文書 |

B6hの確認対象例：`.github/workflows/stage3b6.yml`、`scripts/stage3b6h-watchdog.py`、`scripts/stage3b6h-artifacts.py`、`tests/stage3b6h-collection.py`。B6i：`.github/workflows/stage3b-overview.yml`、`tests/stage3b6i-contract.test.mjs`。B6j：`scripts/stage3b6j-case-record.py`、`tests/stage3b6j.py`、`tests/stage3b6j.test.mjs`、`tests/stage3b6h-collection.py`。変更path一覧は各[GitHub B6h commit](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/8168c3552b820d2da5a666e205e27c55fbd70026)、[B6i](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/8b0abbd7038be062aa43c8aeff40edc25b9ad203)、[B6j](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/commit/f6be90f4a27452375041bf7e4f7ebc35c5cd4e1b)で直接取得。差分pathの数は本工程の直接観測だが、すべての実行時byte一致や差分の動的意味の独立実証ではない。

## 正式run・jobの版別集計（各19 run、混算禁止）
| 版 | run成功/失敗/取消 | job成功/失敗/skip/取消 | 専用結果と受入境界 | 根拠 |
|---|---|---|---|---|
| B6h | 16 / 3 / 0 | 36 / 5 / 1 / 0 | 専用4jobの単体/収録ゲートはPASS、browser FAIL。overview total壁時計1261.703ms >1250msでFAIL。正式安全全体FAIL | R：[B6h](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6961249966)、D：[overview run 44171535659](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44171535659)のjobがFAIL |
| B6i | 16 / 3 / 0 | 全42jobの結果内訳は今回未再集計 U | overview PR/pushは成功、limited PR Chromium close超過・B6a PR/push browser FAIL。正式安全全体FAIL | R：[B6i](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6974070224)、D：[limited PR run 44184412610](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184412610) Chromium FAIL/WebKit SUCCESS |
| B6j | 8 / 10 / 1 | 27 / 13 / 1 / 1 | 731/731局所PASSと異なり正式FAIL。旧RED4件はZ残留/監査FAIL、GREEN未到達。新P2-CI-01 OPEN | R：[B6j確定報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6984053076)、D：[limited PR run 44330864254](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864254)の両engine job FAIL |

19 runや42jobは**workflow/runとjobの件数**であって独立したブラウザ条件数ではない。B6jでは各run attempt1との報告。ラボで全run APIを再列挙したものではない。B6gの17成功/2失敗をB6h/B6i/B6jへ流用しない。

## B6hの代表正式run・失敗原票（R、代表jobはD）
| event / run | jobまたはartifact | 観測と未解決 |
|---|---|---|
| push / [44171535769](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44171535769) | B6h専用job | 単体・収録成功、browser FAIL |
| pull_request / [44171545824](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44171545824) | B6h専用job | 単体・収録成功、browser FAIL |
| push / [44171535659](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44171535659) | job `134351632766`、ZIP `14366514526` | total wall 1261.703774ms >1100+150ms。runtime原票未収録INCOMPLETE。旧B6g 6秒TimeoutExpiredと別 |

元報告では局所727/727、独立focused8/8、P2四件同一反例の修正が限定PASS。正式38 ZIP=2,583,378,780 bytes、root完全manifest 10/38、なし28/38（網羅性UNKNOWN）。別担当のLibrary保存後再取得・byte/size/SHA/CRC照合PASSとの**報告**はあるが、本ラボでは新規取得せず。

## B6iの代表正式run・失敗原票（R、代表jobはD）
| event / run | job/artifact | 観測と未解決 |
|---|---|---|
| push / [44184401456](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184401456) | overview | 一連の収録・seal・upload成功との報告。元browser全体の受入ではない |
| pull_request / [44184413059](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184413059) | overview ZIP `14375095165` | 87,391,889 bytes、SHA-256 `14dda96c376d13738b9771726599b19235244904e7a82c17f115be08f3b88fcf`、2,122 CRCのGitHub原物照合との報告。**保存先からの独立再取得は未成立** |
| pull_request / [44184412610](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184412610) | Chromium job `134396960583` | 729 unit=728PASS/1FAIL。close 1829.093ms >1800ms、withinBudget=false、残留0/auditPASSでも時間FAIL。production matrix SKIPPED |
| push / [44184401192](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184401192) と PR / [44184412572](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44184412572) | B6a interaction | browser matrix FAIL、根因は未確定 |

B6iは正式38 ZIP=2,493,250,228 bytesのinventory報告があるが、全量の保存後独立再取得は**INCOMPLETE**。旧B6hのoverview失敗の改善を本版の全workflow成功と扱わない。[独立レビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5953542485)では5静的変異を拒否したが、実collectorの新規故障注入は未実施。

## B6jの正式run全19件（元PR報告 R。今回の全19 API再取得ではない）
| event | run ID（GitHub Actions） | workflow略称 | report |
|---|---:|---|---|
| push | [44330846897](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330846897) | prototype | FAIL |
| push | [44330846919](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330846919) | interaction | FAIL |
| push | [44330846948](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330846948) | overview | FAIL |
| push | [44330847217](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330847217) | western defences | SUCCESS |
| pull_request | [44330863840](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330863840) | overview | SUCCESS |
| pull_request | [44330863889](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330863889) | interaction | FAIL |
| pull_request | [44330863951](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330863951) | unplaced contract | SUCCESS |
| pull_request | [44330863956](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330863956) | Pages build/deploy workflow | SUCCESS (本番公開を示さない) |
| pull_request | [44330864031](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864031) | survey custody | SUCCESS |
| pull_request | [44330864091](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864091) | pinned CAD integration | SUCCESS |
| pull_request | [44330864121](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864121) | inner observation | FAIL |
| pull_request | [44330864127](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864127) | western defences | SUCCESS |
| pull_request | [44330864192](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864192) | castle exploration | CANCELLED |
| pull_request | [44330864244](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864244) | prototype | FAIL |
| pull_request | [44330864254](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864254) | limited production | FAIL |
| pull_request | [44330864267](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864267) | connected defences | FAIL |
| pull_request | [44330864287](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864287) | inferred C layer | FAIL |
| pull_request | [44330864435](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864435) | survey correspondence | SUCCESS |
| pull_request | [44330864573](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44330864573) | landscape C D extraction | FAIL |

集計 8 SUCCESS + 10 FAIL + 1 CANCELLED = 19。push4 / PR15、job42（27 SUCCESS/13 FAIL/1 SKIPPED/1 CANCELLED）は元報告集計。代表limited run `44330864254`のChromium/WebKit job両FAILは今回APIで直接確認(D)。

## B6jの特定原票、独立レビュー、保全の境界
- 元[確定報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6984053076)では正式6原票の旧REDで、専用push WebKit 1888.072ms/Z1/auditFAIL、専用PR Chromium 1889.750ms/Z1/auditFAIL、専用PR WebKit 1864.433ms/Z1/auditFAIL、overview push 1861.304ms/Z1/auditFAIL、いずれも新GREEN未到達・最終assertions欠落。他2件（専用push Chromium、overview PR）は17対照完走。**局所731/731 PASS、独立focused7/7 PASSでも正式FAILを上書きしない**。
- B6iのclose失敗の旧run `44184412610` job `134396960583` のログではdeadline1125.564→cleanup1623.322→SIGTERM1781.564→kill1816.261→audit1828.910ms、elapsed1829.093ms。元artifact `14375076761` は31 CRC/30 manifestと報告されるが、finite runtime/assertionsは未収録。同期checkpoint/fsyncによる過去原因は**HYPOTHESIS**に留める。
- [独立再審査](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5960380971)で局所P2三群はCLOSED。一方、B6j harness途中assertで最終assertionsが欠落し、collectorが旧6+14件のみを対象にB6j-controlsを意味監査しない**P2-CI-01 OPEN（B6j時点）**。[次のレビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5960885469)はB6k修正へ切り出している。B6k現行判定は別版なのでこの記録のOPENを消さない。
- 正式38原ZIP 1,069,678,166 bytes、GitHub公式size/SHA確認、Library保存後別session直接再取得、全byte/SHA、CRC 37,963、適用manifestの限定PASSは**元作品の報告(R)**。root完全manifest12、SHA一覧のみ1、manifestなし25。後者26本の集合網羅性UNKNOWN。局所束176,052,835 bytes/SHA `927f0be4abbb2d94ff484b08af9cbc5f70f10bb2761f02b7476eb630fd05291f`、CRC63,316/manifest63,315とGit bundle隔離復元の限定PASSもR。本工程で実ZIP取得0、bundle復元0。
- 独立性は元報告のSOLO_STANDARD技術照合／同一account・基盤LIMITED_SHARED_OWNERであって、第三者人的独立ではない。利用主体のACLや長期保持保証はUNKNOWN。原物保全PASS、正式試験FAIL、製品受入NOは別軸。

## 後続版と残件
元[山中城PR #55](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55)はB6kまで進んだ（2026-11-19調査時HEAD `29eb183726e6649b62495c573e19bd32f8f33abe`、Draft）。[B6k提出版レビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5961373662)は限定技術受入PENDING、独立正式受入NO。本Stage 3-AはB6kの結果を再評価しない。新しい元作品のレビュー/正式CI/再取得監査は版別の追加Stageとして扱う。

本工程の実行：GitHubの文書/公開メタデータ取得とラボMarkdown編集だけ。元作品の変更、source/browser実行、CI dispatch、原ZIP保存・削除/移動・公開範囲変更は0。現行山中城安全FAIL/browser FAIL、HOLD、304 NOT_ADOPTED、root cause/使用実byte UNKNOWNを維持。
