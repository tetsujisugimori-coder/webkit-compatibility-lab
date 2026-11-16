# 山中城 WebKit baseline

## 確認方法と版

Stage 0ではGitHub APIのrepository、main commit、open PR、recursive tree、Actions、および固定HEADのworkflow・計画文書・投稿済み追補を読み取り確認した。今回ブラウザ再実行、原ZIP取得、独立バイト監査は行っていない。以下の再現・保全成功は既存一次報告の確認であり、Stage 0自身の再現／再監査ではない。

- Repository: [yamanaka-historical-terrain](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain)、Public。
- main HEAD `148317e52a7dc5efba8aa519538a476dfead18c5` / tree `55223ca4be5db9f7e0de56b0b795ec964744f82c`。
- [Issue #54](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/issues/54)、[Draft PR #55](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55)、branch `feat/stage3b6-comparison`。
- PR HEAD `aa3688f312f46f4db7faace8e7e1d200cdf9b78e` / tree `ea6f733c50c06ba57c38637763ef64399c15d126`。treeはGit tree APIで確認。
- 最新工程はB6cではなくB6d。Git文書RESULTSは提出前PENDINGを含むため、[最終追補](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6929646782)と[304契約審査](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5927399746)を併読する。

## 問題と分類

- OBSERVED（既存原票の報告）：B6bの304応答32件と本文採取例外32件はobserver-local IDで一対一対応。旧B6a例外との対応はUNKNOWN。
- 先行200のresponse ETagと304のrequest If-None-Matchを区別する。ETag一致は使用実バイトの証明ではない。
- HYPOTHESIS支持：B6cではPlaywright 1.56.1のResponse.body()が300–399を拒否する分岐が例外の近接機序を支持した。HTTP redirectの実発生や全根本原因を確定していない。
- 合成修正：先行200 metadata完了前に304を処理する非同期相関問題は合成RED→GREEN。正式失敗の実原因だったとの証明はない。
- B6cのVary対照はAcceptだけ変え、本文・marker・ETagが同一だった。304自体を異常証拠としない。
- REPRODUCED（B6d一次報告の限定範囲）：実Acceptから異なるfirst/second本文・ETag・markerを選択する対照へ修正。PR/push×2engineの4原票で同URL・同context・routing OFF、raw200→200、first→secondとserver／採取entity対応が成立。
- UNKNOWN：404欠落対照はphase2 capture.settle / DIAGNOSTIC_DEADLINE、未完request-2/response-2を記録するが完結していない。
- productionでブラウザが使用した全実バイト、native traceとの一対一対応、根本原因、実before/after本文採取介入はUNKNOWN／未成立。
- page.routeを使う競合・故障経路とroutingなし通常経路ではHTTP cache条件が異なる。前者の成功を通常経路PASSへ読み替えない。
- 304代替受入契約NOT_ADOPTED。captureErrors／status200／配信バイト検査は緩和していない。

## CI・比較・環境

最新HEADのActions APIを確認：19 run、全attempt1、17 success・2 failure、PR15／push4。同条件PR/pushを独立条件として二重計上しない。

- [専用PR run 43951311042](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/43951311042)
- [専用push run 43951295893](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/43951295893)
- 各runのChromium/WebKit、計4job FAIL。
- 各event：Chromium通常8・競合64・注入3 PASS。ただし欠落診断未完でjob FAIL。
- WebKit通常8 FAIL、競合64・注入3 PASS。
- 正式通常条件はChromium/WebKit ×375/390/765/1280 ×通常/Reduced Motion＝16。714単体・保全・生成検証・build成功はブラウザFAILを置換しない。
- Pages build成功／deploy SKIPPED。

[固定workflow](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/blob/aa3688f312f46f4db7faace8e7e1d200cdf9b78e/.github/workflows/stage3b6.yml)：Ubuntu24.04、Node22、Chromium/WebKit matrix、35分timeout。pushは対象branch、pull_requestはpaths限定なし。Playwright1.56.1のruntime source SHAは審査本文に記録。実OS image patch／browser build全情報は今回原ZIP未取得のためNOT_VERIFIED。ローカルbrowserはsocket制約BLOCKEDで、成功扱い不可。

## 証拠・独立性

B6d正式原ZIP38本、計2,664,979,874 bytes。公式size/digest/SHA/CRCと保存後全byte読戻しは報告済み。ただし同一assistant・別プロセスの照合であり、独立コードレビュー／別担当読戻しNOT_TESTED、独立保全ゲートPENDING。

専用4本はmanifest全coverage、source334件／Git tree／runtime source、HAR・trace・画像参照hashを確認したと報告。画像目視NOT_TESTED。回帰34本の意味監査NOT_TESTED。root manifest欠落28本は網羅性UNKNOWN。B6cの独立保全PASSをB6dへ転用しない。Windows NOT_TRANSFERRED、保持期限／将来アクセス保証UNKNOWN。Stage 0では私有保存先や原ZIPを転載しない。

## 次工程と受入境界

新規ブラウザ実験より先にB6dの別担当コード・原ZIP監査。404待機未完と使用資源の独立根拠を別課題にする。既存の技術判定は正式FAIL・総合PARTIAL・限定マージNO・Draft／Stage3-B HOLD。新しい横断運用方針だけで技術FAILをPASSへ変更しない。実機SafariはNOT_TESTED。Atlas等との共通原因を示す証拠はない。

## AGENTS・容量方針の確認範囲

[対象HEADのAGENTS.md](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/blob/aa3688f312f46f4db7faace8e7e1d200cdf9b78e/AGENTS.md)全文を読み取った。小規模PR、大容量原本の無条件複製禁止、bytes/inode/実効書込先・容量余裕の事前確認、案件別Temp、既存証拠の削除・移動禁止、保存後実物の独立読戻しと技術受入の別ゲートを確認。Stage 0は文書／APIメタデータのみで、大容量ZIP・HAR・traceの再取得はしない。容量方針が参照する別リポジトリの運用実装を山中城へ適用済みとは扱わない。
