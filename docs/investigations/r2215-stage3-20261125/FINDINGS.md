# 確認済み事項・仮説・UNKNOWN、個別判定

| 論点 | 判定 | 根拠と留保 |
|---|---|---|
| アサーション発生位置（PR #21同配布revision ELF） | STRONGLY_SUPPORTED | 0x45208a9 call/0x45208ae戻りPC、GDB map換算、既存原票記録。今回生ELF再照合なし、PR #20実行ELF同一性UNKNOWN |
| FDE報告範囲のPC包含 | CONFIRMED | 報告値の算術比較のみ。FDE生出力と対象ELF識別情報は未取得。readelf再実行NOT_TESTED |
| WebKit内部関数名 | UNKNOWN | 完全一致DWARFなし。initializeForNewWindowは比較候補のみ。r2215上流の引継ぎ分岐はサブフレーム限定 |
| Atlasの停止フレーム・該当分岐到達・配布物の分岐条件 | UNKNOWN | 主フレーム操作は停止フレームの証明ではない |
| 空になったindex（previous/currentの区別） | UNKNOWN | unsigned longだけでは変数を特定できない。#301593のnullptr参照仮説はAtlasのoptional assertionを直接説明しない |
| indexが失われた初発原因 | UNKNOWN | WebKit上流も未確定、ソース差分は挙動の説明に留まる |
| r2227の非再現という観測 | CONFIRMED（既存CIの範囲） | 1.56.1ドライバー固定、r2215 3 TIMEOUT/r2227 7 PASS。既存原票は改変しない |
| r2227非再現の特定変更への帰属 | UNKNOWN | 版差が複数。配布物へのpatch適用履歴なし |
| 上流PR #53102の公開ソース上の修正内容 | CONFIRMED | 2025-10-29マージ。現在index欠落時はフォールバック |
| 上流PR #53102とのAtlas因果関係 | UNKNOWN | r2227上流基準日より後。Atlas実行で該当修正のA/B比較なし |
| Playwright v1.57.0独自パッチの公開内容 | CONFIRMED | index欠落時return、上流フォールバックと異なる |
| Playwright独自パッチとの非再現の因果関係 | HYPOTHESIS | 版と修正経路が整合するが配布ELF採用未証明 |
| Bug #300402 previous index欠落 | CONFIRMED（当該Bugの報告範囲） | 報告者による実スタック・nullopt説明。Atlasへの転用不可 |
| Bug #301593 current index欠落・nullptr参照による停止 | HYPOTHESIS | 開発者仮説。Atlasの空optional assertionとは区別する |
| Bug #301593のFIXED状態 | CONFIRMED | 上流#53102の公開修正・Bug状態を確認 |
| 追加実機検証の必要性 | 文書受入には不要、研究上は条件付き | 公開API可視状態と時系列の観測価値がある場合のみ別承認。内部帰属はUNKNOWN、実施NOT_TESTED |
| 同Build ID DWARFによる厳密帰属 | BLOCKED | 公開debuginfod限定照会に成功せず、同一シンボル取得なし |
| 実行時ELFと後日取得ELFのバイト同一性 | UNKNOWN | 実行時SHA/Build ID未記録 |
| 現時点での実機試験 | NOT_TESTED | 本PRは文書のみ、所有者の個別承認待ち |

証明の強さが混ざらないように、「現象の確認」「実配布への適用」「なぜ起きたか」をそれぞれ別に判定する。GitHub Actions run successは診断完走であり製品受入PASSではない。既存のAtlas・他プロジェクトのWebKit障害を一律同じ原因に分類しない。
