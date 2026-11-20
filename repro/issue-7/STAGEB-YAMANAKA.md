# Stage B: Yamanaka module-loading compatibility diagnostic

## Current outcome

PARTIAL. Diagnostic implementation, 21 local Node tests (including 12 loopback HTTP requests) PASS. Exact Playwright Chromium/WebKit execution BLOCKED by absent browser binaries; all eight browser cases NOT_TESTED. Explicit system Chromium 156.0.8078.79 fallback also failed to launch with `socket() failed: Operation not permitted`; it is not the pinned Chromium and contributes no browser result. No protection workaround was applied.

This is a local synthetic compatibility diagnostic, not product acceptance, browser-internal explanation, timing benchmark, or formal CI. Yamanaka Stage 3-B HOLD, past FAIL/UNKNOWN, and 304 alternative NOT_ADOPTED remain.

## Fixed sources and relationship

Lab start main `d4a2105b58276f5dff2cb7dedd1ece4aef8718d7`, tree `aa2a181ba32b75277e7f8a002402e20b6b66fa9e` includes merged PR #9/#10, following #8 bounded observer. Issue #7 remains the source topic. Open PR #11 concerns working policy, not this experiment; no duplicate Stage B branch/PR was found.

Yamanaka transfer HEAD `753922d38c5f9e07f7ca27148ec2a27555dae5e9`, tree `7bce7538e2c2597ee68b0fd3e138960f7e20f66a`. Official B6a [run 44633636805](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44633636805) merge ref `1df9b30eaae36177d3b8239b2ec077253f5efc2a` has the same tree, not the same commit. [WebKit artifact 14585272978](https://github.com/tetsujisugimori-coder/yamanaka-historical-terrain/actions/runs/44633636805/artifacts/14585272978) retained HTML contains `<script type="module" crossorigin src="/assets/index-D_Wx_CwS.js">`. Its `webkit-375-no-preference` raw records a 200 GET, MIME `text/javascript`, `Cache-Control: no-cache`, weak ETag, and `Vary: Origin`. Product decoded bytes: 783670; SHA-256 `2b0dc19bcb8aef451f7ffdd93eeaa031eadc89cbb6a689328b16cc6f06148657`. The same retained HAR/observer reports a later304 for the same URL with If-None-Match and If-Modified-Since. HAR records bodySize0; the Playwright body read failed with `BODY_UNAVAILABLE_REDIRECT_MESSAGE`, so usedBytes remains UNKNOWN. These are historical observations read by a separate source investigator, not new product execution. The synthetic server uses its own content-based weak ETag only, does not emulate Last-Modified validation, and records any If-Modified-Since without using it. Its304 response headers are not claimed byte-identical to the historical response.

We preserve that root-preview URL shape, module/crossorigin and MIME/Vary/weak-validator form. The response body is deliberately a small synthetic module, not product bytes or dependencies. Product ETag is not reused for different content. 404 responses use a controlled `no-store` policy; normal/cache cases use `no-cache`. The 404/304 response policy is diagnostic design, not a claim about production behavior. Pages prefix and production deployment are outside scope.

## Preregistered expectations / limits

1. module200: target requestfinished, DOM load, synthetic marker.
2. module404: target requestfailed and DOM error, marker absent. Diagnostic FAIL is the expected observation, not an experiment failure.
3. fetch404: target requestfinished, HTTP404/ok false, exact synthetic body size/SHA, marker absent.
4. module-revalidation: same context, new document/module map. First200 then server-observed valid If-None-Match/304, zero wire body, module marker again. Browser-visible status is recorded separately. If no second conditional request or no304 despite otherwise complete instrumentation, report UNKNOWN/NOT_OBSERVED. Missing request, response, or terminal instrumentation is INCOMPLETE, not an inferred cache hit. A contradictory observed status is FAIL.

A marker is execution evidence only, not complete cached-byte attribution (no SRI in this representative condition). The product module body actually used in this new diagnostic remains NOT_TESTED. There is no cross-engine conclusion without both browsers.

Bounded observer:5s, browser launch10s, outer command90s. Page/observation/context/server shutdown waits are finite. HTTP unit client has2s request timeout and10s test bound. Output must be a new filename (`wx` exclusive creation); same-run snapshots include unfinished observations. A prior output is never overwritten. Server finish/close are separate from intended response bytes; finish does not prove client consumption. CSP restricts script/connect to self, service workers blocked, server only binds127.0.0.1 and has no redirects/external content. No request interception that would disable HTTP cache.

## Reproduce

From `repro/issue-7`, use locked Playwright1.56.1 dependencies:

```sh
node --test diagnostic.test.mjs stageb-contract.test.mjs stageb-server.test.mjs
STAGEB_OUTPUT=/new/output.json timeout 90s node stageb-module.mjs both
# Separate explicitly non-pinned fallback only:
STAGEB_CHROMIUM_EXECUTABLE=/usr/bin/chromium STAGEB_OUTPUT=/new/system.json timeout 90s node stageb-module.mjs chromium-system
```

Set TMPDIR to a dedicated case directory. Do not reuse output paths. Collect stdout, stderr and exit separately. Library custody, independent review and formal CI are separate gates and are not claimed here.

## Next step

Run the same fixed diagnostic once in an approved environment with the pinned executables. No product changes, timeout relaxation, production requests or extra browser-internal investigation are needed to unblock this diagnostic. Parent coordinator owns GitHub submission and independent review.

## Comparison and handoff

| Layer | Established | Not established |
|---|---|---|
| Lab #8 | bounded matching requestfailed diagnostic replaces hanging wait | product-wide fix |
| Lab #9 | controlled cache/revalidation comparisons | historical product used bytes |
| Lab #10 | controlled HTTP error timing contrasts | internal browser root cause |
| Fixed Yamanaka historical raw | module200 body and later304 response observed | later304 body API/usedBytes |
| New Stage B | same path/module/crossorigin and header-shape fixture; HTTP unit12 requests pass | all8 pinned browser cases NOT_TESTED |

Product fetch/response handling (`src/main.js`, line53 `!r.ok` check) is outside this experiment; synthetic fetch404 does not bypass that product check. A later product-side diagnostic may watch the identity-matched requestfailed plus finite deadline, but only after this equivalent module path is exercised in a usable browser environment. Do not treat304 as empty cached content or infer used bytes from a marker. No product patch is proposed here.

Local `node --test diagnostic.test.mjs stageb-contract.test.mjs stageb-server.test.mjs` finished exit0,21/21, stderr0bytes. Browser launch attempt command exit1, both pinned engines BLOCKED and8 rows NOT_TESTED. HTTP test12 actual requests are not browser trials. Raw artifacts remain in the case evidence directory; source/dependency bootstrap failure and earlier launch attempts remain separately named, never replaced. New report file collision is rejected by exclusive creation. Output provenance and hashes are recorded in the accompanying manifest; preservation acceptance is separate.
