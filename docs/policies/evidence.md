# Evidence, privacy, and feedback policy

## Provenance and preservation

Record repository, branch, full source HEAD, tree, executed checkout SHA (including PR merge ref when relevant), workflow/run/job/attempt, environment, condition ID, expected and actual result, exit state and timestamps. Distinguish source commit from documentation commit and historical evidence from current checks.

For each file record original filename, byte length, SHA-256, official artifact size/digest when available, ZIP CRC status, manifest coverage, and Git blob/source correspondence. CRC is not cryptographic authenticity. A matching archive and manifest do not prove the expected set is complete; establish expected case/output sets independently.

Keep original failed evidence unchanged. Separate later supplements and repaired copies by identifier and hash. Preserve original ZIP without recompression. Keep local, formal CI and synthetic evidence separate. PR and push duplicate conditions must not inflate independent-condition counts.

Preservation has separate stages: acquired, saved, actually reobtained, byte/hash checked, CRC checked, manifest completeness checked, source/version attribution checked. Storage acceptance alone is not preservation PASS. Library or owner-only storage identifiers must not be put in the public repository. Record a public-safe custody status instead. Unverified access scope/retention remains UNKNOWN.

## Public release gate

Only publish sanitized metadata and links independently confirmed public at the observation time. Do not publish credentials, cookies, tokens, personal information, internal filesystem paths, private URLs, private source content, raw HAR/trace/ZIP/screenshots, or signed download links. Automated string scanning is only supplementary to human/independent review.

A public repository's artifact need not be safe to republish. Its raw content requires separate inspection and approval. This baseline has not re-downloaded raw browser artifacts; historical preservation reports are attributed as such, not a fresh readback PASS.

## Feedback to projects

Create an investigation record with a fixed scope and evidence. Independently review it. Send a scoped finding back to the existing project Issue/PR only with authorization. Reproduce and fix inside the project's own approved workflow. Do not move source code, change its test expectations, alter branch rules, or decide its merge from this lab. Shared harness work/new CI/browser runs require separate review and approval.
