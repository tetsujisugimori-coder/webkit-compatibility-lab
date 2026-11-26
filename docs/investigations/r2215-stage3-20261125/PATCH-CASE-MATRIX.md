# 上流/Playwrightパッチ、および履歴索引欠落事例の区別

## 公開パッチ
| 修正候補 | 具体的な変更 | 状態・根拠 | r2227の非再現との関係 |
|---|---|---|---|
| WebKit #52049 | Replace/ReloadではpreviousNavigation->m_currentEntryIndexを再利用し、その他は探索 | OPEN・未マージ。HEAD 9f97b4cd4bdda34f0dc88778cda69a0bb3e6c31f | 採用済修正と扱わない |
| Playwright v1.57.0 bootstrap.diff | m_currentEntryIndex有りならActivationを作り、無くてもelse分岐末尾でreturnする | 公開パッチに直接確認（blob SHA 80d62c3967ecec705a9ab43ddce9271f06235bf2） | **候補**。配布物への適用記録UNKNOWN。根本の索引不整合は温存し得る |
| WebKit #53102 | m_currentEntryIndexがある場合だけActivationを作ってreturn、無ければ通常初期化へ進む | 2025-10-29マージ、302279@main。frameLoaderでdocumentLoader参照修正も含む | r2227基準日(9/29)より後。r2227への取り込み実績未確認、効果帰属はUNKNOWN |
| WebKit 8bb5a0a | 著者日時2025-11-03 UTC、コミッター日時11-06 UTC。Replace/Reloadのprevious index再利用変更をunfork。上流302279が修正済みとの説明 | コミットメッセージ/差分を直接確認 | v1.57.0早期returnの収録・実配布ELFの含有証明にはならない |

**重要**: 上流修正のフォールバックとPlaywright独自パッチの早期returnは、欠落時に別の状態を生む。r2227がPASSでも、索引欠落の初発が消滅したとは言えない。Playwright v1.56.1のbootstrap.diffは独立レビューで全21,481行を照合しNavigation.cppの変更ヘッダ0件を確認が、元WebKitの実ビルドへの適用は別件。

## Bug #300402 / Bug #301593 / Atlas
| 対象 | 直接資料が示す異常 | 報告スタック/条件 | Atlasへの帰属 |
|---|---|---|---|
| Bug #300402 (2025-10-08) | previousNavigation->m_currentEntryIndex がnulloptとの開発者説明 | 別WebKitGTKビルドでSIGABRT、Navigation::initializeForNewWindow→FrameLoader::didBeginDocument→DocumentLoader::commitData | 類似性あり、同Build IDではなく同一関数・索引はUNKNOWN |
| Bug #301593 / #53102 (2025-10-28/29) | 現在のm_currentEntryIndexが空でcurrentEntry()が返すnullptrを参照したという開発者仮説（HYPOTHESIS）。初発原因不明。Bug FIXEDと公開修正内容はCONFIRMED | StabilityTracer、再現例未確定 | 修正機構の参照候補。Atlas同一性UNKNOWN |
| Atlas代表ケース | r2215でHTTP 200後Playwright 15秒TIMEOUT、GDBでWebProcess SIGABRT、optional<unsigned long> assertion | #19〜#21、VMA 0x45208ae。内部スタックは?? | 関数・索引・初発原因・停止フレームUNKNOWN |

前者は「過去のオブジェクト側のindex」、後者は「今回生成中のオブジェクト側のindex」。索引の型が同じでも、#301593のnullptr参照仮説はAtlasの空optional<unsigned long>アサーションを説明する直接証拠ではない。両固定版のcurrentEntry()は索引有無を検査する。r2215上流の履歴引継ぎはサブフレーム限定で、Atlasでの到達と配布物分岐条件はUNKNOWN。実機のアドレスを別Build IDの公開スタックの関数名で置換するのは禁止。

一次資料:
- https://bugs.webkit.org/show_bug.cgi?id=300402
- https://bugs.webkit.org/show_bug.cgi?id=301593
- https://github.com/WebKit/WebKit/pull/52049
- https://github.com/WebKit/WebKit/pull/53102
- https://github.com/WebKit/WebKit/commit/8bb5a0a3ea33be619bc5e7c891b318411258c36f
- https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/patches/bootstrap.diff#L5981-L5996
- https://github.com/microsoft/playwright/issues/37766
- https://github.com/microsoft/playwright/issues/43949
