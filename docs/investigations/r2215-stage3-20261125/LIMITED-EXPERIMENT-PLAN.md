# 追加実機検証の必要性判定と限定計画（未承認・未実行）

**判定：文書受入には不要。研究上は公開API状態・停止時系列の観測価値がある場合のみ検討。開始NO（NOT_TESTED）。** 既存14条件を繰り返さず、旧Atlas固定HEAD 3e56d13d77048d056e79c6971e6e7d24ad92b4ff の代表1条件のみを使う。製品コード、診断器、原票、ゲート/HOLDは変更しない。

## まだ解けない問い
1. 同じ履歴再読込操作中の公開Navigation API状態が、クラッシュ/タイムアウト直前までどのように変わるか。
2. r2215とr2227で、history APIの操作やNavigation API currentEntry/entries/activationの観測に差があるか。
3. Playwright TIMEOUTとWebProcess SIGABRTの時系列を既存原票以上に精密に紐づけられるか。
4. 内部索引の特定、関数帰属、パッチの因果関係はこの実験の判定対象外。UNKNOWNを維持する。

## 手順（所有者承認後の別PR・別原票だけ）
- Playwrightドライバー1.56.1固定。可能な限り同じUbuntu 24.04・WPE設定でr2215とr2227の2版を比較し、バイナリ版・実行ファイル・Build ID・SHA-256を**実行前**に記録。
- Atlas対象操作は EK-0119 → EK-0120 → 先行reload → C05 → 最終reload の1条件のみ。新規contextを使い、各版で**1回**、retries=0、1回当たり最大15秒の待機・全体最大60秒を暫定上限とする。上限/トリガーの実行詳細は承認時に固定。
- 初期・pushState/ナビゲーション後・先行reload前後・最終reload直前にページの公開APIで navigation.currentEntry?.key/id/url, navigation.entries().length, navigation.activation?.navigationType/from?.key、および history.length, location.href をスナップショット。機能非対応や読み取り例外もそのまま記録。
- navigation関連イベントが取得可能なら発火順と時刻を記録。非公開C++フィールドへアクセスしない。公開APIの値が正常でもC++内部indexの有無は推論以上にはならない。
- HTML request/response及びrequestfinishedをURLとrequest識別子で関連づけ、HTTP 200後の本文完了を未観測のまま「完了」とみなさない。
- 版ごとの最終Playwright結果は PASS/TIMEOUT/CRASH通知/SIGABRT別観測を分離し、ブラウザプロセス状態と出口を記録。TIMEOUTをCRASHに事後修正しない。

## 観測・判定の限界
観測処理自体が実行タイミングを変える可能性があるため、観測の有無・所要時間・欠損を記録し既存原票との直接同一視を避ける。版不適合やAPI非対応、必須観測の欠損はNOT_TESTED/UNKNOWNとして区別し、成功とみなさない。各版1回の結果は当該実行の観測に限り、再現率や一般的な非再現を保証しない。

## 停止条件
指定回数終了、各版15秒超、全体60秒超、想定外プロセス/権限/ネットワーク変化、識別可能な原票欠落、再現条件の逸脱のいずれかで中止。無制限再試行なし。新しい安全ゲートの追加や本番実行はしない。

## 成果・保全
入力の固定HEAD、Playwright/OS/ELF識別、観測JSON（時刻・各公開API値と未対応）、ネットワークイベントJSON、stdout/stderr、PID/exit、判定JSON、run/job ID、原ZIP SHA-256・サイズ・再取得照合。中央規約に基づくLevel 2として保存先・保持期間・独立確認を別途記録。正式保存先の権限がない場合はHOLD/UNKNOWNのままにする。

## 限定実験から断定しないこと
公開Navigation APIのcurrentEntryが取得できても、過去のNavigationオブジェクトのm_currentEntryIndexやWebKit固有関数PCは直接わからない。同Build IDのDWARFや十分なソース・バイナリ対応がなければ関数と初発原因はUNKNOWNを維持。
