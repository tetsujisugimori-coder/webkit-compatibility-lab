# Stage 1 — 証拠更新と次の観測条件

記録日: 2026-11-17 JST。基準はlab main `c84ac9e5077ef5e56f6242876c4a1dfd0a1c4858` / tree `d7fef0a0fcfdfccf6187a0c69d2f95ebc3994771`。対象は公開GitHub記録の読取りと文書計画。総合PARTIAL、計画提案。独立レビューNOT_TESTED、実験開始は本提案の対象外。

## 現在の追補（2026-11-17 09:59 UTC / 18:59 JST）

本稿冒頭と以下の初稿は e642308 時点の履歴。B6eは完了報告受領済みで、進行中という旧記述を現在状態として使わない。[具体証拠台帳](stage1-evidence-ledger.md)と[比較・開始条件](stage1-comparison-gates.md)を今回の現在表示とする。直接取得したGitHub metadata・固定source、引用した報告、原票未取得を分離した。実験・元作品変更は0。独立レビュー結果は提出追補で確定する。

## 判断基準

4作品を同じ原因と仮定しない。製品の状態、観測器の採取失敗、比較用fixtureの不備、実行環境の制限を別に記録する。新しい工程は既存の未解決事項に答える必要があり、済んだ監査や追加証拠のない設計反復を繰り返さない。WebKitのFAILは保持し、暫定運用方針による個別マージ審査と分ける。

## 今回読んだ公開記録と版

|対象|観測したPR HEAD|直接読んだ記録と範囲|
|---|---|---|
|山中城 #55|`7c4442e319e19950799d813524038b8474bc69a5`|[PR本文](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55)はB6e着手。[B6d独立監査](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/pull/55#issuecomment-6931792523)はaa3688f3固定、現HEADの監査ではない|
|Loading #88|`2d19a0f0db11b65db4eee56421c0d357558e70af`|[PR本文](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88)、[正式結果](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6897074919)、[v3計画](https://github.com/tetsujisugimori-coder/Loading-museum/pull/88#issuecomment-6899970542)。remoteと未提出成果を分ける|
|Intelligence #46|`8a8146001b2ac22c09eb624831b4a53e8ca48639`|[PR本文](https://github.com/tetsujisugimori-coder/intelligence-ui-museum/pull/46)のRound14結果。原票再計算は今回未実施|
|Atlas #36|`b2adb697efc2ea25c9430533c3f02383bece080a`|[PR本文](https://github.com/tetsujisugimori-coder/historical-source-atlas/pull/36)のB-Q決定。ブラウザ結果は[Stage 0版別記録](../projects/historical-source-atlas.md)に帰属|

4 PRは読取り時点でopen/Draft/未merge。上記は一時点のmetadataで継続監視ではない。原証拠の保存先、署名付きURL、HAR/trace/ZIPや秘密情報は転載しない。原ZIP再取得、独立全byte監査、ブラウザ再実行、実機Safariは今回NOT_TESTED。引用先で報告されたPASSを本担当の直接実証へ転用しない。Loadingの外部設定や未提出B-S成果は今回未確認。

## 山中城: 進行中B6eから受け取る最小情報

B6d監査報告は、38原ZIPの独立保全と限定コード・内容監査をPASSとしている。Varyの異なる表現選択は4原票で対応したとの報告。その他34本の全意味監査NOT_TESTED、manifestなし28本の網羅性UNKNOWN、目視4/48という限界を残す。

404は4原票ともphase2 capture.settle / DIAGNOSTIC_DEADLINE、request-2/response-2未完。次に必要なのは、どの要求のどの待機が終わらず、期限後の処理・終了・記録までどうなったかの対応表。B6eの実source HEAD/tree、checkout、run/job/attemptと対応付け、旧B6d票を新結果へ混ぜない。HTTP応答の受信、finishedの観測、bodyの採取、保存を別段階とする。未完要求があることだけでnative原因を断定しない。

反証条件: 採取処理を変更した条件だけで終了した場合、観測器またはfixtureの寄与を調べる根拠になるが、本番の使用実byteやWebKit正常性の証明にはならない。通常cache条件とrouting条件を混ぜない。304代替契約は別審査でNOT_ADOPTEDを維持する。B6eを待つ間に同じ実験を新harnessで繰り返さない。

## Loading: 一次状態と追加観測の対応表

