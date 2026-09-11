# AGENTS.md

## Commits

- Use Conventional Commits: `type(scope): subject`
- Scope is required; name the affected area, e.g. `feat(footer): ...`, `ci(release): ...`
- Types: `feat`, `fix`, `chore`, `docs`, `ci`, `test`, `refactor`, `perf`, `style`
- One logical change per commit; don't bulk unrelated changes
- Don't commit until validation passes: `bun run build && bun test`
- Write commit and PR bodies to a temp file and pass `-F /tmp/FILE.md` (commit) or `--body-file /tmp/FILE.md` (PR)

## Layout

| Path | Contents |
| --- | --- |
| `index.ts` | Extension entry point; registers the footer |
| `rate.ts` | Token throughput, from stream chunk timing |
| `cache-hit.ts` | Cache hit percentage and miss detection |
| `dist/` | Build output; gitignored, built by `bun run build` |

Tests sit next to the code they cover (`rate.test.ts`, `cache-hit.test.ts`, `avg-cache-hit.test.ts`). Never edit or commit `dist/`; it is generated and gitignored.

## Release

`main` is protected: every change lands through a PR with the `test` check green. Admin enforcement is on, so direct pushes are rejected for everyone.

1. **Bump the version.** Edit `version` in `package.json` by hand. Do not run `npm version`; it rewrites the whole file (expands every inline array) and buries the one-line change in formatting noise.
2. **Open a bump PR** titled `chore(release): bump to X.Y.Z` and merge it once `test` passes.
3. **Tag the merged commit** with a message, so signing does not open an editor:
   ```bash
   git tag -m "vX.Y.Z" vX.Y.Z
   ```
   A bare `git tag vX.Y.Z` hangs: `tag.gpgSign=true` makes it an annotated tag, and git waits on `$EDITOR`. Tags are SSH-signed via `user.signingkey`; set `gpg.ssh.allowedSignersFile` if you want local verification.
4. **Push the tag:** `git push origin vX.Y.Z`.

The `publish` workflow then runs on the tag and does, in order: `bun install`, `bun test`, tag-versus-version check, `npm publish --provenance`, `gh release create`. Each step gates the next, so a failure never leaves a half-finished release.

Tag must equal `v<package.json version>`. The workflow fails the release on mismatch; never tag below the current version.

### Publishing auth

The workflow publishes through npm OIDC trusted publishing, so no `NPM_TOKEN` secret exists in this repo. Requirements:

- Trusted publisher on npmjs.com for `@iaziz786/pi-footer`: GitHub Actions, repository `iAziz786/pi-footer`, workflow `publish.yml`, no environment. Case-sensitive. Inspect or change it with `npm trust list @iaziz786/pi-footer` and `npm trust github ... --file publish.yml --repo iAziz786/pi-footer --allow-publish`.
- The package must already exist on the registry. OIDC token exchange fails when publishing a name npm has never seen.

### Symptom guide

| Symptom | Cause |
| --- | --- |
| `404 Not Found - PUT ...` during publish | OIDC exchange failed, so npm fell back to the placeholder `NODE_AUTH_TOKEN` that `actions/setup-node` writes when given `registry-url`. Check the trusted publisher fields match the workflow exactly. |
| `404` on the very first publish of a new package | The package does not exist on npm yet. OIDC cannot exchange for an unknown package. Publish once with a token or the website, then trusted publishing works. |
| Version conflict (`EPUBLISHCONFLICT`) | The version is already on npm. Bump before tagging. |
| Tag check step fails | Tag name and `package.json` version disagree. |

`npm publish` has no flag that forces OIDC; it engages only when npm finds no usable auth in config. Do not "fix" a publish failure by adding `NODE_AUTH_TOKEN`; fix the trusted publisher instead.
