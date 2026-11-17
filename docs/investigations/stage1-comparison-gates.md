# Stage 1 比較条件と開始ゲート

2026-11-17。これは実行承認ではない。根拠と版は[証拠台帳](stage1-evidence-ledger.md)。本工程は新ブラウザ/native試行0。既存原票にないイベントやhashを補作しない。元作品の受入条件は変更しない。

## Y-B6E-404: 次の最小作業は通知経路の読取り

|項目|固定する対象/条件|
|---|---|
|問い|同responseのbody終了とfinished未通知の間で、保存済み記録から何が区別できるか|
|入力|7c4442e3の専用PR/push×2engineの4原票、収録runtime source、既存trace。B6dは別版|
|比較する経路|requestfinished/requestfailed通知→Response.finished resolver、context.close失敗解放。sourceに存在する分岐と実記録の通過を分ける|
|期待/反証|対応IDと記録があれば待機段階を対応。通知が記録されたのに同Promiseが未解放なら単なる通知不在仮説の反証候補。native ID/通知が無ければUNKNOWNで止める|
|正常対照|同runの通常200、body/finished/保存/settledの完了順序を別行にする。404とcache条件が異なれば明記|
|停止|必要runtime body/hashやID欠落、別版混入、公開不能データ。再試行で埋めない|
|開始条件|担当・入力4本・必要記録だけの取得量/展開予算を固定、既存B6fとの役割重複なし。未修正P2runnerは再利用不可|
|終了条件|四行すべてに通知の有無、source位置、未記録・UNKNOWN、版帰属を記す。全使用byte/304受入を主張しない|

今回のlabは原票取得前の対応表まで。B6fの開始・担当は公開記録から確認できずUNKNOWNであり、既存担当の成果受領を優先する。比較実験へ進む場合は別計画・上限・承認が必要。

## L-API / L-WAAPI / L-BOUNDARY: 原票を読める条件

|優先|入力と問い|固定する比較・拒否条件|
|---|---|---|
|1|API43727018277のStatus S1-4とSwipe失敗3のslot原票|slot内prefix→一次観測→primaryFrozen→後続→cleanupをsequenceと同一clockで結合。一次FAILを後続成功で上書きした台帳は拒否|
|2|WAAPI43727018358の375 Menu raw|click前/ready後/settled/seek/pauseの各値とcurrentTime/durationを読む。331msをPromise待機だけとする解釈を拒否。driver1.56.0とAPI1.56.1を同一条件にしない|
|3|Boundary43727018298のC-WebKit Status|success-prefix Loading≠Success→目的一次未到達を保持。Swipe一次PASSで穴埋めしない。非到達を一次FAILとする分類を拒否|

必要JSON位置が未取得ならNOT_VERIFIED。1原票群ずつ必要ファイルだけ取り出し、事前にZIP size/展開合計/空き容量を確認する。既存の失敗5ZIP保全報告を新たな保全実証へ転用しない。実験C/108、元PRへのpush、外部設定変更は禁止。

独立ゲート: (a)遅延bodyを待つ間の同slot停止整合、(b)初回提出のイベント遮断、(c)対象版の限定受入・マージ条件。required checks0の報告は(b)や(c)の成功ではない。GitHub Appsの未確認範囲を独断で除外しない。

## I-R14: 時間同等性を審査できる比較案

既存planのcondition A/B/Dとarm IDは改名しない。Aは履歴なし、Bはon、Dはon→off。以下は次計画の候補で、試行は未承認。

|比較|変える要因|固定項目・期待観測・反証|
|---|---|---|
|A1対W0|page.evaluate no-op 1回|同condition/iteration/OS/engine。時間が同等で輪郭差が出れば追加呼出し無影響仮説に反証候補|
|A2対W0|target DOM/computed snapshot 1回|geometry/scroll等の同等性を別判定。読取りによる介入を隠さない|
|A3対W0|中間viewport PNG 1枚|最終PNGは両群共通。中間撮影の時間負担を含める|
|A4対W0|context開始からtracing ON/OFF|Escape後だけのtrace介入と呼ばない。context生涯の差が交絡候補|
|A0対W0|意図的待機の有無|同時間比較として扱わない。時間束の比較として別集計|
|caller off対on|focus/event/MutationObserver probe|同時間性は未成立。復帰主体の観測は別問い|

時間指標はhost process.hrtimeのEscape操作終了→final read開始。page performance.nowのkeydown/focus等は別clockで保持し、両clockを直接減算しない。共通最終snapshotと撮影は無観測ではない。歴史的200ms/74対144成立は、厳密な同時刻一致ではなく登録予算内の判定。

|次計画に固定する事項|現時点の具体案 / 未決と必要資料|
|---|---|
|時間をそろえる方法|host側の同一起点から残余待機する候補。待機自体も介入。scheduler超過・finalStartの実測で不成立を検出し、成功まで再試行しない|
|許容差|未決。旧200msを事後拡張しない。OS別の既存actual elapsed分布・clock分解能・超過分布の原票を先に読む。平均だけで極端値を除外しない|
|試行数|未決。旧正式各3回を新たな十分性の根拠にしない。必要な比較精度と許容欠測を独立審査し、有限総数を事前承認|
|順序|旧順はiteration昇順、偶数反転、condition index回転。次案も順序表を実行前登録し、fresh context/pageを維持するが最終採用未決|
|時間/出力上限|未決。既存slot時間、trace/PNG/JSON sizeの最大・総和とcleanup余裕の根拠が必要。値未定のまま開始しない|
|正常対照|同登録conditionのChromium、WebKit A。focus復帰・focus-visible・computed outline・画素輪郭を別々に評価|
|不成立分類|時間超過/DOM・geometry不一致は比較UNCONFIRMED。launch失敗BLOCKED、欠測NOT_TESTED、症状消失は条件限定OBSERVEDで根因PASSではない|
|停止・保存|予算超過/必要証拠欠損/privacy違反/cleanup未完で停止。旧結果保持、各slotの失敗・未到達を保存。raw公開には元privacy gateと承認済み保存先/再取得手順が必要|

旧pilot32・formal288、同HEAD PR再実行を新計画の独立試行数へ足さない。次工程は既存原票の時間/容量分布を読むまで。新pilotやfixture変更はここでは開始しない。

## A-BQ: 一候補の根拠受領と開始NO

同時進行の別担当はLLVM DFSan20.1.8（87f0227c）一候補を静的審査中。新monitorを作らず、公式仕様から完成B_use oracleが自動成立しないことを確認した。候補の最終source表/独立レビュー/公開可能な結論を受領し、PR36に提出された版と未提出作業を分けて更新する。将来別checkerを開発すれば解決すると断定しない。

必要chain: 新FD origin認証→正当copy伝播→SHA/ELF実operand→proof出力→独立checker。Dの自己label/入口read/同値digestだけは不可。A受理/B受理/C拒否の根拠がなければ未立証または限定方式不適格。環境・sole tracer・安全終了・23slot/1160秒・恒久保全も別に成立するまで実装/実測NO。

## 本文書の完了と研究の未完

本Stage 1の完了は、参照可能な根拠・不足欄・比較条件・開始阻害を文書化し別担当が審査すること。原票全量独立再監査や実験開始条件の充足は別。文書限定マージ推奨は元作品の技術受入を変更しない。
