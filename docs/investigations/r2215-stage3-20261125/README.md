# WebKit r2215 第3段階：ソース差分・制御フロー対応技術報告

- 調査・取得日時: 2026/11/25 6:48:38 JST
- 親課題: https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/18
- 既存PR: #19, #20, #21（作業開始時いずれも OPEN / Draft、指定HEAD一致）
- 実装元main: a9d077312571b5c11aea86a07492541a831d10de（tree 83cdfa005f4f562e39751fb19b41932201cb81b2）
- 現行総合判定: **PARTIAL / ソース関係の限定評価PASS / 関数帰属・初発原因UNKNOWN / 新規実機検証NOT_TESTED / Draft維持・マージNO**
- 本報告は既存の調査を修正せずに追補するもの。原ZIPの実物再照合を今回実施したものではない。

## A. 結論
Playwright 1.56.1ドライバー固定の既存14条件では、WebKit r2215が4 PASS/3 TIMEOUT、r2227が7 PASS。r2215のTIMEOUTにC++ optional assertionが同時記録され、別途PR #20が実WPEWebProcessのSIGABRTを直接取得した。これらはWebKitビルド差の影響を強く支持する。ただしPlaywrightのTIMEOUTをCRASHへ書き換えてはならず、r2227での非再現がどのパッチに起因するかは不明である。

既存PR #21のGDB-PC/ELF整合は明確だが、同Build IDのDWARFなしにWebKit内部関数を厳密帰属できない。追加readelfのFDE範囲は報告値の算術検査のみ実施。バイナリ元資料の再取得・バイト同一性は未検証。過去の独立再審査PENDINGも維持する。

## B. 版と適用範囲
- PR #19 HEAD 86c6dad45f4635ab5618f7bd64f6c00e1888601f
- PR #20 HEAD 4ba2b94321d3c0b809448e87d99e8cacfc589749
- PR #21 HEAD 0b5e97d399dfd0f7e7c787382baf28ef24e90e94
- Atlas実験対象 3e56d13d77048d056e79c6971e6e7d24ad92b4ff は報告値として引継ぎ。今回Atlas正本の当該commit内容の直接再検査は NOT_TESTED。
- WebKitソース基準点: r2215=db897909f7c31d9b38793374c66427b6a4cb3dd3 (2025-07-07)、r2227=486de399887bc8fa8a69e2f194ebc9476589a08a (2025-09-29)。Playwright各タグのUPSTREAM_CONFIG.shから直接確認。
- 上流PR #53102のマージは2025-10-29、従ってr2227の上流基準点より後。別途Playwright v1.57.0のbootstrap.diffにガードが存在することは確認できるが、配布ELFへの実適用とは別。

## C. Gemini報告の採用・訂正
採用: Bug #300402のpreviousNavigation側optional欠落、Bug #301593/#53102の新Navigation側currentEntry欠落、Playwright独自ガードの早期return、298765@mainのactivation/BFCache再編を区別すること。
訂正: 2026年の最新ソースを2025年r2215の証拠に転用しない。実際の基準点を固定して比較した。WebKit PR #52049は現時点でOPEN・未マージであり、確定修正として扱わない。上流#53102がr2227の非再現を引き起こしたとしない。Geminiが直接取得できなかった根拠は今回の直接照合と区別する。

## D. ソース比較
詳細は [SOURCE-DIFF.md](SOURCE-DIFF.md)。r2215は前windowの参照を主にsubframeで処理し、通常の初期化ではBack/Forwardの複数履歴項目を収集する。r2227基準点ではpreviousWindowの処理対象が変わり、通常経路では単一entryをappendしてindexを0相当に設定する。updateForActivation→setActivationは単なる名称変更でなく、298765@mainでBFCache復元とイベントタイミングの変更を伴う。両版のelse分岐に、履歴項目探索後の検査不足と解釈できる経路がある。

## E. バイナリとの対応
詳細は [BINARY-ASSESSMENT.md](BINARY-ASSESSMENT.md)。#20の実WebProcessスタック、#21のVMAとassertion位置の対応は従来証拠として強い。FDEが関数範囲に相当する可能性と、特定のWebKit関数名が確定することは別。別Build IDの上流スタックは関数帰属の代用にならない。

## F. 履歴索引欠落事例
詳細は [PATCH-CASE-MATRIX.md](PATCH-CASE-MATRIX.md)。Bug #300402は previousNavigation->m_currentEntryIndex がnullopt、Bug #301593は現在の m_currentEntryIndex がnulloptの想定。Atlasのassertion型が unsigned long である事実は両候補と整合し、識別根拠にはならない。

## G. 個別判定
詳細は [FINDINGS.md](FINDINGS.md)。各項目を独立に判定し、根本原因と回避後の非再現を混同しない。

## H. 証拠保全
[PRIMARY-EVIDENCE-LEDGER.md](PRIMARY-EVIDENCE-LEDGER.md)に公開ソースのURL・固定版・取得区分、既存Actions原票のIDとSHA-256を記録。今回、取得したのは公開ソースのテキスト・既存GitHub記録・Actions artifactメタデータであり、既存ZIPの実バイト再取得・独立ハッシュ照合は **NOT_TESTED**。新規の研究文書はGitの固定treeとblob SHAを残す。中央保全規約 v0.2.0に基づき、既存原票は既存保全記録の区分を継承し、新規調査台帳・根拠はLevel 2相当の保存対象として扱う（正式保存先への別途実物保存を行ったとは主張しない）。削除・移動・上書きは別承認、既存証拠保持1年。

## I. 追加実機検証
**必要性: YES、ただし即時実施: NO（NOT_TESTED）**。現在の証拠だけではcurrent/previousのどちらがnulloptか、同じ操作順のNavigation API可視状態、r2227のフォールバック挙動を区別できない。旧Atlas代表1条件に限定した設計は [LIMITED-EXPERIMENT-PLAN.md](LIMITED-EXPERIMENT-PLAN.md)。所有者の別途承認なしに実行しない。

## J. UNKNOWN / BLOCKED
元GDB ELFと後取得ELFのバイト一致、内部関数帰属、空のindexの主語、indexが失われた初発時点、r2227配布実体のパッチ採用、#53102の因果効果、Playwright独自パッチの因果効果はUNKNOWN。同Build ID一致DWARFの調達と再帰属はBLOCKED。別Build IDのスタック流用は禁止。

## K. 推奨する次工程
1. 別担当が今回の公開ソース・差分・区分判定を独立再取得してレビュー。
2. 既存original ZIPの保全状況と必要なLevel 2の保存先からの再読戻しを別工程で確認。
3. 実機で残す論点が独立レビューでも未解決なら、代表1条件の限定実験について所有者が別途開始可否を判断。
4. 実配布r2227のパッチ実装帰属は正規ビルド記録が得られない限りBLOCKEDのまま収束させる。

## L. GitHub記録と権限
この文書群は本PRの成果であり、Issue #18へPR URL・固定HEAD・未解決項目を追記予定。CIと投稿後のreadbackはPR作成後に別途確認する。Draft維持、マージ・本番・Atlas・診断器・HOLD変更なし。独立レビュー依頼は [INDEPENDENT-REVIEW.md](INDEPENDENT-REVIEW.md)。
