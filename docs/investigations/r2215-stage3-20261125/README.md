# WebKit r2215 第3段階：ソース差分・制御フロー対応技術報告

- 調査・取得日時: 2026/11/25 6:48:38 JST
- 親課題: https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/18
- 既存PR: #19, #20, #21（作業開始時いずれも OPEN / Draft、指定HEAD一致）
- 実装元main: a9d077312571b5c11aea86a07492541a831d10de（tree 83cdfa005f4f562e39751fb19b41932201cb81b2）
- 現行判定（2026-11-26 JST）: **総合PARTIAL / 文書限定受入PASS / PR #22マージ済み / 根本原因・r2227非再現の因果帰属UNKNOWN / 新規実機検証NOT_TESTED**。[独立再審査](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6061365008)・[マージ記録](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/18#issuecomment-7191771478)。
- [PR #22](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22) の審査対象HEADでの旧判定（独立再審査前）: **総合PARTIAL / 文書限定受入HOLD / Draft維持・マージNO**。
- 本報告は既存の調査を修正せずに追補するもの。2026-11-26追補: [独立レビュー](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6060401704) のP2/P3全5件に対応。旧版はGit履歴に保持。Actions原票の独立再取得はレビュー担当が実施し、今回は保存先からの再取得照合を実施した。

## A. 結論
Playwright 1.56.1ドライバー固定の既存14条件では、WebKit r2215が4 PASS/3 TIMEOUT、r2227が7 PASS。r2215のTIMEOUTにC++ optional assertionが同時記録され、別途PR #20が実WPEWebProcessのSIGABRTを直接取得した。これらはWebKitビルド差の影響を強く支持する。ただしPlaywrightのTIMEOUTをCRASHへ書き換えてはならず、r2227での非再現がどのパッチに起因するかは不明である。

既存PR #21のGDB-PC/ELF整合は明確だが、同Build IDのDWARFなしにWebKit内部関数を厳密帰属できない。追加readelfのFDE範囲は報告値の算術検査のみ実施。FDE生出力と当該出力のELF識別情報は未取得。実行時ELFと後取得ELFの同一性はUNKNOWN。r2215上流のpreviousWindow履歴引継ぎ分岐はサブフレーム限定。Atlas操作対象は主フレームだが異常発生フレームは未特定で、当該分岐への到達と実配布物の分岐条件はUNKNOWN。

## B. 版と適用範囲
- PR #19 HEAD 86c6dad45f4635ab5618f7bd64f6c00e1888601f
- PR #20 HEAD 4ba2b94321d3c0b809448e87d99e8cacfc589749
- PR #21 HEAD 0b5e97d399dfd0f7e7c787382baf28ef24e90e94
- Atlas実験対象 3e56d13d77048d056e79c6971e6e7d24ad92b4ff は報告値として引継ぎ。今回Atlas正本の当該commit内容の直接再検査は NOT_TESTED。
- WebKitソース基準点: r2215=db897909f7c31d9b38793374c66427b6a4cb3dd3 (2025-07-07)、r2227=486de399887bc8fa8a69e2f194ebc9476589a08a (2025-09-29)。Playwright各タグのUPSTREAM_CONFIG.shから直接確認。
- 上流PR #53102のマージは2025-10-29、従ってr2227の上流基準点より後。別途Playwright v1.57.0のbootstrap.diffにガードが存在することは確認できるが、配布ELFへの実適用とは別。

## C. Gemini報告の採用・訂正
採用: Bug #300402のpreviousNavigation側optional欠落、Bug #301593の現在索引欠落によるnull pointer参照という開発者仮説、Playwright独自ガードの早期return、298765@mainのactivation/BFCache再編を区別すること。
訂正: 2026年の最新ソースを2025年r2215の証拠に転用しない。実際の基準点を固定して比較した。WebKit PR #52049は現時点でOPEN・未マージであり、確定修正として扱わない。上流#53102がr2227の非再現を引き起こしたとしない。Geminiが直接取得できなかった根拠は今回の直接照合と区別する。

## D. ソース比較
詳細は [SOURCE-DIFF.md](SOURCE-DIFF.md)。r2215は前windowの履歴引継ぎをsubframeに限定し、通常の初期化ではBack/Forwardの複数履歴項目を収集する。r2227基準点ではpreviousWindowの処理対象が変わり、通常経路ではcurrentItemを末尾にappendしてindexをm_entries.size() - 1に設定する（既存entriesが残る経路では0とは限らない）。updateForActivation→setActivationは単なる名称変更でなく、298765@mainでBFCache復元とイベントタイミングの変更を伴う。両版のelse分岐に、履歴項目探索後の検査不足と解釈できる経路がある。

## E. バイナリとの対応
詳細は [BINARY-ASSESSMENT.md](BINARY-ASSESSMENT.md)。#20の実WebProcessスタック、#21のVMAとassertion位置の対応は従来証拠として強い。FDEが関数範囲に相当する可能性と、特定のWebKit関数名が確定することは別。別Build IDの上流スタックは関数帰属の代用にならない。

## F. 履歴索引欠落事例
詳細は [PATCH-CASE-MATRIX.md](PATCH-CASE-MATRIX.md)。Bug #300402は previousNavigation->m_currentEntryIndex がnullopt、Bug #301593は現在の m_currentEntryIndex がnulloptの想定。#301593の開発者仮説はcurrentEntry()が返すnullptrの参照による停止でありHYPOTHESIS。両固定版のcurrentEntry()は索引の有無を検査する。Atlasの空optional<unsigned long>へのアクセスによるアサーションとは直接停止機構を区別する。Atlasの関数・索引・初発原因はUNKNOWN。#53102の公開差分とBugのFIXED状態はCONFIRMED。

## G. 個別判定
詳細は [FINDINGS.md](FINDINGS.md)。各項目を独立に判定し、根本原因と回避後の非再現を混同しない。

## H. 証拠保全
[PRIMARY-EVIDENCE-LEDGER.md](PRIMARY-EVIDENCE-LEDGER.md)に公開ソースのURL・固定版・取得区分、既存Actions原票のIDとSHA-256を記録。初回調査ではメタデータのみ取得。2026-11-26独立レビューでActions原ZIP3件のサイズ・SHA-256・CRC一致を確認。今回、本人限定Driveに既存保存されたE19/E20を再取得し一致、E21を新規保存し同じ保存先から再取得して一致。その後の[独立再審査](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6061365008)では、別担当が本人限定DriveからE19/E20/E21の3件を再取得し、サイズ・SHA-256一致と全25収録ファイルのCRC正常を確認した。Libraryの生バイト取得はBLOCKED。新規の研究文書はGitの固定treeとblob SHAを残す。中央保全規約 v0.2.0に基づき、既存原票は既存保全記録の区分を継承し、新規調査台帳・根拠はLevel 2相当の保存対象として扱う（正式保存先への別途実物保存を行ったとは主張しない）。削除・移動・上書きは別承認、既存証拠保持1年。

## I. 追加実機検証
**文書受入の追加実機検証は不要。研究上の追加観測は条件付き候補、開始NO（NOT_TESTED）**。公開APIの可視状態と停止時系列に研究価値がある場合に限り再判断する。内部索引・関数・パッチの因果帰属は実機計画だけでは確定できない。旧Atlas代表1条件に限定した設計は [LIMITED-EXPERIMENT-PLAN.md](LIMITED-EXPERIMENT-PLAN.md)。所有者の別途承認なしに実行しない。

## J. UNKNOWN / BLOCKED
元GDB ELFと後取得ELFのバイト一致、内部関数帰属、空のindexの主語、indexが失われた初発時点、r2227配布実体のパッチ採用、#53102の因果効果、Playwright独自パッチの因果効果はUNKNOWN。同Build ID一致DWARFの調達と再帰属はBLOCKED。別Build IDのスタック流用は禁止。

## K. 次工程
[独立再審査](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6061365008)で前回の5件はCLOSEDとなり、E21を含む3件の保全照合はPASSとなった。非阻害のP3-04は [SOURCE-DIFF.md](SOURCE-DIFF.md) の制御フロー2を補訂した。新規実機の要否はセクションIの条件で判断する。Issue #18は継続。

### 審査前の計画（履歴）
1. 別担当が修正後の固定HEADについてP2/P3全5件を独立再審査。
2. E21の保存先からの独立再取得・中央規約の保全条件を確認。
3. 文書限定受入を再判定し、追加実機検証は公開API状態・時系列の研究価値がある場合だけ別承認で判断。
4. 実配布r2227のパッチ実装帰属は正規ビルド記録が得られない限りBLOCKEDのまま収束させる。

## L. GitHub記録と権限
[PR #22](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22) の文書限定受入とマージは [Issue #18の追補](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/issues/18#issuecomment-7191771478) に記録済み。審査済みHEADの正式CIは未実施。提出当時の独立レビュー依頼は [INDEPENDENT-REVIEW.md](INDEPENDENT-REVIEW.md) に保持する。