既存報告の対象行を次の形に固定する。件数は歴史的報告で、今回の再実行ではない。

|経路と既存run|主な観測|次に台帳へ対応させる項目|
|---|---|---|
|API 43727018277|Chromium48 PASS、WebKit64 PASS/4 FAIL/4 NOT_TESTED。Swipe3失敗、Status S1-4失敗|slot ID、期待/一次状態、primaryFrozen、prefix到達、後続状態、Node Playwright1.56.1との版対応|
|WAAPI 43727018358|WebKit幅375 Menuの途中pauseが終端到達で不成立|ready/settled snapshot/seekの順序、currentTime/duration、Python Playwright1.56.0との版対応|
|Boundary 43727018298|C-WebKit Status success-prefixでLoading≠Success、目的一次NOT_TESTED/INCOMPLETE|prefix失敗と一次未到達、出力完全性、終了理由。Swipe一次PASSをStatusへ転用しない|

旧Loading≠Errorと後続Loading≠Successを同じ観測としてまとめない。一次時点を過ぎた追加観測が成功しても、保存済み一次FAILを上書きしない。click直前からready後までの331msをPromise pending単体時間と呼ばない。

次の読取り審査では各行に原票中の相関IDと同一clock内sequenceを対応させる。異なるdriver・API経路・時点を一致した比較として扱わない。遅延body取得と同slot停止の未整合、初回pushの安全性、外部Apps/Webhook/Actions/required checksは別ゲート。remote文書がB未承認を示すことと、未提出作業の現在承認状態は同義ではない。後者は未確認のまま保持する。C実験・本番108・製品受入・マージを開始しない。

## Intelligence: 時間をそろえた比較の事前条件

Round14はWindows/Linux×Chromium/WebKit、各pilot8とformal72。formalは計288で、pilot32を分母に混ぜない。両OSでWebKit Aは24/24輪郭あり、B/D各0/24、Chromium A/B/D各24/24と報告。時間予算が対応した比較は74/144で、残70/144は未対応。

次の比較案では元の条件IDを保持し、OS、browser/driver版、viewport375×1000、light、DPR1、normal motion、fresh context/page、操作順と観測時点を対応させる。比較する経過時間の起点・終点・許容差・不成立時の分類を実行前に固定する。許容差は実根拠なしに数値を発明せず、計画段階の未決事項として明示する。

focus復帰、:focus-visible、::afterの計算style、画面の輪郭を別結果にする。時間同等性が成立した条件でも欠落が継続すれば、時間差だけで説明する仮説に対する反証候補になる。欠落が変わった場合も、同時に変えた介入の有無を確認してから原因を評価する。probe OFFでも再現したことは全計測の無影響を証明しない。新試行数・実行予算・許容差・証拠保存・独立レビューは別計画で固定するまでNOT_READY。

## Atlas: 既存反証と追加証拠の入口

v4 style要素、v5指定focus呼出し、v6指定scrollIntoView式の単独除去でも同署名が残ったという範囲を維持する。CSS/focus/scroll全般を原因候補から排除しない。native stack、終了signal、実行物と実使用byteの帰属が不足している。

B-Qでは値一致B_valueと因果的な実使用B_useを分離し、FD/receipt/hash一致だけでは同値旧Buffer利用を識別できないと判断している。Q2/Q3は成立済み方式ではない。次の審査へ進むには既存の具体source/版と観測または証明chainを一候補提示し、元Dが同値旧Bufferを使う経路を区別できる根拠を示す必要がある。根拠がなければ文書反復を止め、開始NOを維持する。

認可Linux環境、通常権限、安全終了、23slot/1160秒、恒久保全の各ゲートは別々。別環境への無断移動や権限変更、GDB/native/browser起動で解消したことにしない。

## この提案の受入と次の作業

文書差分のみ、リンク・版帰属・公開情報の範囲・旧記録保持を自己点検する。独立レビューは未実施で、自己点検を独立PASSとは呼ばない。本提案を受け入れても、新harness・CI・browser実験や元作品のマージを許可するものではない。

優先順は、既に進行中のB6e結果の受領、Loadingの原票対応表、Intelligenceの時間同等性計画、Atlasの実在候補の有無確認。共通実験へ進める条件は、共有機序を支持する証拠、同等の再現条件、固定期待値、資源上限と安全終了、公開前点検、原証拠保全と独立審査がそろうこと。現在の共通原因はUNKNOWN。

