# 確認済み事項・仮説・UNKNOWN、個別判定

| 論点 | 判定 | 根拠と留保 |
|---|---|---|
| アサーション発生位置（PR #21同配布revision ELF） | STRONGLY_SUPPORTED | 0x45208a9 call/0x45208ae戻りPC、GDB map換算、既存原票記録。今回生ELF再照合なし、PR #20実行ELF同一性UNKNOWN |
| FDE報告範囲のPC包含 | CONFIRMED | 与えられた数値の算術比較だけ。readelf実行自体は今回NOT_TESTED |
| WebKit内部関数名 | UNKNOWN | 完全一致DWARFなし。initializeForNewWindowは仮説 |
| 空になったindex（previous/currentの区別） | UNKNOWN | unsigned longだけでは識別できない |
| indexが失われた初発原因 | UNKNOWN | WebKit上流も未確定、ソース差分は挙動の説明に留まる |
| r2227の非再現という観測 | CONFIRMED（既存CIの範囲） | 1.56.1ドライバー固定、r2215 3 TIMEOUT/r2227 7 PASS。既存原票は改変しない |
| r2227非再現の特定変更への帰属 | UNKNOWN | 版差が複数。配布物へのpatch適用履歴なし |
| 上流PR #53102の公開ソース上の修正内容 | CONFIRMED | 2025-10-29マージ。現在index欠落時はフォールバック |
| 上流PR #53102とのAtlas因果関係 | UNKNOWN | r2227上流基準日より後。Atlas実行で該当修正のA/B比較なし |
| Playwright v1.57.0独自パッチの公開内容 | CONFIRMED | index欠落時return、上流フォールバックと異なる |
| Playwright独自パッチとの非再現の因果関係 | HYPOTHESIS | 版と修正経路が整合するが配布ELF採用未証明 |
| Bug #300402 previous index欠落 | CONFIRMED（当該Bugの報告範囲） | 報告者による実スタック・nullopt説明。Atlasへの転用不可 |
| Bug #301593 current index欠落 | STRONGLY_SUPPORTED（当該Bug内の機構） | #53102開発者の説明は推測を含む。初発原因不明 |
| 追加実機検証の必要性 | CONFIRMED（判断としてYES） | index主語と可視履歴状態が既存資料だけでは不明。実施自体はNOT_TESTED |
| 同Build ID DWARFによる厳密帰属 | BLOCKED | 公開debuginfod限定照会に成功せず、同一シンボル取得なし |
| 実行時ELFと後日取得ELFのバイト同一性 | UNKNOWN | 実行時SHA/Build ID未記録 |
| 現時点での実機試験 | NOT_TESTED | 本PRは文書のみ、所有者の個別承認待ち |

証明の強さが混ざらないように、「現象の確認」「実配布への適用」「なぜ起きたか」をそれぞれ別に判定する。GitHub Actions run successは診断完走であり製品受入PASSではない。既存のAtlas・他プロジェクトのWebKit障害を一律同じ原因に分類しない。
