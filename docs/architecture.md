# Architecture

## Overview

- **Web** — Astro static site (`apps/web/`), Tailwind CSS v4 and Starwind UI. Served from a private S3 bucket through CloudFront at `bahri.cc`.
- **API** — ASP.NET minimal API on AWS Lambda (`apps/api/`), reached through the same CloudFront distribution at `/api/*`. Sends contact form emails via SES.
- **Infra** — AWS CDK in C# (`infra/`). Region `eu-west-2`; `CertStack` and `WebAlarmStack` live in `us-east-1` (CloudFront requirements).

`apps/api/` is added in a later issue.

## Releases

Each app ships on its own tag (`web/vX.Y.Z`, `api/vX.Y.Z`); a pushed tag deploys via GitHub Actions. Manifests stay at `0.0.0`.
Runbooks: [aws-setup](runbooks/aws-setup.md) (one-off), [release-web](runbooks/release-web.md).

## Infrastructure ownership

| Stack | Region | Deployed by |
|--|--|--|
| `BootstrapStack` (deploy role, budget) | eu-west-2 | by hand, once |
| `CertStack` (certificate) | us-east-1 | by hand, once |
| `WebStack` (bucket, CloudFront incl. `/api/*` behaviours, DNS) | eu-west-2 | `release-web.yml` |
| `WebAlarmStack` (5xx alarm) | us-east-1 | `release-web.yml`, after `WebStack` |
| `ApiStack` (Lambda) | eu-west-2 | `release-api.yml` |

- Each workflow deploys only its own stacks with `--exclusively`; `release-api.yml` never deploys `WebStack`.
- Stacks share values through SSM parameters, never CloudFormation exports.
- Both release workflows share the `bahri-cc-infra` concurrency group, so deploys queue instead of colliding.
- The account's GitHub OIDC provider and the ACM validation records predate this repo; they're used, not managed, here.

## Secrets

- 1Password vault `bahri-cc` is the source of truth for secrets and for values that reveal the account (account ID, hosted zone ID, ARNs, alert email). See `infra/.env.example`.
- GitHub holds one secret, `OP_SERVICE_ACCOUNT_TOKEN` (read-only service account `bahri-cc-ci`); workflows load everything else with `1password/load-secrets-action`.
- AWS copies (SSM SecureString) are written from 1Password by the release workflows, never edited by hand.
- Rotate the service account token every 90 days: in 1Password first, then `gh secret set OP_SERVICE_ACCOUNT_TOKEN`.
