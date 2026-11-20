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

## 304後のキャッシュ利用

同一オリジンの合成HTTPで、サーバーが返したステータスとバイト数、ページの取得結果、Playwrightのステータスと本文取得結果をそれぞれ記録する。ネットワーク上の304には本文がなく、キャッシュは保存済み応答を再利用できる。[RFC 9110 §15.4.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4.5) · [RFC 9111 §4.3.3](https://www.rfc-editor.org/rfc/rfc9111.html#section-4.3.3)

```sh
cd repro/issue-7
npm ci --ignore-scripts
npx playwright install chromium webkit
node cache-revalidation.mjs > cache-revalidation.json
```

`chromium`・`webkit` のいずれかを引数に指定できる。各条件を別のコンテキストとローカルサーバーで実行し、先行200と後続要求を実送信の `If-None-Match` で照合する。応答には `Cache-Control: no-cache` を付ける。Playwrightのルーティングは使わない。各 `fetch` はページで読んだ全バイトをSHA-256で照合する。スクリプトは `integrity` に初回200と同じ本文のSHA-256を設定し、`load` と実行マーカーを確認する。別内容のハッシュを指定した対照では `error` とマーカーなしを要求する。手動 `If-None-Match` は別対照とする。[Fetch Standard](https://fetch.spec.whatwg.org/#http-network-or-cache-fetch) · [Subresource Integrity](https://www.w3.org/TR/sri/)

### Linuxでの観測（2026-11-20 JST）

Playwright 1.56.1、Chromium 141.0.7390.37、WebKit 26.0。各条件を2回実行し、全14条件の試行記録は同じだった。

| 2回目の読み込み | Chromium | WebKit |
| --- | --- | --- |
| 自動再検証の `fetch`（別文書・同じ文書・`cache: 'no-cache'`） | サーバー304。ページとPlaywrightは200、先行200と同じ35バイト・SHA-256 | 3条件とも自動 `If-None-Match` なしでサーバー200。ページは35バイトを取得。304を要求する対照はFAIL |
| ETag更新の `fetch` | 旧ETagを送り、サーバー200。新しい36バイト・SHA-256を確認 | 自動 `If-None-Match` なしでサーバー200。新しい36バイトを取得。条件付き200の対照はFAIL |
| 手動 `If-None-Match` の `fetch` | サーバーとページで304。ページ本文0バイト、Playwrightの本文取得は例外 | 同じ |
| 正しいハッシュのスクリプト | サーバー304、`load` と初回本文の実行マーカー。Playwrightは304、本文取得は例外 | 同じ |
| 異なるハッシュのスクリプト | サーバー304、`error`、実行マーカーなし。Playwrightは200、35バイトを取得 | サーバー304、`error`、実行マーカーなし。Playwrightは304、本文取得は例外 |

Chromiumは7/7、WebKitは3/7。WebKitの4件は、想定した自動条件付き要求が成立しなかったためFAILを保持し、CLIは終了1を返す。Playwright 1.56.1の `response.body()` は、公開された応答ステータスが300〜399の場合に本文取得を拒否する。今回の合成スクリプトでは、304後にどの内容が実行されたかをハッシュとマーカーで確認できた。WebKitの自動 `fetch` がこの条件で再取得した理由と、山中城の本番使用バイトはUNKNOWN。404の初発中断原因は別途Issue #7に残る。
