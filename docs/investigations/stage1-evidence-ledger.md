# Stage 1 証拠対応台帳

観測日時: 2026-11-17 09:59 UTC（18:59 JST）。作成主体は八兵衛のStage 1担当。対象lab開始HEAD `e64230839a882bd570b8aa6f3562b5c16a6d0d6f` / tree `be60b60233d69b70684f8dab7d3be8a055317511`、base `c84ac9e5077ef5e56f6242876c4a1dfd0a1c4858`。既存19 Markdownの完全treeを取得しAGENTS.md・workflow・実行コードなし。既存証拠規約に従い文書だけを追加・追補する。新しい隔離原稿に取得したため他担当の作業treeを変更していない。

## 確認方法と射程

D = 今回直接GETしたmetadataまたは固定source。R = 今回読んだ公開報告の引用で、原票そのものの再検証ではない。U = 原票・情報未取得。以下のブラウザ観測値はすべてRで、今回REPRODUCEDとしない。原ZIP取得・画像目視・CRC再監査・ブラウザ試行は0。未記録のID/時刻を生成しない。job IDはActions jobs APIのD、各試験の意味はR。原票内のJSON pointerが不明ならUとする。

## 版台帳（D: PR metadata・Git commit APIのtree）

|作品/調査ID|source HEAD / tree|実行checkoutと範囲|
|---|---|---|
|山中城 Y-B6E-404|`7c4442e319e19950799d813524038b8474bc69a5` / `f84b54fc7d9776e070da5f283cb0858b2a78c1fb`|PR `257a64904dc6ec07a8e9ec0213999b991b5251cc` 同treeとのR。pushは提出HEAD。今回commit親関係・原票再照合U|
|Loading L-API/L-WAAPI/L-BOUNDARY|`2d19a0f0db11b65db4eee56421c0d357558e70af` / `47edfb244c9adbdcec2a823e04ef0619cca17f2c`|個々のcheckout U。実験基準5de4b08と文書提出版を混同しない|
|Intelligence I-R14|`8a8146001b2ac22c09eb624831b4a53e8ca48639` / `d7d5fb4e1b50327752668993c5eeede7c79426f7`|主pushは明示source checkoutとのR。通常PR仮merge c3d91d12は別物|
|Atlas A-BQ|`b2adb697efc2ea25c9430533c3f02383bece080a` / `ae77dcfeeddc80d2e7bf6149a32063e372392f0c`|文書審査版でbrowser実行checkout非該当。製品PR35の旧結果と分離|

4 PRは取得時open/Draft/未merge。現在表示と旧履歴は区別した。一時点の確認で継続監視ではない。

## 山中城: 404の4行

