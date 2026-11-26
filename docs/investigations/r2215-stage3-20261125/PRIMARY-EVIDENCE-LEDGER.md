# 一次資料・証拠台帳（第3段階）

初回取得確認日時: 2026/11/25 6:48:38 JST。2026-11-26独立レビュー・補訂を追記。区分「直接取得」は今回GitHub連携/Webの一次資料を読んだ意味であり、実際の配布バイナリや既存ZIPの生バイトを再取得した意味ではない。

| ID | 原資料 / 固定対象 | URL | 今回の取得と評価 |
|---|---|---|---|
| S01 | Playwright v1.56.1 UPSTREAM_CONFIG.sh / db897909f7c31d9b38793374c66427b6a4cb3dd3 | https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/UPSTREAM_CONFIG.sh | 直接取得 CONFIRMED |
| S02 | Playwright v1.57.0 UPSTREAM_CONFIG.sh / 486de399887bc8fa8a69e2f194ebc9476589a08a | https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/UPSTREAM_CONFIG.sh | 直接取得 CONFIRMED |
| S03 | 旧WebKit Navigation.cpp / db897909... (file blob 7ede31a773fcec3ec9feefefb577287dede1c192) | https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/page/Navigation.cpp | 対象範囲を直接取得 |
| S04 | 新WebKit Navigation.cpp / 486de399... (file blob bcff12eb045a53365d90988679d4c4740f3489da) | https://github.com/WebKit/WebKit/blob/486de399887bc8fa8a69e2f194ebc9476589a08a/Source/WebCore/page/Navigation.cpp | 対象範囲を直接取得 |
| S05 | v1.56.1 bootstrap.diff / blob f713c6fa093a1f45956c84844d50635376923b75 | https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/patches/bootstrap.diff | 初回1〜17,000行、独立レビューで全21,481行を照合。Navigation.cpp変更ヘッダ0件 |
| S06 | v1.57.0 bootstrap.diff / blob 80d62c3967ecec705a9ab43ddce9271f06235bf2 | https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/patches/bootstrap.diff#L5981-L5996 | 直接取得。m_currentEntryIndexガード後returnを確認 |
| S07 | WebKit #53102 / merge c69ce8c4652b44accf6932761ae7837864f11151, 2025-10-29 | https://github.com/WebKit/WebKit/pull/53102 | PRパッチ/会話/マージ確認。current index欠落時に通常初期化へフォールバック |
| S08 | WebKit #52049 / OPEN未マージ, HEAD 9f97b4cd4bdda34f0dc88778cda69a0bb3e6c31f | https://github.com/WebKit/WebKit/pull/52049 | パッチ/状態直接取得。Reload/Replaceでprevious index再利用案 |
| S09 | WebKit Bug #300402, 2025-10-08 | https://bugs.webkit.org/show_bug.cgi?id=300402 | 直接取得。previousNavigation index nullopt、別ビルドWebKitGTKシンボル付きスタック |
| S10 | WebKit Bug #301593, 2025-10-28 | https://bugs.webkit.org/show_bug.cgi?id=301593 | 直接取得。#53102によりFIXED |
| S11 | Playwright #37766 | https://github.com/microsoft/playwright/issues/37766 | 一次Issue直接確認。旧版reload事例 |
| S12 | Playwright #43949, 2026-11-06 | https://github.com/microsoft/playwright/issues/43949 | 一次Issue直接確認。pushState/reload/goto、r2215異常・r2227非再現の独立報告 |
| S13 | WebKit 298765@main, b05914464158fcb242b61edb1c2a547be7a0532c, 2025-08-15 | https://github.com/WebKit/WebKit/commit/b05914464158fcb242b61edb1c2a547be7a0532c | コミット差分直接取得。BFCache/activation再構成 |
| S14 | WebKit 8bb5a0a3ea33be619bc5e7c891b318411258c36f, 著者日時2025-11-03 UTC / コミッター日時11-06 UTC | https://github.com/WebKit/WebKit/commit/8bb5a0a3ea33be619bc5e7c891b318411258c36f | コミット差分とメッセージ直接取得。Replace/Reloadの索引再利用変更を取り消した経緯。v1.57.0早期returnの収録証拠ではない |
| S15 | WebKit #53102 landed commit 302279@main | https://github.com/WebKit/WebKit/commit/c69ce8c4652b44accf6932761ae7837864f11151 | 元PR/Issueのマージ記録から確認 |

