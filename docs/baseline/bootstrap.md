# Repository initialization gate

> Historical pre-submission record. The empty-repository blocker below was subsequently resolved by the owner’s initial commit. See [submission supplement](SUBMISSION.md) for current state. Earlier review and evidence conclusions retain their original scope.

Observed 2026-11-16 UTC using authenticated GitHub repository reads:

| Item | Result |
|---|---|
| Actual name | tetsujisugimori-coder/webkit-compatibility-lab |
| Visibility | Public |
| Connected account | tetsujisugimori-coder |
| Returned repository permissions | admin, maintain, push, triage, pull true |
| Default-branch metadata | main |
| Branches | empty list |
| Commit read | 409: Git Repository is empty |
| Contents | 404: repository empty |
| Issues / PRs / workflow runs | 0 / 0 / 0 |
| Rulesets | empty list |
| Branch protection | NOT_VERIFIED: integration returned 403 |
| Actions permissions / default token permission | NOT_VERIFIED: connector endpoint unsupported; local CLI unauthenticated |
| Workflows in Git | no tracked files exist; registered workflow listing NOT_VERIFIED |
| Name history | Initially leading hyphen; owner renamed; corrected name and same repository ID verified |

[Repository metadata](https://api.github.com/repos/tetsujisugimori-coder/webkit-compatibility-lab), [branches](https://api.github.com/repos/tetsujisugimori-coder/webkit-compatibility-lab/branches), [rulesets](https://api.github.com/repos/tetsujisugimori-coder/webkit-compatibility-lab/rulesets), [runs](https://api.github.com/repos/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs).

A permissions flag is not approval to change main. A default-branch string is not an existing Git ref. Empty rulesets do not establish absence of all branch protection.

## Minimal approval proposal (not executed)

1. Name difference is resolved by the owner’s rename. Recheck current repository identity before future writes.
2. Approve exactly one initial main commit containing only a small public README: repository purpose and a statement that investigation documents follow by Draft PR. No workflow, dependency, executable, artifact, or private reference.
3. Confirm Actions permissions and relevant external automation before any write. No new CI or browser execution is authorized. If initial-write consequences cannot be bounded, retain BLOCKED.
4. Once initial main exists, create docs/stage0-webkit-baseline from that exact base, add reviewed public documents, and open Draft PR titled "docs: establish cross-project WebKit investigation baseline".
5. Read back remote HEAD/tree, exact diff, PR state and any resulting checks. Do not merge, delete history, or change protections.

Initial README proposal:

> # WebKit Compatibility Lab
> Cross-project WebKit compatibility investigation records. Stage 0 baseline will be proposed in a Draft PR. This repository does not certify product safety or replace project-specific acceptance.

No bootstrap, rename, settings change, commit, push, Issue, or PR was performed by the assistant in Stage 0. The owner’s rename is recorded separately.
