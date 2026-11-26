# r2215 WebProcess ネイティブ停止位置：Atlas 代表1条件

Issue #18 ／ PR #19の独立レビューで推奨された **1条件限定** の原因切り分け。PR #19の実験コード・原票は変更せず、別のDraft PRで実施する。

## 実行対象と手順
- Atlas旧HEAD `3e56d13d77048d056e79c6971e6e7d24ad92b4ff` のローカルHTTP配信。
- Playwright 1.56.1ドライバー＋同梱WebKit r2215のみ。Chromium・r2227・複数試行を起動しない。
- 操作は `EK-0119 → 既存参照でEK-0120 → page.reload → C05へ移動 → 最終page.reload` の1回。
- 最終reload前に、生存中の `WPEWebProcess` または `WebKitWebProcess` のPID、PPID、実行ファイルを `/proc` から取得。候補が一意でない場合、誤ったPIDにアタッチしない。
- 一意なら `sudo gdb -p <WebProcess PID>` を**対象子プロセス**にアタッチ。SIGABRTを停止捕捉し、スレッド別backtrace・レジスタ・メモリマップをテキストへ書き出す。アタッチ失敗は失敗記録とする。
- Linux core dumpは無効。全体ジョブ20分、ケース実行180秒以内、デバッガ待機は有限。
- 原票: `result.json`、`gdb-backtrace.txt`、`stdout.txt`、`stderr.txt`、`exit.txt`。関数名や索引がシンボル不足で確定できない場合UNKNOWNを保持。

## 判断条件
- **PID**: `/proc/<pid>` でWebProcess実体を特定できたか（MiniBrowserの親PIDと混同しない）。
- **終了シグナル**: GDBがWebProcessのSIGABRTを直接捕捉できたか（起動側stderrのassertion行だけでは不足）。
- **ネイティブスタック**: `Navigation::initializeForNewWindow` の実フレームが含まれるか、取得不能ならUNKNOWN。ライブラリ中のアドレスだけなら同一関数と断定しない。
- **索引**: `previousNavigation->m_currentEntryIndex` と `m_currentEntryIndex` のどちらが未設定か、変数・命令の直接証拠がなければUNKNOWN。SIGABRT署名だけでは特定不能。
- **旧現象**: TIMEOUTとSIGABRTが同時に生じても、Playwright `page.crash` が未観測なら原票TIMEOUTを変更しない。
- **修正帰属**: r2227は「新ビルドで非再現」。#53102の効果は未確定であり本PRで認定しない。

作業対象外：Atlas製品修正、旧原票更新、判定器改善、既存HOLD解除、PR #19のマージ、core dump大型保管。今回のネイティブ証拠のみ評価する。
