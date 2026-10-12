# Web Release

A pushed `web/vX.Y.Z` tag runs `.github/workflows/release-web.yml`, which deploys `WebStack` and `WebAlarmStack`, uploads the site and clears the CloudFront cache. One-off prerequisites: [aws-setup.md](aws-setup.md).

## Release

Releases are cut through the release flow (version confirmed, then `gh release create web/vX.Y.Z --target main --generate-notes`). Watch the run in GitHub Actions; failures are emailed by GitHub to the repo owner.

The tag must be `web/vX.Y.Z`, the newest `web/v*` tag, and on `main`; otherwise the run stops before touching AWS.

After a successful deploy the `linear` job records `web vX.Y.Z` in the Linear pipeline `bahri-cc web` and marks it Released, with the issues since the previous `web/v*` tag. Don't create the Linear Release by hand. If only that job fails, re-run it alone.

## Pre-launch

Repo variable `PUBLIC_PRELAUNCH` (`true` until `web/v1.0.0`; anything but `false` counts as `true`). While on, visitors see the holding page and every response is `noindex`. Preview the real site with `https://bahri.cc/en/?preview=<token>` (1Password `preview-token`); the cookie lasts 30 days.

## Rollback

Old tags are never redeployed. Revert the change on `main` (PR, merge) and release a new patch tag.

## Urgent fix

Fix branch → PR → merge → patch tag immediately. No hotfix branches; `main` stays releasable.

## Infrastructure-only changes

Changes to `WebStack` or `WebAlarmStack` ship with the next web release; there is no separate infra deploy.