根拠: [B6e最終報告](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6933410626)、[後続レビュー](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#pullrequestreview-5935611972)。専用runのevent/attempt1/HEAD/終端failureとjob ID/結論はD。

|event / engine|run / job|条件・原票内参照|期待→実際（R）|
|---|---|---|---|
|push / Chromium|43979577143 / 133692259252|missing phase2、request-2/response-2（context接頭辞・JSON pointer U）|96bytes一致・期限内settled→0bytes、不一致、期限未完、jobFAIL|
|push / WebKit|43979577143 / 133692259396|同上、別contextを合一しない|同上、jobFAIL|
|PR / Chromium|43979583922 / 133692283804|同上|同上、jobFAIL|
|PR / WebKit|43979583922 / 133692283323|同上|同上、jobFAIL|

Rで得た四行共通順序を、別clockの絶対時刻に置換しない:

|順序/段階|相関・観測内容|Dによるsource対応 / 不足|
|---|---|---|
|HTTP応答|phase2の404、server96bytes|wire/native時刻U|
|body開始→終了|同response body=CAPTURED、0bytes|observer `body-start`→`response.body()`→`body-succeeded`をD|
|保存callback|preservation-succeeded|`await consume(body,record)`の終了。内容一致ではないことをD|
|finished待機|completion=PENDING、capture-await-completion、settled=false|completionはbodyと並行開始、finallyのawaitをD。表の行順はfinished開始がbody後という意味ではない|
|期限|DIAGNOSTIC_DEADLINE、初発保持|期限・snapshot実物U、Rを転記|
|context.close開始|同じ未完状態|正確な各ms・context接頭辞U|
|finished失敗→settled|response-finish-failed→capture-settled|sourceはawait completion解除後settled。Rの順序と整合するが実行分岐の再証明でない|
|close終了|close後drain SETTLED|終了前の診断成功へ昇格しない|

直接読んだ[observer source](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/blob/7c4442e319e19950799d813524038b8474bc69a5/scripts/stage3b6-response-observer.mjs)のGit blobは`eeb44563eb34e0390c4aa013ba9805c21fb2a3fc`。`performance.now()`とwall-clockを別記録、IDはobserver-local、native IDではない。`finally`がcompletionを待つためbody終了だけではcapture完了しない（D）。runtime内の未通知理由はUNKNOWN。

環境: 正式CIの実OS/browser binary hash・viewport/motion・各context作成条件は本台帳ではU。cache通常有効/routed対照区別はR。製品: Chromium通常8PASS/WebKit通常8FAIL、両engine競合64/注入3PASS（R）。観測器:限定PASS、記録完全性PARTIAL。fixture:404診断FAIL。環境:局所起動2BLOCKED、残6NOT_TESTED。19run17成功2失敗は専用4job成功を意味しない。

B6d監査aa3688f3の38原ZIP・4/48画像の根拠をB6eへ流用しない。B6e38ZIP/各335source/独立保全PASSはR、他34全意味監査NOT_TESTED・rootmanifestなし28網羅性UNKNOWN維持。B6fは最新レビューの提案として確認、公開提出HEADで開始済みは確認できず担当UNKNOWN。受領すべきものはruntime source hash、requestfinished/requestfailedの記録有無、response IDとの対応、未記録欄。重複実験0、未修正P2局所runner再利用NO。

## Loading: 操作と欠測の対応

根拠: [正式最終報告](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6897074919)。各runはPR/attempt1・終端failure（run APIをD）。

|ID / run / WebKit job(D)|症状・問い|slot / prefix / 一次固定 / 後続 / cleanup / 終了（R/U）|
|---|---|---|
|L-API 43727018277 /132851059374|Status Morph, Swipe:一次の状態と後続状態が違うか|Status S1-4、Swipe3失敗（R）。完全slotID・prefix・primaryFrozen時刻・後続・cleanup U。64P/4F/4NT、68/72complete、非ゼロ終了（R）。Loading≠Errorの旧観測は別版|
|L-WAAPI 43727018358 /132851059611|Menu375:途中pauseは実際に中間か|375 Menu、ready/settled snapshot/seekの順序詳細U。途中pause終端到達で不成立。他5endpoint成立。331msはclick前→ready後continuation、Promise待機単体ではない。cleanup詳細U、observation exit1（R）|
|L-BOUNDARY 43727018298 /132851059542|Status success-prefixと目的観測を分ける|C-WebKit、Swipe一次PASS/COMPLETE。Status prefix Loading≠Success→目的一次NOT_TESTED/INCOMPLETE。一次FAILと呼ばない。primaryFreeze/後続/cleanup詳細U、auditPARTIAL・非ゼロ（R）|

Chromium jobs132851059093(API),132851059402(WAAPI)はsuccess(D)、API48PASS/WAAPI5suite exit0はR。Boundary他5job成功はC-WebKitの代替でない。

環境指定（Stage0文書を参照、今回workflow再監査でない）: API Ubuntu24.04/Node22/Node Playwright1.56.1、WAAPI Ubuntu24.04/Python3.12/Playwright1.56.0、幅375/390/765。実binary hash、motion、cache/routing、context create/closeの全条件U。異なるdriver・操作順を同一比較にしない。製品FAIL/未到達、観測器audit整合と完全性を分離、fixture/環境の寄与UNKNOWN。

必要原票: API二本のslot JSONとprimary固定/後続/cleanup記録、WAAPI WebKit artifact14166859123のobservation記録、Boundary C-WebKit artifact14167680043のattempt/Status slot。今回原物未取得なので原票対応完了ではない。具体JSON pointer・時刻を埋める最小読取りが次条件。新試行不要。

後続は[原commit復旧レビュー](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#pullrequestreview-5929090166)と[管理設定追補](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#pullrequestreview-5929249815)を今回読んだ(R)。未提出0c811a0cの復旧PASSとremote2d19a0f0を分離。required checks0・webhook登録なしは当該レビューの読取範囲で、GitHub Appsの処理排除ではない。全経路起動防止BLOCKED・正式提出NO-GO。遅延body/同slot停止不整合、提出安全、マージ審査の3ゲートを維持。管理画面を今回再操作したとはしない。

## Intelligence: 条件集合と環境

[最終報告](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46#issuecomment-6790030294) R、[固定plan.json](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/blob/8a8146001b2ac22c09eb624831b4a53e8ca48639/tests/select-round14/plan.json) D。plan Git blob `7c18f85c9b62dbcb11e9eba3eee2f6a4c8ca780d`。

主run42977125778、診断job Windows/WebKit130378685336、Linux/WebKit130378685604、Windows/Chromium130378685768、Linux/Chromium130378685811（D全success）。run APIでattempt1・push・対象HEAD・successをD。実checkoutの原票再照合U。各pilot8/formal72、pilot32とformal288分離。PR再実行42977649283は分母に加えない。

condition A/B/D、history A=[] B=[on] D=[on,off]。arm A0/W0/A1/A2/A3/A4、caller off/on。正式各condition×arm3反復、fresh context/page、反復昇順・偶数arm逆順・condition index回転（D）。原票具体例formal-D-caller-on-1はRで、他IDは推測生成しない。

|環境（R）|輪郭結果/時間対応（R）|残る対応不能|
|---|---|---|
|Linux Chromium|A/B/D各24/24あり、34/36時間対応|2/36|
|Windows Chromium|同上、1/36時間対応|35/36|
|Linux WebKit|A24/24あり、B/D各0/24、30/36時間対応|6/36|
|Windows WebKit|同上、9/36時間対応|27/36|

合計74/144対応・70/144非対応。原票再計算はU。OS Windows2025/Ubuntu24.04、WebKit26.0/Chromium141/Playwright1.56.1/SDK0.2.2はR。375×1000/light/DPR1/normal motionはplan D。cache/routingの実条件U。context closeはplan末尾D、実終了時刻U。focus復帰true、focus-visible/計算::after/画像輪郭は別結果（R）。共通観測無影響UNKNOWN。原ZIP4本の公開artifactIDは最終報告Fで追跡できるが今回取得0。

## Atlas: 具体候補と別工程の境界

[B-Q決定](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/36)はR。v4/v5/v6の限定除去は過去ブラウザ結果で、Q2の実証ではない。CSS/focus/scroll全般を排除しない。

別担当の一候補資料審査が進行中: LLVM DataFlowSanitizer20.1.8、commit `87f0227cb60147a26a1eeb4fb06e3b505e9c7261`。本担当も[公式仕様](https://github.com/llvm/llvm-project/blob/87f0227cb60147a26a1eeb4fb06e3b505e9c7261/clang/docs/DataFlowSanitizer.rst)を直接取得(D)。仕様は汎用dataflow frameworkであり、全コードinstrumentation又はABI list指定が必要、独力で特定バグを検出する完成oracleではない。別工程の候補審査は未提出で、公開根拠・提出版は未確認。その担当報告を本台帳の独立性や確定結論へ合算しない。

A新FD由来X、Bその正当copy、C新Xを捨て同値旧Bufferを用いる識別について、標準API仕様だけでは非迂回の独立origin認証・SHA/ELF実operand→proof結合は未立証。対象runtime/native/JIT/thread全coverageとDからのlabel改変排除も未立証。新monitor開発や実測で補わない。環境、sole tracer、合法cleanup、23slot各1回・追加0/1160秒、恒久保存は独立ゲート。保証B UNKNOWN、実装/実測開始NO。新候補探索へ拡散しない。
