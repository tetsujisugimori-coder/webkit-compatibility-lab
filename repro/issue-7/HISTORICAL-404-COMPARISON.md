# 山中城B6nとLabの404中断を照合

山中城PR #55のpush試験 [44633625432](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44633625432) を対象にした。固定HEADは `753922d38c5f9e07f7ca27148ec2a27555dae5e9`、treeは `7bce7538e2c2597ee68b0fd3e138960f7e20f66a`。同一runに入った通常の合成404、If-None-Match対照、ルーティング対照を採用した。

| エンジン | 基本404 | If-None-Matchあり／なし | ルーティングON／OFF | サーバーの `finish` から `requestfailed` | `requestfailed` から収集期限切れ |
| --- | ---: | ---: | ---: | ---: | ---: |
| Chromium | 1/1 | 4/4 | 4/4 | 2.17〜5.07 ms | 5.011〜5.021 s |
| WebKit | 1/1 | 4/4 | 4/4 | 1.60〜3.92 ms | 5.010〜5.016 s |

表の件数は以下の観測がそろった試行。各試行について、実際のスクリプト要求のパスと、対象要求・応答の観測IDを照合した。

- 先行200で実行マーカー `first`。次の文書も `<script src="asset.js">` で読み込み、同じパスにサーバー404・96バイトを記録した。404のページではマーカーが立たなかった。
- サーバーは `response-finish` を記録。Playwrightは404を観測し、同一要求に `request → response → requestfailed` と `ABORT_OR_CANCEL` を記録した。Playwrightの本文捕捉は0バイト、完了判定はFAIL。その後 `capture.settle` が `DIAGNOSTIC_DEADLINE` に達した。
- サーバーの `finish` とPlaywrightのイベントは、同じNodeプロセスの単調時計で収録されている。サーバー時刻はローカルの応答書き込み完了を示す。ブラウザまで到達したバイト数は未観測。[サーバー収録](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/blob/753922d38c5f9e07f7ca27148ec2a27555dae5e9/scripts/stage3b6c-cache-diagnostic.mjs#L107-L130) · [通知収録](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/blob/753922d38c5f9e07f7ca27148ec2a27555dae5e9/scripts/stage3b6g-notifications.mjs#L3-L27)

## Labとの対応

Lab PR #10は同一オリジンの合成HTTPで404の通常スクリプトが `requestfailed` となり、マーカーが立たないことを再現した。Labの96バイト本文は山中城の合成本文とは別で、SHA-256も異なる。山中城のサーバーは本文を一括送信していた。Labの一括送信も両エンジンでサーバー送信完了後に中断通知が届いた。分割送信で検出したWebKitの後半未送信は、Labの分割対照の観測である。[Labの比較](HTTP-ERROR-TIMING.md)

観測結果は、固定版ソースにあるHTTPステータス400以上のスクリプト読み込み失敗と整合する。山中城の原票は観測器内のIDを記録しており、ブラウザ内部の呼び出しやネットワーク上の到達バイトは記録していない。経路の同一性と山中城の製品側への適用は未確定。約5秒かかったのは収集処理であり、要求失敗通知はその時点より前に取得済みだった。

## 参照した原票

GitHub Actionsから2つのZIPを取得し、公式サイズ・SHA-256、ZIP CRC、内部マニフェスト24件ずつ、内部のHEAD・push表記を照合した。使用したJSONは各ZIPの `cache-diagnostic-<engine>.json` と、`if-none-match/`・`route-404/` の同名原票。

| エンジン | Artifact ID | サイズ | SHA-256 |
| --- | ---: | ---: | --- |
| Chromium | 14583396833 | 35,145 B | `87ac229c730eec182d6c3f0df82d431649e901574642fdfb88c3b409dd4b7ca5` |
| WebKit | 14581753624 | 34,838 B | `cd91e7e1946dfa7b8200080e8809ea29e28ad0d891877abe5b3652435a2d6be5` |
