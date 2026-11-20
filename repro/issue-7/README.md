# Issue #7: 404 script 診断の有限待機

対象はローカル合成HTTP上の診断処理のみ。[Issue #7](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/7) の既存比較では、Playwright 1.56.1／Chromium 141.0.7390.37・WebKit 26.0の両方で、通常scriptの404がrequestfailedとなっても response.finished() は5秒時点で未解決だった。If-None-Match有無、ルーティング有無の既存原票はIssue #7を参照。移管元は山中城PR #55、固定版 `753922d38c5f9e07f7ca27148ec2a27555dae5e9`。本稿はブラウザ内部の中断原因を説明しない。

## 実行例

Node.js 22以降を推奨。Playwrightとブラウザを既存の承認済み実行環境に準備する。

```sh
cd repro/issue-7
npm ci --ignore-scripts
npx playwright install chromium webkit
npm test
node repro.mjs
```

`node repro.mjs chromium` または `node repro.mjs webkit` で片側だけも可能。出力のJSONには各版、試行、サーバーのステータス・本文サイズ・ハッシュ・finish、ブラウザ通知、診断判定、クローズ開始時刻を分けて記録する。時刻はUTCと同一Nodeプロセスの単調時計を持つ。未実施・想定外は非ゼロ。サーバーの `finish` はブラウザでの受領を証明しない。

## 診断と判定

- 各試行は別コンテキストで、同一オリジン同一URLの1回目200から開始。2回目は200 script、404 script、404 fetchのいずれか。ルーティングなし、no-store、If-None-Matchなし。
- 試行開始前に待機を設定し、URLとresource typeで対象の開始を選び、その先の終端は同一Requestオブジェクトで識別する。requestfailedで理由と時刻を確定し、requestfinishedは転送の終端であってHTTPの成功とは別。判定時に単調時計で経過時間も照合し、通知がない場合や期限以降に通知を処理した場合は `deadline` でFAIL。結果確定時に期限タイマーと専用リスナーを回収し、遅着通知やクローズで結果を上書きしない。
- ページ側の観測がタイムアウトした場合も、試行のJSONに取得済みの応答・通知と診断の判定、理由、時刻を残す。
- 200のscriptはloadと実行マーカー更新。404のscriptはerrorとマーカー不変、対象requestfailedでクローズと期限より前に診断FAIL。旧方式も同じ要求で並行観測し、クローズ前の5秒時点でresponse.finished()が未解決であることを要求する。新待機が旧方式の実験用待機に依存するわけではない。
- 404のfetchはHTTP 404と96バイトの本文を確認し、サーバー記録とバイトのSHA-256を照合する。期待どおりの診断FAILを記録した試行は回帰試験としてPASS。
- モック通知による単体対照は、同一URLの別Requestと別種類のRequestの失敗、終端なし、終端後の遅着、close/crash/dispose、リスナー解除を対象とする。これらをブラウザ実測とは扱わない。

初発中断原因UNKNOWN、304の本文取得はIssue #7に残す。Labのこのリポジトリには適用可能なActionsワークフローがなく、新規CIは追加しない。山中城側のDraft・未マージ、B6a正式受入FAIL、Stage 3-B HOLD、304代替NOT_ADOPTEDを変更しない。
