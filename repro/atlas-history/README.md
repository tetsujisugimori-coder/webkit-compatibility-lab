# Atlas の参照リンク→再読込クラッシュ：限定比較（Issue #16）

## 判断したい3点
1. **再現条件**：先行参照 EK-0119→EK-0120 をクリックしてページを再読込し、その後 EK-0120-C05 を再読込するとクラッシュするか。対照は C05 直接アクセス。
2. **Chromium差**：同じHTML・操作・Playwright版で Chromium と WebKit を比較する。
3. **回避策**：旧版の先行 `page.reload()` を `page.goto(page.url())` に替えた対照、および現在のAtlasの文書ナビゲーション版を比較する。

## 固定入力
- Atlas旧HEAD：`3e56d13d77048d056e79c6971e6e7d24ad92b4ff`。参照クリックに `history.pushState` を使用。
- Atlas現行HEAD（2026-11-21取得）：`4fc74a0b6a531397914b16d8d38768ac8107803c`。参照の `?ref` 付き文書ナビゲーションを使用。
- Playwright：`1.56.1` および `1.57.0` を別jobでテストし、各版に対応するChromium・WebKitをインストールする。
- 実機条件：GitHub Actions `ubuntu-24.04`、390×1000、通常motion。各ケースは新規BrowserContextを使用する。先行再読込ケースのみ各2回、他の対照は各1回。手動で無制限再試行しない。
- 両HEADの `prototype/eikyouki/index.html` をローカルHTTPから提供。史料データ・Atlasソースは変更しない。

## 分類と判定
`results.json` の各ケースは `PASS` / `CRASH` / `DISCONNECTED` / `TIMEOUT` / `FAIL` / `INCOMPLETE` として保存。各ケースの `PASS` は「クラッシュせずC05の親詳細とフォーカスが回復した」を意味する。**ワークフローのsuccessは診断の実行成功であり、ブラウザの製品受入成功ではない。**

`source_head`、HTML SHA-256、Playwright/ブラウザ版、操作ステップ、エラー、stdout/stderr、終了コードを対応付ける。先行操作と再読込の双方が同じ手順でなければ原因比較の証拠にしない。エラーはクラッシュと単純なDOM不一致に分離する。

## 上流の関連事例
[microsoft/playwright#43949](https://github.com/microsoft/playwright/issues/43949) は、Playwright 1.56.1のWebKitにおける `pushState → reload → 別URL` で `Page crashed` と `_M_is_engaged()` 付近のassertionを記録し、Playwright 1.57.0同梱WebKitで非再現と報告している。Atlasと同一根因の証明ではなく、**比較する候補**。

## 受入の境界
GitHub Actionsの正式runと原票を確認してから結果を追記する。今回のPRは検証器・CIだけで、Atlas本体・現行製品の動作・採録内容・公開設定・必須チェックには触れない。Atlasの旧失敗・HOLDや実機Safari未検証は本診断で自動解除しない。独立レビュー後、必要なら別途本体での採用を判断する。

## 2026-11-21：PR #17 判定器P2修正と限定再検査

- [元の正式CI #44890958138](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44890958138)、固定HEAD `0acae4f0` の32原票は不変。Playwright 1.56.1はChromium 8 PASS、WebKit 6 PASS + 2 TIMEOUT。1.57.0は両ブラウザ各8 PASS。旧原票のTIMEOUTを事後的にCRASHに変更しない。
- このP2修正後の自動CIは **Playwright 1.56.1 + WebKit + 旧Atlas `reference-prior-reload` 2試行だけ** と、判定器の9件の模擬試験に限定する。元の32件比較は再実行せず、別のartifact名 `atlas-history-pr17-followup-<run_id>` へ保存する。
- `results.json` schema 2では、イベントの連番 `seq`、単調時間 `t_ms`、UTC `at`、操作 `step` を残す。HTTP 200、ナビゲーション応答の `response.finished()`、`requestfinished`、`load`、`page.crash`、ブラウザ切断を別記する。HTTP 200は本文完了やDOM成功を保証しない。
- TIMEOUTが暫定分類の場合、一度だけ750msの観測窓を追加し、Context閉鎖後に最終分類する。`provisional_result`と最終`result`を両方保存。CRASH > DISCONNECTED > PASS > TIMEOUT > FAIL の優先順位で、ページとブラウザの障害を混同しない。750msより遅い通知は検出保証なし。
- Debian 13.7 WPE WebKitで2件のページクラッシュが報告されているが、Ubuntuの旧TIMEOUTとの同一原因は未確定。ブラウザ本体はその診断中つながっており、HTTP 200は本文完了やloadの証明ではない。
- 旧文書の「正式CI実測PENDING」は初回CI時点の履歴。現行の判定は **原票集計PASS／判定器P2修正済・再検査と再審査PENDING／受入HOLD／Draft維持／マージNO**。Atlas本体と各作品のHOLDは変更しない。
