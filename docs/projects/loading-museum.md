# Loading-museum: Stage 0 baseline

調査日: 2026-11-16 UTC。公開GitHubのrepo、branch、PR、commit/tree、Actions run、コメント、固定版workflowを読み取り確認した。変更・投稿・ブラウザ実行・試験・原ZIP再取得は行っていない。以下のREPRODUCEDは既存正式試験の報告であり、Stage 0の再実行ではない。証拠保全は公開された独立照合報告の確認に限定する。

## 版と現在状態: OBSERVED

公開repoの正式表記は [Loading-museum](https://github.com/tetsujisugimori-coder/Loading-museum)。関連Issue #87、[PR #88](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88) はopen、Draft、未マージ。

|対象|HEAD|tree|
|---|---|---|
|main|`416a04aad057eeee41157b86383ccdf22ec91d0f`|`5389f76dfd3901affa4f40b2e5a126511ab4c67e`|
|PR #88 remote|`2d19a0f0db11b65db4eee56421c0d357558e70af`|`47edfb244c9adbdcec2a823e04ef0619cca17f2c`|
|従来実験基準|`5de4b08a2dc881ad2afcbe805b0776cb944ff882`|`89a84488c489161f167e06df34fbc25cca0a4c6e`|

公開コメントの最新取得範囲はv3設計保全追補まで。未提出成果をremote実装として扱わない。

## WebKit問題とChromium比較

remote HEADのActions APIを再取得し、21 run（PR20＋push1）、18 success／3 failure、全attempt1を確認した。件数は同条件の独立試験数ではない。

[正式結果・監査報告](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6897074919) による既存観測:

|経路|run|結果|
|---|---|---|
|API isolation|43727018277|Chromium48 PASS。WebKit64 PASS／4 FAIL／4 NOT_TESTED。Swipe3失敗、Status S1-4失敗。|
|WAAPI Stage2A|43727018358|Chromium5 suite成功。WebKit observation失敗、他4 suite成功。375px Menu途中pause条件が終端到達で不成立。|
|Boundary|43727018298|C-WebKit Swipe一次PASS。Statusはsuccess-prefixでLoading≠Success、目的一次NOT_TESTED／INCOMPLETE。|

API auditの技術整合性PASSと68/72完了による非ゼロ終了を区別する。WAAPIの331msはclick直前からready後continuationまでで、Promise pending単体時間ではない。

旧版ではStatus MorphのLoading≠Errorが観測された。後続版のLoading≠Successや別runへ混ぜない。[旧観測・監査](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6895656541)。後続状態のPASSは不変一次FAILを上書きしない。

## 環境と実行経路: OBSERVED／NOT_VERIFIED

- [API workflow](https://github.com/tetsujisugimori-coder/Loading-museum/blob/2d19a0f0db11b65db4eee56421c0d357558e70af/.github/workflows/phase7d-causal.yml): Ubuntu24.04、Node22、Node Playwright1.56.1、Chromium/WebKit、PR→main起動、timeout30分、artifact保持30日。
- [WAAPI workflow](https://github.com/tetsujisugimori-coder/Loading-museum/blob/2d19a0f0db11b65db4eee56421c0d357558e70af/.github/workflows/verify-stage2a.yml): Ubuntu24.04、Node22、Python3.12、Python Playwright1.56.0、幅375/390/765、PR→main起動、timeout20分。
- 両経路を同じdriver版として扱わない。workflowの指定版と当時の実行binary hashは別証拠である。
- 今回、全原票からbrowser/OS実体hash、viewport、motion、cache条件を独立再抽出していない。環境の全面固定はNOT_VERIFIED。

## 証拠と独立レビュー

当該HEADの失敗根拠原ZIP5本（API2、WAAPI2、Boundary1）は、公開報告上、本人限定保存後に別担当が全byte、公式size/digest、CRCを照合済み。Boundaryはsource本文/Git blob、出力集合、nested traceも照合。WAAPIにはmanifest/source本文未収録の限界がある。成功run全artifactの全面監査ではない。

代表公開metadata: Boundary artifact `14167680043`、121,188,744 bytes、SHA-256 `0c85fefe92b127c3a09cfb6baca1b779e65b2f70f07385426d72b3fc26c129c7`。Stage 0で原物再取得はNOT_TESTED。

[v3設計](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6899970542) は独立文書レビュー6指摘修正後の文書限定PASS。合成/実ブラウザPASSではない。[補足保存後照合](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6899983261)も原CI証拠とは別記録。

## UNKNOWN・次工程

根本原因、観測中立性、HTTP実行byte結合は未証明。遅延本文取得と同slot内本文不一致停止の両立は未成立。C有限因果実験、本番108は開始NOという公開記録を保持する。WebKit失敗を観測器だけの問題と確定しない。

次工程は一次時点と後続状態、APIとWAAPIの観測介入・driver版差、本文取得と停止policyを分けた独立審査。新実験は別承認。Stage 0のWebKit非必須運用方針は過去の技術FAIL、UNKNOWN、個別製品受入を変更しない。

## 作業規則の確認範囲

固定remote HEADの再帰Git tree（truncated=false）でAGENTS.md、およびcapacity/storage-policy/容量を名前に含む文書は見つからなかった。容量規則が存在しないとの断定ではなく、命名検索での未発見である。大容量原物の取得・展開・削除は行っていない。


## Stage 1 current supplement (2026-11-17)

Latest PR metadata and public final reports were reread for the [evidence ledger](../investigations/stage1-evidence-ledger.md). It distinguishes directly read source/metadata from cited observations and unacquired originals. Earlier results above remain attached to their historical versions. [Next comparison gates](../investigations/stage1-comparison-gates.md) do not change this project’s FAIL/UNKNOWN/HOLD or authorize execution.
