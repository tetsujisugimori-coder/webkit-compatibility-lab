# WebKit本体の履歴再読込停止: Issue #18 限定実験

これは**診断器の判定ロジック改善ではなく、WebKitバイナリ差分の原因切り分け**である。既存の `repro/atlas-history/`、PR #17の原票と判定は変更しない。

## 上流のソース根拠
- [WebKit/WebKit#53102](https://github.com/WebKit/WebKit/pull/53102) は `Navigation::initializeForNewWindow()` が欠落した `currentEntry()` を参照する経路を修正した。変更箇所は `Source/WebCore/page/Navigation.cpp` の `m_currentEntryIndex` 確認。上流修正者は欠落に至った初発経路を未確定と明記する。
- [microsoft/playwright#37766](https://github.com/microsoft/playwright/issues/37766) ではページ再読込の異常終了に `_M_is_engaged()` と `Navigation::initializeForNewWindow` が記録される。
- [microsoft/playwright#43949](https://github.com/microsoft/playwright/issues/43949) は `pushState→reload→goto` のクラッシュと、1.56.1ドライバー+新WebKitバイナリでのPASSを報告している。**AtlasのUbuntu TIMEOUTと同一原因の証明にはまだならない**。

## 今回の固定実験
- driver: Playwright **1.56.1のみ**。WebKitバイナリ: **r2215 と r2227**。バイナリ起動可否、全シナリオ結果、`DEBUG=pw:browser`を保全する。
- 固定入力1: `route.fulfill`した最小HTMLで `pushState→reload→goto` と、`replaceState`、履歴操作なし、`reload`→`goto(page.url())` を比較。ネットワーク応答の変化をなくす。
- 固定入力2: 旧Atlas HEAD `3e56d13d77048d056e79c6971e6e7d24ad92b4ff` の同一HTML、`EK-0119→EK-0120→reload→C05→reload` 2試行と、先行reloadをgotoへ変える1試行。新規BrowserContextで独立、同一コードを各バイナリで実行。
- 合計 **7条件/バイナリ × 2 = 14条件**。時間制限はナビゲーション15秒、GitHub job 25分。反復は固定回数のみ。
- 取得物は `r2215.json`、`r2227.json`、両stdout/stderr/exit。ブラウザのCRASH/TIMEOUTを隠さず、CI job成功は「限定実験が完走した」だけとする。

## 判断
1. 最小HTMLのr2215のみでクラッシュし、r2227でPASS: 上流のWebKit修正による改善と整合する（修正箇所の独立再証明ではない）。
2. Atlasも同じバイナリ差を示す: WebKitバイナリ起因を支持。ただしUbuntu TIMEOUTとDebian SIGABRTの同一性は原票・native stackを要する。
3. `_M_is_engaged` が出ても **WebProcessのstackに対象関数が確認できなければ**同一根因は有力仮説に留める。
4. どちらかのバイナリが起動不可、原票不足などは NOT_TESTED/INCOMPLETE。都合のよいPASSにしない。

このPRではAtlas本体、既存診断器、必須CIゲート、各作品のHOLD、既存原票の扱いを変えない。必要なら次工程でWebKitのシンボル付き実行・gdbバックトレースを**対象1条件に限定**して設計する。
