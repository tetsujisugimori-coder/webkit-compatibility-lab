# Stage 2-A 山中城B6f証拠の受領

2026-11-17。総合PARTIAL。文書・固定sourceの受領整理に限定し、新実験は0。

## 基準と取得区分

lab開始main `66d56436591b8f935a2f3515c4618d513a8473ff` / tree `b77c2fe1588d0211bba22ee4eca3f67ecb8324cd`（D）。PR #2は2026-11-17 11:11:33 UTCにmerged（D）。PR本文の旧Draft/未merge表記は履歴であり現在状態ではない。完全tree22pathを確認しAGENTS.md、workflow、実行コードは存在しない。証拠・受入方針を読み、本工程も文書のみとする。既存Stage1の旧観測は保持する。

D = このStage2-Aで直接取得したmetadata・報告本文・固定source。R = 読んだ報告が述べる実行値・過去監査結果。U = 今回未取得の原票・情報。報告本文をDで取得しても、そこに記載された実測の認定はR。旧4原ZIPの取得・再監査、HAR/trace/画像監査は今回NOT_TESTED。同じdot内の他担当の過去監査は本工程の独立実証ではない。

- [B6f最終報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6945117530)（本文D、値R）。
- [B6f独立レビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5937046389)（本文D、監査実施R）。
- source HEAD `7c4442e319e19950799d813524038b8474bc69a5` / tree `f84b54fc7d9776e070da5f283cb0858b2a78c1fb`（今回Git commit APIでD）。実行pushは同HEAD、PR checkout `257a64904dc6ec07a8e9ec0213999b991b5251cc` は別commit・同tree（R）。
- Playwright 1.56.1、公式固定commit `54c711571a37de525377e6f3d3608c3e029b1829` のTSを今回GET（D）。実行server network JS 20,824 bytes / SHA256 `6405362d8778d46d0aa64332139927cfbad311fdf915cf2284bf05ea8cd05e48` はR。TSと実行compiled JSの同一byte主張はしない。
- B6fでは主要observer/diagnostic/lockの3fileを4ZIPと照合、初回コピー末尾LF失敗を保持した後12/12一致（R）。全client/backend実行物の帰属はPARTIAL、実行OS/binary全hashは今回U。

## 4原票と正常/負対照（8行、R）

run/jobは既存Stage1台帳、artifactと観測値はB6f報告・レビューに基づく。今回Actions原ZIPの新規取得はない。runはattempt1・failure。4原票を8独立試行へ増やさず、各原票内の先行phase1/再読込phase2を別行にした。

|event/engine|run / job / artifact|phase/status|server bytes / body bytes|保存callback / finished / settled|
|---|---|---|---|---|
|push/Chromium|43979577143 / 133692259252 / 14282448171|1 / 200|96 / 96、entity一致|終了 / FINISHED / settled|
|push/Chromium|43979577143 / 133692259252 / 14282448171|2 / 404|96 / 0、不一致|終了 / 期限時PENDING / 期限時false|
|push/WebKit|43979577143 / 133692259396 / 14281493835|1 / 200|96 / 96、entity一致|終了 / FINISHED / settled|
|push/WebKit|43979577143 / 133692259396 / 14281493835|2 / 404|96 / 0、不一致|終了 / 期限時PENDING / 期限時false|
|PR/Chromium|43979583922 / 133692283804 / 14283064378|1 / 200|96 / 96、entity一致|終了 / FINISHED / settled|
|PR/Chromium|43979583922 / 133692283804 / 14283064378|2 / 404|96 / 0、不一致|終了 / 期限時PENDING / 期限時false|
|PR/WebKit|43979583922 / 133692283323 / 14282588967|1 / 200|96 / 96、entity一致|終了 / FINISHED / settled|
|PR/WebKit|43979583922 / 133692283323 / 14282588967|2 / 404|96 / 0、不一致|終了 / 期限時PENDING / 期限時false|

全404で `body取得0 → preservation callback終了 → capture.settle期限(completion=PENDING/settled=false) → context.close開始 → response-finish-failed → capture-settled → context.close終了`（R）。bodyとfinished待機は並行開始なので、この表をfinished開始がbody後という意味に使わない。同一rowの単調時計による順序であり、他run/native/wire時計と減算しない。各ms値は今回原票未取得のため新採取しない。

初発 `DIAGNOSTIC_DEADLINE` と assessment `UNKNOWN` を保持し、close後 `SETTLED` は期限内成功ではない。保存callback終了はbody一致とは別。200の正確なclose時刻・初発error全フィールドは今回Uで、404の失敗を正常対照へ転記しない。

全4件のrequestfinished/requestfailedは **NOT_RECORDED**（R）。存在しなかったとの認定ではない。phase2 request-2/response-2はobserver-local ID、native Request IDではない。native ID・Page.Close通知との実相関はUNKNOWN/U。missing専用HAR/traceは生成されず、通常等300 HARのmissing entry0というB6f検索結果はR。通常traceをmissing証拠に流用しない。

## sourceと実行範囲

[静的経路・仮説](stage2a-completion-hypotheses.md)は公式固定sourceを再読取した説明。今回の実404でloadingFailed/requestFailedが起きた証拠はない。server96/body0の不一致、根本原因、本番使用実byteは未解消/UNKNOWN。正式ブラウザ受入FAIL、304代替契約NOT_ADOPTED、Stage3-B HOLDを保持。

[B6g報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6946367339)の存在と別版HEAD `16e26b3381763269dfc9d2360670b57726db996d` / tree `c2f1b07f938535d91acd0f94ec3d2d31b4a4a1a9`をDで受領。新しいゲート・CI結果の審査は別工程でありB6fの歴史的P2・NOT_RECORDEDを上書きしない。
