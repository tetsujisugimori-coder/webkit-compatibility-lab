# 一次資料・証拠台帳（第3段階）

取得確認日時: 2026/11/25 6:48:38 JST。区分「直接取得」は今回GitHub連携/Webの一次資料を読んだ意味であり、実際の配布バイナリや既存ZIPの生バイトを再取得した意味ではない。

| ID | 原資料 / 固定対象 | URL | 今回の取得と評価 |
|---|---|---|---|
| S01 | Playwright v1.56.1 UPSTREAM_CONFIG.sh / db897909f7c31d9b38793374c66427b6a4cb3dd3 | https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/UPSTREAM_CONFIG.sh | 直接取得 CONFIRMED |
| S02 | Playwright v1.57.0 UPSTREAM_CONFIG.sh / 486de399887bc8fa8a69e2f194ebc9476589a08a | https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/UPSTREAM_CONFIG.sh | 直接取得 CONFIRMED |
| S03 | 旧WebKit Navigation.cpp / db897909... (file blob 7ede31a773fcec3ec9feefefb577287dede1c192) | https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/page/Navigation.cpp | 対象範囲を直接取得 |
| S04 | 新WebKit Navigation.cpp / 486de399... (file blob bcff12eb045a53365d90988679d4c4740f3489da) | https://github.com/WebKit/WebKit/blob/486de399887bc8fa8a69e2f194ebc9476589a08a/Source/WebCore/page/Navigation.cpp | 対象範囲を直接取得 |
| S05 | v1.56.1 bootstrap.diff / blob f713c6fa093a1f45956c84844d50635376923b75 | https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/patches/bootstrap.diff | 直接取得。分割取得した1〜17,000行でNavigation.cpp変更hunkなし（ファイル全長の証明はしない） |
| S06 | v1.57.0 bootstrap.diff / blob 80d62c3967ecec705a9ab43ddce9271f06235bf2 | https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/patches/bootstrap.diff#L5981-L5996 | 直接取得。m_currentEntryIndexガード後returnを確認 |
| S07 | WebKit #53102 / merge c69ce8c4652b44accf6932761ae7837864f11151, 2025-10-29 | https://github.com/WebKit/WebKit/pull/53102 | PRパッチ/会話/マージ確認。current index欠落時に通常初期化へフォールバック |
| S08 | WebKit #52049 / OPEN未マージ, HEAD 9f97b4cd4bdda34f0dc88778cda69a0bb3e6c31f | https://github.com/WebKit/WebKit/pull/52049 | パッチ/状態直接取得。Reload/Replaceでprevious index再利用案 |
| S09 | WebKit Bug #300402, 2025-10-08 | https://bugs.webkit.org/show_bug.cgi?id=300402 | 直接取得。previousNavigation index nullopt、別ビルドWebKitGTKシンボル付きスタック |
| S10 | WebKit Bug #301593, 2025-10-28 | https://bugs.webkit.org/show_bug.cgi?id=301593 | 直接取得。#53102によりFIXED |
| S11 | Playwright #37766 | https://github.com/microsoft/playwright/issues/37766 | 一次Issue直接確認。旧版reload事例 |
| S12 | Playwright #43949, 2026-11-06 | https://github.com/microsoft/playwright/issues/43949 | 一次Issue直接確認。pushState/reload/goto、r2215異常・r2227非再現の独立報告 |
| S13 | WebKit 298765@main, b05914464158fcb242b61edb1c2a547be7a0532c, 2025-08-15 | https://github.com/WebKit/WebKit/commit/b05914464158fcb242b61edb1c2a547be7a0532c | コミット差分直接取得。BFCache/activation再構成 |
| S14 | WebKit 8bb5a0a3ea33be619bc5e7c891b318411258c36f, 2025-11-03 | https://github.com/WebKit/WebKit/commit/8bb5a0a3ea33be619bc5e7c891b318411258c36f | コミット差分とメッセージ直接取得。Playwright由来のdownstream変更を上流302279の修正後に取り消した経緯 |
| S15 | WebKit #53102 landed commit 302279@main | https://github.com/WebKit/WebKit/commit/c69ce8c4652b44accf6932761ae7837864f11151 | 元PR/Issueのマージ記録から確認 |

## 既存証拠の追跡（このセッションでは原ZIP生バイトを展開・再ハッシュしていない）
| ID | 原票・正式CI・固定HEAD | Actions artifact の直接メタデータ | 検証階層 |
|---|---|---|---|
| E19 | PR #19 run 44960921488; HEAD 86c6dad45f4635ab5618f7bd64f6c00e1888601f | artifact 14729886189, 6,877 bytes, SHA256 0dc3195697d9ae1949f7ce88aec1e80499e6589c691065cf18694011658285e4 | run success/artifact存在とdigestは今回直接取得。7x2原票の内容は既存PR・Issue記載、ZIP再照合NOT_TESTED |
| E20 | PR #20 run 44992423234; HEAD 4ba2b94321d3c0b809448e87d99e8cacfc589749 | artifact 14742670307, 25,925 bytes, SHA256 85c11b9958ff6b87194ea7c44969c3ed97b760341dd36be280b103309a0b55aa | run success/artifact存在とdigestは直接取得。生GDBテキスト再展開NOT_TESTED |
| E21 | PR #21 run 44996352539; HEAD 0b5e97d399dfd0f7e7c787382baf28ef24e90e94 | artifact 14744180842, 9,626 bytes, SHA256 53de56d6973eadffe2a1fba13bac33587b62d59f3ae9cf1dc46696e18d5783db | run success/artifact存在とdigestは直接取得。ELF生バイト再取得NOT_TESTED |

- 原票URL: https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44960921488/artifacts/14729886189 ; https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44992423234/artifacts/14742670307 ; https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44996352539/artifacts/14744180842
- PR #20 GDBが実行したELFとPR #21で後日取得したELFが同じ配布revisionであることは報告されているが、実行時のBuild ID/SHAが原票にない。厳密なbyte同一性UNKNOWN。
- Level 2保全候補: 本調査文書・一次資料照合記録・新規差分表。保存実体は本PRのGit blob。本人限定Libraryなど所定の保全先への独立保存は本作業では実施していない。中央保全規約による最終保全認定は別途必要。
