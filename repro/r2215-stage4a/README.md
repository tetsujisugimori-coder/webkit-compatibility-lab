# r2215 第4段階 4-A: 公開状態観測器（合成試験のみ）

関連 Issue #18 / PR #23。基準 main: 9d38b3ae1cac8e7310a66961793b1db2fb0bae65。
第3段階の限定実験計画を変更せず、独立ディレクトリに観測モジュールを追加する。
製品コード、既存診断器・原票・受入ゲートは変更しない。実ブラウザを起動するエントリポイントは設けない。

## 観測契約

- readPublicState: location.href / history.length / Navigation API currentEntry, entries().length, activation を読み取り。null、非対応、読み取り例外を分ける。C++内部状態は観測しない。
- createObserver: ホスト単調時刻・壁時計・受領順序・操作段階・cleanup区分を記録。request識別子で同一URLの別要求を区別し、200応答とrequestfinishedを混同しない。page.crash、browser.disconnected、外部根拠付きprocess.exitは独立。
- installPublicEventAdapter: 専用ページの最初のナビゲーション前に設定する。主フレーム/サブフレームの区分に加え、アダプタ内のフレームIDと文書の初期化時に生成する文書IDを記録する。同じフレームの再読込でも文書IDが変わり、文書内連番と時刻の所属を確認できる。取得できないIDはnull。ページ報告の受領順序は発火順序の証明ではない。binding失敗や文書終了でイベントが欠け得る。
- snapshot: 既定500ms、最大15000ms、再試行なし。読み取り例外はERRORとして記録し、実行中状態を解除する。タイムアウト時にstopCaseを返す。実行中のevaluateをキャンセルする機能ではないため、呼出側はケースを停止して回収する。全体期限は4-Bの外部ランナーの責務。
- processExitは外部から根拠を受け取る。正の整数のPIDと空白以外を含む出典に加え、整数の終了コードまたは空白以外を含むシグナルのいずれか一方を必須とする。合成値を実測と呼ばない。
- 出力はreport()のJSON互換イベント列。既存verdictは変更せず、この観測器は製品PASS/FAILを判定しない。

## 合成試験

node --test repro/r2215-stage4a/observer.test.cjs

初回提出版 `139092e158824725af7909b7a3660833a8e64b01` は、実装担当の隔離Linuxコンテナ Node v22.16.0 で 8/8 PASS、fail/skip/cancel 0。
GitHub読戻しのGit blob SHAは実行版と一致:
- observer.cjs: bac0799736651d4d29bfee69bebfa671886a5495 / SHA-256 a7463f8221a4f310fc77b99f7637729265cab5084ac341cae4bf5629e1777932
- observer.test.cjs: edf13e5c7293f2b2398553a8faad5ea222e13a73 / SHA-256 0aa3e95b7945f4d743f368e6f55b02eca5d2d28310ba0aa62039b1cef929a67f

補訂版では、複数フレームと再読込前後の文書識別（P2-03）、不正な終了根拠の拒否（P2-04）、null/undefined例外後の記録とスナップショットの復帰（P3-06）を合成試験に追加。対象コミットの正式CIは [PR #24のチェック](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/24/checks)を参照。

実ブラウザでのPlaywright 1.56.1 API互換性、イベント欠損率、観測負荷、実プロセス監視、固定入力による実行制限はNOT_TESTED。4-Bに先立ち専用ランナー・外部期限・原票回収・証拠保全・開始条件を固定し、個別承認を得る。既存の各版1回・各15秒・全体60秒の暫定上限を勝手に拡張しない。
P3-05は第3段階READMEのPR #22補訂時の保存作業とPR #23の文書追記を明確にした。独立確認済み。

研究の判定は4-B開始NO、総合PARTIAL、根本原因UNKNOWN、実機NOT_TESTED。中央保全規約に基づく原票保全は新規正式原票発生時に適用する。
