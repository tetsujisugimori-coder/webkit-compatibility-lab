# Intelligence UI Museum: Stage 0 baseline

調査日: 2026-11-16 UTC。公開GitHub metadata、PR、コメント、固定版workflowを読み取り確認した。変更・投稿・ブラウザ・試験実行・原ZIP再取得は行っていない。REPRODUCEDは既存正式試験の報告を意味し、今回の再実行ではない。証拠保全は公開独立照合報告の確認に限定する。

## 現在版と輪郭問題版: OBSERVED

公開repo: [intelligence-ui-museum](https://github.com/tetsujisugimori-coder/intelligence-ui-museum)。

|対象|HEAD|tree|
|---|---|---|
|main|`f065515b3f52ade79a7e057abb86f385dfcce5e9`|`478e0ec826f39793682c445a852aa9e965cebc37`|
|PR #65 wave9|`518c263273f20dbc4afed8f5bd4fbabf581568d4`|`478e0ec826f39793682c445a852aa9e965cebc37`|
|PR #46 Round14|`8a8146001b2ac22c09eb624831b4a53e8ca48639`|`d7d5fb4e1b50327752668993c5eeede7c79426f7`|

[PR #65](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/65) は2026-11-16T12:50:43Zにmerged、closed、Draft=false。旧報告のDraftを現在状態として扱わない。最終HEADの13 Actions runすべてsuccessを今回APIで確認した。

輪郭問題の[PR #46](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46) はopen、Draft、未マージ。Issue #45、親Issue #28、前段PR #43/#44。baseは `78e6e99fa46274cae9435dae4483c5266ad6b021`。wave9の成功は輪郭問題解消の証拠ではない。

## 既存再現記録と比較

[Round14報告](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46#issuecomment-6790030294)、[独立レビュー](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46#pullrequestreview-5855358257):

- 正式run42977125778、attempt1、push。同HEAD PR run42977649283は別runで分母に合算しない。
- Windows/Linux × Chromium/WebKitの4環境。各pilot8＋formal72、全pilot32＋formal288。条件ごと3反復、fresh context/page、順序ローテーション。
- WebKitは各OSでA24/24輪郭表示、B/D各0/24表示。Chromiumは各OSのA/B/D各24/24表示。
- WebKit B/Dではfocus自体がtriggerへ戻る一方、最終`:focus-visible=false`、`::after outline=none 0px`。A/Chromiumはtrue／2px。
- 追加APIなし、traceOFF、probeOFFでも既存再現した。「追加計測が必要条件」は指定条件内で支持されないが、観測中立性全般の証明ではない。
- ON条件のsource-mapped focus caller36/36は `apps/v10/src/select-focus-return.ts:40:15`。probeOFF/native原因の証明ではない。実依存はRadix Popoverであり、Selectと取り違えない。
- 時間予算が対応した比較は74/144、残70は同条件といえない。因果確定UNKNOWN。

## 環境とCI

既存報告上: WebKit26.0、Chromium141、Playwright1.56.1、SDK0.2.2、375×1000、light、root文字100%、DPR1、normal motion。

[固定workflow](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/blob/8a8146001b2ac22c09eb624831b4a53e8ca48639/.github/workflows/select-round14.yml) でWindows2025／Ubuntu24.04 × WebKit／Chromium、Node22、timeout75分、専用branch push・限定paths PR・workflow_dispatch、raw保存前privacy/contract gate、独立archive-readback job、保持90日を確認した。実行はしていない。指定環境と当時の実binary hashは別で、今回後者を再抽出していない。

診断CI成功は症状消失ではない。6workflow25checks成功という既存報告とWebKit輪郭欠落の再現は両立する。

## 原証拠保全

[保存後独立照合報告](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46#issuecomment-6824192926):

- 正式run原ZIP12本／48,165,800 bytes。別PowerShellプロセスで再取得後12/12公式size/SHA一致、全ZIP CRC、nested40 ZIP CRC。
- raw4本各424member、8manifest、1688member hash一致。
- status4本には内包HEAD/manifestがない。API run metadata＋artifact名による対応であり、内包HEAD検証とは異なる。
- GitHub artifact期限は報告上2027-02-09T07:06:52Z。保存先保持期限は本人管理、再起動後永続性等NOT_TESTED。
- Stage 0では原ZIPを再取得せず、報告読取り確認に限定する。

代表公開metadata: Linux WebKit artifact `13836212545`、SHA-256 `e7673b11ce9de9c56979f851dcb56d24e7588f0f6c06d1f1c1c14dc0ba953828`。

## UNKNOWN・次工程

根本原因、native focus-visible決定機序、70比較の時間非同等性は未解消。実機Safari、VoiceOver、物理keyboard/touch、他viewport、Reduced Motion等は今回NOT_TESTED。Stage3 HOLD／v10製品受入NOをwave9マージ成功で引き上げない。

次工程は時間同等性を満たす対照設計と、focus復帰・focus-visible状態・描画輪郭の独立観測。原因修正前に同一条件の対照と反証条件を事前登録する。Loading-museumとの共通原因はUNKNOWN。

## 作業規則の確認範囲

最新mainの[AGENTS.md](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/blob/f065515b3f52ade79a7e057abb86f385dfcce5e9/AGENTS.md)を全文読取。歴史証拠の保護、Stage 3 HOLD、製品/runner/証拠/環境障害の区別、独立レビューの分離、秘密情報非公開などを確認した。再帰Git tree（truncated=false）のcapacity/storage-policy/容量の命名検索で専用容量方針は見つからなかった。全文横断の不存在証明ではない。大容量原物の取得・展開・削除は行っていない。


## Stage 1 current supplement (2026-11-17)

Latest PR metadata and public final reports were reread for the [evidence ledger](../investigations/stage1-evidence-ledger.md). It distinguishes directly read source/metadata from cited observations and unacquired originals. Earlier results above remain attached to their historical versions. [Next comparison gates](../investigations/stage1-comparison-gates.md) do not change this project’s FAIL/UNKNOWN/HOLD or authorize execution.
