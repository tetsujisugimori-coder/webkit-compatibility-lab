# 第3段階・独立技術レビュー依頼書

作成日: 2026/11/25 6:48:38 JST。Issue #18、新規Draft PRに対する独立レビュアー向け。修正担当とは別のセッション/担当でGitHub正本を再取得すること。

## 2026-11-26 再審査依頼
[初回独立レビュー](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6060401704) のP2-01/P2-02/P3-01/P3-02/P3-03の対応を最新HEADで検査し、各CLOSED/OPENを判定すること。文書受入には実機検証不要。E21の本人限定Drive保存先から別担当で再取得しサイズ・SHA-256・CRCを照合する。非公開識別子を公開GitHubに出さない。

## レビュー対象
- 本PR固定HEADとtree、変更ファイル全件。main及び既存PR #19〜#21のHEAD不変を照合する。
- S01〜S15の固定URLとコミット、PlaywrightのUPSTREAM_CONFIG、r2215/r2227 Navigation.cpp、v1.57.0 bootstrap.diff、#52049/#53102、8bb5a0aを独立確認する。
- 開発者コメントにおける previousNavigation index / 現在の index を区別し、上流フォールバックとPlaywright早期returnを誤って同一視していないか審査。
- FDE/PC算術、二種類のoptional型、旧GDB ELFと後日ELFのbyte非同一証明の未達、同一Build ID未取得を確認。別Build IDの公開スタックから関数名を断定していないかをチェック。
- 既存14条件TIMEOUTとSIGABRT、正式CIのjob successとブラウザ判定を区別しているか確認。
- Level 2保全状況、Actions独立再取得とDrive保存先再取得の区別、E21の独立再取得PENDINGを誤認させないか審査。
- 代表1条件の限定実験が未承認・NOT_TESTEDであることを確認。

## 求める独立報告
(1) 固定HEAD/tree、(2) 出典の直接取得状況、(3) 技術的事実・仮説・UNKNOWNの区分、(4) P1/P2/P3指摘と証拠、(5) 文書・証拠台帳限定の受入可否、(6) マージ推奨YES/NO、(7) 保存先・再取得照合の未完点。PRへCOMMENTとして投稿し読戻す。原資料と本報告の差異は履歴を消さず追補する。

## 禁止事項
無断マージ、Draft解除、main直書き、force push、既存原票変更、新規実機実行、PR #19〜#21の変更、Atlasコード更新、旧HOLD/FAIL変更、同一原因の断定。