## 既存証拠の追跡（初回取得記録。2026-11-26追補は下記）
| ID | 原票・正式CI・固定HEAD | Actions artifact の直接メタデータ | 検証階層 |
|---|---|---|---|
| E19 | PR #19 run 44960921488; HEAD 86c6dad45f4635ab5618f7bd64f6c00e1888601f | artifact 14729886189, 6,877 bytes, SHA256 0dc3195697d9ae1949f7ce88aec1e80499e6589c691065cf18694011658285e4 | run success/artifact存在とdigestは今回直接取得。7x2原票の内容は既存PR・Issue記載、ZIP再照合NOT_TESTED |
| E20 | PR #20 run 44992423234; HEAD 4ba2b94321d3c0b809448e87d99e8cacfc589749 | artifact 14742670307, 25,925 bytes, SHA256 85c11b9958ff6b87194ea7c44969c3ed97b760341dd36be280b103309a0b55aa | run success/artifact存在とdigestは直接取得。生GDBテキスト再展開NOT_TESTED |
| E21 | PR #21 run 44996352539; HEAD 0b5e97d399dfd0f7e7c787382baf28ef24e90e94 | artifact 14744180842, 9,626 bytes, SHA256 53de56d6973eadffe2a1fba13bac33587b62d59f3ae9cf1dc46696e18d5783db | run success/artifact存在とdigestは直接取得。ELF生バイト再取得NOT_TESTED |

- 原票URL: https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44960921488/artifacts/14729886189 ; https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44992423234/artifacts/14742670307 ; https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44996352539/artifacts/14744180842
- PR #20 GDBが実行したELFとPR #21で後日取得したELFが同じ配布revisionであることは報告されているが、実行時のBuild ID/SHAが原票にない。厳密なbyte同一性UNKNOWN。
- Level 2保全候補: 本調査文書・一次資料照合記録・新規差分表。保存実体は本PRのGit blob。本人限定Libraryなど所定の保全先への独立保存は本作業では実施していない。中央保全規約による最終保全認定は別途必要。

## 2026-11-26 独立レビュー・保存担当による保全確認（再審査前の記録）
- [独立レビュー](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6060401704) でActions E19/E20/E21の全25収録ファイルのCRCと3 ZIPのサイズ・SHA-256一致を確認。FDE生出力はE20/E21に見つからず、対象ELF識別情報との対応は未証明。
- 本人限定Driveの既存保全先でE19/E20の実体・ownerのみの権限を確認し、今回生バイトを再取得。上表のサイズ・SHA-256と一致、CRC正常。
- E21はActionsから生ZIP取得し上表のサイズ・SHA-256一致、CRC正常を確認。同じ本人限定Drive保全先へ新規保存し、ownerのみの権限と保存先からの再取得・サイズ・SHA-256・CRC一致を確認。新規保存担当自身による読戻しであり、独立担当の保存先再取得はPENDING。
- Libraryに3件の登録・サイズ一致を確認したが生バイト取得はBLOCKED。Drive/Libraryの非公開識別子や取得URLは公開GitHubに記載しない。保持期限1年、削除・移動・上書き禁止。正式な中央規約適合の最終判定は独立再審査で確認する。
- Actions失効予定（JST）E19 2026-11-29 08:18:36、E20 15:10:09、E21 16:02:22。既存保全先のファイルは削除・移動・上書きしていない。

## 2026-11-26 保存先からの独立再取得（現行）
- [独立再審査](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/22#pullrequestreview-6061365008)では、別担当がE19/E20/E21の原ZIPを本人限定Driveから再取得した。取得時点で権限は所有者のみ。3件のサイズ・SHA-256はActions記録と一致し、全25収録ファイルのCRCが正常。原ZIP3件の保全照合はPASS。
- 保持期間の経過後の実在性とLibrary経由のZIP実体照合は当該再審査の範囲外。上記のE21独立再取得PENDINGは再審査前の状態。
