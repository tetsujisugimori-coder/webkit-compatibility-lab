# Historical Source Atlas WebKit baseline

## 確認方法と版

Stage 0ではGitHub APIのrepository、main commit、open PR、recursive tree、Actions、固定HEADのworkflow・計画文書、PRの版別履歴を読み取り確認した。今回ブラウザ再実行・原ZIP取得・独立バイト監査は行っていない。以下の再現・保全成功は既存一次報告の確認であり、Stage 0自身の再現／再監査ではない。

- Repository: [historical-source-atlas](https://github.com/tetsujisugimori-coder/historical-source-atlas)、Public。
- main HEAD `3e56d13d77048d056e79c6971e6e7d24ad92b4ff` / tree `bf87c376f7cf86e45cf309feebe1eb15e5684b0f`。
- [Issue #34](https://github.com/tetsujisugimori-coder/historical-source-atlas/issues/34)、[Draft PR #35](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35)、branch `data/eikyouki-batch13`。
- PR HEAD `97ce39e8cb9ea38967354aea11cac2282097d7cf` / tree `b7370577c706aa70f9eebd80e96ef8ee4f73d93e`。treeはGit tree APIで確認。
- 関連Draft PR #36は文書成立性審査。HEAD `b2adb697efc2ea25c9430533c3f02383bece080a` / tree `ae77dcfeeddc80d2e7bf6149a32063e372392f0c`（treeはPR本文の記録確認）。旧実験結果を文書版へ転用しない。

## 失敗署名と比較

OBSERVED／REPRODUCED（既存原票の報告）：Linux WebKitのEK-0120-C05節reloadでnative assertion `optional:479 / _M_get<unsigned long> / Assertion 'this->_M_is_engaged()' failed.`。初期診断はWebKit9context全てassertion、8 page-crash／1 timeout。Chromium対照は完走。page-crashイベントなしを正常扱いしない。

長い前置操作・PNG採取なしでも再現。renderer native stack／終了signal・具体的呼出元は未取得。launcher cleanup exitCode=0はrenderer正常の証拠ではない。MESA/ZINK警告、Linux/Windows差、native assertionから原因を断定しない。

|固定診断|変更した一因子|結果と結論の上限|
|---|---|---|
|v3|131記事→3記事|両方WebKit各3回同署名。Chromium2対照非再現。縮小して再現保持|
|v4|3記事からstyle要素だけ除去|WebKit A/B各3/3同署名、Chromium各1非再現。style要素はこの経路の必要条件ではない|
|v5|v4 Bから指定focus呼出し34 bytesのみ除去|同じ8枠で同様の結果。focus一般の無関係／根因確定ではない|
|v6|保存済v5 Bから指定scrollIntoView式57 bytesのみ除去|同じ8枠で同様の結果。他のscrollIntoViewは保持。scroll一般の除外ではない|

出典：[v4結果](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#issuecomment-6876274246)、[v5結果](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#issuecomment-6877092929)、[v6結果](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#issuecomment-6885351512)、[v6独立レビュー](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#pullrequestreview-5907550024)。

## 環境・版別CI

[固定v6計画](https://github.com/tetsujisugimori-coder/historical-source-atlas/blob/97ce39e8cb9ea38967354aea11cac2282097d7cf/diagnostics/webkit-isolation/PLAN-v6.md)：実験HEAD `187810113b4e02de5cd465fb53f6f43cc3d04576`、tree `72ea76f78359172fbb9eead1b4b6cfba51495b88`。Playwright1.56.1、Ubuntu24.04、375×1000、normal motion、API/navigation30秒、worker150秒。WebKit固定4実行物hash/build ID、各slot新worker/browser/context、再試行0。4hash一致は環境全体同一性の証明ではない。実OS image patch／全browser build実物は今回NOT_VERIFIED。

[現行正式workflow](https://github.com/tetsujisugimori-coder/historical-source-atlas/blob/97ce39e8cb9ea38967354aea11cac2282097d7cf/.github/workflows/acceptance.yml)：Ubuntu24.04、Python3.12、Node24、Playwright1.56.1、push/pull_request/workflow_dispatch。診断jobはPR限定、正式jobとは別runner／依存ゲートなし。

- 最新PR35 HEAD `97ce39e8…`はStage A native runner堅牢化の合成検証版。同一7入力前後、追加30検査と独立再走を報告。
- 最新HEADのActions runはAPIで0件確認。CI PASSではない。実GDB／browser／signal0。[Stage A最終報告](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#issuecomment-6893997222)。
- 直前native診断HEAD `c54a6c24d81cbd09345e15f82dbbeb39307fe621` / tree `ba5ad55df3447cd9f3fa4e78a11d1f87094b642d`：GDB15.1 sibling attachが `ptrace: Operation not permitted.` で停止。native4slot NOT_RUN。workflow成功は証拠保存成功でありnative診断PASSではない。
- 同版正式PR/push各Chromium8 PASS／WebKit8 FAIL。これは最新97ce版CI結果ではない。[native最終結果](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#issuecomment-6886920261)。

## 証拠・独立性

v4〜v6およびc54 nativeの原ZIPは保存後の独立全byte／SHA／CRC／manifest照合を報告。今回実物再取得は未実施。正式ZIPでsource実物がない場合、同HEAD Git由来の後作成補足を当時runtime採取と区別する。最新Stage Aの恒久保全BLOCKED。古い保全成功で上書きしない。[native原証拠レビュー](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/35#pullrequestreview-5908284731)。私有保存先や原ZIPはStage 0へ転載しない。

関連PR36のB-Qは因果的な実使用証明の設計審査にとどまる。backend実装NOT_READY、実測NO、native BLOCKED。WebKitの新再現結果ではない。[PR36最新独立審査](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/36#pullrequestreview-5927296392)。

## 次工程と受入境界

既存診断入力／実行物／環境台帳を維持し、認可環境でnative stack取得が可能かを別審査する。権限変更や新実験は本Stage 0対象外。根本原因UNKNOWN、製品受入FAIL、総合PARTIAL、Draft／マージNOを維持した過去の判定と、WebKitを全作品共通必須ゲートから外す暫定運用方針を分離する。通常受入を自動承認しない。実機Safariの成功へ昇格させない。山中城のHTTP本文観測問題との共通原因は未証明。

## AGENTS・容量方針の確認範囲

[対象HEADのAGENTS.md](https://github.com/tetsujisugimori-coder/historical-source-atlas/blob/97ce39e8cb9ea38967354aea11cac2282097d7cf/AGENTS.md)全文を読み取った。記事ID・出典保全、史料記述と史実認定の分離、専用branch／Draft PR／独立レビューの方針を確認。AGENTS自体に詳細な容量節はない。今回全文確認したPLAN-v6には最低2GiB・1024 inode、専用Temp、書込検査、3GiB予約、測定不能時停止、既存証拠削除禁止が記載されるが、これはv6固有の事前計画であり全工程へ一律転用しない。Stage 0は文書／APIメタデータのみで、大容量ZIP・HAR・trace再取得はしない。


## Stage 1 current supplement (2026-11-17)

Latest PR metadata and public final reports were reread for the [evidence ledger](../investigations/stage1-evidence-ledger.md). It distinguishes directly read source/metadata from cited observations and unacquired originals. Earlier results above remain attached to their historical versions. [Next comparison gates](../investigations/stage1-comparison-gates.md) do not change this project’s FAIL/UNKNOWN/HOLD or authorize execution.
