# Stage 2-A 完了通知の静的経路と原因候補

根拠・D/R/Uの定義は[受領台帳](stage2a-b6f-evidence-intake.md)。仮説の順位付けなし。静的経路の成立と実行分岐の証明は別。

## 固定source直接確認（D）

以下は全てPlaywright公式commit `54c711571a37de525377e6f3d3608c3e029b1829`。

|source / 行|直接確認した構造|実記録との境界|
|---|---|---|
|client/network.ts 639,709–715|Response独自_finishedPromise。finishedはtargetClosedScopeとのrace、bodyはchannel.body binary|server body終了はこのclient Promiseのresolveを保証しない|
|client/browserContext.ts 195–214|requestFailedはfailure/timing/event更新、finished resolveなし。requestFinishedはresponseがある時だけresolve|実要求でどちらの通知が来たかはNOT_RECORDED|
|server/network.ts 475–481,541–553|server独自_finishedPromiseを_requestFinishedがresolve。bodyはその後callback/overrideを読む|client Promiseとは別。body0の理由はこれだけでは不明|
|server/chromium/crNetworkManager.ts 485–540|loadingFinishedはreportRequestFinished。loadingFailedでも既存responseのserver Promiseをresolve後requestFailedへ|HTTP404をloadingFailedと同義にしない|
|server/webkit/wkPage.ts 1140–1203|同様にfinished/failedが別経路、request/response存在条件あり|両engineに静的候補がありWebKit共通根因ではない|
|server/frames.ts 316–336 / dispatchers/browserContextDispatcher.ts 159–191|別eventとchannel配送。既存dispatcherまたはsubscription条件あり|条件存在だけで通知欠落・未購読を断定しない|
|server/dispatchers/networkDispatchers.ts 104–106|body RPCはserver Response.bodyを待つ|全channel配送の実観測ではない|
|client/page.ts 139,161–162,238–243 / client/network.ts 292–294|channel close→Page.Close→closed scope、finished raceが閉鎖失敗へ進み得る|context.close時間順序だけではPage.Close実相関や因果を証明しない|

山中城固定observerはcompletionを並行起動し、body/consumeの後finallyでawait completionする（D）。captureの待機位置は説明できるが、Playwright側の未完理由をobserverだけに帰さない。待機を外す受入緩和はしない。

## H1〜H4と反証候補

|ID|根拠・Rでの整合|実記録で欠けるもの|反証し得る観測|識別不能条件|判定|
|---|---|---|---|---|---|
|H1 clientまで完了通知が未到達|dispatcher配送条件、4件finished未完|native→server→channel→clientの同Request配送記録|同Requestのresponse付きrequestFinishedがclientへ到達・処理された直接記録|購読変更で別経路になる、native IDなし、受信/処理を混同|UNKNOWN|
|H2 通知は発生したがresolveせず|requestFailed handlerはresolveしない。loadingFailedはserverのみ完了し得る|実404のrequestFailed/requestFinishedとresponse対応|当該client Promiseが期限前resolveした記録は、この未resolve説明を反証|通知なしと通知あり未処理、別Request/別Responseを区別不能|静的可能性SUPPORTED、実分岐UNKNOWN|
|H3 closeが未完待機を失敗解放|close scope race存在、4件close開始後/終了前に失敗→settled|Page.Close実相関、他の失敗源、介入なし対照|同じ待機がclose開始前に失敗解放した確かな記録、または別失敗源の直接証拠|同時期のbackend失敗とclose競合、別時計|時系列と整合、因果UNKNOWN|
|H4 観測器/fixture/時刻の影響|finally待機、server96/body0不一致、購読条件は静的存在|通知追加の介入量、wire送出完了、fixture/記録器の完全性|一因子比較で仮定した特定影響が必要でないことを示す記録（H4全体を一括否定しない）|複数変更、予算差、異なるclock、通常200と404の履歴差|UNKNOWN、比較実験NOT_TESTED|

新しい反証実験は0。H1とH2の識別には同Requestの配送/処理とResponse対応が必要、単なるeventログだけではnative実経路を確定しない。H3とH4は他仮説と併存可能。共通WebKit根因、全runtime実行byte一致、使用実byteはUNKNOWN。

## 今回取得sourceの識別

TSを配布compiled JSと同一byteとはしない。sourceのhashは取得同一性の記録で、過去実行物の認証ではない。

|固定取得元|bytes|SHA-256|
|---|---:|---|
|[client/network.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/client/network.ts)|30967|`8709f32781670cf9b061ec24bdfed329d4c9f5eacd2ae5f3246457b525aab5cc`|
|[client/browserContext.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/client/browserContext.ts)|26226|`e0b885101f8e9c9a25f8545ff459fbf870884bb4dcdcd72ef6e945b914b9c766`|
|[client/page.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/client/page.ts)|37644|`767b35d686b55bca414b58c24a7d2f31b5b8023b76b38cdeee2d58c81251a90a`|
|[server/network.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/network.ts)|24390|`7a516173f0eea1f6432f236e2174da2f2eb90aabb3eb470bf2bbfde70f7e4ce2`|
|[server/chromium/crNetworkManager.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/chromium/crNetworkManager.ts)|39604|`add4c9825ce6cd5f3c5a30a7d4333697023f495e680ace791fb8dc582ed40bb4`|
|[server/webkit/wkPage.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/webkit/wkPage.ts)|58575|`1a790b87e59a82757de3c9d507a62b347b6a724e7bdd45d8fe063e90a51c73b5`|
|[server/frames.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/frames.ts)|73497|`3be8c15084f4d7b1134a1bc26034cb5e456078e6424a291829d71b408a68f72d`|
|[server/dispatchers/browserContextDispatcher.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/dispatchers/browserContextDispatcher.ts)|23136|`b929610a626241c1ab7ca58cfdd2cee407d3b87d000c9f2f41fa48f2866a6629`|
|[server/dispatchers/networkDispatchers.ts](https://raw.githubusercontent.com/microsoft/playwright/54c711571a37de525377e6f3d3608c3e029b1829/packages/playwright-core/src/server/dispatchers/networkDispatchers.ts)|11243|`9e3c57e5c9e029fbaf68bf35273a45811c2e8e83b66db792acf2571593e804ad`|
|[observer.mjs](https://raw.githubusercontent.com/tetsujisugimori-coder/yamanaka-historical-terrain/7c4442e319e19950799d813524038b8474bc69a5/scripts/stage3b6-response-observer.mjs)|6022|`a31f385df87f178652b98aca4733a796ef05202b5e9bca6745774de432c07b96`|
