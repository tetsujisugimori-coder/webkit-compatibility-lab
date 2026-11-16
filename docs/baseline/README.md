# Stage 0 baseline — 2026-11-16 UTC

> Historical pre-submission record. The empty-repository blocker below was subsequently resolved by the owner’s initial commit. See [submission supplement](SUBMISSION.md) for current state. Earlier review and evidence conclusions retain their original scope.

## Result

Overall PARTIAL. Public-safe documentation proposal prepared. Remote submission BLOCKED because the corrected-name repository remains empty without a base commit. Merge recommendation NO: there is no PR to merge. No source project was changed.

## Observation method

Authenticated GitHub reads of repository metadata, refs/commit/tree, relevant Issue/PR discussions and review records, fixed workflow/document sources and Actions run metadata. Original browser ZIPs were not downloaded or re-executed. New reproduction, fresh byte preservation and physical Safari testing are NOT_TESTED. The inventory is a scoped baseline, not a claim to have exhaustively indexed every historical issue.

Public source links are in the four project reports. Runtime or artifact claims read from a report are identified as reported, even when that report says independent audit PASS. Stage 0 does not inherit that PASS as its own audit result.

## Important current-state corrections

- The owner renamed the initially leading-hyphen lab to webkit-compatibility-lab; same repository identity verified.
- Intelligence PR #65 is merged. Its successful wave9 tests do not resolve the still-Draft PR #46 outline issue.
- Yamanaka PR #55 advanced to B6d HEAD aa3688f3. Its independent review/readback gate is PENDING; B6c independent PASS cannot be reused.
- Loading PR #88 remote remains 2d19a0f0. Unsubmitted local B-S results are not the remote code.
- Atlas PR #35 latest synthetic runner HEAD 97ce39e8 has no Actions run. Formal browser results belong to earlier c54a6c24, while v6 reproduction belongs to 18781011.

## Public disclosure controls

Only public source metadata, full Git identities, sanitized descriptions and public URLs are included. No source-code migration, private storage identifiers, internal filesystem paths, credentials, cookies, raw HAR/trace/ZIP or screenshots are included. No new workflow or dependency is proposed. The Issue template is Markdown only.

## Limits

New lab branch protection and Actions permission settings remain NOT_VERIFIED, with exact access failures documented in bootstrap.md. Repository permissions do not override owner approval. Existing-source artifact retention and future access are not guaranteed. Unknown root causes, untested physical devices and project-specific HOLDs remain explicit.
