# Stage 2-AからStage 2-Bへの引継ぎ

[受領台帳](stage2a-b6f-evidence-intake.md)と[仮説](stage2a-completion-hypotheses.md)を先に読む。本工程は新実験を許可しない。B6fの既知P2「提出外runner個別期限未強制・close無期限」は歴史的未解消のまま保持する。

1. 既存山中城B6g以降を優先し、最新報告・対象HEAD/tree・独立審査の対象ソースhash・結果を別工程で受領する。B6g報告の存在や限定PASSという語だけを実行許可にしない。既存試行を重複再実行しない。
2. 個別45秒/全体180秒は起動・観測・終了込み。終了余裕を事前予約し後から延長しない。context.closeを有限化し、Promise.race待機打切りだけでなく外側から子process/配下を止め、初発・期限・cleanup失敗・強制終了を区別する。
3. 正常、処理停止、close停止、子残留、初発失敗後cleanup失敗、全体期限の故障対照を別担当が直接審査。対象OSでの停止保証範囲と限界を明示する。P2解消未確認なら開始NO。
4. 新観測が別途認可される場合のみ、正常200/404×Chromium/WebKit最大4試行。404は先行200→同context再読込履歴、正常対照と二重加算しない。Playwright1.56.1/runtime/fixture/routing/cache/header/body取得順/5秒診断期限を固定する。
5. requestfinished/requestfailed・Page.Closeを操作前から同Request objectへ対応し、observer-local IDとnative IDを分ける。body/保存/finished/期限/close/settledを同一単調時計へ。NOT_RECORDED/記録失敗/対象外を区別。購読・配送の変更影響も記録する。
6. 起動不能、期限、容量不足、証拠不一致、初発識別不能で停止。残りNOT_TESTED。追加/自動retry禁止。後始末完了を期限内成功へ昇格しない。
7. 原証拠は許可済み本人限定保存先、保存後の独立再取得・size/SHA/CRC/manifest確認を別ゲートにする。欠落時はPARTIAL/BLOCKEDを保持。

正式ブラウザ受入FAIL、根本原因/使用実byte UNKNOWN、304 NOT_ADOPTED、Stage3-B HOLDを維持。新CI/依存/runtime/製品変更、設定変更、他作品変更、Draft解除、マージは禁止。Stage2-A文書の限定受入/マージ推奨は元作品のHOLD解除やStage2-B実行承認ではない。

## 本工程の検証状態

旧原ZIP独立再監査・新ブラウザ・native試験・画像監査・新CI実行はNOT_TESTED。文書リンク/版/引用区分の自己点検、別担当レビュー、提出後読戻し、新文書束の独立保全はそれぞれ別記録で報告する。Stage1 P3-01は旧現在欄の整理課題であり、今回の誘導追記だけで全体CLOSEDとはしない。
