# r2215/r2227 ソース差分比較

比較したのはPlaywrightタグのUPSTREAM_CONFIG.shで固定した **WebKit上流ソース基準点**。これにPlaywright patchが適用された実配布ELFのコードとは同一視しない。

| 比較観点 | db897909... (r2215上流基準点) | 486de399... (r2227上流基準点) | 判定 |
|---|---|---|---|
| 基準日 | 2025-07-07 | 2025-09-29 | 直接取得 |
| initializeForNewWindowのpreviousWindow取扱い | previousWindow && !frame()->isMainFrame() が前提 | previousWindow で処理 | 確認済。主frameへの適用範囲が変化 |
| Traverse | index探索失敗ならentriesをクリアして通常経路へ | 同趣旨 | 確認済 |
| Push | previous index後をshrink | 同趣旨 | 確認済 |
| Replace | previousEntryを保持、場合によりentry置換、current indexを探索 | 同趣旨。ただしnavigationType ASSERTなど差あり | 確認済 |
| Reload/その他 else | index探索後、navigationTypeがあれば currentEntry() を参照 | index探索後、ASSERT(navigationType)を経て currentEntry() を参照 | 両方に未設定を見落とす可能性 |
| 通常経路のentries | pageのback/forward列をorigin条件で収集し現在itemを探す | currentItemを末尾にappendしindex=m_entries.size() - 1（0とは限らない） | 重要な構造差 CONFIRMED |
| Activation関数 | updateForActivation | setActivation | 298765@mainで変更 |
| BFCache復帰 | updateForReactivationは既存構成 | 298765@mainでpreviousItemによるActivation更新・navigateイベント遅延などを追加 | 単なる改名ではない |

制御フロー（高水準、実行アドレスとは未対応）:
1. initializeForNewWindowへ navigationType と previousWindow が渡る。
2. 両固定版とも、履歴エントリとイベントが無効なら早期終了する。次に `frame()` から `page` を取得し、`page` がなければ早期終了する。続いて `frame()` の履歴から `currentItem` を取得し、`currentItem` がなければ早期終了する。
3. previousWindowと条件により以前のentriesをコピーして索引を参照。r2215上流ではこの分岐はサブフレーム限定。Atlas操作は主フレームだが停止フレームは不明であり、実配布物の条件・到達はUNKNOWN。ここで **previousNavigation->m_currentEntryIndex** が空なら、size/entry/index参照が失敗し得る。
4. Traverse/Push/Replace/その他の分岐。その他の分岐では現在のm_entriesからcurrentItemの一致を探索する。見つからなければ **現在のm_currentEntryIndex** が空。
5. currentEntry()は両固定版で索引の有無を検査し、欠落時はnullptrを返す。戻り値の参照と空optionalの直接アクセスは別の停止機構であり、Atlasの署名との同一性はUNKNOWN。
6. 通常経路へ移る場合も、r2215とr2227でエントリ生成ロジックが異なる。実配布ELFの最終動作は上流基準点だけでは確定できない。

## 298765@main（2025-08-15）
https://github.com/WebKit/WebKit/commit/b05914464158fcb242b61edb1c2a547be7a0532c
同コミットは updateForActivation を setActivation に改称するとともに、updateForReactivationがBFCacheのpreviousItem/Activationに対応する変更、BFCache復元後のnavigateイベント発火、FrameLoaderの状態管理変更を含む。r2215基準日より後、r2227基準日より前。関数名を2026年ソースから逆適用せず、この差分で判断する。

## 差分で説明できないこと
1. r2227配布物に入ったPlaywright個別パッチの実ビルド履歴（UNKNOWN）。
2. Navigation.cpp以外の差分のうち単独で非再現をもたらす変更（UNKNOWN）。
3. 旧ELF内部PC 0x45208aeのWebKit関数帰属（UNKNOWN）。
4. 非再現が初発索引欠落の解消か、単にアサーション回避か（UNKNOWN）。

固定原資料:
- https://github.com/microsoft/playwright/blob/v1.56.1/browser_patches/webkit/UPSTREAM_CONFIG.sh
- https://github.com/microsoft/playwright/blob/v1.57.0/browser_patches/webkit/UPSTREAM_CONFIG.sh
- https://github.com/WebKit/WebKit/blob/db897909f7c31d9b38793374c66427b6a4cb3dd3/Source/WebCore/page/Navigation.cpp
- https://github.com/WebKit/WebKit/blob/486de399887bc8fa8a69e2f194ebc9476589a08a/Source/WebCore/page/Navigation.cpp
