# Issue #7の404スクリプト中断

[PR #8](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/8) で、対象の `requestfailed` により診断待機を終えるようにした。本試験は、その通知に先立つブラウザのHTTPエラー処理を調べる。

```sh
cd repro/issue-7
npm ci --ignore-scripts
npx playwright install chromium webkit
node http-error-timing.mjs > http-error-timing.json
```

Node.js 22以降。引数 `chromium` または `webkit` で片側も実行できる。Playwright 1.56.1／Linux、同一オリジンのローカルHTTP、`no-store`、ルーティングなし。各条件は新しいコンテキストとサーバーで実行する。本文は同じステータス対照間で同一のJavaScriptで、通常は96バイト。サーバーはヘッダーを先にフラッシュし、500 ms後に本文を送る。分割対照では4,096バイトを使用し、2,048バイトずつ500 ms間隔で送る。分割対照の200と404は共に `X-Content-Type-Options: nosniff` を付ける。

サーバー側はヘッダー、各本文送信の予定時刻と実行、応答クローズを記録する。Playwrightは対象要求を同一Requestで照合し、応答と終端を記録する。ページ側は実行マーカー・要素イベント、または `fetch` のステータス・本文ハッシュを収録する。JSONの単調時計は各実行で同じNodeプロセスのものを使う。終了判定は要求の終端とページの観測を検査し、404スクリプトの中断時刻は送信時刻との前後関係として記録する。

## 実測

Chromium 141.0.7390.37（rev1194）、WebKit 26.0（rev2215）。各9条件を2回実行し、終端、ページ結果、本文送信の前後関係は一致した。

| 条件 | Chromium | WebKit |
| --- | --- | --- |
| 200および境界値の399のスクリプト | 本文送信後に `requestfinished`、マーカーあり | 同じ |
| 400・404のスクリプト、本文を一括送信 | 本文送信後に `requestfailed`（`net::ERR_ABORTED`）、マーカーなし | 本文送信後に `requestfailed`（`Load request cancelled`）、マーカーなし |
| 404の `fetch` | 本文送信前に応答通知。送信後に `requestfinished`、96バイトとSHA-256一致 | 同じ |
| 200の分割スクリプト | 後半送信後に完了・実行 | 後半送信後に完了・実行 |
| 404の分割スクリプト | 後半送信後に `requestfailed`、マーカーなし | 前半送信後、後半送信前に `requestfailed`。サーバー側で応答が閉じ、後半未送信。マーカーなし |

`nosniff` の有無を比較した一括送信の404は、いずれも本文送信後に中断が通知された。「ヘッダー送信直後、本文より前に中断通知が出る」という仮説は今回の全404スクリプト試行で成立しなかった。

## 実装との対応

- Chromium 141.0.7390.37の `ResourceLoader::DidReceiveResponseInternal` は、対象リソースがHTTPエラーを無視する型でなければ、400以上を `HandleError(ResourceError::HttpError(...))` に渡す。生のHTTP応答を扱う `RawResource` はその判定を無視する指定を持つ。[ResourceLoader](https://github.com/chromium/chromium/blob/141.0.7390.37/third_party/blink/renderer/platform/loader/fetch/resource_loader.cc#L1021-L1028) · [RawResource](https://github.com/chromium/chromium/blob/141.0.7390.37/third_party/blink/renderer/platform/loader/fetch/raw_resource.h#L105-L109)
- Playwright 1.56.1のWebKit上流基準版では、`SubresourceLoader` が400以上を同様に判定し、エラーを設定して `cancel()` を呼ぶ。`CachedRawResource` はその判定を無視する指定を持つ。[基準版指定](https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/UPSTREAM_CONFIG.sh) · [SubresourceLoaderの中断処理](https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/loader/SubresourceLoader.cpp#L528-L543) · [400のしきい値](https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/loader/SubresourceLoader.cpp#L586-L592) · [CachedRawResource](https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/loader/cache/CachedRawResource.h#L55-L59)

合成パスで観測した中断は、両エンジンのリソース読み込み処理にあるHTTPステータスの判定と対応する。Playwrightへの応答通知までのエンジン内部の経路は未計測。山中城の過去の実行で同じ経路を通ったことはUNKNOWN。
